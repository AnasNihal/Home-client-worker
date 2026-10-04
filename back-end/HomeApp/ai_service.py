"""AI provider wrapper with useful deterministic fallbacks for local development."""
import base64
import json
import os
import re
from datetime import date


def _client():
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return None
    from openai import OpenAI
    return OpenAI(api_key=key)


def _fallback_intake(message):
    text = message.lower()
    profession = "cleaner"
    for name, words in {
        "plumber": ["tap", "pipe", "leak", "water", "drain"],
        "electrician": ["switch", "fan", "wire", "socket", "power"],
        "carpenter": ["door", "shelf", "wood", "furniture"],
        "pest-control": ["pest", "termite", "cockroach", "mosquito"],
        "cleaner": ["clean", "dust", "sofa", "kitchen"],
    }.items():
        if any(word in text for word in words):
            profession = name
            break
    return {
        "profession": profession,
        "service_query": message[:255],
        "location": "",
        "preferred_date": None,
        "preferred_time": None,
        "budget": None,
        "confidence": 0.35,
        "clarifying_question": "Which city or area should we search in?",
        "provider": "fallback",
    }


def extract_service_request(message):
    client = _client()
    if not client:
        return _fallback_intake(message)
    schema = {
        "type": "object",
        "properties": {
            "profession": {"type": "string"},
            "service_query": {"type": "string"},
            "location": {"type": "string"},
            "preferred_date": {"type": ["string", "null"]},
            "preferred_time": {"type": ["string", "null"]},
            "budget": {"type": ["number", "null"]},
            "confidence": {"type": "number"},
            "clarifying_question": {"type": ["string", "null"]},
        },
        "required": ["profession", "service_query", "location", "preferred_date", "preferred_time", "budget", "confidence", "clarifying_question"],
        "additionalProperties": False,
    }
    try:
        response = client.responses.create(
            model=os.getenv("OPENAI_AI_MODEL", "gpt-4o-mini"),
            input=[
                {"role": "system", "content": "Extract a home-service request. Never invent missing dates, times, locations, or prices. Return null for unknown values."},
                {"role": "user", "content": message[:2000]},
            ],
            text={"format": {"type": "json_schema", "name": "service_request", "strict": True, "schema": schema}},
        )
        result = json.loads(response.output_text)
        result["provider"] = "openai"
        return result
    except Exception:
        return _fallback_intake(message)


def moderate_text(text):
    client = _client()
    if not client:
        flagged = bool(re.search(r"\b(spam|scam|hate|kill|abuse)\b", text.lower()))
        return {"flagged": flagged, "reason": "Local safety filter" if flagged else "", "provider": "fallback"}
    try:
        result = client.moderations.create(model="omni-moderation-latest", input=text[:4000])
        moderation = result.results[0]
        return {"flagged": bool(moderation.flagged), "reason": "Potentially harmful content" if moderation.flagged else "", "provider": "openai"}
    except Exception:
        return {"flagged": False, "reason": "Moderation unavailable; queued for review", "provider": "fallback"}


def _clean_history(history):
    """Keep only a small, safe transcript for the support model and fallback."""
    if not isinstance(history, list):
        return []
    cleaned = []
    for item in history[-12:]:
        if not isinstance(item, dict) or item.get("role") not in {"user", "assistant"}:
            continue
        content = str(item.get("content", "")).strip()
        if content:
            cleaned.append({"role": item["role"], "content": content[:1500]})
    return cleaned


def _booking_summary(context):
    bookings = context.get("recent_bookings", [])
    if not bookings:
        return "You do not have any bookings yet."
    lines = []
    for booking in bookings[:3]:
        lines.append(
            f"Booking #{booking['id']}: {booking['service']} with {booking['worker']} "
            f"on {booking['date']} at {booking['time']} — {booking['status']}; "
            f"payment {booking['payment_status']} ({booking['payment_mode']})."
        )
    return "\n".join(lines)


def _fallback_support(message, context, history):
    """Answer common support questions without pretending a model is configured."""
    lowered = message.lower()
    bookings = context.get("recent_bookings", [])
    latest = bookings[0] if bookings else None

    if any(word in lowered for word in ("hello", "hi", "hey", "good morning", "good evening")):
        return (
            f"Hi {context.get('customer_name', 'there')}! I can help you find a professional, "
            "understand a booking status, explain payments, or guide you through cancellations. "
            "What do you need help with?"
        )

    if any(word in lowered for word in ("booking", "booked", "appointment", "status", "track")):
        if latest:
            return (
                f"You have {context['booking_count']} booking(s). Your latest is booking "
                f"#{latest['id']} for {latest['service']} with {latest['worker']} on "
                f"{latest['date']} at {latest['time']}. Its status is “{latest['status']}” "
                f"and payment is “{latest['payment_status']}”. Open My Bookings for the full details."
            )
        return "You do not have any bookings yet. Use the service finder above or Browse Workers to get started."

    if any(word in lowered for word in ("cancel", "cancellation", "delete booking")):
        if latest and latest["status"] in {"completed", "canceled", "declined"}:
            return f"Booking #{latest['id']} is already “{latest['status']}”, so it cannot be canceled."
        return (
            "To cancel a booking, open My Bookings, choose the booking, and select Cancel. "
            "If the option is not available, the booking may already be completed or canceled."
        )

    if any(word in lowered for word in ("pay", "payment", "refund", "price", "cost")):
        if latest:
            return (
                f"For booking #{latest['id']}, the current payment status is “{latest['payment_status']}” "
                f"and the payment option is “{latest['payment_mode']}”. You can review the amount and "
                "payment details from My Bookings."
            )
        return "You can choose Pay Now during checkout or Pay Later when the worker accepts your request."

    if any(word in lowered for word in ("worker", "professional", "plumber", "electrician", "cleaner", "carpenter", "pest")):
        return (
            "Tell me the service you need and your city—for example, “a leaking tap in Bangalore”. "
            "The AI service finder can then match you with active professionals and show their prices."
        )

    if any(word in lowered for word in ("profile", "account", "phone", "address", "city")):
        return "You can update your contact details from Profile. I can explain the steps if you tell me what you want to change."

    if any(word in lowered for word in ("help", "what can you do", "options")):
        return (
            "I can help with finding a worker, checking bookings, explaining payment options, "
            "cancellations, and updating your profile. Ask me a specific question and I’ll guide you."
        )

    if history:
        return (
            "I want to help, but I need a little more detail. Is your question about finding a worker, "
            "a booking, payment, cancellation, or your profile?"
        )
    return (
        "I can help with your home-service journey. Tell me what you need—such as “find a plumber”, "
        "“what is my booking status?”, or “how do I pay?”"
    )


def answer_support(message, context, history=None):
    history = _clean_history(history)
    client = _client()
    if not client:
        return _fallback_support(message, context, history)

    try:
        instructions = (
            "You are HomeCare's friendly support assistant. Be warm, concise, and practical. "
            "Use the supplied account context to answer questions about this user's bookings and payments. "
            "You may explain how to use the app, recommend the service finder, and ask one useful follow-up question. "
            "Never claim that you booked, canceled, refunded, changed, or contacted anyone. "
            "If the answer is not in the account context, say that clearly instead of inventing details. "
            "For urgent electrical, gas, fire, structural, or medical danger, tell the user to move to safety "
            "and contact the appropriate local emergency service or qualified professional.\n\n"
            f"Account context:\n{json.dumps(context, ensure_ascii=True)}"
        )
        transcript = history + [{"role": "user", "content": message[:2000]}]
        response = client.responses.create(
            model=os.getenv("OPENAI_AI_MODEL", "gpt-4o-mini"),
            instructions=instructions,
            input=transcript,
            max_output_tokens=500,
        )
        return response.output_text.strip() or _fallback_support(message, context, history)
    except Exception:
        return _fallback_support(message, context, history)


def analyze_image(image_bytes, content_type, filename):
    client = _client()
    if not client:
        lower = filename.lower()
        category = "plumber" if any(x in lower for x in ["leak", "pipe", "tap"]) else "general home service"
        return {"category": category, "summary": "Image analysis is available after configuring OPENAI_API_KEY.", "confidence": 0.2, "provider": "fallback"}
    try:
        encoded = base64.b64encode(image_bytes).decode("ascii")
        response = client.responses.create(
            model=os.getenv("OPENAI_VISION_MODEL", "gpt-4o-mini"),
            input=[{"role": "user", "content": [
                {"type": "input_text", "text": "Identify the likely home-service category and describe the visible issue. Do not make a safety-critical diagnosis."},
                {"type": "input_image", "image_url": f"data:{content_type};base64,{encoded}"},
            ]}],
        )
        return {"category": "review required", "summary": response.output_text, "confidence": 0.6, "provider": "openai"}
    except Exception:
        return {"category": "review required", "summary": "The image could not be analyzed automatically.", "confidence": 0, "provider": "fallback"}

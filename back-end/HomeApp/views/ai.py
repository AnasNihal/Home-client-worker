from datetime import datetime
from decimal import Decimal

from django.db.models import Avg, Count, Q, Sum
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..ai_service import analyze_image, answer_support, extract_service_request, moderate_text
from ..image_validation import validate_uploaded_image
from ..models import Booking, Profession, ServiceRequest, Worker, WorkerRating, WorkerService


def _profession_match(worker, profession):
    if not profession:
        return 0
    value = profession.lower().replace("-", " ")
    return 40 if value in worker.profession.name.lower() or worker.profession.name.lower() in value else 0


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def service_intake(request):
    message = str(request.data.get("message", "")).strip()
    if len(message) < 5:
        return Response({"detail": "Please describe the home-service problem."}, status=400)
    if len(message) > 4000:
        return Response({"detail": "Description must be 4000 characters or fewer."}, status=400)
    result = extract_service_request(message)
    profession = Profession.objects.filter(Q(slug__iexact=result.get("profession", "")) | Q(name__iexact=result.get("profession", ""))).first()
    preferred_date = None
    preferred_time = None
    if result.get("preferred_date"):
        try:
            preferred_date = datetime.strptime(result["preferred_date"], "%Y-%m-%d").date()
        except ValueError:
            result["preferred_date"] = None
    if result.get("preferred_time"):
        try:
            preferred_time = datetime.strptime(result["preferred_time"], "%H:%M").time()
        except ValueError:
            result["preferred_time"] = None
    service_request = ServiceRequest.objects.create(
        user=request.user,
        original_text=message,
        profession=profession,
        normalized_service=result.get("service_query", "")[:255],
        location=result.get("location", "")[:255],
        preferred_date=preferred_date,
        preferred_time=preferred_time,
        budget=result.get("budget"),
        ai_confidence=min(max(float(result.get("confidence", 0)), 0), 1),
    )
    result["request_id"] = service_request.id
    result["profession_id"] = profession.id if profession else None
    return Response(result, status=201)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recommend_workers(request):
    request_id = request.query_params.get("request_id")
    service_request = get_object_or_404(ServiceRequest, id=request_id, user=request.user) if request_id else None
    profession = service_request.profession if service_request else Profession.objects.filter(id=request.query_params.get("profession_id")).first()
    query = (service_request.normalized_service if service_request else request.query_params.get("q", "")).lower()
    location = (service_request.location if service_request else request.query_params.get("location", "")).lower()
    budget = service_request.budget if service_request else None
    workers = Worker.objects.filter(
        is_active=True,
        verification_status="approved",
    ).select_related("profession").prefetch_related("services", "ratings")
    results = []
    for worker in workers:
        services = list(worker.services.filter(is_active=True))
        service_text = " ".join(f"{s.services} {s.description or ''}" for s in services).lower()
        score = _profession_match(worker, profession.name if profession else "")
        if query and any(word in service_text for word in query.split() if len(word) > 2):
            score += 30
        if location and location in (worker.location or "").lower():
            score += 20
        average = worker.ratings.filter(moderation_status="approved").aggregate(avg=Avg("rating"))["avg"] or 0
        score += float(average) * 2
        if budget and services:
            closest = min(abs(Decimal(s.price) - Decimal(budget)) for s in services)
            score += max(0, 10 - float(closest) / 100)
        results.append((score, worker, services, average))
    results.sort(key=lambda item: (-item[0], -float(item[3])))
    return Response({"request_id": service_request.id if service_request else None, "results": [
        {"worker_id": worker.id, "name": worker.name, "profession": worker.profession.name,
         "location": worker.location, "rating": round(float(avg), 1), "score": round(score, 2),
         "services": [{"id": s.id, "name": s.services, "price": str(s.price)} for s in services]}
        for score, worker, services, avg in results[:10]
    ]})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def moderate_review(request):
    review = str(request.data.get("review", "")).strip()
    if not review:
        return Response({"detail": "Review text is required."}, status=400)
    if len(review) > 2000:
        return Response({"detail": "Review must be 2000 characters or fewer."}, status=400)
    result = moderate_text(review)
    return Response(result, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def support_chat(request):
    message = str(request.data.get("message", "")).strip()
    if not message:
        return Response({"detail": "Message is required."}, status=400)
    if len(message) > 4000:
        return Response({"detail": "Message must be 4000 characters or fewer."}, status=400)
    bookings = Booking.objects.filter(user=request.user).select_related("worker", "service").order_by("-created_at")[:5]
    profile = getattr(request.user, "profiles", None)
    context = {
        "customer_name": request.user.get_full_name() or request.user.username,
        "city": getattr(profile, "city", "") if profile else "",
        "booking_count": Booking.objects.filter(user=request.user).count(),
        "recent_bookings": [
            {
                "id": b.id,
                "status": b.status,
                "date": b.date.isoformat(),
                "time": b.time_slot.strftime("%H:%M"),
                "worker": b.worker.name,
                "service": b.service.services,
                "payment_mode": b.payment_mode,
                "payment_status": b.payment_status,
                "amount": str(b.amount),
            }
            for b in bookings
        ],
    }
    history = request.data.get("history", [])
    if history is not None and not isinstance(history, list):
        return Response({"detail": "history must be a list."}, status=400)
    return Response({"answer": answer_support(message, context, history=history)})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def analyze_service_image(request):
    image = request.FILES.get("image")
    if not image:
        return Response({"detail": "An image file is required."}, status=400)
    try:
        validate_uploaded_image(image, 20 * 1024 * 1024)
    except ValueError as exc:
        return Response({"detail": str(exc)}, status=400)
    return Response(analyze_image(image.read(), image.content_type, image.name))

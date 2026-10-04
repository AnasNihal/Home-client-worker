import React, { useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../constants/api";
import { fetchWithAuth } from "../utils/fetchWithAuth";

export default function AiBookingAssistant() {
  const [message, setMessage] = useState("");
  const [data, setData] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageResult, setImageResult] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!message.trim()) return;
    setLoading(true); setError(""); setData(null); setWorkers([]);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/ai/service-intake/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!response || !response.ok) throw new Error("Could not understand the request.");
      const intake = await response.json();
      setData(intake);
      const recommendationResponse = await fetchWithAuth(`${API_BASE_URL}/ai/recommend-workers/?request_id=${intake.request_id}`);
      if (recommendationResponse?.ok) setWorkers((await recommendationResponse.json()).results || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  async function analyzeImage(event) {
    const image = event.target.files?.[0];
    if (!image) return;
    const form = new FormData(); form.append("image", image);
    const response = await fetchWithAuth(`${API_BASE_URL}/ai/analyze-image/`, { method: "POST", body: form });
    if (response?.ok) setImageResult(await response.json());
  }

  return (
    <section className="max-w-4xl mx-auto my-12 px-6">
      <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-primary/10">
        <p className="text-sm font-semibold tracking-widest text-primary uppercase">AI service finder</p>
        <h2 className="text-2xl md:text-3xl font-bold text-primary mt-2">Describe the problem. We’ll find the right professional.</h2>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 mt-5">
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Example: My kitchen tap is leaking in Bangalore" className="flex-1 rounded-xl border border-gray-300 px-4 py-3" />
          <button disabled={loading} className="rounded-xl bg-primary text-white px-6 py-3 font-semibold disabled:opacity-60">{loading ? "Finding…" : "Find help"}</button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600"><label className="cursor-pointer rounded-lg border px-3 py-2 hover:bg-gray-50">Upload a problem photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={analyzeImage} className="hidden" /></label>{imageResult && <span>{imageResult.category}: {imageResult.summary}</span>}</div>
        {error && <p className="text-red-600 mt-3">{error}</p>}
        {data && <div className="mt-5 rounded-xl bg-green-50 p-4"><p className="text-primary font-semibold">We understood: {data.service_query}</p><p className="text-sm text-gray-600">Category: {data.profession} · Confidence: {Math.round((data.confidence || 0) * 100)}%</p></div>}
        {workers.length > 0 && (
          <div className="mt-5 grid md:grid-cols-2 gap-3">
            {workers.map((worker) => (
              <div key={worker.worker_id} className="rounded-xl border p-4 hover:border-primary/40 hover:shadow-md transition-all">
                <Link to={`/workers/${worker.worker_id}`} className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <div className="font-semibold text-primary">{worker.name}</div>
                  <div className="text-sm text-gray-600">{worker.profession} · ⭐ {worker.rating}</div>
                  <div className="text-sm mt-2">
                    {(worker.services || []).slice(0, 2).map((service) => (
                      <span key={service.id} className="mr-2">{service.name} ₹{service.price}</span>
                    ))}
                  </div>
                  <div className="mt-3 text-sm font-semibold text-primary">View worker profile →</div>
                </Link>
                <Link to={`/booking/${worker.worker_id}`} className="inline-block mt-3 rounded-lg bg-yellow px-3 py-2 text-sm font-semibold text-primary hover:bg-yellow/90">
                  Book this worker
                </Link>
              </div>
            ))}
          </div>
        )}
        {data && workers.length === 0 && <p className="text-gray-600 mt-4">No matching worker was found yet. Try adding your city, date, or budget.</p>}
      </div>
    </section>
  );
}

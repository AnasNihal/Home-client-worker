// src/pages/WorkerDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {rateWorker, getAuthData, redirectToLogin } from "../utlis/useHelper";

export default function WorkerDetails() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

   const [redirecting, setRedirecting] = useState(false);

   

  const { user } = getAuthData();

  useEffect(() => {
    const fetchWorkerDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://127.0.0.1:8000/worker/worker_details/${workerId}`
        );
        if (!response.ok) throw new Error("Worker not found");
        const data = await response.json();

        const professionName =
          typeof data.profession === "string"
            ? data.profession
            : data.profession?.name ?? "Service Provider";

        const normalizedServices =
          Array.isArray(data.services) && data.services.length > 0
            ? data.services.map((s) => ({
                ...s,
                name: s.name || s.services || "Service",
              }))
            : [];

        setWorker({
          ...data,
          profession: professionName,
          services: normalizedServices,
          reviews: data.reviews || [] // ✅ attach reviews
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerDetails();
  }, [workerId]);

  // ✅ Rating submit handler
  const handleRatingSubmit = async () => {
    if (!user || user.role?.toLowerCase() !== "user") {
  return redirectToLogin();
}


    if (userRating === 0) {
      alert("Please select a rating");
      return;
    }

    try {
      const data = await rateWorker(workerId, userRating, reviewText);

      setWorker((prev) => ({
        ...prev,
        rating: data.average_rating,
        ratings: { total_ratings: data.total_ratings },
        reviews: [
          { id: Date.now(), user__username: "You", rating: userRating, review: reviewText },
          ...(prev.reviews || [])
        ],
      }));

      alert("Thank you! Rating submitted.");
      setShowReviewForm(false);
      setUserRating(0);
      setReviewText("");
    } catch (err) {
      alert(err);
    }
  };

// ✅ Booking handler
  const handleBooking = () => {
    if (!user || user.role !== "user") return redirectToLogin();

    setRedirecting(true); // show loading message
    setTimeout(() => {
      navigate(`/booking/${workerId}`, { replace: true });
    }, 1200); // 1.2s delay for UX
  };


  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Loading worker details...</p>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center mt-20">
        <h2 className="text-3xl font-bold mb-4">Worker Not Found</h2>
        <p className="mb-6">{error || "The requested worker does not exist."}</p>
        <Link
          to="/worker"
          className="inline-block px-6 py-3 bg-yellow text-primary font-semibold rounded-lg hover:bg-yellow/90 transition"
        >
          Back to Workers
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-green pt-10 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Worker Image */}
            <div className="lg:col-span-1 flex justify-center">
              <div className="relative">
                <img
                  src={
                    worker.image
                      ? worker.image.startsWith("http")
                        ? worker.image
                        : `http://127.0.0.1:8000${worker.image}`
                      : "https://via.placeholder.com/400x400?text=No+Image"
                  }
                  alt={worker.name}
                  className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl object-cover shadow-2xl border-4 border-white"
                />
              </div>
            </div>

            {/* Worker Details */}
            <div className="lg:col-span-2 p-10 bg-gradient-to-br from-primary/80 via-primary/70 to-primary/60 rounded-lg text-white text-center lg:text-left relative overflow-hidden shadow-lg">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-md">
                {worker.name || "Professional Worker"}
              </h1>
              <p className="text-xl md:text-2xl mb-6 opacity-90">
                {worker.profession || "Service Provider"}
              </p>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-md rounded-xl p-4 hover:bg-white/30 transition-all duration-300">
                  <div className="text-3xl font-bold mb-2">{worker.rating || "4.5"}</div>
                  <div className="text-sm opacity-80">Rating</div>
                </div>
                <div className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-md rounded-xl p-4 hover:bg-white/30 transition-all duration-300">
                  <div className="text-3xl font-bold mb-2">{worker.ratings?.total_ratings || "0"}</div>
                  <div className="text-sm opacity-80">Reviews</div>
                </div>
                <div className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-md rounded-xl p-4 hover:bg-white/30 transition-all duration-300">
                  <div className="text-3xl font-bold mb-2">{worker.completedJobs || "0"}</div>
                  <div className="text-sm opacity-80">Jobs Done</div>
                </div>
                <div className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-md rounded-xl p-4 hover:bg-white/30 transition-all duration-300">
                  <div className="text-3xl font-bold mb-2">{worker.experience ? worker.experience.split(" ")[0] : "0"}</div>
                  <div className="text-sm opacity-80">Years Exp</div>
                </div>
              </div>

              <div
                className="inline-flex items-center px-4 py-2 rounded-full font-semibold uppercase tracking-wide shadow-md transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                style={{
                  backgroundColor: worker.availability === "Available Today" ? "#34D399" : "#FBBF24",
                  color: worker.availability === "Available Today" ? "#fff" : "#000",
                }}
              >
                <div className="w-2 h-2 bg-current rounded-full mr-2 animate-pulse" />
                {worker.availability || "Contact for Availability"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        {/* About */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-primary mb-4">About {worker.name}</h2>
          <p className="text-gray-700 mb-6">{worker.bio || "Professional service provider with years of experience."}</p>
        </div>

        {/* Services */}
        {worker.services?.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-primary mb-6">Services Offered</h2>
            <div className="space-y-4">
              {worker.services.map((service) => (
                <div key={service.id} className="border border-gray-200 rounded-xl p-4 hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-green">{service.name}</h3>
                      <p className="text-gray-600 text-sm">{service.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">₹{service.price}</div>
                      {service.duration && <div className="text-sm text-gray-500">{service.duration}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rating */}
        {user?.role === "user" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-primary mb-4">Rate This Worker</h2>
            {!showReviewForm ? (
              <button onClick={() => setShowReviewForm(true)} className="w-full bg-yellow text-primary font-semibold py-3 rounded-xl hover:bg-yellow/90 transition-colors">
                Add Your Rating
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setUserRating(star)} className={`w-8 h-8 ${star <= userRating ? "text-yellow-400" : "text-gray-300"}`}>
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <button onClick={handleRatingSubmit} className="w-full bg-gray-400 text-primary font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors">
                  Submit
                </button>
              </div>
            )}
          </div>
        )}

        {/* Booking */}
        {user?.role === "user" && (
        <div className="flex justify-center mt-10">
          <button
            onClick={handleBooking}
            disabled={redirecting}
            className="px-8 py-4 bg-yellow text-primary text-lg font-semibold rounded-xl shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 disabled:opacity-60"
          >
            {redirecting ? "Redirecting to booking..." : "Book This Worker"}
          </button>
        </div>
        )}

        {/* Reviews Section ✅ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-primary mb-6">User Reviews</h2>
          {worker.reviews?.length > 0 ? (
            <div className="space-y-4">
              {worker.reviews.map((rev) => (
                <div key={rev.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-green">{rev.user__username}</span>
                    <span className="text-yellow-400">
                      {"★".repeat(rev.rating) + "☆".repeat(5 - rev.rating)}
                    </span>
                  </div>
                  {rev.review && <p className="text-gray-700">{rev.review}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center mt-2">No reviews yet. Be the first to rate!</p>
          )}
        </div>
      </div>
    </div>
  );
}

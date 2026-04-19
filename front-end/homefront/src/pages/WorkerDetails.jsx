// src/pages/WorkerDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {rateWorker, getAuthData, redirectToLogin} from "../utils/useHelper";
import AlertToast from "../components/AlertToast";

export default function WorkerDetails() {
  const { workerId } = useParams();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const closeToast = () => setToast(null);

  const { user } = getAuthData();

  useEffect(() => {
    const fetchWorkerDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://127.0.0.1:8000/workers/${workerId}/`
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
          reviews: data.reviews || [] // attach reviews
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerDetails();
  }, [workerId]);

  // Rating submit handler
  const handleRatingSubmit = async () => {
    if (!user || user.role?.toLowerCase() !== "user") {
      return redirectToLogin();
    }

    if (userRating === 0) {
      setToast({
        type: 'warning',
        title: 'Rating Required',
        message: 'Please select a rating before submitting your review.',
      });
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

      setToast({
        type: 'success',
        title: 'Review Submitted',
        message: 'Thank you! Your rating has been recorded.',
      });
      setShowReviewForm(false);
      setUserRating(0);
      setReviewText("");
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Review Failed',
        message: err?.toString() || 'Unable to submit your review at this time.',
      });
    }
  };

  // Booking handler 
  const handleBooking = () => {
    if (!user || user.role?.toLowerCase() !== "user") return redirectToLogin();
    setRedirecting(true);
    setTimeout(() => {
      navigate(`/booking/${workerId}`, { replace: true });
    }, 1200);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green mx-auto"></div>
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
          className="inline-block px-6 py-3 bg-yellow text-green font-semibold rounded-lg hover:bg-yellow/90 transition"
        >
          Back to Workers
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-green min-h-screen">
      {toast && (
        <AlertToast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={closeToast}
        />
      )}
      <div className="max-w-6xl mx-auto px-4 pt-24 sm:pt-28 pb-12">
        <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-7 sm:p-10">
            <div className="flex items-center justify-between gap-4 mb-8">
              <Link
                to="/worker"
                className="inline-flex items-center gap-2 text-green hover:text-green/90 transition-colors"
              >
                <span className="text-xl">←</span>
                <span className="font-semibold">Back to Workers</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4">
                <div className="flex flex-col items-center lg:items-start">
                  <img
                    src={
                      worker.image
                        ? worker.image.startsWith("http")
                          ? worker.image
                          : `http://127.0.0.1:8000${worker.image}`
                        : "https://via.placeholder.com/400x400?text=No+Image"
                    }
                    alt={worker.name}
                    className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl object-cover border border-black/10 shadow-sm"
                  />

                  <div className="mt-5 text-center lg:text-left w-full">
                    <h1 className="text-3xl sm:text-4xl font-bold text-green tracking-tight">
                      {worker.name || "Professional Worker"}
                    </h1>
                    <p className="mt-1 text-lg sm:text-xl font-semibold text-green/80">
                      {worker.profession || "Service Provider"}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ring-1 ring-inset ${
                          worker.availability === "Available Today"
                            ? "bg-light_green text-green ring-green/20"
                            : "bg-yellow/30 text-green ring-yellow/40"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-current" />
                        {worker.availability || "Contact for Availability"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
                  <div className="rounded-2xl bg-light_green p-4 ring-1 ring-green/10">
                    <div className="text-2xl font-bold text-green">{worker.rating || "0"}</div>
                    <div className="text-sm text-green/80">Rating</div>
                  </div>
                  <div className="rounded-2xl bg-light_green p-4 ring-1 ring-green/10">
                    <div className="text-2xl font-bold text-green">{worker.ratings?.total_ratings || "0"}</div>
                    <div className="text-sm text-green/80">Reviews</div>
                  </div>
                  <div className="rounded-2xl bg-light_green p-4 ring-1 ring-green/10">
                    <div className="text-2xl font-bold text-green">{worker.completedJobs || "0"}</div>
                    <div className="text-sm text-green/80">Jobs Done</div>
                  </div>
                  <div className="rounded-2xl bg-light_green p-4 ring-1 ring-green/10">
                    <div className="text-2xl font-bold text-green">{worker.experience ? worker.experience.split(" ")[0] : "0"}</div>
                    <div className="text-sm text-green/80">Years Exp</div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-8">
                    <div className="rounded-2xl border border-black/5 bg-white p-6">
                      <h2 className="text-xl sm:text-2xl font-bold text-green mb-3">About</h2>
                      <p className="text-gray-700 leading-relaxed">
                        {worker.bio || "Professional service provider with years of experience."}
                      </p>
                    </div>

                    {worker.services?.length > 0 && (
                      <div className="rounded-2xl border border-black/5 bg-white p-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-green mb-5">Services Offered</h2>
                        <div className="space-y-3">
                          {worker.services.map((service) => (
                            <div
                              key={service.id}
                              className="rounded-2xl border border-black/5 p-4 hover:border-green/20 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <h3 className="text-base sm:text-lg font-semibold text-green truncate">{service.name}</h3>
                                  {service.description && (
                                    <p className="mt-1 text-sm text-gray-600">{service.description}</p>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-xl sm:text-2xl font-bold text-green">₹{service.price}</div>
                                  {service.duration && <div className="text-sm text-gray-500">{service.duration}</div>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="rounded-2xl border border-black/5 bg-white p-6">
                      <h2 className="text-xl sm:text-2xl font-bold text-green mb-5">User Reviews</h2>
                      {worker.reviews?.length > 0 ? (
                        <div className="space-y-3">
                          {worker.reviews.map((rev) => (
                            <div key={rev.id} className="rounded-2xl border border-black/5 p-4">
                              <div className="flex items-center justify-between gap-3 mb-2">
                                <span className="font-semibold text-green truncate">
                                  {rev.user__username || "User"}
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="text-yellow">
                                    {"★".repeat(rev.rating)}
                                  </span>
                                  <span className="text-gray-300">
                                    {"☆".repeat(5 - rev.rating)}
                                  </span>
                                  <span className="text-sm text-gray-600 ml-1">
                                    ({rev.rating}/5)
                                  </span>
                                </div>
                              </div>
                              {rev.review && <p className="text-gray-700 mt-2">{rev.review}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No reviews yet. Be the first to rate!</p>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-4">
                    <div className="lg:sticky lg:top-28 space-y-5">
                      <div className="rounded-2xl border border-black/5 bg-white p-6">
                        <h2 className="text-xl font-bold text-green mb-4">Book This Worker</h2>
                        {user?.role?.toLowerCase() === "user" ? (
                          <button
                            onClick={handleBooking}
                            disabled={redirecting}
                            className="w-full bg-[#1c392e] text-white font-semibold py-3 rounded-xl hover:bg-[#1c392e]/90 transition-colors disabled:opacity-50"
                          >
                            {redirecting ? "Redirecting..." : "Book Now"}
                          </button>
                        ) : (
                          <div className="text-center py-2">
                            <p className="text-gray-600 text-sm mb-3">
                              Please log in as a user to book this worker
                            </p>
                            <Link
                              to="/login"
                              className="inline-block px-4 py-2 bg-yellow text-green font-semibold rounded-lg hover:bg-yellow/90 transition-colors"
                            >
                              Login to Book
                            </Link>
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-black/5 bg-white p-6">
                        <h2 className="text-lg font-bold text-green mb-4">Rate This Worker</h2>

                        {user?.role?.toLowerCase() === "user" ? (
                          !showReviewForm ? (
                            <button
                              onClick={() => setShowReviewForm(true)}
                              className="w-full bg-yellow text-green font-semibold py-3 rounded-xl hover:bg-yellow/90 transition-colors"
                            >
                              Add Your Rating
                            </button>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => setUserRating(star)}
                                    className={`w-9 h-9 rounded-lg ring-1 ring-black/5 transition-colors ${
                                      star <= userRating ? "bg-yellow text-green" : "bg-white text-gray-400"
                                    }`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>

                              <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                rows={4}
                                placeholder="Write a short review (optional)"
                                className="w-full p-3 border border-black/10 rounded-xl focus:ring-2 focus:ring-green focus:border-green outline-none"
                              />

                              <div className="flex gap-3">
                                <button
                                  onClick={() => {
                                    setShowReviewForm(false);
                                    setUserRating(0);
                                    setReviewText("");
                                  }}
                                  className="flex-1 py-3 rounded-xl font-semibold border border-black/10 text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleRatingSubmit}
                                  className="flex-1 py-3 rounded-xl font-semibold bg-green text-white hover:bg-green/90 transition-colors"
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-600 text-sm mb-3">
                              Please log in as a user to rate this worker
                            </p>
                            <Link
                              to="/login"
                              className="inline-block px-4 py-2 bg-yellow text-green font-semibold rounded-lg hover:bg-yellow/90 transition-colors"
                            >
                              Login to Rate
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

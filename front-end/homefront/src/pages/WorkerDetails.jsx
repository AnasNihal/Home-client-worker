// src/pages/WorkerDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import {
  fetchAPI,
  postAPI,
  getImageURL,
} from "../utils/api";

import { rateWorker, getAuthData, redirectToLogin } from "../utils/useHelper";

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

  /* -------------------- FETCH WORKER DETAILS -------------------- */
  useEffect(() => {
    const loadWorker = async () => {
      try {
        setLoading(true);

        const data = await fetchAPI(`/worker/worker_details/${workerId}`);

        const profession =
          typeof data.profession === "string"
            ? data.profession
            : data.profession?.name || "Service Provider";

        const services =
          Array.isArray(data.services) && data.services.length > 0
            ? data.services.map((s) => ({
                ...s,
                name: s.name || s.services,
              }))
            : [];

        setWorker({
          ...data,
          profession,
          services,
          reviews: data.reviews || [],
        });
      } catch (err) {
        setError(err.message || "Failed to load worker");
      } finally {
        setLoading(false);
      }
    };

    loadWorker();
  }, [workerId]);

  /* -------------------- RATE WORKER -------------------- */
  const handleRatingSubmit = async () => {
    if (!user || user.role !== "user") return redirectToLogin();

    if (userRating === 0) {
      alert("Please give a rating");
      return;
    }

    try {
      const data = await rateWorker(workerId, userRating, reviewText);

      setWorker((prev) => ({
        ...prev,
        rating: data.average_rating,
        ratings: { total_ratings: data.total_ratings },
        reviews: [
          {
            id: Date.now(),
            user__username: "You",
            rating: userRating,
            review: reviewText,
          },
          ...prev.reviews,
        ],
      }));

      alert("Your rating has been submitted");
      setShowReviewForm(false);
      setUserRating(0);
      setReviewText("");
    } catch (err) {
      alert(err.message || "Failed to submit rating");
    }
  };

  /* -------------------- BOOK WORKER -------------------- */
  const handleBooking = () => {
    if (!user || user.role !== "user") return redirectToLogin();

    setRedirecting(true);
    setTimeout(() => {
      navigate(`/booking/${workerId}`);
    }, 1200);
  };

  /* -------------------- LOADING -------------------- */
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center mt-20">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Loading worker details...</p>
      </div>
    );
  }

  /* -------------------- ERROR -------------------- */
  if (error || !worker) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center mt-20">
        <h2 className="text-3xl font-bold mb-4">Worker Not Found</h2>
        <p className="mb-6">{error || "This worker does not exist."}</p>

        <Link
          to="/worker"
          className="px-6 py-3 bg-yellow text-primary rounded-lg font-semibold hover:bg-yellow/90"
        >
          Back to Workers
        </Link>
      </div>
    );
  }

  /* -------------------- MAIN UI -------------------- */
  return (
    <div className="bg-green pt-10 min-h-screen">

      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-primary to-primary/80 py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">

          {/* IMAGE */}
          <div className="flex justify-center">
            <img
              src={worker.image ? getImageURL(worker.image) : "https://via.placeholder.com/400"}
              alt={worker.name}
              className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl object-cover shadow-xl border-4 border-white"
            />
          </div>

          {/* DETAILS */}
          <div className="lg:col-span-2 bg-primary/70 text-white p-10 rounded-xl shadow-xl">
            <h1 className="text-4xl font-extrabold mb-3">{worker.name}</h1>
            <p className="text-xl opacity-90 mb-6">{worker.profession}</p>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <StatCard title="Rating" value={worker.rating || "4.5"} />
              <StatCard
                title="Reviews"
                value={worker.ratings?.total_ratings || "0"}
              />
              <StatCard title="Jobs Done" value={worker.completedJobs || "0"} />
              <StatCard
                title="Years Exp"
                value={worker.experience?.split(" ")[0] || "0"}
              />
            </div>

            <span
              className="px-4 py-2 rounded-full shadow-md inline-flex items-center gap-2 font-semibold"
              style={{
                background:
                  worker.availability === "Available Today" ? "#34D399" : "#FBBF24",
                color: worker.availability === "Available Today" ? "#fff" : "#000",
              }}
            >
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {worker.availability || "Availability Unknown"}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">

        {/* ABOUT */}
        <SectionCard title={`About ${worker.name}`}>
          <p className="text-gray-700">{worker.bio || "No bio available."}</p>
        </SectionCard>

        {/* SERVICES */}
        {worker.services?.length > 0 && (
          <SectionCard title="Services Offered">
            <div className="space-y-4">
              {worker.services.map((service) => (
                <div
                  key={service.id}
                  className="border border-gray-200 p-4 rounded-xl hover:border-primary/30 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{service.name}</h3>
                      <p className="text-gray-600">{service.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        ₹{service.price}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* RATE WORKER */}
        {user?.role === "user" && (
          <SectionCard title="Rate This Worker">
            {!showReviewForm ? (
              <button
                className="w-full bg-yellow text-primary py-3 rounded-xl font-semibold hover:bg-yellow/90"
                onClick={() => setShowReviewForm(true)}
              >
                Add Your Rating
              </button>
            ) : (
              <>
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setUserRating(star)}
                      className={`text-2xl ${
                        star <= userRating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <textarea
                  className="w-full p-3 border rounded-lg"
                  placeholder="Write your review"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />

                <button
                  className="w-full bg-primary text-white py-3 rounded-xl mt-3 hover:bg-primary/90"
                  onClick={handleRatingSubmit}
                >
                  Submit
                </button>
              </>
            )}
          </SectionCard>
        )}

        {/* BOOKING */}
        {user?.role === "user" && (
          <div className="flex justify-center">
            <button
              onClick={handleBooking}
              disabled={redirecting}
              className="px-8 py-4 bg-yellow text-primary text-lg font-semibold rounded-xl hover:scale-105 transition disabled:opacity-60"
            >
              {redirecting ? "Redirecting..." : "Book This Worker"}
            </button>
          </div>
        )}

        {/* REVIEWS */}
        <SectionCard title="User Reviews">
          {worker.reviews?.length > 0 ? (
            <div className="space-y-4">
              {worker.reviews.map((rev) => (
                <div key={rev.id} className="border rounded-xl p-4">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">{rev.user__username}</span>
                    <span className="text-yellow-400">
                      {"★".repeat(rev.rating)}
                      {"☆".repeat(5 - rev.rating)}
                    </span>
                  </div>
                  <p className="text-gray-700">{rev.review}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No reviews yet.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

/* ------------------- UI Helpers ------------------- */

const StatCard = ({ title, value }) => (
  <div className="bg-white/20 text-white rounded-xl p-4 text-center shadow">
    <div className="text-3xl font-bold">{value}</div>
    <div className="text-sm opacity-80">{title}</div>
  </div>
);

const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm">
    <h2 className="text-2xl font-bold text-primary mb-4">{title}</h2>
    {children}
  </div>
);

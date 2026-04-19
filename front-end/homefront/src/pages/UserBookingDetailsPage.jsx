import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import AlertToast from "../components/AlertToast";

const API_BASE_URL = "http://127.0.0.1:8000";

const UserBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const closeToast = () => setToast(null);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_BASE_URL}/user/bookings/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response) return;
      if (!response.ok) throw new Error("Failed to load bookings");
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/bookings/${id}/cancel/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response) return;
      if (!response.ok) throw new Error("Failed to cancel booking");
      const updated = await response.json();
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: updated.status } : b))
      );
      setToast({
        type: 'success',
        title: 'Booking Canceled',
        message: 'Your booking has been canceled successfully.',
      });
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        title: 'Cancel Failed',
        message: 'Could not cancel the booking right now.',
      });
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm("Mark this booking as completed?")) return;

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/bookings/${id}/complete/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response) return;
      if (!response.ok) throw new Error("Failed to complete booking");
      const updated = await response.json();
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: updated.status } : b))
      );
      setToast({
        type: 'success',
        title: 'Booking Completed',
        message: 'Your booking status is now completed.',
      });
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        title: 'Completion Failed',
        message: 'Unable to mark the booking as completed.',
      });
    }
  };

  const handleReview = async (workerId, rating, review) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/reviews/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ worker: workerId, rating, review }),
      });
      if (!response) return;
      if (!response.ok) throw new Error("Failed to submit review");
      setToast({
        type: 'success',
        title: 'Review Submitted',
        message: 'Thank you for your review.',
      });
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        title: 'Review Failed',
        message: 'Could not submit your review. Please try again.',
      });
    }
  };

  const handlePayNow = async (booking) => {
    try {
      setLoading(true);
      
      // Use the new payment flow that doesn't require existing booking
      const res = await fetchWithAuth(
        `${API_BASE_URL}/payments/stripe/checkout/new/${booking.worker.id}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            service_id: booking.service.id,
            date: booking.date,
            time: booking.time,
            payment_mode: "now",
          }),
        }
      );

      if (!res) return;

      const data = await res.json();
      if (!res.ok) {
        setToast({
          type: 'error',
          title: 'Payment Failed',
          message: data.detail || 'Failed to start Stripe Checkout.',
        });
        return;
      }

      if (!data.checkout_url) {
        setToast({
          type: 'error',
          title: 'Payment Failed',
          message: 'Stripe checkout URL missing.',
        });
        return;
      }

      window.location.href = data.checkout_url;
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        title: 'Stripe Error',
        message: 'Error starting Stripe Checkout.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <>
      <AlertToast toast={toast} onClose={closeToast} />
      <div className="min-h-screen bg-light_green p-6 mt-20">
      <h2 className="text-2xl font-bold text-green mb-6">My Bookings</h2>
      {bookings.length === 0 && <p>No bookings found.</p>}
      <div className="space-y-4">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-white p-6 rounded-2xl shadow-md flex flex-col gap-4 hover:shadow-xl"
          >
            {/* Worker Info */}
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => navigate(`/workers/${b.worker.id}`)}
            >
              <img
                src={b.worker.image || "/default-worker.png"}
                alt="Worker"
                className="w-16 h-16 rounded-full object-cover border"
              />
              <div>
                <p>
                  <strong>Worker:</strong> {b.worker.user.username}
                </p>
                <p>
                  <strong>Email:</strong> {b.worker.user.email}
                </p>
                <p>
                  <strong>Service:</strong> {b.service.services}
                </p>
                <p>
                  <strong>Date:</strong> {b.date} at {b.time}
                </p>
                <p className="mt-2 text-sm">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`ml-1 px-3 py-1 rounded-full font-semibold ${
                      b.status === "pending"
                        ? "bg-yellow-200 text-yellow-800"
                        : b.status === "accepted"
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {b.status}
                  </span>
                </p>
                <p className="mt-2 text-sm">
                  <strong>Payment Status:</strong>{" "}
                  <span
                    className={`ml-1 px-3 py-1 rounded-full font-semibold ${
                      b.payment_status === "paid"
                        ? "bg-green-200 text-green-800"
                        : b.payment_status === "failed"
                        ? "bg-red-200 text-red-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {b.payment_status || "pending"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              {b.payment_status !== "paid" && (
                <button
                  onClick={() => handlePayNow(b)}
                  className="px-6 py-2 bg-yellow hover:bg-yellow-500 text-green font-bold rounded-lg shadow-sm"
                >
                  Pay Now
                </button>
              )}
              {b.status.toLowerCase() === "pending" && (
                <button
                  onClick={() => handleCancel(b.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow"
                >
                  Cancel
                </button>
              )}
              {b.status.toLowerCase() === "accepted" && (
                <button
                  onClick={() => handleComplete(b.id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
                >
                  Completed
                </button>
              )}
              {b.status.toLowerCase() === "completed" && (
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold shadow">
                  Work Completed
                </span>
              )}
            </div>


            {/* Rating & Review Section */}
          {["accepted", "completed"].includes(b.status.toLowerCase()) && (
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold mb-2">Leave a Review</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const rating = e.target.rating.value;
                  const review = e.target.review.value;
                  handleReview(b.worker.id, rating, review);
                  e.target.reset();
                }}
                className="space-y-2"
              >
                <input
                  type="number"
                  name="rating"
                  placeholder="Rating (1-5)"
                  min="1"
                  max="5"
                  required
                  className="w-full border rounded-lg p-2"
                />
                <textarea
                  name="review"
                  placeholder="Write your review..."
                  required
                  className="w-full border rounded-lg p-2"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
                >
                  Submit Review
                </button>
              </form>
            </div>
          )}

          </div>
        ))}
      </div>
    </div>
  </>
);

};

export default UserBookingsPage;

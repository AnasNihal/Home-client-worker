import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchWithAuth } from "../utlis/fetchWithAuth";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const confirm = async () => {
      try {
        setLoading(true);
        setError("");

        if (!sessionId) {
          setError("Missing Stripe session id.");
          return;
        }

        const res = await fetchWithAuth(
          `http://127.0.0.1:8000/payments/stripe/confirm/?session_id=${encodeURIComponent(sessionId)}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res) return;

        const data = await res.json();
        if (!res.ok) {
          setError(data.detail || "Failed to confirm payment");
          return;
        }
      } catch (e) {
        setError("Failed to confirm payment");
      } finally {
        setLoading(false);
      }
    };

    confirm();
  }, [sessionId]);

  return (
    <div className="bg-green min-h-screen">
      <div className="max-w-3xl mx-auto px-4 pt-24 sm:pt-28 pb-12">
        <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-7 sm:p-10 text-center">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green mx-auto"></div>
                <p className="mt-4 text-lg">Confirming payment...</p>
              </>
            ) : error ? (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold text-green">Payment received</h1>
                <p className="mt-3 text-gray-700">But we couldn’t verify it automatically.</p>
                <p className="mt-2 text-sm text-gray-600">{error}</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold text-green">Payment Successful</h1>
                <p className="mt-3 text-gray-700">Your booking payment has been confirmed.</p>
              </>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/booking/details"
                className="px-6 py-3 rounded-xl bg-yellow text-green font-semibold hover:bg-yellow/90 transition"
              >
                View My Bookings
              </Link>
              <Link
                to="/"
                className="px-6 py-3 rounded-xl border border-black/10 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

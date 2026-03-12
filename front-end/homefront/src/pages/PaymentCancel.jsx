import React from "react";
import { Link } from "react-router-dom";

export default function PaymentCancel() {
  return (
    <div className="bg-green min-h-screen">
      <div className="max-w-3xl mx-auto px-4 pt-24 sm:pt-28 pb-12">
        <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-7 sm:p-10 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-green">Payment Cancelled</h1>
            <p className="mt-3 text-gray-700">You cancelled the payment. Your booking was created but is still unpaid.</p>

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

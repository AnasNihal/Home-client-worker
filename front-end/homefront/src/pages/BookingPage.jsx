// src/pages/BookingPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import AlertToast from "../components/AlertToast";

export default function BookingPage() {
  const { workerId } = useParams();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaymentChoice, setShowPaymentChoice] = useState(false);
  const [toast, setToast] = useState(null);

  const closeToast = () => setToast(null);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    // Fetch worker details
    fetch(`http://127.0.0.1:8000/workers/${workerId}/`)
      .then((res) => res.json())
      .then((data) => {
        setWorker(data);
        setServices(data.services);
      })
      .catch((err) => console.error(err));
  }, [workerId]);

  const workerImageSrc = worker?.image
    ? worker.image.startsWith("http")
      ? worker.image
      : `http://127.0.0.1:8000${worker.image}`
    : "";

  const workerProfessionName =
    typeof worker?.profession === "string"
      ? worker.profession
      : worker?.profession?.name || "Service Provider";

  // Toggle service selection (only one service)
  const toggleService = (service) => {
    setSelectedService((prev) =>
      prev?.id === service.id ? null : service
    );
  };

  const createPayLaterBooking = async () => {
    if (!selectedService || !date || !time) {
      setToast({
        type: 'warning',
        title: 'Incomplete Booking',
        message: 'Please select a service, date, and time before continuing.',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWithAuth(`http://127.0.0.1:8000/workers/${workerId}/book/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: selectedService.id,
          date,
          time,
          payment_mode: "later",
        }),
      });

      if (!res) return;

      const data = await res.json();

      if (!res.ok) {
        setToast({
          type: 'error',
          title: 'Booking Failed',
          message: data.detail || 'Failed to create booking. Please try again.',
        });
        return;
      }

      setToast({
        type: 'success',
        title: 'Booking Confirmed',
        message: 'Your booking is confirmed and payment is pending.',
      });
      navigate("/user/bookings");
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        title: 'Booking Error',
        message: 'Error creating booking. Please try again.',
      });
    } finally {
      setLoading(false);
      setShowPaymentChoice(false);
    }
  };

  const startStripeCheckout = async () => {
    if (!selectedService || !date || !time) {
      setToast({
        type: 'warning',
        title: 'Incomplete Booking',
        message: 'Please select a service, date, and time before continuing.',
      });
      return;
    }

    // Check minimum amount (₹100 minimum for Stripe)
    if (parseFloat(selectedService.price) < 100) {
      setToast({
        type: 'warning',
        title: 'Minimum Amount Required',
        message: 'Please select a service priced at least ₹100.',
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Create Stripe Checkout session WITHOUT creating booking first
      const stripeRes = await fetchWithAuth(
        `http://127.0.0.1:8000/payments/stripe/checkout/new/${workerId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            service_id: selectedService.id,
            date,
            time,
            payment_mode: "now",
          }),
        }
      );

      if (!stripeRes) return;
      const stripeData = await stripeRes.json();

      if (!stripeRes.ok) {
        setToast({
          type: 'error',
          title: 'Checkout Error',
          message: stripeData.detail || 'Failed to start Stripe Checkout.',
        });
        setLoading(false);
        return;
      }

      if (!stripeData.checkout_url) {
        setToast({
          type: 'error',
          title: 'Checkout Error',
          message: 'Stripe checkout URL is missing. Please check backend configuration.',
        });
        setLoading(false);
        return;
      }

      // 2. Redirect to Stripe for payment - booking will be created only after successful payment
      window.location.href = stripeData.checkout_url;
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        title: 'Checkout Error',
        message: 'Error starting Stripe Checkout. Please try again.',
      });
    } finally {
      setLoading(false);
      setShowPaymentChoice(false);
    }
  };

  const handleConfirmClick = () => {
    if (!selectedService || !date || !time) {
      setToast({
        type: 'warning',
        title: 'Incomplete Booking',
        message: 'Please select a service, date, and time.',
      });
      return;
    }

    // Validate time is within working hours (9 AM to 6 PM)
    const [hours, minutes] = time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    const morningStart = 9 * 60; // 9 AM
    const eveningEnd = 18 * 60; // 6 PM

    if (timeInMinutes < morningStart || timeInMinutes >= eveningEnd) {
      setToast({
        type: 'warning',
        title: 'Invalid Time',
        message: 'Workers are only available from 9 AM to 6 PM.',
      });
      return;
    }

    setShowPaymentChoice(true);
  };


  if (!worker)
    return (
      <div className="max-w-4xl mx-auto p-8 text-center mt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green mx-auto"></div>
        <p className="mt-4 text-lg">Loading booking...</p>
      </div>
    );

  return (
    <div className="bg-green min-h-screen">
      {toast && (
        <AlertToast
          toast={toast}
          onClose={closeToast}
        />
      )}
      <div className="max-w-6xl mx-auto px-4 pt-24 sm:pt-28 pb-12">
        <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-7 sm:p-10">
            <div className="flex items-center justify-between gap-4 mb-8">
              <Link
                to={`/workers/${workerId}`}
                className="inline-flex items-center gap-2 text-green hover:text-green/90 transition-colors"
              >
                <span className="text-xl">←</span>
                <span className="font-semibold">Back to Worker</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-8">
                <div className="rounded-2xl bg-light_green p-6 ring-1 ring-green/10">
                  <div className="flex items-center gap-4">
                    {workerImageSrc ? (
                      <img
                        src={workerImageSrc}
                        alt={worker.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-black/10"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white ring-1 ring-black/5 flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}

                    <div className="min-w-0">
                      <h2 className="text-2xl sm:text-3xl font-bold text-green truncate">
                        {worker.name || "Worker"}
                      </h2>
                      <p className="text-green/80 font-semibold">
                        {workerProfessionName}
                      </p>
                      {worker.location && <p className="text-gray-600">{worker.location}</p>}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-black/5 bg-white p-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-green mb-5">
                    Select Service
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => {
                      const isSelected = selectedService?.id === service.id;
                      return (
                        <button
                          type="button"
                          key={service.id}
                          onClick={() => toggleService(service)}
                          className={`text-left rounded-2xl border p-5 transition-all ${
                            isSelected
                              ? "border-yellow bg-yellow/20"
                              : "border-black/10 hover:border-green/20 hover:bg-black/5"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-base font-semibold text-green truncate">
                                {service.name || service.services}
                              </p>
                              {service.description && (
                                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                  {service.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-lg font-bold text-green">₹{service.price}</span>
                              <span
                                className={`w-5 h-5 rounded-full ring-2 ring-offset-2 ring-offset-white ${
                                  isSelected ? "bg-yellow ring-yellow" : "bg-white ring-black/10"
                                }`}
                              />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-black/5 bg-white p-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-green mb-5">
                    Choose Date & Time
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-green font-semibold mb-2">Select Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={getTodayDate()}
                        className="w-full p-3 border border-black/10 rounded-xl focus:ring-2 focus:ring-green focus:border-green outline-none"
                      />
                      <p className="mt-1 text-xs text-gray-500">Only upcoming dates available</p>
                    </div>
                    <div>
                      <label className="block text-green font-semibold mb-2">Select Time</label>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        min="09:00"
                        max="18:00"
                        className="w-full p-3 border border-black/10 rounded-xl focus:ring-2 focus:ring-green focus:border-green outline-none"
                      />
                      <p className="mt-1 text-xs text-gray-500">Available: 9 AM to 6 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-28 space-y-5">
                  <div className="rounded-2xl border border-black/5 bg-white p-6">
                    <h3 className="text-lg font-bold text-green mb-4">Booking Summary</h3>

                    <div className="space-y-3 text-gray-700">
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-gray-600">Worker</span>
                        <span className="font-semibold text-green text-right">{worker.name}</span>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-gray-600">Service</span>
                        <span className="font-semibold text-green text-right">
                          {selectedService ? (selectedService.services || selectedService.name) : "Select a service"}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-gray-600">Price</span>
                        <span className="font-semibold text-green text-right">
                          {selectedService ? `₹${selectedService.price}` : "—"}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-gray-600">Date</span>
                        <span className="font-semibold text-green text-right">{date || "Select date"}</span>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-gray-600">Time</span>
                        <span className="font-semibold text-green text-right">{time || "Select time"}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={handleConfirmClick}
                        disabled={loading}
                        className="w-full py-3 bg-yellow text-green font-bold rounded-xl shadow-sm hover:shadow-md hover:bg-yellow/90 transition-all disabled:opacity-60"
                      >
                        {loading ? "Booking..." : "Confirm Booking"}
                      </button>
                      <p className="mt-3 text-sm text-gray-600">
                        After confirming, you can choose Pay Now or Pay Later (Pay Later adds ₹20).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {showPaymentChoice && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setShowPaymentChoice(false)}
                />
                <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-black/10">
                  <h3 className="text-xl font-bold text-green">Choose Payment</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Pay now redirects to Stripe Checkout (test mode). Pay later adds ₹20.
                  </p>

                  <div className="mt-5 space-y-3">
                    <button
                      onClick={startStripeCheckout}
                      disabled={loading}
                      className="w-full py-3 rounded-xl font-semibold bg-yellow text-green hover:bg-yellow/90 transition-colors disabled:opacity-60"
                    >
                      Pay Now
                    </button>
                    <button
                      onClick={createPayLaterBooking}
                      disabled={loading}
                      className="w-full py-3 rounded-xl font-semibold bg-yellow text-green hover:bg-yellow/90 transition-colors disabled:opacity-60"
                    >
                      Pay Later (+₹20)
                    </button>
                    <button
                      onClick={() => setShowPaymentChoice(false)}
                      className="w-full py-3 rounded-xl font-semibold border border-black/10 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

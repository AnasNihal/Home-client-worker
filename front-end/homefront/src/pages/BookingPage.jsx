// src/pages/BookingPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const theme = {
  green: "#1c392e",
  yellow: "#f5d543",
  white: "#ffff",
  light_green: "#EAF4E7",
};

export default function BookingPage() {
  const { workerId } = useParams();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch worker details
    fetch(`http://127.0.0.1:8000/api/worker/worker_details/${workerId}`)
      .then((res) => res.json())
      .then((data) => {
        setWorker(data);
        setServices(data.services);
      })
      .catch((err) => console.error(err));
  }, [workerId]);

  // Toggle service selection (only one service)
  const toggleService = (service) => {
    setSelectedService((prev) =>
      prev?.id === service.id ? null : service
    );
  };

const handleBooking = async () => {
  if (!selectedService || !date || !time) {
    alert("Please select one service, a date, and a time");
    return;
  }

  setLoading(true);
  try {
    const token = localStorage.getItem("access"); // JWT token
    const res = await fetch(`http://127.0.0.1:8000/workers/${workerId}/book/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        service_id: selectedService.id, // only one service
        date,
        time,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Show backend message if available
      alert(data.detail || "Failed to create booking");
      return;
    }

    alert("Booking confirmed!");
    navigate("/"); // redirect after booking
  } catch (err) {
    console.error(err);
    alert("Error creating booking");
  } finally {
    setLoading(false);
  }
};


  if (!worker) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div
      className="min-h-screen p-6 pt-24"
      style={{ backgroundColor: theme.light_green }}
    >
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        {/* Worker Info */}
        <div className="flex items-center mb-6">
          {worker.image ? (
            <img
              src={worker.image}
              alt={worker.name}
              className="w-24 h-24 rounded-full mr-4 object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-300 mr-4 flex items-center justify-center text-gray-600">
              No Image
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold" style={{ color: theme.green }}>
              {worker.name}
            </h2>
            <p className="text-gray-700">{worker.profession.name}</p>
            <p className="text-gray-500">{worker.location}</p>
          </div>
        </div>

        {/* Service Selection */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2" style={{ color: theme.green }}>
            Select Service
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => {
              const isSelected = selectedService?.id === service.id;
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service)}
                  className={`relative p-4 border rounded-lg cursor-pointer select-none transition duration-200 ${
                    isSelected ? "border-yellow-500 bg-yellow-50" : "hover:bg-gray-50"
                  }`}
                >
                  {/* Checkbox in top-right corner */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="absolute top-2 right-2 w-5 h-5 text-yellow-500 border-gray-300 rounded"
                  />

                  <h4 className="font-semibold text-green-900">
                    {service.name || service.services}
                  </h4>
                  <p className="text-gray-600">{service.description}</p>
                  <p className="font-bold mt-2">₹{service.price}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Date & Time */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-green-900 font-semibold mb-1">
              Select Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-green-900 font-semibold mb-1">
              Select Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Booking Summary */}
        {selectedService && date && time && (
          <div className="mb-6 p-4 border rounded-lg bg-yellow-50">
            <h3 className="font-semibold text-green-900 mb-2">Booking Summary</h3>
            <p>
              <strong>Worker:</strong> {worker.name}
            </p>
            <p>
              <strong>Service:</strong>{" "}
              {selectedService.services || selectedService.name} — ₹
              {selectedService.price}
            </p>
            <p className="mt-2">
              <strong>Date:</strong> {date} at {time}
            </p>
          </div>
        )}

        {/* Confirm Button */}
        <button
          onClick={handleBooking}
          disabled={loading}
          className="w-full py-3 text-white font-bold rounded-lg"
          style={{ backgroundColor: theme.green }}
        >
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}

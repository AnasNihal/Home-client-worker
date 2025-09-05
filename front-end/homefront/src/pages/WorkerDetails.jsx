import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

export default function WorkerDetails() {
  const { workerId } = useParams();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchWorkerDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/worker/worker_details/${workerId} `);
        if (!response.ok) {
          throw new Error('Worker not found');
        }
        const data = await response.json();
        setWorker(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerDetails();
  }, [workerId]);

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

  const handleBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      alert("Please select a service, date, and time slot");
      return;
    }
    
    const selectedServiceData = worker.services.find(s => s.id === selectedService);
    alert(`Booking confirmed!\nService: ${selectedServiceData.name}\nDate: ${selectedDate}\nTime: ${selectedTime}\nPrice: ₹${selectedServiceData.price}`);
  };

  const handleRatingSubmit = () => {
    if (userRating === 0) {
      alert("Please select a rating");
      return;
    }
    alert(`Thank you for your ${userRating}-star rating!`);
    setShowReviewForm(false);
    setUserRating(0);
    setReviewText("");
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
                  src={worker.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"}
                  alt={worker.name}
                  className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl object-cover shadow-2xl border-4 border-white"
                />
              </div>
            </div>

            {/* Worker Details */}
            <div className="lg:col-span-2 p-10 bg-gradient-to-br from-primary/80 via-primary/70 to-primary/60 rounded-lg text-white text-center lg:text-left relative overflow-hidden shadow-lg">
              {/* Decorative floating circles */}
              <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full animate-bounce-slow" />
              <div className="absolute bottom-[-30px] left-[-30px] w-16 h-16 bg-white/10 rounded-full animate-bounce-slow delay-200" />

              {/* Main Header: Name & Profession */}
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-md">
                {worker.name || 'Professional Worker'}
              </h1>
              <p className="text-xl md:text-2xl mb-6 opacity-90">{worker.profession || 'Service Provider'}</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-md rounded-xl p-4 hover:bg-white/30 transition-all duration-300">
                  <div className="text-3xl font-bold mb-2">{worker.rating || '4.5'}</div>
                  <div className="text-sm opacity-80">Rating</div>
                </div>
                <div className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-md rounded-xl p-4 hover:bg-white/30 transition-all duration-300">
                  <div className="text-3xl font-bold mb-2">{worker.reviews || '0'}</div>
                  <div className="text-sm opacity-80">Reviews</div>
                </div>
                <div className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-md rounded-xl p-4 hover:bg-white/30 transition-all duration-300">
                  <div className="text-3xl font-bold mb-2">{worker.completedJobs || '0'}</div>
                  <div className="text-sm opacity-80">Jobs Done</div>
                </div>
                <div className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-md rounded-xl p-4 hover:bg-white/30 transition-all duration-300">
                  <div className="text-3xl font-bold mb-2">
                    {worker.experience ? worker.experience.split(' ')[0] : '0'}
                  </div>
                  <div className="text-sm opacity-80">Years Exp</div>
                </div>
              </div>

              {/* Availability Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full font-semibold uppercase tracking-wide shadow-md transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                style={{
                  backgroundColor: worker.availability === "Available Today" ? '#34D399' : '#FBBF24',
                  color: worker.availability === "Available Today" ? '#fff' : '#000',
                }}
              >
                <div className="w-2 h-2 bg-current rounded-full mr-2 animate-pulse" />
                {worker.availability || 'Contact for Availability'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column - Worker Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-primary mb-4">About {worker.name}</h2>
              <p className="text-gray-700 mb-6">{worker.bio || 'Professional service provider with years of experience.'}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {worker.languages && worker.languages.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-primary mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {worker.languages.map((lang, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-primary mb-2">Location</h3>
                  <p className="text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {worker.location || 'Location not specified'}
                  </p>
                </div>
              </div>

              {worker.phone && (
                <div className="mt-6">
                  <h3 className="font-semibold text-primary mb-2">Contact</h3>
                  <p className="text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    {worker.phone}
                  </p>
                </div>
              )}
            </div>

            {/* Services Section */}
            {worker.services && worker.services.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-primary mb-6">Services Offered</h2>
                <div className="space-y-4">
                  {worker.services.map((service) => (
                    <div key={service.id} className="border border-gray-200 rounded-xl p-4 hover:border-primary/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-green">{service.services}</h3>
                          <p className="text-gray-600 text-sm">{service.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">₹{service.price}</div>
                          {service.duration && (
                            <div className="text-sm text-gray-500">{service.duration}</div>
                          )}
                        </div>
                      </div>
                      
                      {service.includes && service.includes.length > 0 && (
                        <div className="border-t pt-3">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">What's included:</h4>
                          <div className="flex flex-wrap gap-2">
                            {service.includes.map((item, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                                ✓ {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work Gallery */}
            {worker.gallery && worker.gallery.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-primary mb-6">Previous Work</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {worker.gallery.map((image, index) => (
                    <img 
                      key={index}
                      src={image}
                      alt={`Work sample ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking & Rating */}
          <div className="space-y-6 sticky top-8">
            
            {/* Booking Card */}
            {worker.services && worker.services.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-primary mb-6">Book a Service</h2>
                
                {/* Service Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Service</label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Choose a service</option>
                    {worker.services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ₹{service.price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Time Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Time</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 text-xs rounded-lg font-medium transition-colors ${
                          selectedTime === time
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Display */}
                {selectedService && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Total Amount:</span>
                      <span className="text-2xl font-bold text-primary">
                        ₹{worker.services.find(s => s.id === selectedService)?.price}
                      </span>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <button
                  onClick={handleBooking}
                  className="w-full bg-yellow text-primary font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Book Now
                </button>
              </div>
            )}

            {/* Rating & Review Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-4">Rate This Worker</h2>
              
              {!showReviewForm ? (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full bg-yellow text-primary font-semibold py-3 rounded-xl hover:bg-yellow/90 transition-colors"
                >
                  Add Your Rating
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Star Rating */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setUserRating(star)}
                          className={`w-8 h-8 ${
                            star <= userRating ? "text-yellow-400" : "text-gray-300"
                          }`}
                        >
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review (Optional)</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      rows="3"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleRatingSubmit}
                      className="flex-1 bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Submit Rating
                    </button>
                    <button
                      onClick={() => {
                        setShowReviewForm(false);
                        setUserRating(0);
                        setReviewText("");
                      }}
                      className="px-4 bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

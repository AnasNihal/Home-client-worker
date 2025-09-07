// src/pages/contactus.jsx
import React, { useState } from "react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Message sent!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Contact Us</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl w-full">
        
        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-2xl p-8 space-y-6"
        >
          <div>
            <label className="block text-gray-700 font-medium mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows="5"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Send Message
          </button>
        </form>

        {/* Google Maps */}
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <iframe
            title="contact-map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.1913542030766!2d-122.41941538468103!3d37.77492977975914!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858064dfdcd1ab%3A0xdee0e6f0f80a7a4!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1633906766815!5m2!1sen!2sus"
            width="100%"
            height="450"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

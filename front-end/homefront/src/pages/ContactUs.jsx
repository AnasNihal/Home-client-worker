// src/pages/contactus.jsx
import React from "react";
import TopSection from '../components/TopSection';

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-light_green">
      {/* TopSection Component */}
      <TopSection
        title="Contact Us"
        subtitle="Get in Touch"
        bgColor="bg-[#1c392e]"
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Get in Touch</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green">📍</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Address</h4>
                    <p className="text-gray-600 text-sm">123 Service Lane<br />Koramangala, Bengaluru<br />Karnataka 560034, India</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green">📞</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Phone</h4>
                    <p className="text-gray-600 text-sm">+91 80 1234 5678</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green">✉️</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Email</h4>
                    <p className="text-gray-600 text-sm">support@homeservices.in</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Business Hours</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Saturday</span>
                  <span className="font-medium">10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sunday</span>
                  <span className="font-medium">10:00 AM - 4:00 PM</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Our Location</h3>
              <p className="text-gray-600 text-sm mt-1">Visit our office in Bengaluru</p>
            </div>
            <iframe
              title="contact-map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.382726734631!2d77.62242657477147!3d12.9352291876899!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b4416d%3A0x9d6c6c6c6c6c6c6c!2sKoramangala%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1633906766815!5m2!1sen!2sin"
              width="100%"
              height="350"
              allowFullScreen=""
              loading="lazy"
              className="border-0"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

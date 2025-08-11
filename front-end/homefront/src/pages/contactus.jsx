import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TopSection from '../components/TopSection';
import Form from '../components/VideoForm';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    alert('Message sent successfully!');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <>
    <div className="bg-light_green min-h-screen">
        <TopSection
        title="Contact Us"
        subtitle="Cleaning Conpany"
        />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Contact Information - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* Address */}
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center group hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-primary mb-3">Our Address</h3>
            <div className="text-gray-700 space-y-1">
              <p className="font-semibold">ServiceHub Headquarters</p>
              <p>123 Main Street</p>
              <p>Downtown District</p>
              <p>City, State 12345</p>
              <p>India</p>
            </div>
          </div>

          {/* Phone */}
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center group hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-primary mb-3">Phone Numbers</h3>
            <div className="text-gray-700 space-y-2">
              <p className="font-semibold">Customer Service:</p>
              <p className="text-lg font-bold text-primary">+91 98765 43210</p>
              <p className="font-semibold mt-3">Emergency Line:</p>
              <p className="text-lg font-bold text-red-600">+91 98765 43211</p>
              <p className="text-sm text-gray-500 mt-2">Available 24/7</p>
            </div>
          </div>

          {/* Email */}
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center group hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-primary mb-3">Email Address</h3>
            <div className="text-gray-700 space-y-2">
              <p className="font-semibold">General Inquiries:</p>
              <p className="text-lg font-bold text-primary break-all">info@servicehub.com</p>
              <p className="font-semibold mt-3">Support:</p>
              <p className="text-lg font-bold text-primary break-all">support@servicehub.com</p>
              <p className="text-sm text-gray-500 mt-2">Response within 24 hours</p>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">Find Us on Map</h2>
          <div className="w-full h-96 bg-gray-200 rounded-xl overflow-hidden">
            {/* Google Maps Embed - Replace with your actual coordinates */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.0999999999995!2d90.4125181!3d23.8103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQ4JzM3LjEiTiA5MMKwMjQnNDUuMSJF!5e0!3m2!1sen!2sbd!4v1635750000000!5m2!1sen!2sbd"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-xl"
            />
          </div>
        </div>
      </div>
      <Form/>
    </div>
    </>
  );
}

import React, { useState } from "react";

const faqItems = [
  {
    question: "How do I book a service provider?",
    answer:
      "Browse workers, select a service, choose date and time, and confirm your booking from the booking page.",
  },
  {
    question: "When can I rate and review a worker?",
    answer:
      "You can submit a review only after the booking is marked completed in your booking details.",
  },
  {
    question: "Can I reschedule or cancel a booking?",
    answer:
      "You can cancel pending bookings from the booking details page. Rescheduling depends on worker availability.",
  },
  {
    question: "How do payments work?",
    answer:
      "You can choose to pay now or later depending on the service. Payment status is shown in your booking details.",
  },
  {
    question: "How are workers verified?",
    answer:
      "Workers provide required details during registration and can be reviewed by users after completed jobs.",
  },
  {
    question: "Where can I update my profile information?",
    answer:
      "Users can update details in Profile, and workers can update their profile in the Worker Dashboard.",
  },
  {
    question: "What if I need help or support?",
    answer:
      "Reach out through the Contact page or email support@homeservices.in for help.",
  },
  {
    question: "Is my data secure?",
    answer:
      "We store only the data needed to manage bookings and profiles and use authentication for access.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleIndex = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <div className="min-h-screen bg-green pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="mb-10">
              <p className="text-yellow font-semibold tracking-wider text-sm uppercase">Help Center</p>
              <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-green">
                Questions? We&apos;ve got answers.
              </h1>
              <p className="mt-3 text-gray-600 max-w-2xl">
                Everything you need to know about bookings, payments, and reviews in one place.
              </p>
            </div>

            <div className="divide-y divide-black/10 rounded-2xl border border-black/5 overflow-hidden">
              {faqItems.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={item.question} className="bg-white">
                    <button
                      type="button"
                      onClick={() => toggleIndex(index)}
                      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-light_green/40 transition"
                      aria-expanded={isOpen}
                    >
                      <span className="font-semibold text-green">{item.question}</span>
                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-green transition-transform ${
                          isOpen ? "rotate-45 bg-yellow" : "bg-light_green"
                        }`}
                      >
                        +
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 text-gray-700 text-sm leading-relaxed">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

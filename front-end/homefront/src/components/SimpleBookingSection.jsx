export default function BookingSection() {
  return (
    <>
      <section className="w-full bg-primary px-6 py-20">
        {/* TITLES */}
        <div className="max-w-7xl mx-auto pt-16 pb-12">
          <p className="text-yellow text-sm font-semibold uppercase mb-4 tracking-widest">
            How it works
          </p>
          <h2 className="text-white text-4xl md:text-5xl font-semibold leading-tight mb-2">
            Step-by-step care process<br />made simple for you
          </h2>
        </div>

        {/* MAIN 2-COLUMN */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8 items-start">
          {/* LEFT: Sticky Image Container */}
          <div className="relative lg:h-[700px] flex items-start justify-center lg:justify-start mb-8 lg:mb-0">
            <div className="sticky top-32 w-full max-w-[660px]">
              <img
                src="https://images.pexels.com/photos/4099465/pexels-photo-4099465.jpeg?auto=compress&w=900&q=80"
                alt="Booking Process"
                className="w-full max-w-full sm:max-w-full lg:max-w-[660px] h-[300px] sm:h-[400px] lg:h-[500px] object-cover rounded-xl shadow-lg"
              />
            </div>
          </div>

          {/* RIGHT: Boxes column with natural scroll */}
          <div className="flex flex-col justify-start min-h-[700px] w-full">
            <ProcessBox
              step="01"
              title="Fill-up appointment form"
              desc="Our team shares helpful insights, product reviews, and expert recommendations to help you maintain."
              accentCircle="bg-[#FFEC43] text-primary"
            />
            <ProcessBox
              step="02"
              title="Get a call back"
              desc="Our experts provide useful tips, in-depth reviews, and trusted advice to support your maintenance efforts."
              accentCircle="bg-[#AED656] text-primary"
            />
            <ProcessBox
              step="03"
              title="Get your work done asap"
              desc="Our pros visit your place at the time you choose, and ensure the work is done efficiently and perfectly."
              accentCircle="bg-white text-primary"
            />
            <div className="flex flex-col justify-end mt-8">
              <a
                href="#book"
                className="inline-flex items-center gap-2 bg-yellow text-primary px-8 py-4 rounded-full font-semibold text-lg shadow hover:bg-[#FFE042] transition-colors self-start"
              >
                Book Now
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: FORM + VIDEO SECTION */}
    </>
  );
}

// ...keep your ProcessBox function same as before

function ProcessBox({ step, title, desc, accentCircle }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center rounded-xl py-8 px-6 sm:px-12 mb-8 shadow-md min-h-[160px] w-full bg-black bg-opacity-20 backdrop-blur-md">
      <span
        className={`flex items-center justify-center rounded-full w-16 h-16 text-2xl font-bold mb-4 sm:mb-0 mr-0 sm:mr-12 ${accentCircle}`}
      >
        {step}
      </span>
      <div>
        <h3 className="text-xl sm:text-2xl font-semibold mb-1 text-white">{title}</h3>
        <p className="text-sm sm:text-base text-gray-200 opacity-90 max-w-md">{desc}</p>
      </div>
    </div>
  );
}

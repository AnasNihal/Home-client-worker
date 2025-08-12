import { useScrollAnimation } from '../hooks/useScrollAnimation';

function ListItem({ bg, text, textColor, isVisible, staggerClass }) {
  return (
    <li className={`flex items-center gap-4 fade-in-up ${staggerClass} ${
      isVisible ? 'animate' : ''
    }`}>
      <span
        className="rounded-full w-9 h-9 flex items-center justify-center hover:scale-110 transition-transform duration-200"
        style={{ backgroundColor: bg }}
      >
        <svg 
          className={`w-5 h-5 ${bg === "#1E5F4B" ? "text-white" : ""}`} 
          fill="none" 
          stroke="currentColor" 
          strokeWidth={2} 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <span className={`text-[18px] font-semibold ${textColor}`}>{text}</span>
    </li>
  );
}

export default function AboutSection() {
  const [leftColumnRef, leftColumnVisible] = useScrollAnimation(0.2);
  const [rightColumnRef, rightColumnVisible] = useScrollAnimation(0.2);

  return (
    <section className="w-full pb-20 bg-light_green px-8 py-20 overflow-hidden">
      <div className="max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-y-12 lg:gap-x-32 place-items-center py-20">

        {/* LEFT COLUMN: Single image on mobile/tablet, overlapping on desktop */}
        <div 
          ref={leftColumnRef}
          className={`relative w-full lg:w-[500px] h-[550px] flex-shrink-0 fade-in-left stagger-1 ${
            leftColumnVisible ? 'animate' : ''
          }`}
        >
          {/* Main image (full width on small screens) */}
          <img
            src="https://images.pexels.com/photos/4239148/pexels-photo-4239148.jpeg?auto=compress&w=800&q=80"
            alt="Professional cleaning service"
            className={`rounded-xl shadow-xl w-full h-full object-cover hover:scale-105 transition-transform duration-300 fade-in-scale stagger-2 ${
              leftColumnVisible ? 'animate' : ''
            }`}
          />
          {/* Second overlapping image only on large screens */}
          <img
            src="https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg?auto=compress&w=800&q=80"
            alt="Clean and organized space"
            className={`hidden lg:block rounded-xl shadow-lg w-[380px] h-[450px] object-cover absolute bottom-[-40px] right-[-60px] z-20 hover:scale-105 transition-transform duration-300 fade-in-scale stagger-4 ${
              leftColumnVisible ? 'animate' : ''
            }`}
          />
        </div>

        {/* RIGHT COLUMN: Content */}
        <div 
          ref={rightColumnRef}
          className={`w-full flex flex-col justify-center fade-in-right stagger-1 ${
            rightColumnVisible ? 'animate' : ''
          }`}
        >
          {/* Section Tag */}
          <p className={`text-[15px] font-semibold tracking-wide text-primary uppercase mb-4 fade-in-up stagger-2 ${
            rightColumnVisible ? 'animate' : ''
          }`}>
            About company
          </p>

          {/* Main Title */}
          <h2 className={`text-5xl font-bold text-primary mb-7 leading-tight fade-in-up stagger-3 ${
            rightColumnVisible ? 'animate' : ''
          }`}>
            To make clean, healthy<br />spaces accessible
          </h2>

          {/* Description */}
          <p className={`text-gray-600 text-lg mb-10 fade-in-up stagger-4 ${
            rightColumnVisible ? 'animate' : ''
          }`}>
            We're a team of passionate, vetted cleaning professionals dedicated
            to delivering spotless, fresh spaces with a personal touch. Whether
            it's a cozy apartment or a bustling office.
          </p>

          {/* List Items */}
          <ul className="space-y-6 mb-10">
            <ListItem
              bg="#FFEC43"
              text="Trained & background-checked staff"
              textColor="text-primary"
              isVisible={rightColumnVisible}
              staggerClass="stagger-5"
            />
            <ListItem
              bg="#1E5F4B"
              text="Customized cleaning plans"
              textColor="text-primary"
              isVisible={rightColumnVisible}
              staggerClass="stagger-6"
            />
            <ListItem
              bg="#AED656"
              text="Punctual and reliable service"
              textColor="text-primary"
              isVisible={rightColumnVisible}
              staggerClass="stagger-7"
            />
          </ul>

          {/* Button */}
          <a
            href="/About"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 bg-green text-white rounded-full font-medium text-sm hover:text-yellow hover:scale-105 transition-transform duration-200 fade-in-up stagger-8 ${
              rightColumnVisible ? 'animate' : ''
            }`}
            style={{ padding: "6px 14px", width: "fit-content" }}
          >
            <svg
              className="w-4 h-4 -ml-1"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            About US
          </a>
        </div>
      </div>
    </section>
  );
}

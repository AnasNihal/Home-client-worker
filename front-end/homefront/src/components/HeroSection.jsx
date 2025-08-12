
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function HeroSection() {
  // Create animation refs for different sections
  const [heroContentRef, heroContentVisible] = useScrollAnimation(0.1);
  const [titleRef, titleVisible] = useScrollAnimation(0.2);
  const [buttonsRef, buttonsVisible] = useScrollAnimation(0.3);
  const [imageContainerRef, imageContainerVisible] = useScrollAnimation(0.2);
  const [kitchenImageRef, kitchenImageVisible] = useScrollAnimation(0.3);
  const [maidImageRef, maidImageVisible] = useScrollAnimation(0.4);

  return (
    <section className="max-w-7xl mx-auto px-6 pt-48 pb-20 grid md:grid-cols-2 gap-12 items-center min-h-[850px] font-sans overflow-hidden">

      {/* Left Column */}
      <div 
        ref={heroContentRef}
        className="flex flex-col justify-center"
      >
        {/* Service Tag */}
        <p className={`text-[#FCD34D] uppercase tracking-wide text-sm mb-4 font-medium fade-in-up stagger-1 ${
          heroContentVisible ? 'animate' : ''
        }`}>
          Service Booking Company
        </p>

        {/* Main Title */}
        <h1 
          ref={titleRef}
          className={`text-white font-sans font-semibold text-[42px] md:text-[56px] mb-6 fade-in-left stagger-2 ${
            titleVisible ? 'animate' : ''
          }`}
        >
          Home & business {" "}
          <span className="text-[#C6DE41] underline underline-offset-4">
            services
          </span>{" "}
          tailored to everyone   
        </h1>

        {/* Buttons Row */}
        <div 
          ref={buttonsRef}
          className={`flex gap-4 mb-6 fade-in-up stagger-3 ${
            buttonsVisible ? 'animate' : ''
          }`}
        >
         
          <a
            href="#qt"
            className="relative flex items-center justify-center bg-[#FCD34D] text-[#0C7C59] font-medium px-6 py-3 rounded-full overflow-hidden group hover:scale-105 transition-transform duration-200"
          >
            <span className="absolute left-5 transform transition-all duration-700 ease-in-out group-hover:left-auto group-hover:right-5">
              →
            </span>
            <span className="pl-7 transition-all duration-700 ease-in-out group-hover:-translate-x-3">
              Get&nbsp;A&nbsp;Quote
            </span>
          </a>

          <Link to="/Worker">
          <button className="flex items-center gap-2 border border-[#FCD34D] text-white px-6 py-3 rounded-full hover:bg-[#FCD34D] hover:text-[#0C7C59] hover:scale-105 transition-all duration-200">
            → Book A Service
          </button>
          </Link>
        </div>

      </div>

      {/* Right Column - Fixed positioning and overflow */}
      <div 
        ref={imageContainerRef}
        className={`relative flex justify-center md:justify-end overflow-hidden fade-in-right ${
          imageContainerVisible ? 'animate' : ''
        }`}
      >
        {/* Background Shape */}
        

        {/* Kitchen Image */}
        <img
          ref={kitchenImageRef}
          src="/images/herosection-img-kitchen.jpg"
          alt="Cleaning Service"
          className={`relative z-10 rounded-lg w-[440px] md:w-[500px] hover:scale-105 transition-transform duration-300 fade-in-scale stagger-2 ${
            kitchenImageVisible ? 'animate' : ''
          }`}
        />

        {/* Maid Image - Fixed positioning to prevent overflow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 w-[420px] md:w-[500px] overflow-hidden">
          <img
            ref={maidImageRef}
            src="/images/herosection-maid.png"
            alt="Maid"
            className={`w-full hover:scale-105 transition-transform duration-300 fade-in-up stagger-3 ${
              maidImageVisible ? 'animate' : ''
            }`}
          />
        </div>
      </div>
    </section>
  );
}
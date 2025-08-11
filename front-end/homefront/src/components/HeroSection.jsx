export default function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-48 pb-20 grid md:grid-cols-2 gap-12 items-center min-h-[850px] font-sans">
      
      {/* Left Column */}
      <div className="flex flex-col justify-center">
        <p className="text-[#FCD34D] uppercase tracking-wide text-sm mb-4 font-medium">
          Cleaning Service Company
        </p>

        <h1 className="text-white font-sans font-semibold text-[42px] md:text-[56px]">
          Residential & commercial{" "}
          <span className="text-[#C6DE41] underline underline-offset-4">
            cleaning
          </span>{" "}
          tailored services.
        </h1>

        {/* Buttons Row */}
        <div className="flex gap-4 mb-6">
          <button className="relative flex items-center justify-center bg-[#FCD34D] text-[#0C7C59] font-medium px-6 py-3 rounded-full overflow-hidden group">
            <span className="absolute left-5 transform transition-all duration-700 ease-in-out group-hover:left-auto group-hover:right-5">
              →
            </span>
            <span className="pl-7 transition-all duration-700 ease-in-out group-hover:-translate-x-3">
              Get A Quote
            </span>
          </button>

          <button className="flex items-center gap-2 border border-[#FCD34D] text-white px-6 py-3 rounded-full hover:bg-[#FCD34D] hover:text-[#0C7C59] transition">
            → Book A Service
          </button>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            <img src="/images/avatar1.jpg" alt="Customer" className="w-8 h-8 rounded-full border-2 border-[#0D2E26]" />
            <img src="/images/avatar2.jpg" alt="Customer" className="w-8 h-8 rounded-full border-2 border-[#0D2E26]" />
            <img src="/images/avatar3.jpg" alt="Customer" className="w-8 h-8 rounded-full border-2 border-[#0D2E26]" />
          </div>
          <p className="text-[#A0B0A8] text-sm">
            Customer rating: <span className="text-[#C6DE41] font-semibold">4.8</span> out of 5.0
          </p>
        </div>
      </div>

      {/* Right Column */}
      <div className="relative flex justify-center md:justify-end">
        {/* Background Shape */}
        <div className="absolute inset-0 -z-10">
          <img src="/images/bg-shape.svg" alt="Shape" className="w-full h-full object-contain" />
        </div>

        {/* Kitchen Image */}
        <img
          src="/images/herosection-img-kitchen.jpg"
          alt="Cleaning Service"
          className="relative z-10 rounded-lg w-[440px] md:w-[500px]"


        />

        {/* Maid Image - Bigger & Centered */}
        <img
          src="/images/herosection-maid.png"
          alt="Maid"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 w-[420px] md:w-[500px]"
        />
      </div>
    </section>
  );
}

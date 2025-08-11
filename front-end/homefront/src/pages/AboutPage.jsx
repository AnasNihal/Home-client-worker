// src/pages/About.jsx
import React from 'react';
import TopSection from '../components/TopSection';
import TeamMembers from '../components/TeamMember';

const historyItems = [
  { year: 2025, title: 'Driven by Quality', desc: 'Olton is a trusted cleaning service provider committed to quality, reliability, and customer satisfaction. With 30+ years of experience, we bring excellence and attention to detail to every job—whether its your home' },
  { year: 2019, title: 'Humble Beginnings', desc: 'Olton is a dependable cleaning company known for quality, consistency, and customer care. With over 30 years of expertise, we deliver thorough, high-standard service to homes, offices, and retail spaces.' },
  { year: 2016, title: 'Growth & Expansion', desc: 'Olton provides trusted cleaning solutions focused on excellence, dependability, and client satisfaction. Backed by 30+ years of experience, we serve homes, offices, and stores with precision and care.' },

];

export default function About() {
  return (
   <>
    <TopSection
        title="About Company"
        subtitle="Cleaning Service Company"
        bgColor="bg-[#f4faef]"
    />
     <section className="w-full bg-[#edf7ee] py-24 px-6 flex flex-col items-center text-center">
  <div className="max-w-4xl w-full py-12">
    <p className="text-sm tracking-widest text-gray-500 mb-4 font-medium uppercase">
      CLEAN SPACES, HAPPY FACES.
    </p>
    <h2 className="text-[#263932] text-4xl md:text-5xl font-normal mb-12 leading-snug">
      We’re Olton, your local cleaning experts<br />
      offering residential, commercial, and specialty cleaning services.
    </h2>
    {/* Stats row */}
    <div className="flex flex-col sm:flex-row justify-center gap-16 text-[#263932]">
      <div>
        <div className="text-7xl md:text-8xl outlined-number mb-2">4.9</div>
        <p className="text-base text-gray-600">Rates out of 5.0</p>
      </div>
      <div>
        <div className="text-7xl md:text-8xl outlined-number mb-2">24/7</div>
        <p className="text-base text-gray-600">Online support</p>
      </div>
      <div>
        <div className="text-7xl md:text-8xl outlined-number mb-2">7</div>
        <p className="text-base text-gray-600">Worldwide base</p>
      </div>
    </div>
  </div>
</section>

<section className="w-full bg-white py-16 px-1 md:px-12 lg:px-24">
  {/* Top: Label and Main Heading (left-aligned) */}
  <div className="mb-4 py-20" style={{ maxWidth: '1250px' }}>
    <span className="block text-sm leading-tight font-medium tracking-widest text-gray-400 mb-2 uppercase text-left">
      COMPANY HISTORY
    </span>
    <h2 className="text-4xl md:text-5xl font-bold text-[#264632] mb-2 text-left tracking-tight leading-snug">
      Meet with our happy<br />type journey
    </h2>
  </div>
{historyItems.map((item, i) => (
  <div key={i} style={{ maxWidth: '1250px' }} className="w-full">
    {/* HR line before each item */}
    <hr className="border-gray-200 mb-8" />

    {/* Two-column layout */}
    <div className="flex flex-col md:flex-row gap-0 md:gap-14 py-16 justify-between items-start">
      {/* Left: Year */}
      <div className="md:w-[140px] flex-shrink-0 flex items-start pl-2 md:pl-6">
        <span className="text-[#264632] text-7xl md:text-8xl tracking-tight leading-none text-left">
          {item.year}
        </span>
      </div>

      {/* Right: Content */}
      <div className="flex-1 flex justify-end items-start">
        <div className="rounded-xl w-full md:w-[700px]">
          <h3 className="text-xl md:text-2xl  text-[#264632] mb-3 text-left">
            {item.title}
          </h3>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed text-left">
            {item.desc}
          </p>
        </div>
      </div>
    </div>
  </div>
))}

</section>
<TeamMembers showAll={false} />
   </>
  );
}

// src/components/Footer.jsx

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#193629] text-[#e6f3e7] pt-16 pb-0 px-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-8 pb-10">
        {/* Essential description and social */}
        <div className="flex-1 min-w-[220px]">
          <h4 className="font-semibold text-lg mb-4">Essential</h4>
          <p className="mb-7 text-[15px] leading-relaxed">
            We&apos;re a team of passionate, vetted cleaning professionals dedicated to delivering spotless, fresh spaces with a personal touch.
          </p>
          <div className="flex gap-3 mt-2">
            <FooterIcon icon="facebook" />
            <FooterIcon icon="x" />
            <FooterIcon icon="instagram" />
            <FooterIcon icon="linkedin" />
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 min-w-[150px]">
          <h4 className="font-semibold text-lg mb-4">Essential</h4>
          <ul className="space-y-3 text-[15px]">
            <li><Link to="/about" className="hover:text-yellow transition">About Us</Link></li>
            <li><Link to="/expertise" className="hover:text-yellow transition">Our expertise</Link></li>
            <li><Link to="/how-it-works" className="hover:text-yellow transition">How it Works</Link></li>
            <li><Link to="/faqs" className="hover:text-yellow transition">FAQs</Link></li>
            <li><Link to="/contact" className="hover:text-yellow transition">Contact Us</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="flex-1 min-w-[180px]">
          <h4 className="font-semibold text-lg mb-4">Get in touch</h4>
          <ul className="space-y-3 text-[15px]">
            <li>+1 (800) 123-4567 - 9</li>
            <li>info@olton.com</li>
            <li>123 Main Street, Los Angeles, CA 90001</li>
            <li>
              Available: <span className="text-yellow-400 font-semibold">Mon–Sun, 8am – 10pm</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="flex-1 min-w-[220px]">
          <h4 className="font-semibold text-lg mb-4">Get weekly update</h4>
          <form className="flex flex-col w-full gap-3">
            <input
              type="email"
              placeholder="jane@framer.com"
              className="rounded-full bg-transparent border border-gray-300 px-5 py-3 mb-1 text-[#e6f3e7] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow transition"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center w-full rounded-full bg-yellow-400 text-[#193629] font-semibold px-6 py-3 text-base hover:bg-yellow-300 transition mt-1"
            >
              <span className="mr-2">Subscribe</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      <hr className="border-t border-[#456b59] my-2" />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between py-6">
        {/* Logo and brand */}
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          {/* Placeholder logo: Yellow circular SVG with crescent */}
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#FFEC43]">
            <svg height="26" width="26" viewBox="0 0 26 26">
              <circle cx="13" cy="13" r="12" fill="#FFEC43" />
              <path d="M13 1a12 12 0 100 24 8 8 0 110-16z" fill="#193629" />
            </svg>
          </span>
          <span className="text-xl font-semibold text-[#e6f3e7]">Olton</span>
        </div>
        <span className="text-[13px] text-[#b2ccbe]">
          Copyright &amp; design by @Red
        </span>
      </div>
    </footer>
  );
}

function FooterIcon({ icon }) {
  const icons = {
    facebook: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="11" stroke="white" className="text-white" />
        <path d="M14 8h-2a1 1 0 00-1 1v2h3.5" stroke="white" strokeLinecap="round" />
        <path d="M12 21v-8" stroke="white" strokeLinecap="round" />
      </svg>
    ),
    x: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="11" stroke="white" className="text-white" />
        <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeLinecap="round" />
      </svg>
    ),
    instagram: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="11" stroke="white" className="text-white" />
        <rect x="7.5" y="7.5" width="9" height="9" rx="4.5" stroke="white" />
        <circle cx="16.5" cy="7.5" r="1" fill="white" />
      </svg>
    ),
    linkedin: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="11" stroke="white" className="text-white" />
        <rect x="8" y="10" width="2" height="6" rx="1" fill="white" />
        <rect x="14" y="10" width="2" height="6" rx="1" fill="white" />
        <circle cx="9" cy="8" r="1" fill="white" />
      </svg>
    ),
  };
  return (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-white hover:bg-[#FFEC43] hover:border-[#FFEC43] cursor-pointer transition">
      {icons[icon]}
    </span>
  );
}

import React from "react";
import { FaLinkedin } from "react-icons/fa"; // Make sure react-icons is installed (npm install react-icons)
import { Link } from 'react-router-dom';


const teamData = [
  {
    id: 1,
    name: "Mary Coleman",
    role: "Founder",
    imgSrc: "https://framerusercontent.com/images/qXmGtntg94s34pxF4cqaYicEBc.jpg",
    mediaUrl: "https://linkedin.com/in/marycoleman",
  },
  {
    id: 2,
    name: "Christy Sims",
    role: "CEO",
    imgSrc: "https://framerusercontent.com/images/2MJ9LUFVF8qlC5yCI0p8GhqdVA.jpg",
    mediaUrl: "https://linkedin.com/in/christysims",
  },
  {
    id: 3,
    name: "Elizabeth Lee",
    role: "CMO",
    imgSrc: "https://framerusercontent.com/images/aBjbcJ1ar3Z6T4znRfUaR2bTKoc.jpg",
    mediaUrl: "https://linkedin.com/in/elizabethlee",
  },
  // Add more members here if needed
];

export default function TeamMembers({ showAll = false }) {
  const membersToShow = showAll ? teamData : teamData.slice(0, 3);

  return (
    <section className="w-full bg-light_green mx-auto px-6 py-16">
      <span className="block text-sm leading-tight font-medium tracking-widest text-gray-400 mb-2 uppercase text-center">
        MANAGEMENT
      </span>
      <h2 className="text-3xl md:text-5xl font-bold text-center text-[#263932] mb-10">
        {showAll ? "Meet Our Team" : "Meet Our Team"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 py-20 px-11 md:grid-cols-3 gap-12">
        {membersToShow.map(({ id, name, role, imgSrc, mediaUrl }) => (
          <div
            key={id}
            className="relative group rounded-2xl shadow-xl overflow-hidden aspect-[4/5] bg-gray-100 cursor-pointer"
            style={{ minHeight: 380 }}
          >
            {/* Full image fills card */}
            <img
              src={imgSrc}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Bottom overlay for name and icon */}
            <div className="absolute bottom-0 left-0 w-full flex justify-between items-end px-5 py-4 bg-gradient-to-t from-[rgba(0,0,0,0.78)] via-transparent to-transparent">
              <div>
                <span className="block text-gray-200 text-xs font-medium opacity-80 mb-0.5">{role}</span>
                <span className="block text-white text-base font-semibold drop-shadow-sm">{name}</span>
              </div>
              <a
                href={mediaUrl}
                onClick={e => e.stopPropagation()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-white hover:bg-yellow-100 rounded-full p-2 shadow transition"
                aria-label={`LinkedIn of ${name}`}
              >
                <FaLinkedin className="w-5 h-5 text-[#0176b4]" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {!showAll && (
  <div className="mt-12 text-center">
    <Link
      to="/"
      className="inline-block text-yellow-500 hover:text-yellow-600 font-semibold transition-colors"
    >
      See All Team Members &rarr;
    </Link>
  </div>
)}
    </section>
  );
}

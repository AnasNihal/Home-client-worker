import React from "react";

const serviceNames = [
  "Deep cleaning",
  "Indoor & outdoor cleaning",
  "Office cleaning",
  "Regular cleaning",
  "Window cleaning",
  "Carpet cleaning",
];

function SpinnerIcon() {
  return (
    <svg
      className="inline-block mr-2 w-7 h-7 text-primary align-middle"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="#193629" strokeWidth="2.8" opacity="0.24" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="#193629" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

export default function SponsorsSection() {
  // CSS for the marquee animation (can be put in your global stylesheet, or in a <style> tag)
  // Make sure this CSS is included somewhere in your project!
  // Example for Tailwind with custom classes:
  //
  // .animate-marquee {
  //   animation: marquee 24s linear infinite;
  // }
  // @keyframes marquee {
  //   0% {
  //     transform: translateX(0%);
  //   }
  //   100% {
  //     transform: translateX(-50%);
  //   }
  // }
  
  return (
    <section className="py-16 bg-light_green overflow-hidden">
      <div className="flex flex-col items-center">
        <h3 className="text-sm font-medium tracking-wide text-primary uppercase mb-8">
          WE HAVE MORE THAN 1000 BACKERS
        </h3>
        <div className="relative w-full overflow-hidden">
          <div
            className="flex gap-12 animate-marquee whitespace-nowrap select-none items-center"
            style={{
              minHeight: "4rem"
            }}
          >
            {[...serviceNames, ...serviceNames].map((service, index) => (
              <div
                key={index}
                className="inline-flex items-center text-4xl md:text-5xl font-semibold text-primary opacity-80 px-4"
              >
                <SpinnerIcon />
                {service}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

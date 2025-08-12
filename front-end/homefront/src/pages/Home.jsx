  import HeroSection from "../components/HeroSection"
  import AboutSection from "../components/AboutSection"
  import SponsorsSection from "../components/Sponsor"
  import BookingSection from "../components/SimpleBookingSection"
  import Form from "../components/VideoForm"
  import React from "react";
  import { Link } from "react-router-dom";
  
  const services = [
  {
    id: "electrical-repairs",
    icon: "https://img.icons8.com/ios-filled/50/1E5F4B/electrical.png",
    title: "Electrical Repairs",
    desc: "Wiring, fan and switchboard installation or repair — safe and reliable service for all your electrical needs.",
  },
  {
    id: "plumbing",
    icon: "https://img.icons8.com/ios-filled/50/1E5F4B/plumbing.png",
    title: "Plumbing work",
    desc: "Leak detection, pipe repair and faucet installs — keeping your water systems running smoothly.",
  },
  {
    id: "carpenter",
    icon: "https://img.icons8.com/ios-filled/50/1E5F4B/carpenter.png",
    title: "Carpenter work",
    desc: "Shelves, doors and custom woodwork — crafted for strength, style, and perfect fit.",
  },
  {
    id: "deep-cleaning",
    icon: "https://img.icons8.com/ios-filled/50/1E5F4B/clean.png",
    title: "Deep cleaning",
    desc: "Intensive top-to-bottom cleaning for a fresh, spotless, and healthy space.",
  },
  {
    id: "residential-cleaning",
    icon: "https://img.icons8.com/ios-filled/50/1E5F4B/clean.png",
    title: "Residential Cleaning",
    desc: "Deep and thorough cleaning services for your home to make it spotless and healthy.",
  },
  {
    id: "pest-control",
    icon: "https://img.icons8.com/ios-filled/50/1E5F4B/bug.png",
    title: "Pest Control",
    desc: "Effective pest control solutions ensuring a pest-free and healthy home environment.",
  },
];

const heroImg =
  "https://framerusercontent.com/images/aLP8uanZsPkhDlmd9tsL1U4Ghs.png";
  
  export default function Home(){
        return(
            <>
                <HeroSection/>
                    <section id="services" className="bg-light_green py-20">
                    <div className="w-full max-w-7xl mx-auto px-6">
                        {/* Header */}
                        <header className="text-center mb-12 max-w-2xl mx-auto">
                        <p className="text-base font-semibold tracking-widest text-primary uppercase mb-4">
                            Our services
                        </p>
                        <h2 className="text-4xl md:text-5xl font-semibold text-primary">
                            Spotless spaces, stress-free living
                        </h2>
                        </header>

                        <div className="grid gap-6">
                        {/* Top Row */}
                        <div className="grid md:grid-cols-3 gap-6">
                            {services.slice(0, 3).map((card) => (
                            <ServiceCard key={card.id} {...card} compact />
                            ))}
                        </div>

                        {/* Middle Hero */}
                        <div className="relative bg-gradient-to-r from-green to-primary rounded-2xl overflow-hidden min-h-[200px] flex items-center justify-between px-8 py-6 my-4">
                            <div className="flex-1 text-white z-10">
                            <h3 className="text-2xl md:text-3xl font-bold mb-2">
                                Professional Home Services
                            </h3>
                            <p className="text-green-100 mb-4 text-lg">
                                Trusted experts for all your home needs
                            </p>
                            <Link
                                to="/worker"
                                className="inline-block px-6 py-3 bg-yellow text-primary font-semibold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                            >
                                Book Now
                            </Link>
                            </div>
                            <div className="flex-1 flex justify-end">
                            <img
                                src={heroImg}
                                alt="Service illustration"
                                className="h-32 md:h-40 w-auto object-contain opacity-90"
                            />
                            </div>
                        </div>

                        {/* Bottom Row */}
                        <div className="grid md:grid-cols-3 gap-6">
                            {services.slice(3, 6).map((card) => (
                            <ServiceCard key={card.id} {...card} compact />
                            ))}
                        </div>
                        </div>
                    </div>
                    </section>

                <SponsorsSection />
                <AboutSection/>
                <BookingSection/>
                <Form/>
            </>
        )
    }

    function ServiceCard({ id, icon, title, desc, compact = false }) {
  return (
    <Link
      to={`/services/${id}`}
      className={`rounded-xl bg-white shadow-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1 group ${
        compact ? "p-6 min-h-[250px]" : "p-8 min-h-[320px]"
      }`}
    >
      <div
        className={`h-12 w-12 flex items-center justify-center rounded-md bg-accent/30 group-hover:bg-accent/40 transition-colors ${
          compact ? "mb-3" : "mt-4 mb-4"
        }`}
      >
        <img src={icon} alt={title} className="h-6 w-6" />
      </div>
      <h3
        className={`font-medium text-primary mb-2 group-hover:text-accent transition-colors ${
          compact ? "text-lg" : "text-xl"
        }`}
      >
        {title}
      </h3>
      <p className={`${compact ? "text-sm" : "text-base"} text-gray-600`}>
        {compact ? `${desc.slice(0, 80)}...` : desc}
      </p>
    </Link>
  );
}
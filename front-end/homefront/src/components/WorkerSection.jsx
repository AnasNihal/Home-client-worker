// src/components/WorkerSection.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function WorkersSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [workers, setWorkers] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  // Fetch workers
  useEffect(() => {
    let cancelled = false;
    async function fetchWorkers() {
      try {
        const res = await fetch("http://127.0.0.1:8000/worker/worker_list");
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        const normalized = (Array.isArray(data) ? data : []).map((w, idx) => {
          const id = w.id ?? w.pk ?? w.username ?? (w.name ? `worker-${w.name.toLowerCase().replace(/\s+/g, "-")}` : `worker-${idx}`);
          let image = w.image || w.image_url || w.profile_image || "";
          if (image && typeof image === "string" && !image.startsWith("http")) image = `http://127.0.0.1:8000${image.startsWith("/") ? "" : "/"}${image}`;
          if (!image) image = "https://via.placeholder.com/400";

          const servicesArr = Array.isArray(w.services) ? w.services : [];
          const skills = servicesArr.map((s) => s.services || "Unknown");

          const category = w.profession ? w.profession.toLowerCase().replace(/\s+/g, "-") : "general";

          const experience = typeof w.experience === "string" ? w.experience : String(w.experience ?? "");
          const rating = w.ratings?.average_rating ?? null;
          const reviews = w.ratings?.total_ratings ?? 0;
          const location = w.location ?? "";
          const availability = w.availability ?? (Math.random() > 0.5 ? "Available Today" : "Available Tomorrow");

          return {
            id,
            image,
            name: w.name ?? w.username ?? "Unknown",
            profession: w.profession ?? "",
            category,
            experience,
            rating,
            reviews,
            location,
            availability,
            skills,
            services: servicesArr,
            bio: w.bio ?? "",
            verified: !!w.verified,
          };
        });
        if (!cancelled) setWorkers(normalized);
      } catch (err) {
        console.error("Error fetching workers:", err);
        if (!cancelled) setWorkers([]);
      }
    }
    fetchWorkers();
    return () => { cancelled = true; };
  }, []);

  // Fetch professions dynamically
  useEffect(() => {
    async function fetchProfessions() {
      try {
        const res = await fetch("http://127.0.0.1:8000/worker/profession_list");
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        setProfessions([{ id: "all", name: "All Services", slug: "all" }, ...data]);
      } catch (err) {
        console.error("Error fetching professions:", err);
        setProfessions([{ id: "all", name: "All Services", slug: "all" }]);
      }
    }
    fetchProfessions();
  }, []);

  // Add counts dynamically based on workers' professions
  const professionsWithCount = professions.map((prof) => ({
    ...prof,
    count: prof.slug === "all" ? workers.length : workers.filter((w) => w.category === prof.slug).length,
  }));

  // Filter workers based on search and selected profession
  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      (worker.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (worker.profession || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || worker.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort workers
  const sortedWorkers = [...filteredWorkers].sort((a, b) => {
    switch (sortBy) {
      case "rating": return (b.rating ?? 0) - (a.rating ?? 0);
      case "experience": return (parseInt(b.experience, 10) || 0) - (parseInt(a.experience, 10) || 0);
      default: return 0;
    }
  });

  return (
    <section className="bg-light_green min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Find Professional Workers</h1>
          <p className="text-gray-600 text-lg">Browse {workers.length}+ verified professionals in your area</p>
          <div className="relative max-w-2xl mx-auto mt-4 mb-6">
            <input
              type="text"
              placeholder="Search by name or profession..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 pr-12 text-lg border border-gray-300 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {professionsWithCount.slice(0, 5).map((prof) => (
              <button
                key={prof.slug}
                onClick={() => setSelectedCategory(prof.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  selectedCategory === prof.slug ? "bg-white text-primary shadow-md" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <img src={prof.icon || "https://img.icons8.com/ios-filled/50/1E5F4B/menu.png"} alt={prof.name} className="w-4 h-4" />
                <span className="font-medium">{prof.name}</span>
                <span className="text-xs bg-black/10 px-2 py-0.5 rounded-full">{prof.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-primary mb-4">Filters</h3>
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Service Category</h4>
                <div className="space-y-2">
                  {professionsWithCount.map((prof) => (
                    <button
                      key={prof.slug}
                      onClick={() => setSelectedCategory(prof.slug)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                        selectedCategory === prof.slug ? "bg-primary font-bold" : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={prof.icon || "https://img.icons8.com/ios-filled/50/1E5F4B/menu.png"} alt={prof.name} className="w-5 h-5" />
                        <span>{prof.name}</span>
                      </div>
                      <span className="text-sm bg-black/10 px-2 py-1 rounded-full">{prof.count}</span>
                    </button>
                  ))}
                </div>  
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Sort By</h4>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Most Experienced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Workers Grid */}
          <div className="flex-1 space-y-4">
            {sortedWorkers.map((worker) => (
              <WorkerCard key={worker.id} {...worker} />
            ))}
            {sortedWorkers.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No workers found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// WorkerCard component kept inline
function WorkerCard({ id, image, name, profession, experience, rating, reviews, location, availability, skills, verified }) {
  const isAvailableToday = availability === "Available Today";
  const skillsList = Array.isArray(skills) ? skills : [];

  return (
    <Link to={`/workers/${id}`} className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden block w-full cursor-pointer">
      <div className="flex p-4 sm:p-5 md:p-6 gap-4 sm:gap-5 md:gap-6">
        <div className="relative flex-shrink-0">
          <img src={image} alt={name} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-primary transition-colors" />
          {verified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors truncate">{name}</h3>
              <p className="text-primary font-semibold text-sm sm:text-base md:text-lg">{profession}</p>
            </div>
            <span className={`ml-3 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap ${isAvailableToday ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
              {isAvailableToday ? "Available Today" : "Tomorrow"}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              <span className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">{rating ?? "N/A"}</span>
              <span className="text-gray-500 text-xs sm:text-sm md:text-base">({reviews} reviews)</span>
            </div>
            <span className="text-gray-300">•</span>
            <span className="text-gray-600 font-semibold text-xs sm:text-sm md:text-base">{experience} experience</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
            {skillsList.slice(0, 3).map((skill, index) => (
              <span key={index} className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-100 group-hover:bg-primary/10 text-gray-700 text-xs sm:text-sm rounded-full font-medium transition-colors">{skill}</span>
            ))}
            {skillsList.length > 3 && <span className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-100 text-gray-500 text-xs sm:text-sm rounded-full">+{skillsList.length - 3}</span>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600 flex-1 min-w-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span className="font-semibold text-sm sm:text-base truncate">{location}</span>
            </div>

            <div className="px-4 py-2 sm:px-6 sm:py-3 bg-primary text-white font-semibold rounded-lg group-hover:bg-primary/90 transition-colors text-sm sm:text-base whitespace-nowrap flex items-center gap-2">
              View Details
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
    </Link>
  );
}
  
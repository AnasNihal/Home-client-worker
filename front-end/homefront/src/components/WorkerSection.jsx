// src/components/WorkerSection.jsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAPI, getImageURL } from "../utils/api";

export default function WorkersSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [workers, setWorkers] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  /* ===========================
      1. FETCH WORKERS (FAST)
  =========================== */
  useEffect(() => {
    let cancelled = false;

    async function fetchWorkers() {
      try {
        // ✅ Load cached first (instant load)
        const cached = localStorage.getItem("workers_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (!cancelled && Array.isArray(parsed)) {
            setWorkers(parsed);
          }
        }

        // ✅ Always refresh in background (Neon wake-up)
        const data = await fetchAPI("/worker/worker_list");

        const normalized = (Array.isArray(data) ? data : []).map((w, idx) => {
          const id =
            w.id ??
            w.pk ??
            w.username ??
            (w.name
              ? `worker-${w.name.toLowerCase().replace(/\s+/g, "-")}`
              : `worker-${idx}`);

          const image =
            getImageURL(w.image || w.image_url || w.profile_image) ||
            "https://via.placeholder.com/400";

          const servicesArr = Array.isArray(w.services) ? w.services : [];
          const skills = servicesArr.map((s) => s.services || "Unknown");

          const professionName =
            typeof w.profession === "string"
              ? w.profession
              : w.profession?.name ?? "";

          const category = professionName
            ? professionName.toLowerCase().replace(/\s+/g, "-")
            : "general";

          const experience =
            typeof w.experience === "string"
              ? w.experience
              : String(w.experience ?? "");

          const rating = w.ratings?.average_rating ?? null;
          const reviews = w.ratings?.total_ratings ?? 0;
          const location = w.location ?? "";
          const availability =
            w.availability ??
            (Math.random() > 0.5
              ? "Available Today"
              : "Available Tomorrow");

          return {
            id,
            image,
            name: w.name ?? w.username ?? "Unknown",
            profession: professionName,
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

        if (!cancelled) {
          setWorkers(normalized);

          // ✅ Save updated cache
          localStorage.setItem("workers_cache", JSON.stringify(normalized));
        }
      } catch (err) {
        console.error("Error fetching workers:", err);
      }
    }

    fetchWorkers();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ===========================
     2. FETCH PROFESSIONS (FAST)
  =========================== */
  useEffect(() => {
    let cancelled = false;

    async function fetchProfessions() {
      try {
        // ✅ Instant data from cache
        const cached = localStorage.getItem("professions_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (!cancelled) {
            setProfessions([
              { id: "all", name: "All Services", slug: "all" },
              ...parsed,
            ]);
          }
        }

        // ✅ Background refresh
        const data = await fetchAPI("/worker/profession_list");

        if (!cancelled && Array.isArray(data)) {
          setProfessions([
            { id: "all", name: "All Services", slug: "all" },
            ...data,
          ]);

          localStorage.setItem(
            "professions_cache",
            JSON.stringify(data)
          );
        }
      } catch (err) {
        console.error("Error fetching professions:", err);

        if (!cancelled) {
          setProfessions([{ id: "all", name: "All Services", slug: "all" }]);
        }
      }
    }

    fetchProfessions();
    return () => {
      cancelled = true;
    };
  }, []);

  // Add dynamic count
  const professionsWithCount = professions.map((prof) => ({
    ...prof,
    count:
      prof.slug === "all"
        ? workers.length
        : workers.filter((w) => w.category === prof.slug).length,
  }));

  // Filter workers
  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      (worker.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (worker.profession || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      worker.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort workers
  const sortedWorkers = [...filteredWorkers].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return (b.rating ?? 0) - (a.rating ?? 0);
      case "experience":
        return (
          (parseInt(b.experience, 10) || 0) -
          (parseInt(a.experience, 10) || 0)
        );
      default:
        return 0;
    }
  });

  return (
    <section className="bg-light_green min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Find Professional Workers
          </h1>
          <p className="text-gray-600 text-lg">
            Browse {workers.length}+ verified professionals in your area
          </p>

          <div className="relative max-w-2xl mx-auto mt-4 mb-6">
            <input
              type="text"
              placeholder="Search by name or profession..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 pr-12 text-lg border border-gray-300 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          {/* Quick Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {professionsWithCount.slice(0, 5).map((prof) => (
              <button
                key={prof.slug}
                onClick={() => setSelectedCategory(prof.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  selectedCategory === prof.slug
                    ? "bg-white text-primary shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span className="font-medium">{prof.name}</span>
                <span className="text-xs bg-black/10 px-2 py-0.5 rounded-full">
                  {prof.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* GRID */}
        <div className="flex gap-8">
          <div className="flex-1 space-y-4">
            {sortedWorkers.map((worker) => (
              <WorkerCard key={worker.id} {...worker} />
            ))}

            {sortedWorkers.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No workers found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===========================
      WORKER CARD
=========================== */
function WorkerCard({
  id,
  image,
  name,
  profession,
  experience,
  rating,
  reviews,
  location,
  availability,
  skills,
  verified,
}) {
  const isAvailableToday = availability === "Available Today";
  const skillsList = Array.isArray(skills) ? skills : [];

  return (
    <Link
      to={`/workers/${id}`}     
      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden block w-full cursor-pointer"
    >
      <div className="flex p-6 gap-6">
        <div className="relative">
          <img
            src={image}
            alt={name}
            className="w-24 h-24 rounded-full object-cover"
          />
          {verified && (
            <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              ✓
            </span>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{name}</h3>
          <p className="text-primary font-semibold">{profession}</p>

          <div className="flex gap-3 mt-2">
            <span>⭐ {rating ?? "N/A"}</span>
            <span>{experience} experience</span>
          </div>

          <div className="flex gap-2 mt-3">
            {skillsList.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-4 py-1 bg-gray-100 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>

          <p className="mt-3 text-gray-600">{location}</p>
        </div>
      </div>
    </Link>
  );
}

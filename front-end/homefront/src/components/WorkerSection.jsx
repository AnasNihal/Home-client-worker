// src/components/WorkerSection.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAPI, getImageURL } from "../utils/api";

export default function WorkersSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [workers, setWorkers] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FETCH WORKERS
  useEffect(() => {
    loadWorkers();
  }, []);

  // FETCH PROFESSIONS
  useEffect(() => {
    loadProfessions();
  }, []);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      
      // Check cache first
      const cached = localStorage.getItem("workers_cache");
      if (cached) {
        const data = JSON.parse(cached);
        setWorkers(data);
        setLoading(false);
      }

      // Fetch fresh data
      const data = await fetchAPI("/worker/worker_list/");
      
      if (Array.isArray(data) && data.length > 0) {
        setWorkers(data);
        localStorage.setItem("workers_cache", JSON.stringify(data));
        setError(null);
      }
    } catch (err) {
      console.error("Error loading workers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProfessions = async () => {
    try {
      const cached = localStorage.getItem("professions_cache");
      if (cached) {
        setProfessions([{ id: "all", name: "All Services", slug: "all" }, ...JSON.parse(cached)]);
      }

      const data = await fetchAPI("/worker/profession_list/");
      if (Array.isArray(data)) {
        setProfessions([{ id: "all", name: "All Services", slug: "all" }, ...data]);
        localStorage.setItem("professions_cache", JSON.stringify(data));
      }
    } catch (err) {
      console.error("Error loading professions:", err);
    }
  };

  // Filter workers
  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.profession?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.profession?.toLowerCase().includes(searchTerm.toLowerCase());

    const workerCategory = typeof worker.profession === 'string' 
      ? worker.profession.toLowerCase().replace(/\s+/g, "-")
      : worker.profession?.slug || worker.profession?.name?.toLowerCase().replace(/\s+/g, "-") || "";

    const matchesCategory = selectedCategory === "all" || workerCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // LOADING
  if (loading && workers.length === 0) {
    return (
      <section className="bg-light_green min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl text-primary font-medium">Loading workers...</p>
        </div>
      </section>
    );
  }

  // ERROR
  if (error && workers.length === 0) {
    return (
      <section className="bg-light_green min-h-screen py-8 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Workers</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-light_green min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Find Professional Workers
          </h1>
          <p className="text-gray-600 text-lg">
            Browse {workers.length}+ verified professionals
          </p>

          <div className="relative max-w-2xl mx-auto mt-4 mb-6">
            <input
              type="text"
              placeholder="Search by name or profession..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 text-lg border border-gray-300 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {professions.map((prof) => {
              const count = prof.slug === "all" 
                ? workers.length 
                : workers.filter(w => {
                    const cat = typeof w.profession === 'string' 
                      ? w.profession.toLowerCase().replace(/\s+/g, "-")
                      : w.profession?.slug || w.profession?.name?.toLowerCase().replace(/\s+/g, "-") || "";
                    return cat === prof.slug;
                  }).length;

              return (
                <button
                  key={prof.id || prof.slug}
                  onClick={() => setSelectedCategory(prof.slug)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    selectedCategory === prof.slug
                      ? "bg-primary text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border"
                  }`}
                >
                  <span className="font-medium">{prof.name}</span>
                  <span className="text-xs bg-black/10 px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* WORKERS LIST */}
        <div className="space-y-4">
          {filteredWorkers.length > 0 ? (
            filteredWorkers.map((worker) => <WorkerCard key={worker.id} worker={worker} />)
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No workers found</h3>
              <p className="text-gray-500">Try adjusting your search</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* WORKER CARD */
function WorkerCard({ worker }) {
  const professionName = typeof worker.profession === 'string' 
    ? worker.profession 
    : worker.profession?.name || "Service Provider";

  const rating = worker.ratings?.average_rating || worker.rating || 0;
  const reviews = worker.ratings?.total_ratings || 0;
  const image = worker.image ? getImageURL(worker.image) : "https://via.placeholder.com/400";

  return (
    <Link
      to={`/workers/${worker.id}`}
      className="block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100"
    >
      <div className="flex p-6 gap-6">
        {/* Image */}
        <div className="relative flex-shrink-0">
          <img
            src={image}
            alt={worker.name}
            className="w-24 h-24 rounded-full object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/400";
            }}
          />
          {worker.verified && (
            <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              ✓
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900">{worker.name}</h3>
          <p className="text-primary font-semibold">{professionName}</p>

          <div className="flex gap-4 mt-2 text-sm text-gray-600">
            <span>⭐ {rating > 0 ? rating.toFixed(1) : "New"}</span>
            <span>{reviews} reviews</span>
            <span>{worker.experience || "New"}</span>
          </div>

          {/* Skills */}
          {worker.services && worker.services.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {worker.services.slice(0, 3).map((service, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                >
                  {service.services || service.name}
                </span>
              ))}
              {worker.services.length > 3 && (
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-500">
                  +{worker.services.length - 3} more
                </span>
              )}
            </div>
          )}

          {worker.location && (
            <p className="mt-3 text-gray-600 text-sm">📍 {worker.location}</p>
          )}
        </div>

        {/* Availability */}
        <div className="flex-shrink-0">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              worker.availability === "Available Today"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {worker.availability || "Available"}
          </span>
        </div>
      </div>
    </Link>
  );
}
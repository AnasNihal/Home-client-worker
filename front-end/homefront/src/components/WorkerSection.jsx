import React, { useState } from "react";
import { Link } from "react-router-dom";

const workers = [
  {
    id: "john-electrician",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    name: "John Smith",
    profession: "Electrician",
    category: "electrical-repairs",
    experience: "8 years",
    rating: 4.8,
    reviews: 156,
    location: "Downtown Area",
    availability: "Available Today",
    hourlyRate: 25,
    skills: ["Wiring", "Fan Installation", "Switchboard Repair"],
    completedJobs: 234,
    verified: true
  },
  {
    id: "mike-plumber",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    name: "Mike Johnson",
    profession: "Plumber",
    category: "plumbing",
    experience: "12 years",
    rating: 4.9,
    reviews: 203,
    location: "Central District",
    availability: "Available Tomorrow",
    hourlyRate: 30,
    skills: ["Pipe Repair", "Leak Detection", "Faucet Install"],
    completedJobs: 387,
    verified: true
  },
  {
    id: "david-carpenter",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    name: "David Wilson",
    profession: "Carpenter",
    category: "carpenter",
    experience: "15 years",
    rating: 4.7,
    reviews: 189,
    location: "North Side",
    availability: "Available Today",
    hourlyRate: 35,
    skills: ["Custom Woodwork", "Door Installation", "Shelving"],
    completedJobs: 421,
    verified: true
  },
  {
    id: "sarah-cleaner",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b734?w=400&h=400&fit=crop&crop=face",
    name: "Sarah Davis",
    profession: "Deep Cleaning Specialist",
    category: "deep-cleaning",
    experience: "6 years",
    rating: 4.9,
    reviews: 142,
    location: "East End",
    availability: "Available Today",
    hourlyRate: 20,
    skills: ["Deep Cleaning", "Sanitization", "Organization"],
    completedJobs: 298,
    verified: true
  },
  {
    id: "alex-cleaner",
    image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=face",
    name: "Alex Martinez",
    profession: "House Cleaner",
    category: "residential-cleaning",
    experience: "4 years",
    rating: 4.6,
    reviews: 98,
    location: "West District",
    availability: "Available Tomorrow",
    hourlyRate: 18,
    skills: ["Residential Cleaning", "Window Cleaning", "Floor Care"],
    completedJobs: 156,
    verified: false
  },
  {
    id: "tom-pest",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
    name: "Tom Anderson",
    profession: "Pest Control Expert",
    category: "pest-control",
    experience: "10 years",
    rating: 4.8,
    reviews: 167,
    location: "South Area",
    availability: "Available Today",
    hourlyRate: 28,
    skills: ["Pest Elimination", "Prevention", "Inspection"],
    completedJobs: 312,
    verified: true
  }
];

const serviceCategories = [
  {
    id: "all",
    name: "All Services",
    icon: "https://img.icons8.com/ios-filled/50/1E5F4B/menu.png",
    count: workers.length
  },
  {
    id: "electrical-repairs",
    name: "Electrical",
    icon: "https://img.icons8.com/ios-filled/50/1E5F4B/electrical.png",
    count: workers.filter(w => w.category === "electrical-repairs").length
  },
  {
    id: "plumbing",
    name: "Plumbing",
    icon: "https://img.icons8.com/ios-filled/50/1E5F4B/plumbing.png",
    count: workers.filter(w => w.category === "plumbing").length
  },
  {
    id: "carpenter",
    name: "Carpentry",
    icon: "https://img.icons8.com/ios-filled/50/1E5F4B/carpenter.png",
    count: workers.filter(w => w.category === "carpenter").length
  },
  {
    id: "deep-cleaning",
    name: "Deep Cleaning",
    icon: "https://img.icons8.com/ios-filled/50/1E5F4B/clean.png",
    count: workers.filter(w => w.category === "deep-cleaning").length
  },
  {
    id: "residential-cleaning",
    name: "House Cleaning",
    icon: "https://img.icons8.com/ios-filled/50/1E5F4B/clean.png",
    count: workers.filter(w => w.category === "residential-cleaning").length
  },
  {
    id: "pest-control",
    name: "Pest Control",
    icon: "https://img.icons8.com/ios-filled/50/1E5F4B/bug.png",
    count: workers.filter(w => w.category === "pest-control").length
  }
];


export default function WorkersSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  // Filter workers based on search and category
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.profession.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || worker.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort workers
  const sortedWorkers = [...filteredWorkers].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "price-low":
        return a.hourlyRate - b.hourlyRate;
      case "price-high":
        return b.hourlyRate - a.hourlyRate;
      case "experience":
        return parseInt(b.experience) - parseInt(a.experience);
      default:
        return 0;
    }
  });

  return (
    <section className="bg-light_green min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Search */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              Find Professional Workers
            </h1>
            <p className="text-gray-600 text-lg">
              Browse {workers.length}+ verified professionals in your area
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or profession..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pr-12 text-lg border border-gray-300 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
              <svg 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {serviceCategories.slice(0, 5).map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  selectedCategory === category.id
                    ? "bg-white text-primary shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <img src={category.icon} alt={category.name} className="w-4 h-4" />
                <span className="font-medium">{category.name}</span>
                <span className="text-xs bg-black/10 px-2 py-0.5 rounded-full">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-primary mb-4">Filters</h3>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Service Category</h4>
                <div className="space-y-2">
                  {serviceCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                        selectedCategory === category.id
                          ? "bg-primary text-white"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={category.icon} alt={category.name} className="w-5 h-5" />
                        <span>{category.name}</span>
                      </div>
                      <span className="text-sm bg-black/10 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="experience">Most Experienced</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Availability</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="ml-2 text-gray-700">Available Today</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="ml-2 text-gray-700">Available This Week</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="ml-2 text-gray-700">Verified Only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Workers Grid */}
          <div className="flex-1">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {sortedWorkers.length} of {workers.length} workers
              </p>
              <div className="lg:hidden">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                  </svg>
                  Filters
                </button>
              </div>
            </div>

            {/* Workers Cards */}
            <div className="space-y-4">
              {sortedWorkers.map((worker) => (
                <WorkerCard key={worker.id} {...worker} />
              ))}
            </div>

            {sortedWorkers.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
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

// Enhanced WorkerCard with better click handling
function WorkerCard({ id, image, name, profession, experience, rating, reviews, location, availability, hourlyRate, skills, verified }) {
  const isAvailableToday = availability === "Available Today";

  return (
    <Link
      to={`/worker-details/${id}`} // Updated route path
      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden block w-full cursor-pointer"
    >
      {/* Card Content */}
      <div className="flex p-4 sm:p-5 md:p-6 gap-4 sm:gap-5 md:gap-6">
        
        {/* Left: Profile Image */}
        <div className="relative flex-shrink-0">
          <img 
            src={image} 
            alt={name}
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-primary transition-colors"
          />
          {/* Verification Badge */}
          {verified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Right: Content Area */}
        <div className="flex-1 min-w-0">
          
          {/* Top Row: Name and Availability */}
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors truncate">
                {name}
              </h3>
              <p className="text-primary font-semibold text-sm sm:text-base md:text-lg">
                {profession}
              </p>
            </div>
            <span className={`ml-3 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap ${
              isAvailableToday 
                ? "bg-green-100 text-green-700" 
                : "bg-yellow-100 text-yellow-700"
            }`}>
              {isAvailableToday ? "Available Today" : "Tomorrow"}
            </span>
          </div>
          
          {/* Rating and Experience Row */}
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">
                {rating}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm md:text-base">
                ({reviews} reviews)
              </span>
            </div>
            <span className="text-gray-300">•</span>
            <span className="text-gray-600 font-semibold text-xs sm:text-sm md:text-base">
              {experience} experience
            </span>
          </div>

          {/* Skills Row */}
          <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
            {skills.slice(0, 3).map((skill, index) => (
              <span 
                key={index}
                className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-100 group-hover:bg-primary/10 text-gray-700 text-xs sm:text-sm rounded-full font-medium transition-colors"
              >
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-100 text-gray-500 text-xs sm:text-sm rounded-full">
                +{skills.length - 3}
              </span>
            )}
          </div>

          {/* Bottom Row: Location, Price and Button */}
          <div className="flex items-center justify-between">
            {/* Location */}
            <div className="flex items-center gap-2 text-gray-600 flex-1 min-w-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span className="font-semibold text-sm sm:text-base truncate">
                {location}
              </span>
            </div>
            
            {/* Price and View Details */}
            <div className="flex items-center gap-3 sm:gap-4 ml-4">
              <div className="text-right">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                  ${hourlyRate}
                </span>
                <span className="text-gray-500 text-sm sm:text-base">/hr</span>
              </div>
              
              {/* View Details Button */}
              <div className="px-4 py-2 sm:px-6 sm:py-3 bg-primary text-white font-semibold rounded-lg group-hover:bg-primary/90 transition-colors text-sm sm:text-base whitespace-nowrap flex items-center gap-2">
                View Details
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click indicator */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
    </Link>
  );
}

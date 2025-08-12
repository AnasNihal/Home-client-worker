import React from 'react';
import TopSection from '../components/TopSection';
import BlogCard from '../components/BlogCard';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const blogPosts = [
  {
    id: 1,
    title: '5 Tips for a Healthier Home',
    excerpt: 'Discover easy routines to keep your home spotless and your family healthy.',
    image: 'https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&w=800&q=80',
    date: 'August 5, 2025',
    author: 'Alex Martinez',
  },
  {
    id: 2,
    title: 'Eco-Friendly Cleaning Solutions',
    excerpt: 'Learn how to switch to green products for a safer environment.',
    image: 'https://images.pexels.com/photos/4503264/pexels-photo-4503264.jpeg?auto=compress&w=800&q=80',
    date: 'July 28, 2025',
    author: 'Sarah Davis',
  },
  {
    id: 3,
    title: 'Deep Cleaning Checklist',
    excerpt: 'Your ultimate guide to a thorough deep-clean for every room.',
    image: 'https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg?auto=compress&w=800&q=80',
    date: 'July 15, 2025',
    author: 'David Wilson',
  },
  {
    id: 4,
    title: 'Maintaining Your Wooden Floors',
    excerpt: 'Protect and polish your hardwood for years of beauty.',
    image: 'https://images.pexels.com/photos/462235/pexels-photo-462235.jpeg?auto=compress&w=800&q=80',
    date: 'June 30, 2025',
    author: 'John Smith',
  },
];

export default function BlogPage() {
  const [headerRef, headerVisible] = useScrollAnimation(0.2);
  const [gridRef, gridVisible]     = useScrollAnimation(0.2);

  return (
    <>
      <TopSection
        title="Our Blog"
        subtitle="Insights & Tips"
        bgColor="bg-[#f4faef]"
      />

      <section className="w-full bg-white py-20 px-6 sm:px-12 lg:px-24 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center mb-16" ref={headerRef}>
          <h2
            className={`text-4xl font-bold text-primary mb-4 fade-in-up ${
              headerVisible ? 'animate' : ''
            }`}
          >
            Latest Articles
          </h2>
          <p
            className={`text-gray-600 text-lg fade-in-up stagger-2 ${
              headerVisible ? 'animate' : ''
            }`}
          >
            Stay informed with our expert cleaning and maintenance tips.
          </p>
        </div>

        <div
          ref={gridRef}
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto fade-in-up stagger-3 ${
            gridVisible ? 'animate' : ''
          }`}
        >
          {blogPosts.map((post, idx) => (
            <BlogCard key={post.id} post={post} index={idx} visible={gridVisible} />
          ))}
        </div>
      </section>
    </>
  );
}

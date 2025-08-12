import React from 'react';
import { Link } from 'react-router-dom';

export default function BlogCard({ post, index, visible }) {
  const delayClass = `stagger-${Math.min(index + 1, 6)}`;

  return (
    <Link
      to={`/blog/${post.id}`}
      className={`group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 fade-in-up ${delayClass} ${
        visible ? 'animate' : ''
      }`}
    >
      <div className="relative h-48">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-gray-600 mb-4">{post.excerpt}</p>
        <div className="text-sm text-gray-500 flex justify-between">
          <span>{post.date}</span>
          <span>By {post.author}</span>
        </div>
      </div>
    </Link>
  );
}

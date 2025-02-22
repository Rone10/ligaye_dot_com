'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BlogPost, BlogCategory } from '../../types/blog';

const mockPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of Remote Work: Trends to Watch in 2025',
    excerpt: 'Discover the latest trends shaping remote work culture and how companies are adapting to the new normal of distributed teams...',
    category: 'Career Advice',
    date: 'March 15, 2025',
    author: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
    },
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c',
  },
  {
    id: '2',
    title: '10 Essential Skills for Job Seekers in 2025',
    excerpt: 'Master these key skills to stand out in today\'s competitive job market...',
    category: 'Tips',
    date: 'March 12, 2025',
    author: {
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    },
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
  },
  {
    id: '3',
    title: 'Tech Industry Hiring Trends for Q2 2025',
    excerpt: 'Analysis of the latest hiring trends in the technology sector...',
    category: 'Industry',
    date: 'March 10, 2025',
    author: {
      name: 'Alex Thompson',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
    },
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf',
  },
];

const categories: BlogCategory[] = [
  { name: 'Career Advice', count: 12 },
  { name: 'Industry News', count: 8 },
  { name: 'Tips & Tutorials', count: 15 },
];

const recentPosts = [
  {
    title: 'How to Ace Your Remote Job Interview',
    date: 'March 8, 2025',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
  },
  {
    title: 'Building Your Personal Brand Online',
    date: 'March 5, 2025',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
  },
];

export default function BlogsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">News & Insights</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay up-to-date with the latest job market trends, career advice, and
            company news.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Featured Article */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <a href={`/blogs/${mockPosts[0].id}`} className="block group">
                <img
                  src={mockPosts[0].image}
                  alt={mockPosts[0].title}
                  className="w-full h-[400px] object-cover rounded-lg mb-4"
                />
                <div className="flex items-center gap-2 text-sm mb-2">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-600">
                    {mockPosts[0].category}
                  </Badge>
                  <span className="text-gray-500">{mockPosts[0].date}</span>
                </div>
                <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-600">
                  {mockPosts[0].title}
                </h2>
                <p className="text-gray-600 mb-4">{mockPosts[0].excerpt}</p>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <img src={mockPosts[0].author.avatar} alt={mockPosts[0].author.name} />
                  </Avatar>
                  <span className="text-sm">{mockPosts[0].author.name}</span>
                  <Button variant="link" className="ml-auto text-blue-600">
                    Read More →
                  </Button>
                </div>
              </a>
            </motion.article>

            {/* Article Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {mockPosts.slice(1).map((post) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <a href={`/blogs/${post.id}`} className="block group">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <span className="text-blue-600">{post.category}</span>
                      <span className="text-gray-500">{post.date}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <img src={post.author.avatar} alt={post.author.name} />
                      </Avatar>
                      <span className="text-sm">{post.author.name}</span>
                      <Button variant="link" className="ml-auto text-blue-600">
                        Read More →
                      </Button>
                    </div>
                  </a>
                </motion.article>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12 gap-1">
              <Button variant="outline">Previous</Button>
              <Button variant="outline" className="bg-blue-600 text-white">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">Next</Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-96 space-y-8">
            {/* Search */}
            <div className="bg-white rounded-lg border p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search articles..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg border p-4">
              <h2 className="text-lg font-semibold mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.name}
                    className="flex items-center justify-between hover:text-blue-600 cursor-pointer"
                  >
                    <span>{category.name}</span>
                    <span className="text-gray-500">({category.count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-white rounded-lg border p-4">
              <h2 className="text-lg font-semibold mb-4">Recent Posts</h2>
              <div className="space-y-4">
                {recentPosts.map((post, index) => (
                  <a
                    key={index}
                    href="#"
                    className="flex gap-4 group"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-medium group-hover:text-blue-600 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{post.date}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-white rounded-lg border p-4">
              <h2 className="text-lg font-semibold mb-4">Subscribe to Newsletter</h2>
              <p className="text-gray-600 mb-4">
                Get the latest articles and job updates delivered to your inbox.
              </p>
              <Input
                type="email"
                placeholder="Enter your email"
                className="mb-3"
              />
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
'use client';

import { motion } from 'framer-motion';
import { Twitter, Linkedin, Facebook } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

// Mock data for the blog post
const blogPost = {
  category: 'Career Advice',
  date: 'March 15, 2025',
  title: 'The Future of Remote Work: Trends to Watch in 2025',
  author: {
    name: 'Sarah Johnson',
    role: 'Senior Career Advisor',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
  },
  content: {
    introduction: 'The landscape of remote work continues to evolve rapidly as we move through 2025. Companies and employees alike are adapting to new ways of working, leveraging technology, and redefining workplace culture in unprecedented ways.',
    keyTrends: [
      'Hybrid work models becoming the new standard',
      'Advanced collaboration tools and virtual reality meetings',
      'Focus on mental health and work-life balance',
      'Rise of global talent pools and distributed teams',
    ],
    impact: 'As organizations embrace remote work, maintaining a strong company culture has become more important than ever. Leaders are finding innovative ways to foster connection and engagement among distributed teams.',
    quote: 'The future of work is not about where we work, but how we work together effectively, regardless of location.',
  },
  tags: ['#RemoteWork', '#FutureOfWork', '#WorkplaceCulture'],
  image: 'https://images.unsplash.com/photo-1497366216548-37526070297c',
  relatedArticles: [
    {
      title: 'Essential Skills for Remote Work Success',
      date: 'March 12, 2025',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
    },
    {
      title: 'Building Strong Remote Teams',
      date: 'March 10, 2025',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf',
    },
  ],
  comments: [
    {
      author: 'Mike Chen',
      timeAgo: '2 hours ago',
      content: 'Great insights on the future of remote work! The section about virtual reality meetings was particularly interesting.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    },
    {
      author: 'Alex Thompson',
      timeAgo: '5 hours ago',
      content: 'Would love to see more specific examples of companies successfully implementing these trends.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
    },
  ],
};

export default function BlogDetailPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4"
      >
        {/* Blog Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm mb-4">
            <a href="/career-advice" className="text-blue-600 hover:underline">
              {blogPost.category}
            </a>
            <span className="text-gray-500">•</span>
            <span className="text-gray-500">{blogPost.date}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-6">{blogPost.title}</h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <img src={blogPost.author.avatar} alt={blogPost.author.name} />
              </Avatar>
              <div>
                <h3 className="font-semibold">{blogPost.author.name}</h3>
                <p className="text-sm text-gray-500">{blogPost.author.role}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="rounded-full">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full">
                <Linkedin className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full">
                <Facebook className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Blog Content */}
        <div className="bg-white rounded-lg border p-6 mb-8">
          <img
            src={blogPost.image}
            alt="Remote work"
            className="w-full rounded-lg mb-8"
          />

          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">{blogPost.content.introduction}</p>

            <h2 className="text-xl font-bold mb-4">Key Trends Shaping Remote Work</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
              {blogPost.content.keyTrends.map((trend, index) => (
                <li key={index}>{trend}</li>
              ))}
            </ul>

            <h2 className="text-xl font-bold mb-4">The Impact on Company Culture</h2>
            <p className="text-gray-600 mb-6">{blogPost.content.impact}</p>

            <blockquote className="border-l-4 border-blue-600 pl-4 italic my-6">
              {blogPost.content.quote}
            </blockquote>

            <div className="flex gap-2 mb-8">
              {blogPost.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-blue-600">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Author Bio */}
        <div className="bg-white rounded-lg border p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">About {blogPost.author.name}</h2>
          <p className="text-gray-600">
            Sarah is a Senior Career Advisor with over 10 years of experience in workforce development and
            remote work consulting. She helps organizations and individuals navigate the changing landscape
            of work.
          </p>
        </div>

        {/* Related Articles */}
        <div className="bg-white rounded-lg border p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Related Articles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {blogPost.relatedArticles.map((article) => (
              <a
                key={article.title}
                href="#"
                className="flex gap-4 group"
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold group-hover:text-blue-600">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{article.date}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-bold mb-6">Comments ({blogPost.comments.length})</h2>
          
          <div className="space-y-6 mb-8">
            {blogPost.comments.map((comment, index) => (
              <div key={index} className="flex gap-4">
                <Avatar className="w-10 h-10">
                  <img src={comment.avatar} alt={comment.author} />
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{comment.author}</h3>
                    <span className="text-sm text-gray-500">{comment.timeAgo}</span>
                  </div>
                  <p className="text-gray-600">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="font-semibold mb-4">Add a Comment</h3>
            <Textarea
              placeholder="Share your thoughts..."
              className="mb-4"
            />
            <Button className="bg-blue-600 hover:bg-blue-700">
              Post Comment
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
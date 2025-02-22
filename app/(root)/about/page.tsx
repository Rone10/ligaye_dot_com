'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Users, Rocket, LineChart, Network as Network2, Target, Headphones } from 'lucide-react';

const features = [
  {
    title: 'Connect',
    description: 'Bringing together employers and job seekers across The Gambia',
    icon: Users,
  },
  {
    title: 'Empower',
    description: 'Enabling career growth and business success',
    icon: Rocket,
  },
  {
    title: 'Grow',
    description: 'Supporting the development of The Gambian economy',
    icon: LineChart,
  },
];

const team = [
  {
    name: 'Fatou Ceesay',
    role: 'CEO & Founder',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
  },
  {
    name: 'Omar Jallow',
    role: 'Head of Operations',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
  },
  {
    name: 'Mariama Saine',
    role: 'Client Success Manager',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
  },
];

const benefits = [
  {
    title: 'Largest Gambian Network',
    description: 'Access to the largest network of employers and job seekers in The Gambia',
    icon: Network2,
  },
  {
    title: 'Local Expertise',
    description: 'Deep understanding of the Gambian job market and business environment',
    icon: Target,
  },
  {
    title: 'User-Friendly Platform',
    description: 'Easy-to-use interface designed for both employers and job seekers',
    icon: Users,
  },
  {
    title: '24/7 Support',
    description: 'Dedicated support team to assist you throughout your journey',
    icon: Headphones,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-12"
      >
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">About TenderBoard</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connecting Gambian talent with opportunities, bridging the gap between
            employers and job seekers.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-lg border p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
          <p className="text-gray-600 mb-12">
            At TenderBoard, we're committed to transforming The Gambia's job market by creating a seamless
            connection between talented individuals and leading employers. Our mission is to empower Gambian
            professionals and businesses to reach their full potential.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="text-center">
                  <div className="flex justify-center mb-4">
                    <Icon className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-lg border p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">Our Story</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c"
                alt="Modern office space"
                className="rounded-lg w-full"
              />
            </div>
            <div>
              <p className="text-gray-600">
                Founded in 2023, TenderBoard emerged from a vision to revolutionize how Gambians find
                employment and how businesses discover talent. What started as a small initiative has grown into
                the country's leading job platform, serving thousands of professionals and organizations.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-lg border p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-blue-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg border p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">Why Choose Us</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">Ready to Get Started?</h2>
          <div className="flex justify-center gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700">Search Jobs</Button>
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Post a Job
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
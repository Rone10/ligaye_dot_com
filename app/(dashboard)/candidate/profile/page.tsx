'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Mail, Phone, Globe, Linkedin, Github } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

const skills = [
  'React.js',
  'TypeScript',
  'Node.js',
  'JavaScript',
  'HTML5',
  'CSS3',
  'Git',
  'REST APIs',
];

const workExperience = [
  {
    title: 'Senior Frontend Developer',
    company: 'TechCorp Solutions',
    period: '2023 - Present',
    description: 'Led frontend development initiatives and mentored junior developers. Implemented new features and optimized application performance.',
  },
  {
    title: 'Frontend Developer',
    company: 'Digital Innovations',
    period: '2020 - 2023',
    description: 'Developed and maintained multiple client projects using React.js and modern frontend technologies.',
  },
];

const education = {
  degree: 'Bachelor of Science in Computer Science',
  school: 'University of Technology',
  period: '2016 - 2020',
  major: 'Major in Software Engineering',
};

const socialLinks = [
  { platform: 'LinkedIn', url: 'linkedin.com/in/johnsmith', icon: Linkedin },
  { platform: 'GitHub', url: 'github.com/johnsmith', icon: Github },
  { platform: 'Website', url: 'johnsmith.dev', icon: Globe },
];

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border p-6"
      >
        <div className="flex flex-col md:flex-row items-start gap-6">
          <Avatar className="w-24 h-24">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
              alt="John Smith"
              className="rounded-lg object-cover"
            />
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold">John Smith</h1>
                <p className="text-gray-600">Senior Frontend Developer</p>
                <div className="flex items-center gap-2 text-gray-600 mt-2">
                  <MapPin className="w-4 h-4" />
                  <span>Banjul, The Gambia</span>
                </div>
              </div>
              <Button className="bg-blue-600">
                Edit Profile
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {['React.js', 'TypeScript', 'Node.js'].map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-blue-50 text-blue-600"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* About Me */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border p-6"
      >
        <h2 className="text-lg font-semibold mb-4">About Me</h2>
        <p className="text-gray-600">
          Passionate frontend developer with 5+ years of experience building responsive and user-friendly web applications. Specialized in React.js and modern JavaScript frameworks. Strong advocate for clean code and best practices.
        </p>
      </motion.div>

      {/* Resume */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Resume</h2>
          <Button variant="outline">Update Resume</Button>
        </div>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24">
              <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-medium">John_Smith_Resume_2025.pdf</div>
            <div className="text-sm text-gray-500">Updated 2 weeks ago</div>
          </div>
          <Button variant="ghost" className="text-blue-600">Download</Button>
        </div>
      </motion.div>

      {/* Skills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="bg-blue-50 text-blue-600"
            >
              {skill}
            </Badge>
          ))}
        </div>
      </motion.div>

      {/* Work Experience */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Work Experience</h2>
        <div className="space-y-6">
          {workExperience.map((job, index) => (
            <div key={index} className="border-b last:border-0 pb-6 last:pb-0">
              <h3 className="font-semibold">{job.title}</h3>
              <div className="text-gray-600">
                {job.company} • {job.period}
              </div>
              <p className="mt-2 text-gray-600">{job.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Education */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Education</h2>
        <div>
          <h3 className="font-semibold">{education.degree}</h3>
          <div className="text-gray-600">
            {education.school} • {education.period}
          </div>
          <p className="mt-2 text-gray-600">{education.major}</p>
        </div>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Contact Information</h2>
          <Badge variant="outline">Visible to employers</Badge>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4" />
            <span>john.smith@example.com</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4" />
            <span>+220 123 456 789</span>
          </div>
        </div>
      </motion.div>

      {/* Portfolio & Social Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Portfolio & Social Links</h2>
        <div className="space-y-3">
          {socialLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <div key={index} className="flex items-center gap-2 text-gray-600">
                <Icon className="w-4 h-4" />
                <a href={`https://${link.url}`} className="hover:text-blue-600">
                  {link.url}
                </a>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
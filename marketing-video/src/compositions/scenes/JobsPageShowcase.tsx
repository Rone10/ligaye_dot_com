import React from 'react';
import { useCurrentFrame } from 'remotion';
import { BRAND_COLORS } from '../../utils/colors';
import { useFadeIn, useSlideUp, useStaggerAnimation } from '../../utils/animations';
import { JobCard } from '../../components/JobCard';

interface JobsPageShowcaseProps {
  theme: 'light' | 'dark';
  format: 'landscape' | 'square' | 'story';
}

export const JobsPageShowcase: React.FC<JobsPageShowcaseProps> = ({ theme, format }) => {
  const frame = useCurrentFrame();
  
  // Animation timings
  const titleAnimation = useSlideUp(0, 45);
  const searchBarAnimation = useSlideUp(30, 45);
  const filtersAnimation = useFadeIn(60, 30);
  const jobCardAnimations = useStaggerAnimation(90, 3, 20, 30);
  
  // Responsive layout
  const isSquare = format === 'square';
  const isStory = format === 'story';
  
  // Mock job data
  const mockJobs = [
    {
      title: 'Software Developer',
      company: 'Tech Solutions Gambia',
      location: 'Banjul',
      salary: 'D25,000 - D35,000',
      type: 'Full-time',
    },
    {
      title: 'Marketing Manager',
      company: 'Digital Marketing Co.',
      location: 'Kanifing',
      salary: 'D20,000 - D28,000',
      type: 'Full-time',
    },
    {
      title: 'English Teacher',
      company: 'International School',
      location: 'Serrekunda',
      salary: 'D15,000 - D22,000',
      type: 'Full-time',
    },
  ];
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 ${theme === 'dark' ? 'gradient-bg-dark' : 'gradient-bg'}`} />
      
      <div className={`relative z-10 h-full ${isStory ? 'px-4 py-6' : 'px-8 py-12'}`}>
        {/* Title */}
        <div
          className="text-center mb-8"
          style={{
            opacity: titleAnimation.opacity,
            transform: `translateY(${titleAnimation.translateY}px)`,
          }}
        >
          <h2 
            className={`font-bold mb-4 ${theme === 'dark' ? 'text-theme-light' : 'text-theme-dark'}`}
            style={{ fontSize: isStory ? 28 : isSquare ? 32 : 40 }}
          >
            Find Your Perfect Job
          </h2>
          <p 
            className="text-theme-gray-dark"
            style={{ fontSize: isStory ? 16 : isSquare ? 18 : 20 }}
          >
            Browse hundreds of opportunities across Gambia
          </p>
        </div>
        
        {/* Search Interface */}
        <div
          className={`mb-8 ${isStory ? '' : 'max-w-4xl mx-auto'}`}
          style={{
            opacity: searchBarAnimation.opacity,
            transform: `translateY(${searchBarAnimation.translateY}px)`,
          }}
        >
          {/* Search Bar */}
          <div className="glass-card p-4 mb-6">
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-theme-gray-dark rounded-full" />
              </div>
              <input
                className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 text-lg ${
                  theme === 'dark' 
                    ? 'bg-theme-dark/50 border-theme-gray text-theme-light' 
                    : 'bg-white border-theme-gray text-theme-dark'
                }`}
                placeholder="Search for jobs, companies, or keywords..."
                style={{ fontSize: isStory ? 14 : 16 }}
                readOnly
              />
            </div>
            
            {/* Popular searches */}
            <div className="flex flex-wrap gap-2 mt-4">
              {['Software Developer', 'Teacher', 'Marketing', 'Accountant'].map((term, index) => (
                <span
                  key={term}
                  className="px-3 py-1 rounded-full text-sm bg-theme-gray text-theme-dark"
                  style={{
                    opacity: Math.max(0, filtersAnimation - index * 0.2),
                  }}
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Job Listings Layout */}
        <div className={`${isStory ? '' : 'max-w-6xl mx-auto'}`}>
          <div className={`grid gap-6 ${
            isStory ? 'grid-cols-1' : isSquare ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-[300px_1fr]'
          }`}>
            
            {/* Filters Sidebar (landscape only) */}
            {!isStory && !isSquare && (
              <div
                style={{
                  opacity: filtersAnimation,
                }}
              >
                <div className="glass-card p-6">
                  <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-theme-light' : 'text-theme-dark'}`}>
                    Filters
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-theme-gray-dark mb-2">
                        Location
                      </label>
                      <select className="w-full p-2 rounded border border-theme-gray text-sm">
                        <option>All Locations</option>
                        <option>Banjul</option>
                        <option>Kanifing</option>
                        <option>Serrekunda</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-theme-gray-dark mb-2">
                        Job Type
                      </label>
                      <select className="w-full p-2 rounded border border-theme-gray text-sm">
                        <option>All Types</option>
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Job Cards */}
            <div className="space-y-4">
              {mockJobs.map((job, index) => (
                <div
                  key={index}
                  style={{
                    opacity: jobCardAnimations[index],
                    transform: `translateX(${(1 - jobCardAnimations[index]) * 50}px)`,
                  }}
                >
                  <JobCard job={job} theme={theme} />
                </div>
              ))}
              
              {/* Show more indicator */}
              <div
                className="text-center py-4"
                style={{
                  opacity: Math.max(0, (jobCardAnimations[2] || 0) - 0.3),
                }}
              >
                <div className="inline-flex items-center space-x-2 text-theme-gray-dark">
                  <span style={{ fontSize: isStory ? 14 : 16 }}>+50 more jobs available</span>
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: BRAND_COLORS.primary.blue,
                          opacity: 0.3 + 0.4 * Math.sin((frame + i * 10) * 0.3),
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
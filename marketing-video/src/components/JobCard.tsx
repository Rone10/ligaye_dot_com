import React from 'react';
import { BRAND_COLORS } from '../utils/colors';

interface JobCardProps {
  job: {
    title: string;
    company: string;
    location: string;
    salary: string;
    type: string;
  };
  theme: 'light' | 'dark';
}

export const JobCard: React.FC<JobCardProps> = ({ job, theme }) => {
  return (
    <div 
      className={`glass-card p-6 hover:shadow-level-3 transition-all duration-300 ${
        theme === 'dark' ? 'glass-card-dark' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 
            className={`font-semibold mb-2 ${
              theme === 'dark' ? 'text-theme-light' : 'text-theme-dark'
            }`}
            style={{ fontSize: 18 }}
          >
            {job.title}
          </h3>
          <p 
            className="text-theme-gray-dark mb-1"
            style={{ fontSize: 16 }}
          >
            {job.company}
          </p>
          <div className="flex items-center space-x-4 text-sm text-theme-gray-dark">
            <span className="flex items-center">
              <div className="w-4 h-4 mr-1 rounded-full bg-theme-gray-dark/20" />
              {job.location}
            </span>
            <span className="flex items-center">
              <div className="w-4 h-4 mr-1 rounded bg-theme-gray-dark/20" />
              {job.type}
            </span>
          </div>
        </div>
        
        <div className="ml-4 text-right">
          <div 
            className="px-3 py-1 rounded-full text-sm font-medium text-white mb-2"
            style={{ background: BRAND_COLORS.secondary.green }}
          >
            {job.salary}
          </div>
          <button 
            className="px-4 py-2 rounded-lg font-medium text-white text-sm transition-all hover:shadow-level-2"
            style={{ background: BRAND_COLORS.primary.blue }}
          >
            Apply Now
          </button>
        </div>
      </div>
      
      {/* Job highlights */}
      <div className="flex flex-wrap gap-2">
        {['Remote OK', 'Benefits', 'Career Growth'].map((tag, index) => (
          <span
            key={tag}
            className="px-2 py-1 rounded text-xs bg-theme-gray text-theme-dark"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

// Define the shape of the props
type ProfileCompletenessProps = {
  candidateProfile?: {
    profile: {
      id: string;
      fullName: string;
      email: string;
      avatarUrl: string | null;
      [key: string]: any;
    };
    candidateProfile: {
      id: string;
      title?: string | null;
      skills?: Array<{ id: string; name: string; }> | string[] | null;
      bio?: string | null;
      experienceLevel?: string | null;
      resumeUrl?: string | null;
      [key: string]: any;
    } | null;
  };
}

export function ProfileCompleteness({ candidateProfile }: ProfileCompletenessProps) {
  // Calculate profile completeness and identify missing sections
  const calculateProfileCompleteness = () => {
    if (!candidateProfile?.candidateProfile) {
      return { score: 25, sections: [
        { name: 'Basic Information', completed: true },
        { name: 'Work Experience', completed: false },
        { name: 'Skills Assessment', completed: false },
        { name: 'Resume', completed: false },
      ]};
    }

    const profile = candidateProfile.profile;
    const candidateData = candidateProfile.candidateProfile;
    
    const sections = [
      { name: 'Basic Information', completed: !!profile.fullName },
      { name: 'Professional Title', completed: !!candidateData?.title },
      { name: 'Skills', completed: !!(candidateData?.skills && candidateData.skills.length > 0) },
      { name: 'Resume', completed: !!candidateData?.resumeUrl },
    ];
    
    const completedSections = sections.filter(s => s.completed).length;
    const score = Math.round((completedSections / sections.length) * 100);
    
    return { score, sections };
  };
  
  const { score, sections } = calculateProfileCompleteness();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border p-6"
    >
      <h2 className="text-lg font-semibold mb-4">Profile Completeness</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Overall Progress</span>
            <span>{score}%</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>
        <div className="space-y-3">
          {sections.map((section, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${
                section.completed ? 'bg-green-500' : 'bg-gray-200'
              }`} />
              <span className="text-sm">{section.name}</span>
            </div>
          ))}
        </div>
        <Button className="w-full bg-blue-600" asChild>
          <Link href="/candidate/profile">Complete Profile</Link>
        </Button>
      </div>
    </motion.div>
  );
}
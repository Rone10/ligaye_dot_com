'use server';

import { createServerClient } from '@supabase/ssr';
import { getUser } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { 
  getEmployerProfileByProfileId, 
  getEmployerProfileWithUserByProfileId,
  getEmployerActiveJobsCount,
  updateEmployerProfile
} from '@/lib/db/queries/employer/company';
import { getProfileByUserId } from '@/lib/db/queries/profiles';
import { EmployerProfile } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';

// Define the company profile interface that matches the mock data structure
export interface CompanyProfileData {
  id: string;
  name: string;
  logo: string;
  coverImage: string;
  description: string;
  industry: string;
  companySize: string;
  founded: string;
  website: string;
  location: {
    address: string;
    city: string;
    country: string;
  };
  contact: {
    email: string;
    phone: string;
    socialMedia: {
      facebook: string;
      twitter: string;
      linkedin: string;
      instagram: string;
    };
  };
  workingHours: string;
  benefits: {
    icon: string;
    title: string;
    description: string;
  }[];
  culture: {
    values: string[];
    description: string;
  };
  officePhotos: string[];
}

// Define the company stats interface
export interface CompanyStatData {
  label: string;
  value: string;
  icon: string; // Change from any to string - we'll use icon name instead of component
  className: string;
  iconColor: string;
}


/**
 * Get the current employer's company profile
 */
export async function getCompanyProfile(): Promise<CompanyProfileData | null> {
    const user = await getUser();
    if (!user) {
        return null;
    }
    
  


  try {
    const profile = await getProfileByUserId(user.id);
    if (!profile) {
        return null;
    }
    const profileId = profile.id;
    
    if (!profileId) {
      return null;
    }
    
    const employerData = await getEmployerProfileWithUserByProfileId(profileId);
    
    if (!employerData) {
      return null;
    }
    
    // Transform the database data to match the expected format
    // This is a placeholder implementation - you'll need to adapt this
    // based on your actual data structure and requirements
    return {
      id: employerData.id,
      name: employerData.companyName,
      logo: employerData.avatarUrl || '/company-logo.png', // Fallback to default
      coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c', // Placeholder
      description: employerData.companyDescription || '',
      industry: employerData.industry,
      companySize: employerData.companySize,
      founded: '2020', // Placeholder - add this field to your schema if needed
      website: employerData.website || '',
      location: {
        address: employerData.location,
        city: 'Banjul', // Placeholder - consider adding these fields to your schema
        country: 'The Gambia',
      },
      contact: {
        email: employerData.email,
        phone: '+220 7123 4567', // Placeholder - add this field to your schema if needed
        socialMedia: {
          facebook: 'https://facebook.com',
          twitter: 'https://twitter.com',
          linkedin: 'https://linkedin.com',
          instagram: 'https://instagram.com',
        },
      },
      workingHours: 'Monday - Friday, 9:00 AM - 5:00 PM', // Placeholder
      benefits: [
        {
          icon: '🏥',
          title: 'Health Insurance',
          description: 'Comprehensive health coverage for employees and their families',
        },
        {
          icon: '💻',
          title: 'Remote Work',
          description: 'Flexible work arrangements with remote options',
        },
        {
          icon: '📚',
          title: 'Learning & Development',
          description: 'Continuous learning opportunities and professional growth',
        },
      ],
      culture: {
        values: [
          'Innovation First',
          'Customer Success',
          'Team Collaboration',
        ],
        description: 'We foster a culture of innovation and collaboration, where every team member is empowered to make a difference.',
      },
      officePhotos: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c',
        'https://images.unsplash.com/photo-1497366412874-3415097a27e7',
      ],
    };
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return null;
  }
}

/**
 * Get the company stats
 */
export async function getCompanyStats(): Promise<CompanyStatData[]> {
    const user = await getUser();
    if (!user) {
        return [];
    }
    
    try {
    const profile = await getProfileByUserId(user.id);
    if (!profile) {
        return [];
    }
    const profileId = profile.id;
    
    if (!profileId) {
      return [];
    }
    
    const employerProfile = await getEmployerProfileByProfileId(profileId);
    if (!employerProfile) {
        return [];
    }

    // Get active jobs count
    const activeJobsCount = await getEmployerActiveJobsCount(profileId);
    
    // Return the stats with string identifiers for icons instead of components
    return [
      {
        label: 'Company Size',
        value: employerProfile.companySize,
        icon: 'Users',
        className: 'bg-blue-50',
        iconColor: 'text-blue-600',
      },
      {
        label: 'Founded',
        value: '2020', // Placeholder - add this field to your schema if needed
        icon: 'Building2',
        className: 'bg-green-50',
        iconColor: 'text-green-600',
      },
      {
        label: 'Location',
        value: employerProfile.location.split(',')[0] || 'Banjul',
        icon: 'MapPin',
        className: 'bg-purple-50',
        iconColor: 'text-purple-600',
      },
      {
        label: 'Open Positions',
        value: activeJobsCount.toString(),
        icon: 'Clock',
        className: 'bg-yellow-50',
        iconColor: 'text-yellow-600',
      },
    ];
  } catch (error) {
    console.error('Error fetching company stats:', error);
    return [];
  }
}

/**
 * Update the company profile
 */
export async function updateCompanyProfileAction(data: Partial<EmployerProfile>) {
  try {
    const user = await getUser();
    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }
    
    const profile = await getProfileByUserId(user.id);
    if (!profile) {
        return { success: false, error: 'User not authenticated' };
    }
    const profileId = profile.id;
    
    
    const employerProfile = await getEmployerProfileByProfileId(profileId);
    
    if (!employerProfile) {
      return { success: false, error: 'Employer profile not found' };
    }
    
    const result = await updateEmployerProfile(employerProfile.id, data);
    
    if (result.success) {
      // Revalidate the company profile page to reflect the changes
      revalidatePath('/employer/company');
    }
    
    return result;
  } catch (error) {
    console.error('Error updating company profile:', error);
    return { success: false, error: 'Failed to update company profile' };
  }
}

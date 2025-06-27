/**
 * Centralized cache tag management for employer profile feature
 * This file contains all cache tag constants to ensure consistency
 * and prevent issues with 'use server' directives
 */

export const EMPLOYER_PROFILE_CACHE_TAGS = {
  // Profile-specific tags
  profile: (profileId: string) => `employer-profile-${profileId}`,
  profileByUserId: (userId: string) => `employer-profile-user-${userId}`,
  
  // Collection tags
  allProfiles: 'employer-profiles-collection',
  
  // Related data tags
  industries: 'industries',
  locations: 'locations',
  
  // Combined tags for easy invalidation
  getProfileTags: (profileId: string, userId?: string) => {
    const tags = [
      EMPLOYER_PROFILE_CACHE_TAGS.profile(profileId),
      EMPLOYER_PROFILE_CACHE_TAGS.allProfiles,
    ];
    
    if (userId) {
      tags.push(EMPLOYER_PROFILE_CACHE_TAGS.profileByUserId(userId));
    }
    
    return tags;
  },
  
  // Get all tags that should be invalidated when a profile is updated
  getInvalidationTags: (profileId: string, userId?: string) => {
    return EMPLOYER_PROFILE_CACHE_TAGS.getProfileTags(profileId, userId);
  }
} as const;
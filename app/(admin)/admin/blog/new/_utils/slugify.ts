import { checkSlugUniqueness } from '../_queries';

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and spaces
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

export async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  // Check if the base slug is unique
  let isUnique = await checkSlugUniqueness(slug, excludeId);
  
  // If not unique, append numbers until we find a unique slug
  while (!isUnique) {
    slug = `${baseSlug}-${counter}`;
    isUnique = await checkSlugUniqueness(slug, excludeId);
    counter++;
    
    // Prevent infinite loops (safety measure)
    if (counter > 100) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  
  return slug;
} 
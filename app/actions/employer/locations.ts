import { getAllLocations } from '@/lib/db/queries/employer/locations';
import { getUser } from '@/lib/supabase/server';

export interface Location {
  id: string;
  name: string | null;
  region: string;
  district: string | null;
}

export async function fetchLocations(): Promise<Location[] | null> {
  try {
    const user = await getUser();
    if (!user) return null;
    
    const locations = await getAllLocations();
    return locations;
  } catch (error) {
    console.error('Error fetching locations:', error);
    return null;
  }
} 
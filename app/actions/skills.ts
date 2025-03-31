'use server'

import { db } from '@/lib/db';
import { skills } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Get all available skills
 */
export async function getAllSkills() {
  try {
    const allSkills = await db().select().from(skills).orderBy(skills.name);
    return allSkills;
  } catch (error) {
    console.error('Failed to fetch skills:', error);
    return [];
  }
}

/**
 * Search skills by name
 */
export async function searchSkills(query: string) {
  try {
    if (!query || query.trim() === '') {
      return await getAllSkills();
    }
    
    const foundSkills = await db()
      .select()
      .from(skills)
      .where(sql`${skills.name} ILIKE ${`%${query}%`}`)
      .orderBy(skills.name);
    
    return foundSkills;
  } catch (error) {
    console.error('Failed to search skills:', error);
    return [];
  }
}

/**
 * Get a skill by ID
 */
export async function getSkillById(id: string) {
  try {
    const skill = await db()
      .select()
      .from(skills)
      .where(eq(skills.id, id))
      .limit(1);
    
    return skill[0] || null;
  } catch (error) {
    console.error('Failed to get skill by ID:', error);
    return null;
  }
} 
'use server'

import { getUser } from '@/lib/supabase/server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/db';
import { applications, jobs, candidateProfiles, profiles } from '@/lib/db/schema';
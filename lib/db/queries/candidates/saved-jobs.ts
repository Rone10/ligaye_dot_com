'use server'

import { db } from '@/lib/db/db';
import { 
  savedJobs,
} from '@/lib/db/schema';
import { eq, and, count, desc, sql, gt } from 'drizzle-orm';
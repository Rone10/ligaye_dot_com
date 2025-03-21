# Skills Schema Migration Plan

## Background
Currently, the database schema uses array fields for storing skills:
- `skillsRequired` in the `jobs` table
- `skills` in the `candidateProfiles` table

This approach doesn't fully leverage the relational database structure. The existing schema already has junction tables (`jobSkills`), but they're not being utilized properly. This document outlines a plan to normalize this data structure.

## 1. Schema Changes

### A. Create Junction Table for Candidate Skills

```typescript
// Add candidateSkills junction table
export const candidateSkills = pgTable('candidate_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateId: uuid('candidate_id').notNull().references(() => candidateProfiles.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  proficiencyLevel: text('proficiency_level').default('intermediate'),
  deleted: boolean('deleted').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    candidateIdIdx: index('candidate_skills_candidate_id_idx').on(table.candidateId),
    skillIdIdx: index('candidate_skills_skill_id_idx').on(table.skillId),
    uniqueCandidateSkill: uniqueIndex('candidate_skill_unique_idx').on(table.candidateId, table.skillId)
  };
});
```

### B. Update Relations

```typescript
// Add candidateSkills relations
export const candidateSkillsRelations = relations(candidateSkills, ({ one }) => ({
  candidate: one(candidateProfiles, {
    fields: [candidateSkills.candidateId],
    references: [candidateProfiles.id],
  }),
  skill: one(skills, {
    fields: [candidateSkills.skillId],
    references: [skills.id],
  }),
}));

// Update candidateProfiles relations to include skills
export const candidateProfilesRelations = relations(candidateProfiles, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [candidateProfiles.profileId],
    references: [profiles.id],
  }),
  skills: many(candidateSkills)
}));
```

### C. Export New Types

```typescript
// Add CandidateSkill types
export type CandidateSkill = InferModel<typeof candidateSkills>;
export type NewCandidateSkill = InferInsertModel<typeof candidateSkills>;
```

### D. Schema Cleanup (For Later)

Mark the array fields as deprecated:
```typescript
// In jobs table
skillsRequired: text('skills_required').array(), // @deprecated - Use jobSkills junction table instead

// In candidateProfiles table
skills: text('skills').array(), // @deprecated - Use candidateSkills junction table instead
```

## 2. Migration Strategy

### A. Create Migration Script

```typescript
// lib/db/migrations/skills-migration.ts
'use server'

import { db } from '../db';
import { jobs, candidateProfiles, skills, jobSkills, candidateSkills, eq } from '../schema';

export async function migrateJobSkills() {
  const allJobs = await db().select().from(jobs);
  let migratedCount = 0;
  
  for (const job of allJobs) {
    if (job.skillsRequired && job.skillsRequired.length > 0) {
      for (const skillName of job.skillsRequired) {
        // Find or create the skill
        let skillRecord = await db()
          .select()
          .from(skills)
          .where(eq(skills.name, skillName))
          .limit(1);
          
        let skillId;
        if (skillRecord.length === 0) {
          // Create skill if it doesn't exist
          const newSkill = await db()
            .insert(skills)
            .values({ name: skillName })
            .returning();
          skillId = newSkill[0].id;
        } else {
          skillId = skillRecord[0].id;
        }
        
        // Link job to skill
        await db()
          .insert(jobSkills)
          .values({
            jobId: job.id,
            skillId: skillId
          })
          .onConflictDoNothing();
          
        migratedCount++;
      }
    }
  }
  
  return { migratedCount };
}

export async function migrateCandidateSkills() {
  const allCandidates = await db().select().from(candidateProfiles);
  let migratedCount = 0;
  
  for (const candidate of allCandidates) {
    if (candidate.skills && candidate.skills.length > 0) {
      for (const skillName of candidate.skills) {
        // Find or create the skill
        let skillRecord = await db()
          .select()
          .from(skills)
          .where(eq(skills.name, skillName))
          .limit(1);
          
        let skillId;
        if (skillRecord.length === 0) {
          // Create skill if it doesn't exist
          const newSkill = await db()
            .insert(skills)
            .values({ name: skillName })
            .returning();
          skillId = newSkill[0].id;
        } else {
          skillId = skillRecord[0].id;
        }
        
        // Link candidate to skill
        await db()
          .insert(candidateSkills)
          .values({
            candidateId: candidate.id,
            skillId: skillId,
            proficiencyLevel: 'intermediate' // Default value
          })
          .onConflictDoNothing();
          
        migratedCount++;
      }
    }
  }
  
  return { migratedCount };
}
```

### B. Create Migration API Route

```typescript
// app/api/admin/migrate-skills/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { migrateJobSkills, migrateCandidateSkills } from '@/lib/db/migrations/skills-migration';
import { getUser } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verify admin user
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only run in development or by admin
    if (process.env.NODE_ENV !== 'development') {
      // Check if user is admin (implement your admin check)
      // ...
    }
    
    // Run migrations
    const jobsResult = await migrateJobSkills();
    const candidatesResult = await migrateCandidateSkills();
    
    return NextResponse.json({
      success: true,
      jobSkillsMigrated: jobsResult.migratedCount,
      candidateSkillsMigrated: candidatesResult.migratedCount
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
```

## 3. Database Query Updates

### A. Update Jobs Queries

```typescript
// lib/db/queries/jobs.ts

// Create job with skills
export async function createJob(jobData, skillIds: string[]) {
  // Start a transaction
  return await db().transaction(async (tx) => {
    // Create the job
    const newJob = await tx
      .insert(jobs)
      .values(jobData)
      .returning();
      
    const jobId = newJob[0].id;
    
    // Add skills
    if (skillIds && skillIds.length > 0) {
      for (const skillId of skillIds) {
        await tx
          .insert(jobSkills)
          .values({
            jobId,
            skillId
          })
          .onConflictDoNothing();
      }
    }
    
    return newJob[0];
  });
}

// Get job with skills
export async function getJobWithSkills(jobId: string) {
  // Get the job
  const job = await db()
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);
    
  if (!job.length) {
    throw new Error('Job not found');
  }
  
  // Get skills
  const jobSkillsData = await db()
    .select({
      skill: {
        id: skills.id,
        name: skills.name
      }
    })
    .from(jobSkills)
    .innerJoin(skills, eq(jobSkills.skillId, skills.id))
    .where(eq(jobSkills.jobId, jobId));
    
  const skillsList = jobSkillsData.map(item => item.skill);
  
  return {
    ...job[0],
    skills: skillsList
  };
}

// Update job skills
export async function updateJobSkills(jobId: string, skillIds: string[]) {
  return await db().transaction(async (tx) => {
    // Delete existing skills
    await tx
      .delete(jobSkills)
      .where(eq(jobSkills.jobId, jobId));
      
    // Add new skills
    if (skillIds && skillIds.length > 0) {
      for (const skillId of skillIds) {
        await tx
          .insert(jobSkills)
          .values({
            jobId,
            skillId
          })
          .onConflictDoNothing();
      }
    }
    
    return { success: true };
  });
}
```

### B. Update Candidate Queries

```typescript
// lib/db/queries/candidates.ts

// Create candidate with skills
export async function createCandidateProfile(data, skillsData: Array<{skillId: string, proficiency?: string}>) {
  return await db().transaction(async (tx) => {
    // Create the profile
    const newProfile = await tx
      .insert(candidateProfiles)
      .values(data)
      .returning();
      
    const candidateId = newProfile[0].id;
    
    // Add skills
    if (skillsData && skillsData.length > 0) {
      for (const { skillId, proficiency } of skillsData) {
        await tx
          .insert(candidateSkills)
          .values({
            candidateId,
            skillId,
            proficiencyLevel: proficiency || 'intermediate'
          })
          .onConflictDoNothing();
      }
    }
    
    return newProfile[0];
  });
}

// Get candidate with skills
export async function getCandidateWithSkills(candidateId: string) {
  // Get the candidate
  const candidate = await db()
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.id, candidateId))
    .limit(1);
    
  if (!candidate.length) {
    throw new Error('Candidate not found');
  }
  
  // Get skills with proficiency
  const candidateSkillsData = await db()
    .select({
      skill: {
        id: skills.id,
        name: skills.name
      },
      proficiency: candidateSkills.proficiencyLevel
    })
    .from(candidateSkills)
    .innerJoin(skills, eq(candidateSkills.skillId, skills.id))
    .where(eq(candidateSkills.candidateId, candidateId));
    
  const skillsList = candidateSkillsData.map(item => ({
    id: item.skill.id,
    name: item.skill.name,
    proficiency: item.proficiency
  }));
  
  return {
    ...candidate[0],
    skills: skillsList
  };
}

// Update candidate skills
export async function updateCandidateSkills(candidateId: string, skillsData: Array<{skillId: string, proficiency?: string}>) {
  return await db().transaction(async (tx) => {
    // Delete existing skills
    await tx
      .delete(candidateSkills)
      .where(eq(candidateSkills.candidateId, candidateId));
      
    // Add new skills
    if (skillsData && skillsData.length > 0) {
      for (const { skillId, proficiency } of skillsData) {
        await tx
          .insert(candidateSkills)
          .values({
            candidateId,
            skillId,
            proficiencyLevel: proficiency || 'intermediate'
          })
          .onConflictDoNothing();
      }
    }
    
    return { success: true };
  });
}
```

## 4. Frontend Component Updates

### A. Skills Selection Component

```tsx
// components/SkillsSelect.tsx
'use client';

import { useState, useEffect } from 'react';
import { MultiSelect } from '@/components/ui/multi-select';

interface Skill {
  id: string;
  name: string;
}

interface SkillsSelectProps {
  selectedSkills: Skill[];
  onChange: (skills: Skill[]) => void;
  withProficiency?: boolean;
}

export function SkillsSelect({ selectedSkills = [], onChange, withProficiency = false }: SkillsSelectProps) {
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [skillProficiencies, setSkillProficiencies] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Load all skills from the database
    async function loadSkills() {
      try {
        const response = await fetch('/api/skills');
        const data = await response.json();
        setAvailableSkills(data.skills);
      } catch (error) {
        console.error('Failed to load skills:', error);
      }
    }
    
    loadSkills();
  }, []);
  
  // Initialize proficiencies from selectedSkills if available
  useEffect(() => {
    if (withProficiency && selectedSkills.length > 0) {
      const proficiencies: Record<string, string> = {};
      selectedSkills.forEach(skill => {
        if ('proficiency' in skill) {
          proficiencies[skill.id] = skill.proficiency;
        }
      });
      setSkillProficiencies(proficiencies);
    }
  }, [selectedSkills, withProficiency]);
  
  // Handle skill selection changes
  const handleSkillChange = (newSkills: Skill[]) => {
    onChange(newSkills.map(skill => ({
      id: skill.id,
      name: skill.name,
      ...(withProficiency && { proficiency: skillProficiencies[skill.id] || 'intermediate' })
    })));
  };
  
  // Handle proficiency changes
  const handleProficiencyChange = (skillId: string, proficiency: string) => {
    const newProficiencies = {
      ...skillProficiencies,
      [skillId]: proficiency
    };
    setSkillProficiencies(newProficiencies);
    
    // Update selected skills with new proficiency
    const updatedSkills = selectedSkills.map(skill => 
      skill.id === skillId 
        ? { ...skill, proficiency } 
        : skill
    );
    onChange(updatedSkills);
  };
  
  return (
    <div className="space-y-4">
      <MultiSelect
        options={availableSkills.map(skill => ({
          value: skill.id,
          label: skill.name
        }))}
        value={selectedSkills.map(skill => ({
          value: skill.id,
          label: skill.name
        }))}
        onChange={values => handleSkillChange(values.map(v => ({
          id: v.value,
          name: v.label
        })))}
        placeholder="Select skills"
      />
      
      {withProficiency && selectedSkills.length > 0 && (
        <div className="space-y-2 mt-4">
          <h4 className="text-sm font-medium">Skill Proficiency</h4>
          {selectedSkills.map(skill => (
            <div key={skill.id} className="flex items-center gap-2">
              <span className="text-sm flex-1">{skill.name}</span>
              <select 
                value={skillProficiencies[skill.id] || 'intermediate'}
                onChange={e => handleProficiencyChange(skill.id, e.target.value)}
                className="flex-1 p-1 text-sm border rounded"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### B. Skills API Route

```typescript
// app/api/skills/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { skills } from '@/lib/db/schema';

export async function GET() {
  try {
    const allSkills = await db().select().from(skills).orderBy(skills.name);
    
    return NextResponse.json({
      skills: allSkills
    });
  } catch (error) {
    console.error('Failed to fetch skills:', error);
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}
```

## 5. Testing Strategy

### A. Unit Tests

Create unit tests for:
- Migration scripts
- Database query functions
- Junction table relationships

### B. Integration Tests

Create integration tests for:
- Job creation flow with skills
- Candidate profile creation with skills
- Job search by skills
- Candidate search by skills
- Skills migration process

### C. Manual Testing Checklist

- [ ] Create new job with skills selection
- [ ] Edit existing job and update skills
- [ ] Create candidate profile with skills and proficiency levels
- [ ] Edit candidate profile and update skills
- [ ] Test job search with skill filters
- [ ] Test candidate search by skills
- [ ] Test migration of existing jobs' skills
- [ ] Test migration of existing candidates' skills
- [ ] Verify skill badges display on job cards
- [ ] Verify skills with proficiency display on candidate profiles

## 6. Implementation Timeline

### Week 1: Schema Changes & Migration
- Day 1-2: Implement schema changes
- Day 3-4: Develop migration scripts
- Day 5: Test migration on staging data

### Week 2: Backend API Updates
- Day 1-2: Update job-related queries
- Day 3-4: Update candidate-related queries
- Day 5: Integration testing

### Week 3: Frontend Updates
- Day 1-2: Update job creation/editing UI
- Day 3-4: Update candidate profile UI
- Day 5: UI testing

### Week 4: Deployment & Monitoring
- Day 1: Deploy to staging
- Day 2-3: Final testing on staging
- Day 4: Deploy to production
- Day 5: Monitor and fix issues

## 7. Rollout Plan

### A. Pre-Deployment Checklist
- [ ] Database backup
- [ ] Schema changes tested on staging
- [ ] Migration scripts tested on copy of production data
- [ ] Frontend changes tested on staging
- [ ] Integration tests passing

### B. Deployment Steps
1. Deploy schema changes
2. Deploy backend API changes
3. Deploy frontend changes
4. Run migration scripts during low-traffic hours
5. Monitor error rates
6. Update documentation

### C. Rollback Plan
If issues occur:
1. Revert frontend to use array fields
2. Revert backend to use array fields
3. Keep junction tables but don't use them
4. Fix issues and retry deployment

## 8. Long-Term Plan

### Phase 1 (Immediate)
- Implement all changes above
- Keep both array fields and junction tables

### Phase 2 (1-2 months later)
- Add deprecation warnings when array fields are used
- Update all code to use junction tables exclusively

### Phase 3 (3-6 months later)
- Remove array fields from schema
- Clean up legacy code

## Benefits of This Approach

1. **Data Integrity**: Ensures skills are consistently named and referenced
2. **Flexibility**: Allows for additional attributes on skills (like proficiency levels)
3. **Performance**: Enables more efficient queries and joins
4. **Maintainability**: Follows proper relational database design principles
5. **Scalability**: Makes it easier to extend skill-related features in the future

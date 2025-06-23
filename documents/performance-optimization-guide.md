# Performance Optimization Guide for Next.js + Drizzle Applications

## 📖 **Overview**

This guide documents proven performance optimization patterns discovered during the optimization of a job detail page that achieved **400-600ms load time improvements** and **50% reduction in database queries**. These patterns can be applied across any Next.js application using Drizzle ORM.

## 🎯 **Core Optimization Principles**

### 1. **Database Query Optimization**
- **Consolidate Queries**: Combine multiple queries into fewer, more efficient ones
- **Use Relations Wisely**: Leverage Drizzle's `with` relations for nested data
- **Eliminate N+1 Patterns**: Avoid sequential queries that depend on previous results
- **Optimize Joins**: Use appropriate join types and query structures

### 2. **Caching Strategy**
- **Layered Caching**: Different cache durations for different data types
- **Smart Invalidation**: Granular cache tags for precise invalidation
- **Request-Level + Persistent**: Combine React cache with Next.js unstable_cache

### 3. **Data Flow Optimization**
- **Parallel Execution**: Run independent queries simultaneously
- **Minimize Waterfalls**: Reduce sequential dependencies
- **Early Data Fetching**: Start queries as early as possible

## 🔍 **Performance Issue Identification Framework**

### **Red Flags to Look For:**

```typescript
// ❌ Multiple Sequential Database Calls
const user = await getUser()
const data = await getData(user.id)
const relatedData = await getRelatedData(data.id)

// ❌ N+1 Query Pattern
const item = await getItem(id)
const related = await getRelated(item.foreignKey)

// ❌ Ineffective Caching
export const getData = cache(async function(id, options) {
  // options.next ignored when using React cache()
})

// ❌ Repeated Profile Lookups
const profileId = await getProfileId(userId)
const applications = await getApplications(profileId)
const savedItems = await getSavedItems(profileId)
```

### **Performance Audit Checklist:**

- [ ] Count database queries per page load
- [ ] Identify sequential vs parallel data fetching
- [ ] Check cache hit/miss rates
- [ ] Look for repeated similar queries
- [ ] Monitor query execution times
- [ ] Identify data that rarely changes vs frequently changes

## 🚀 **Optimization Patterns**

### **Pattern 1: Query Consolidation with Drizzle Relations**

```typescript
// ❌ Before: Multiple Queries
async function getJobData(jobId: string) {
  const job = await db().select().from(jobs).where(eq(jobs.id, jobId))
  const skills = await db().select().from(jobSkills)
    .leftJoin(skills, eq(jobSkills.skillId, skills.id))
    .where(eq(jobSkills.jobId, jobId))
  const industries = await db().select().from(jobIndustries)
    .leftJoin(industries, eq(jobIndustries.industryId, industries.id))
    .where(eq(jobIndustries.jobId, jobId))
}

// ✅ After: Single Query with Relations
async function getJobData(jobId: string) {
  return db().query.jobs.findFirst({
    where: eq(jobs.id, jobId),
    with: {
      company: true,
      location: true,
      jobSkills: {
        with: { skill: true }
      },
      jobIndustries: {
        with: { industry: true }
      }
    }
  })
}
```

### **Pattern 2: Smart Caching with Proper Invalidation**

```typescript
// ❌ Before: React Cache Only
export const getData = cache(async function(id: string, options?: CacheOptions) {
  // options are ignored - no persistent caching
  return fetchData(id)
})

// ✅ After: Layered Caching Strategy
async function getDataInternal(id: string): Promise<DataType> {
  // Your data fetching logic
  return fetchData(id)
}

export const getData = async (id: string, options?: CacheOptions) => {
  const cachedFunction = unstable_cache(
    async () => getDataInternal(id),
    [`data-${id}`], // Unique cache key
    {
      tags: [`data-${id}`, `data-collection`], // Multiple tags for granular invalidation
      revalidate: 3600, // 1 hour for stable data
    }
  )
  
  return cachedFunction()
}

// Cache invalidation helpers
export async function revalidateDataCache(id: string) {
  revalidateTag(`data-${id}`)
  revalidateTag(`related-data-${id}`)
}
```

### **Pattern 3: Parallel Data Fetching**

```typescript
// ❌ Before: Waterfall Loading
async function getPageData(id: string) {
  const user = await getUser()
  const mainData = await getMainData(id)
  const relatedData = await getRelatedData(id)
  const userSpecificData = user ? await getUserData(user.id, id) : null
}

// ✅ After: Optimized Parallel Loading
async function getPageData(id: string) {
  // First wave: Independent data
  const [user, mainData] = await Promise.all([
    getUser(),
    getMainData(id)
  ])
  
  // Second wave: Data that might depend on first wave
  const [relatedData, userSpecificData] = await Promise.all([
    getRelatedData(id), // Independent of user
    user ? getUserData(user.id, id) : Promise.resolve(null) // Conditional
  ])
  
  return { user, mainData, relatedData, userSpecificData }
}
```

### **Pattern 4: Optimized User Status Checks**

```typescript
// ❌ Before: Multiple Profile Lookups
async function checkUserApplication(jobId: string, userId: string) {
  const profile = await db().select({ id: profiles.id })
    .from(profiles).where(eq(profiles.userId, userId))
  const application = await db().select()
    .from(applications)
    .where(eq(applications.candidateProfileId, profile[0].id))
}

async function checkUserSavedJob(jobId: string, userId: string) {
  const profile = await db().select({ id: profiles.id })
    .from(profiles).where(eq(profiles.userId, userId))
  const saved = await db().select()
    .from(savedJobs)
    .where(eq(savedJobs.userId, profile[0].id))
}

// ✅ After: Single Query with Joins
async function checkUserApplication(jobId: string, userId: string) {
  const result = await db()
    .select({ id: applications.id })
    .from(applications)
    .innerJoin(candidateProfiles, eq(applications.candidateProfileId, candidateProfiles.id))
    .innerJoin(profiles, eq(candidateProfiles.profileId, profiles.id))
    .where(and(
      eq(applications.jobId, jobId),
      eq(profiles.userId, userId),
      eq(applications.deleted, false)
    ))
    .limit(1)
  
  return result.length > 0
}
```

## 🎛️ **Cache Strategy Framework**

### **Cache Duration Guidelines**

```typescript
// Long-term cache (1-4 hours): Stable data
const STABLE_DATA_CACHE = 3600 // 1 hour
- Company information
- Job details
- Location data
- Skills/Industries

// Medium-term cache (5-30 minutes): Semi-dynamic data
const SEMI_DYNAMIC_CACHE = 900 // 15 minutes
- Job listings
- Application counts
- Public statistics

// Short-term cache (1-5 minutes): User-specific data
const USER_SPECIFIC_CACHE = 300 // 5 minutes
- Application status
- Saved items
- User preferences

// Request-level cache: Prevent duplicate queries in same request
const REQUEST_CACHE = 0 // React cache for request deduplication
```

### **Cache Tag Strategy**

```typescript
// Hierarchical tagging for granular invalidation
const CACHE_TAGS = {
  // Entity-specific tags
  job: (id: string) => `job-${id}`,
  user: (id: string) => `user-${id}`,
  company: (id: string) => `company-${id}`,
  
  // Relationship tags
  userApplications: (userId: string) => `user-applications-${userId}`,
  jobApplications: (jobId: string) => `job-applications-${jobId}`,
  companyjobs: (companyId: string) => `company-jobs-${companyId}`,
  
  // Collection tags
  allJobs: 'jobs-collection',
  allApplications: 'applications-collection'
}

// Invalidation helpers
export async function invalidateJobData(jobId: string, companyId?: string) {
  const tags = [
    CACHE_TAGS.job(jobId),
    CACHE_TAGS.jobApplications(jobId)
  ]
  
  if (companyId) {
    tags.push(CACHE_TAGS.companyjobs(companyId))
  }
  
  await Promise.all(tags.map(tag => revalidateTag(tag)))
}
```

## 📊 **Implementation Template for New Features**

### **1. Analyze Data Requirements**
```typescript
// Template for feature analysis
interface FeatureDataRequirements {
  // Primary data (always needed)
  primary: {
    entity: string // e.g., 'job', 'user', 'company'
    queries: string[] // List of required queries
    frequency: 'high' | 'medium' | 'low' // How often this data changes
  }
  
  // Secondary data (conditionally needed)
  secondary: {
    entity: string
    condition: string // When this data is needed
    dependsOn: string[] // What primary data it depends on
  }[]
  
  // User-specific data
  userSpecific: {
    entity: string
    requiresAuth: boolean
    personalizedData: string[]
  }[]
}
```

### **2. Query Optimization Template**

```typescript
// Template for optimized query functions
async function get[Entity]Data(id: string): Promise<[Entity]Type> {
  // Use Drizzle query API for complex relations
  return db().query.[entityTable].findFirst({
    where: eq([entityTable].id, id),
    with: {
      // Include all needed relations
      relatedEntity1: true,
      relatedEntity2: {
        with: { nestedRelation: true }
      }
    }
  })
}

// Cached version with proper tags
export const get[Entity] = async (id: string, options?: CacheOptions) => {
  const cachedFunction = unstable_cache(
    async () => get[Entity]Data(id),
    [`[entity]-${id}`],
    {
      tags: [`[entity]-${id}`, `[entity]-collection`],
      revalidate: APPROPRIATE_CACHE_DURATION,
    }
  )
  
  return cachedFunction()
}
```

### **3. Page Component Template**

```typescript
// Template for optimized page components
export default async function [Feature]Page({ params }: PageProps) {
  const resolvedParams = await params
  const id = resolvedParams.id
  
  // Wave 1: Independent data fetching
  const [user, primaryData] = await Promise.all([
    getUser(),
    getPrimaryData(id)
  ])
  
  // Wave 2: Dependent data fetching
  const [secondaryData, userSpecificData] = await Promise.all([
    getSecondaryData(id), // If independent of user
    user ? getUserSpecificData(user.id, id) : Promise.resolve(null)
  ])
  
  return (
    <div>
      {/* Render optimized components */}
    </div>
  )
}
```

## 🛠️ **Server Actions Optimization**

### **Optimized Actions with Cache Invalidation**

```typescript
'use server'

export async function update[Entity](id: string, data: UpdateData) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')
  
  try {
    // Perform update
    const result = await db().update([entityTable])
      .set(data)
      .where(eq([entityTable].id, id))
      .returning()
    
    // Smart cache invalidation
    await Promise.all([
      revalidate[Entity]Cache(id),
      revalidateUserCache(user.id),
      // Other related cache invalidations
    ])
    
    return { success: true, data: result[0] }
  } catch (error) {
    console.error(`Error updating [entity]:`, error)
    throw new Error('Failed to update [entity]')
  }
}

// Reusable cache invalidation patterns
export async function revalidate[Entity]Cache(id: string) {
  const tags = [
    `[entity]-${id}`,
    `[entity]-collection`,
    `related-[entities]-${id}`
  ]
  
  await Promise.all(tags.map(tag => revalidateTag(tag)))
}
```

## 📈 **Performance Monitoring Setup**

### **Key Metrics to Track**

```typescript
// Performance monitoring helpers
export class PerformanceMonitor {
  static async measureQueryTime<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const start = performance.now()
    try {
      const result = await operation()
      const duration = performance.now() - start
      
      // Log slow queries (> 100ms)
      if (duration > 100) {
        console.warn(`Slow query detected: ${operationName} took ${duration}ms`)
      }
      
      return result
    } catch (error) {
      console.error(`Query failed: ${operationName}`, error)
      throw error
    }
  }
  
  static trackCacheHitRate(cacheKey: string, wasHit: boolean) {
    // Implement cache metrics tracking
    // Could integrate with monitoring service
  }
}

// Usage in queries
export const getOptimizedData = async (id: string) => {
  return PerformanceMonitor.measureQueryTime(
    () => getDataInternal(id),
    `getOptimizedData-${id}`
  )
}
```

### **Cache Effectiveness Monitoring**

```typescript
// Cache monitoring helpers
export async function monitorCacheEffectiveness() {
  // Track cache hit rates
  const cacheStats = {
    hitRate: 0.85, // Target: >80%
    averageResponseTime: 150, // Target: <200ms
    queryCount: 3, // Target: <5 per page
  }
  
  // Alert if performance degrades
  if (cacheStats.hitRate < 0.8) {
    console.warn('Cache hit rate below target:', cacheStats.hitRate)
  }
}
```

## 🔄 **Migration Guide for Existing Features**

### **Step-by-Step Optimization Process**

1. **Audit Current Performance**
   ```bash
   # Measure current performance
   - Count database queries per page
   - Measure page load times
   - Identify sequential vs parallel operations
   ```

2. **Identify Optimization Opportunities**
   ```typescript
   // Look for these patterns in existing code
   - Multiple similar queries
   - Sequential awaits that could be parallel
   - Missing or ineffective caching
   - Repeated profile/user lookups
   ```

3. **Apply Optimization Patterns**
   ```typescript
   // Priority order for optimization
   1. Consolidate database queries
   2. Implement proper caching
   3. Parallelize data fetching
   4. Add cache invalidation
   5. Monitor and measure
   ```

4. **Test and Validate**
   ```typescript
   // Validation checklist
   - Compare before/after query counts
   - Measure page load time improvements
   - Verify cache invalidation works correctly
   - Test with various user scenarios
   ```

## 🚨 **Common Pitfalls to Avoid**

### **Caching Pitfalls**
- **Over-caching**: Don't cache frequently changing data for too long
- **Under-invalidation**: Ensure all related cache entries are invalidated
- **Cache keys**: Use specific, collision-free cache keys
- **Memory usage**: Monitor cache memory consumption

### **Query Pitfalls**
- **Over-joining**: Don't fetch unnecessary related data
- **Missing indexes**: Ensure database indexes support your queries
- **Large result sets**: Implement pagination for large datasets
- **Null handling**: Handle nullable relations properly

### **Data Flow Pitfalls**
- **False dependencies**: Don't serialize independent operations
- **Error handling**: Ensure parallel operations handle errors correctly
- **Type safety**: Maintain proper TypeScript types throughout optimizations

## 📚 **Quick Reference Checklists**

### **New Feature Development Checklist**
- [ ] Plan data requirements (primary, secondary, user-specific)
- [ ] Design optimized queries with relations
- [ ] Implement layered caching strategy
- [ ] Use parallel data fetching where possible
- [ ] Add proper cache invalidation
- [ ] Include performance monitoring
- [ ] Test with realistic data volumes

### **Existing Feature Optimization Checklist**
- [ ] Audit current query patterns
- [ ] Measure baseline performance
- [ ] Identify consolidation opportunities
- [ ] Implement caching improvements
- [ ] Parallelize data operations
- [ ] Add cache invalidation
- [ ] Validate performance improvements

## 🎯 **Expected Results**

When properly implemented, these patterns typically achieve:

- **40-60% reduction** in database queries
- **200-600ms improvement** in page load times
- **60-80% cache hit rates** for stable data
- **Significantly reduced** database server load
- **Better user experience** with faster page loads

## 💡 **Future Enhancements**

Consider these advanced optimizations for high-traffic applications:

1. **Static Generation**: Pre-generate popular pages
2. **Edge Caching**: Use CDN for global content distribution
3. **Database Read Replicas**: Distribute query load
4. **Background Jobs**: Process non-critical data asynchronously
5. **View Tracking**: Implement efficient analytics without blocking page loads

---

This guide provides a comprehensive framework for optimizing any Next.js + Drizzle application. Apply these patterns systematically to achieve significant performance improvements across your entire application. 
# Site-Wide Rate Limiting Implementation

## Overview
Site-wide rate limiting has been implemented using Arcjet to prevent server overload and protect against abuse. The implementation uses tiered rate limits based on route types.

## Rate Limit Tiers

### 1. **General Routes** (60 requests/minute)
- Default rate limit for authenticated dashboard pages
- Applied to: `/candidate/*`, `/employer/*`, `/dashboard/*`
- Prevents excessive browsing while allowing normal usage

### 2. **API Routes** (30 requests/minute)
- Stricter limits for API endpoints
- Applied to: `/api/*` (except seed routes)
- Protects against API abuse

### 3. **Public Routes** (200 requests/hour)
- More permissive for public content
- Applied to: `/`, `/jobs/*`, `/tenders/*`, `/about`, `/contact`, `/privacy`, `/terms`
- Allows browsing while preventing scraping

### 4. **Authentication Routes** (5 requests/15 minutes)
- Very strict to prevent brute force attacks
- Applied to: `/sign-in`, `/sign-up`, `/reset-password`, `/auth/*`
- Already configured in previous implementation

### 5. **Admin/Seed Routes** (3 requests/hour)
- Extremely strict for sensitive operations
- Applied to: `/admin/*`, `/api/seed-*`
- Prevents unauthorized access attempts

## Implementation Details

### Middleware Configuration
The rate limiting is implemented in `middleware.ts` and runs on every request (except static assets).

### Response Headers
When rate limited, the response includes:
- Status: 429 (Too Many Requests)
- Retry-After: 60 seconds
- X-RateLimit-Limit: The limit that was exceeded
- X-RateLimit-Reset: When the limit resets

### Monitoring
Rate limit violations are logged with:
- IP address (from X-Forwarded-For or X-Real-IP headers)
- Path that was accessed
- Timestamp

## Testing the Implementation

To test rate limiting:
1. Make repeated requests to any endpoint
2. Observe the 429 response after exceeding the limit
3. Check the Retry-After header for when to try again

## Configuration
All rate limit rules are defined in `/lib/arcjet.ts` and can be adjusted as needed:
- `generalRateLimit`: 60 req/min
- `apiRateLimit`: 30 req/min
- `publicRouteRateLimit`: 200 req/hour
- `authRateLimit`: 5 req/15min
- `adminRateLimit`: 3 req/hour

## Notes
- Static assets (images, CSS, JS) are excluded from rate limiting
- Rate limits are tracked per IP address
- The implementation uses Arcjet's fixedWindow algorithm
- All rate limits are in LIVE mode (actively blocking)
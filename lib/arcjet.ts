import arcjet, {
  detectBot,
  fixedWindow,
  validateEmail,
  shield,
} from "@arcjet/next";

if (!process.env.ARCJET_KEY) {
  throw new Error("ARCJET_KEY environment variable is not set");
}

// Base Arcjet client
export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"], // Track by IP address
  rules: [], // Base rules will be empty, specific rules added per endpoint
});

// Rule 1: Rate limiting for authentication endpoints
export const authRateLimit = fixedWindow({
  mode: "LIVE",
  window: "15m",
  max: 5, // 5 attempts per 15 minutes
});

// Rule 2: Bot protection for public forms
export const botProtection = detectBot({
  mode: "LIVE",
  allow: [], // Block all detected bots
});

// Rule 3: Email validation
export const emailValidation = validateEmail({
  mode: "LIVE",
  block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
});

// Rule 4: Enhanced protection for payment endpoints
export const paymentProtection = shield({
  mode: "LIVE",
});

// Create a combined rule for signup that includes email validation and rate limiting
export const signupRules = [
  emailValidation,
  fixedWindow({
    mode: "LIVE",
    window: "15m",
    max: 3, // Stricter for signups
  }),
  detectBot({
    mode: "LIVE",
    allow: [],
  }),
];

// Helper function to create Arcjet instance with specific rules
export function createArcjet(rules: any[]) {
  return arcjet({
    key: process.env.ARCJET_KEY!,
    characteristics: ["ip.src"],
    rules,
  });
}

// Rule 5: Rate limiting for admin/seed routes (stricter)
export const adminRateLimit = fixedWindow({
  mode: "LIVE",
  window: "1h",
  max: 3, // Very strict: only 3 requests per hour for seed operations
});

// Site-wide rate limiting configurations
export const generalRateLimit = fixedWindow({
  mode: "LIVE",
  window: "1m",
  max: 60, // 60 requests per minute for general browsing
});

export const apiRateLimit = fixedWindow({
  mode: "LIVE",
  window: "1m",
  max: 30, // 30 requests per minute for API routes
});

export const publicRouteRateLimit = fixedWindow({
  mode: "LIVE",
  window: "1h",
  max: 200, // 200 requests per hour per IP for public pages
});

// Pre-configured Arcjet instances for common use cases
export const authArcjet = createArcjet([authRateLimit]);
export const formArcjet = createArcjet([botProtection, fixedWindow({ mode: "LIVE", window: "1h", max: 10 })]);
export const signupArcjet = createArcjet(signupRules);
export const paymentArcjet = createArcjet([paymentProtection, authRateLimit]);
export const adminArcjet = createArcjet([adminRateLimit, shield({ mode: "LIVE" })]);

// Site-wide rate limiter for middleware
export const siteWideArcjet = createArcjet([generalRateLimit]);
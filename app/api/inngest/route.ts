import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { jobDescriptionFunction, helloWorld } from "@/inngest/functions";

// Create an API route handler for the /api/inngest endpoint
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [jobDescriptionFunction, helloWorld],
});
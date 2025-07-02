import { Inngest } from "inngest";

// Define the event payload type
type JobDescriptionGenerateEvent = {
  data: {
    title: string;
    location: string;
    experienceLevel: string;
    workLocation: string;
    jobType: string;
    industries: string[];
    skills: string[];
    numberOfOpenings: number;
    companyName: string;
    companyIndustry: string;
    jobLanguage: string;
    benefits: string[];
    supplementalPay: string[];
    educationRequirements: string;
    experienceRequirements: string;
    requestId: string;
  };
};

// Create the Inngest client instance
export const inngest = new Inngest({
  id: "ligaye-job-board",
});
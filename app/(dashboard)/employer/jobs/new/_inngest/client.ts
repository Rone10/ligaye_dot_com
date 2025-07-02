import { Inngest } from "inngest";

// Define the event payload type
type JobDescriptionGenerateEvent = {
  data: {
    title: string;
    locationId: string;
    experienceLevel: string;
    workLocation: string;
    jobType: string;
    industryIds: string[];
    skillIds: string[];
    numberOfOpenings: number;
    companyName: string;
    companyIndustry: string;
    requestId: string;
  };
};

// Create the Inngest client instance
export const inngest = new Inngest({
  id: "ligaye-job-board",
});
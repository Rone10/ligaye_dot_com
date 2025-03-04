import { JobDetailsForm } from "./components/JobDetailsForm";
import { StepIndicator } from "../components/StepIndicator";

export const metadata = {
  title: 'Job Details - Post a Job',
  description: 'Add detailed information about your job posting',
};

export default function JobDetailsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add job details</h1>
      <StepIndicator />
      <JobDetailsForm />
    </div>
  );
} 
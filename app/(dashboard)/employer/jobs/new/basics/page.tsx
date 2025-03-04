import { JobBasicsForm } from "./components/JobBasicsForm";
import { StepIndicator } from "../components/StepIndicator";

export const metadata = {
  title: 'Job Basics - Post a Job',
  description: 'Add basic information about your job posting',
};

export default function JobBasicsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add job basics</h1>
      <StepIndicator />
      <JobBasicsForm />
    </div>
  );
} 
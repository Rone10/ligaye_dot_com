import { StepIndicator } from "../components/StepIndicator";
import { DescriptionForm } from "./components/DescriptionForm";

export const metadata = {
  title: 'Job Description - Post a Job',
  description: 'Add detailed job description, experience and education requirements',
};

export default function DescriptionPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Job Description</h1>
        <p className="text-gray-500 mt-2">
          Describe the job responsibilities, qualifications, and skill requirements
        </p>
      </header>

      <StepIndicator />
      <DescriptionForm />
    </>
  );
} 
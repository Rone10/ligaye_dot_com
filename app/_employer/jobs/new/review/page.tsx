import { StepIndicator } from "../components/StepIndicator";
import { ReviewForm } from "./components/ReviewForm";

export const metadata = {
  title: 'Review & Preferences - Post a Job',
  description: 'Review job details and set application preferences',
};

export default function ReviewPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Review & Application Preferences</h1>
        <p className="text-gray-500 mt-2">
          Review all job details and set your application preferences
        </p>
      </header>

      <StepIndicator />
      <ReviewForm />
    </>
  );
} 
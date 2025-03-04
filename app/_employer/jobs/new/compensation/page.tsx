import { CompensationForm } from "./components/CompensationForm";
import { StepIndicator } from "../components/StepIndicator";

export const metadata = {
  title: 'Compensation - Post a Job',
  description: 'Add salary and benefits information for your job posting',
};

export default function CompensationPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add pay and benefits</h1>
      <StepIndicator />
      <CompensationForm />
    </div>
  );
} 
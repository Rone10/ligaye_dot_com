import { JobFormProvider } from "./components/JobFormProvider";

export const metadata = {
  title: 'Post a Job',
  description: 'Create a new job posting',
};

export default function JobCreationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <JobFormProvider>
        <div className="bg-white rounded-lg shadow-md p-6">
          {children}
        </div>
      </JobFormProvider>
    </div>
  );
} 
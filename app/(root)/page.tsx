import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { HeroWithMockup } from "@/components/blocks/hero-with-mockup";

export default function LandingPage() {
  const features = [
    "Find your dream job",
    "Connect with top employers",
    "Track your applications",
    "Get personalized recommendations",
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroWithMockup
          title="Find Your Next Career Opportunity"
          description="Connect with thousands of employers and discover opportunities that match your skills and aspirations."
          primaryCta={{
            text: "Browse Jobs",
            href: "/jobs",
            icon: <ArrowRight className="ml-2 h-4 w-4" />,
          }}
          secondaryCta={{
            text: "Post a Job",
            href: "/dashboard",
          }}
          mockupImage={{
            src: "/dashboard-preview.jpg",
            alt: "Job Platform Dashboard Preview",
            width: 1280,
            height: 720,
          }}
          className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        />

        {/* Features Section */}
        <section className="py-16 bg-muted/50 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
              <p className="text-muted-foreground">
                We provide the tools and resources you need to succeed in your job search
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-card p-6 rounded-lg shadow-sm border flex items-start gap-4"
                >
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                  <p className="font-medium">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Take the Next Step in Your Career?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of professionals who have found their dream jobs through our platform.
            </p>
            <Link href="/jobs">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
} 
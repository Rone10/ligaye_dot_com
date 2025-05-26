import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Target, Users, Gem } from 'lucide-react';

export const dynamic = 'force-static';

export default function AboutUsPage() {
  // Glassmorphic styles using Tailwind arbitrary values / utility classes
  // Ensure backdrop-filter is enabled in your tailwind.config.js if using utility class
  const glassmorphicCardClass =
    'bg-white/70 dark:bg-black/60 backdrop-blur-lg border border-white/30 dark:border-black/40 rounded-2xl shadow-lg'; // Adjusted for better visibility & consistency

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--bg-gradient-from))] to-[hsl(var(--bg-gradient-to))] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary-blue mb-4">
            About Ligaye.com
          </h1>
          <p className="text-lg text-theme-gray-dark max-w-2xl mx-auto">
            Connecting talent with opportunity across The Gambia. We are dedicated to building a thriving job market for everyone.
          </p>
        </section>

        {/* Core Values/Mission Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Mission Card */}
          <Card className={glassmorphicCardClass}>
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <div className="bg-primary-blue/10 p-3 rounded-full">
                <Target className="h-6 w-6 text-primary-blue" />
              </div>
              <CardTitle className="text-2xl font-semibold text-theme-dark">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-theme-gray-dark">
                To empower Gambian job seekers and employers by providing an accessible, reliable, and efficient platform that bridges the gap between talent and opportunity, fostering economic growth and individual prosperity.
              </p>
            </CardContent>
          </Card>

          {/* Vision Card */}
          <Card className={glassmorphicCardClass}>
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
               <div className="bg-secondary-green/10 p-3 rounded-full">
                <BrainCircuit className="h-6 w-6 text-secondary-green" />
              </div>
              <CardTitle className="text-2xl font-semibold text-theme-dark">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-theme-gray-dark">
                To be the leading catalyst for career development and workforce enhancement in The Gambia, creating a future where every individual has the chance to achieve their professional potential.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-theme-dark mb-10">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Community Focus', description: 'Prioritizing the needs and success of the Gambian workforce and businesses.' },
              { icon: Gem, title: 'Integrity', description: 'Operating with transparency, honesty, and ethical practices in all interactions.' },
              { icon: Target, title: 'Impact', description: 'Striving to make a tangible, positive difference in people&apos;s lives and the national economy.' },
            ].map((value) => (
              <Card key={value.title} className={glassmorphicCardClass + " text-center p-6"}>
                 <div className="mb-4 inline-flex items-center justify-center p-3 bg-muted rounded-full">
                    <value.icon className="h-6 w-6 text-primary-blue" />
                 </div>
                <h3 className="text-xl font-semibold text-theme-dark mb-2">{value.title}</h3>
                <p className="text-theme-gray-dark text-sm">{value.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section (Placeholder) */}
        {/* <section className={`p-8 md:p-12 rounded-2xl ${glassmorphicCardClass}`}>
          <h2 className="text-3xl font-bold text-center text-dark dark:text-light mb-8">Meet the Team (Placeholder)</h2>
          <p className="text-center text-gray-700 dark:text-gray-300 max-w-xl mx-auto">
            We are a passionate team dedicated to realizing the vision of Ligaye.com. More details about our team members will be shared soon!
          </p> */}
          {/* Placeholder for team member cards/profiles */}
        {/* </section> */}
      </div>
    </div>
  );
} 
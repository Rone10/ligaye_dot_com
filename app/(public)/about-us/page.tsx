import React from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Target, Users, Gem } from 'lucide-react';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'About Us - Ligaye.com',
    description: 'Learn about Ligaye.com, Gambia\'s premier job board connecting talent with opportunity. Our mission is to build a thriving job market for everyone in The Gambia.',
    path: '/about-us',
    keywords: [
      'about Ligaye',
      'Gambian job board',
      'employment platform Gambia',
      'job market Gambia',
      'careers in Gambia',
      'hiring in Gambia',
      'Ligaye mission',
      'job portal Gambia'
    ],
  });
}

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Ligaye</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Connecting talent with opportunity across The Gambia. We are dedicated to building a thriving job market for everyone.
          </p>
        </div>

        {/* Core Values/Mission Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Mission Card */}
          <Card className="bg-card border border-border rounded-xl">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-semibold">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To empower Gambian job seekers and employers by providing an accessible, reliable, and efficient platform that bridges the gap between talent and opportunity, fostering economic growth and individual prosperity.
              </p>
            </CardContent>
          </Card>

          {/* Vision Card */}
          <Card className="bg-card border border-border rounded-xl">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <BrainCircuit className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-semibold">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To be the leading catalyst for career development and workforce enhancement in The Gambia, creating a future where every individual has the chance to achieve their professional potential.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 tracking-tight">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'Community Focus', description: 'Prioritizing the needs and success of the Gambian workforce and businesses.' },
              { icon: Gem, title: 'Integrity', description: 'Operating with transparency, honesty, and ethical practices in all interactions.' },
              { icon: Target, title: 'Impact', description: 'Striving to make a tangible, positive difference in people&apos;s lives and the national economy.' },
            ].map((value) => (
              <Card key={value.title} className="bg-card border border-border rounded-xl text-center p-6">
                <div className="mb-4 inline-flex items-center justify-center p-3 bg-primary/10 rounded-full">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
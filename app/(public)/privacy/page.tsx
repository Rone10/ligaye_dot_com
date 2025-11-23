import { Metadata } from 'next';
import { Shield, Eye, Lock, Users, Database, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Privacy Policy',
    description: 'Learn how Ligaye.com protects your privacy and handles your personal information. Our comprehensive privacy policy explains data collection, usage, and your rights as a user of Gambia\'s premier job board.',
    path: '/privacy',
    keywords: [
      'privacy policy Ligaye',
      'data protection Gambia',
      'personal information security',
      'job board privacy',
      'user data rights',
      'Ligaye data policy',
      'information security Gambia'
    ],
  });
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-4 md:pt-12 pb-6">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">


            <h1 className="text-3xl md:text-4xl font-bold mb-1 tracking-tight">
              Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Policy</span>
            </h1>

            <p className="text-base md:text-lg text-foreground max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>

            <div className="text-sm text-foreground mt-4">
              <p>Last updated: November 2025</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="bg-card border border-border rounded-xl p-8 md:p-12">

            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                <Eye className="h-7 w-7 text-primary" />
                Introduction
              </h2>
              <div className="prose prose-lg max-w-none text-foreground space-y-4">
                <p>
                  Welcome to Ligaye. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our job board platform and related services.
                </p>
                <p>
                  By using Ligaye, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
                </p>
              </div>
            </div>

            {/* Information We Collect */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                <Database className="h-7 w-7 text-primary" />
                Information We Collect
              </h2>

              <div className="space-y-8">
                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
                  <div className="text-foreground space-y-2">
                    <p><strong>For Job Seekers:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Full name, email address, and phone number</li>
                      <li>Professional experience and employment history</li>
                      <li>Educational background and qualifications</li>
                      <li>Skills, certifications, and portfolio information</li>
                      <li>Resume/CV documents and cover letters</li>
                      <li>Location and preferred work arrangements</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <h3 className="text-xl font-semibold mb-4">Employer Information</h3>
                  <div className="text-foreground space-y-2">
                    <p><strong>For Employers:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Company name, address, and contact information</li>
                      <li>Business registration details and industry classification</li>
                      <li>Authorized representative information</li>
                      <li>Job posting details and requirements</li>
                      <li>Payment information for job posting fees</li>
                      <li>Company profile and branding materials</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <h3 className="text-xl font-semibold mb-4">Technical Information</h3>
                  <div className="text-foreground">
                    <ul className="list-disc list-inside space-y-1">
                      <li>IP address, browser type, and device information</li>
                      <li>Usage patterns, page views, and navigation data</li>
                      <li>Cookies and similar tracking technologies</li>
                      <li>Search queries and filter preferences</li>
                      <li>Application and interaction timestamps</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                <Users className="h-7 w-7 text-primary" />
                How We Use Your Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold mb-3">Service Provision</h3>
                  <ul className="text-foreground space-y-2 text-sm">
                    <li>Facilitate job matching between candidates and employers</li>
                    <li>Process job applications and communications</li>
                    <li>Maintain and improve platform functionality</li>
                    <li>Provide customer support and assistance</li>
                  </ul>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold mb-3">Communication</h3>
                  <ul className="text-foreground space-y-2 text-sm">
                    <li>Send job alerts and notifications</li>
                    <li>Provide platform updates and announcements</li>
                    <li>Respond to inquiries and support requests</li>
                    <li>Send marketing communications (with consent)</li>
                  </ul>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold mb-3">Platform Improvement</h3>
                  <ul className="text-foreground space-y-2 text-sm">
                    <li>Analyze usage patterns and user behavior</li>
                    <li>Develop new features and services</li>
                    <li>Enhance search and matching algorithms</li>
                    <li>Conduct research and analytics</li>
                  </ul>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold mb-3">Legal Compliance</h3>
                  <ul className="text-foreground space-y-2 text-sm">
                    <li>Comply with applicable laws and regulations</li>
                    <li>Prevent fraud and ensure platform security</li>
                    <li>Resolve disputes and enforce agreements</li>
                    <li>Respond to legal requests and investigations</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Information Sharing */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Lock className="h-7 w-7 text-primary" />
                Information Sharing and Disclosure
              </h2>

              <div className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <h3 className="text-xl font-semibold mb-4">With Employers</h3>
                  <p className="text-foreground">
                    When you apply for a job, we share your profile information, resume, and application details with the relevant employer. This includes your contact information, work experience, education, and any additional information you choose to include in your application.
                  </p>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <h3 className="text-xl font-semibold mb-4">With Job Seekers</h3>
                  <p className="text-foreground">
                    Employers can view job seeker profiles that match their job requirements. We may also show aggregated, anonymized data about candidate pools to help employers understand market trends.
                  </p>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <h3 className="text-xl font-semibold mb-4">Service Providers</h3>
                  <p className="text-foreground">
                    We work with trusted third-party service providers for payment processing (Stripe), email communications, analytics, and hosting services. These providers are bound by confidentiality agreements and can only use your information to provide services to us.
                  </p>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <h3 className="text-xl font-semibold mb-4">Legal Requirements</h3>
                  <p className="text-foreground">
                    We may disclose your information when required by law, court order, or government request, or when we believe disclosure is necessary to protect our rights, your safety, or the safety of others.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Security */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Shield className="h-7 w-7 text-primary" />
                Data Security
              </h2>

              <div className="bg-muted/50 p-6 rounded-lg border border-border">
                <div className="text-foreground space-y-4">
                  <p>
                    We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Regular security assessments and updates</li>
                    <li>Access controls and authentication mechanisms</li>
                    <li>Secure hosting infrastructure with Supabase</li>
                    <li>Regular backups and disaster recovery procedures</li>
                    <li>Employee training on data protection practices</li>
                  </ul>
                  <p>
                    However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                  </p>
                </div>
              </div>
            </div>

            {/* Your Rights */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Users className="h-7 w-7 text-primary" />
                Your Rights and Choices
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold mb-3">Access and Update</h3>
                  <p className="text-foreground text-sm">
                    You can access and update your personal information through your account settings. You have the right to request a copy of the personal information we hold about you.
                  </p>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold mb-3">Data Portability</h3>
                  <p className="text-foreground text-sm">
                    You can request to receive your personal information in a structured, commonly used format, or request that we transfer it to another service provider.
                  </p>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold mb-3">Deletion</h3>
                  <p className="text-foreground text-sm">
                    You can delete your account at any time. We will remove your personal information, though some information may be retained for legal or legitimate business purposes.
                  </p>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold mb-3">Marketing Preferences</h3>
                  <p className="text-foreground text-sm">
                    You can opt out of marketing communications at any time by using the unsubscribe link in emails or updating your preferences in your account settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Cookies and Tracking */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Eye className="h-7 w-7 text-primary" />
                Cookies and Tracking Technologies
              </h2>

              <div className="bg-muted/50 p-6 rounded-lg border border-border">
                <div className="text-foreground space-y-4">
                  <p>
                    We use cookies and similar tracking technologies to enhance your experience on our platform. These technologies help us:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Remember your preferences and settings</li>
                    <li>Analyze site traffic and usage patterns</li>
                    <li>Provide personalized content and recommendations</li>
                    <li>Ensure platform security and prevent fraud</li>
                    <li>Deliver relevant advertisements (with consent)</li>
                  </ul>
                  <p>
                    You can control cookie settings through your browser preferences. However, disabling certain cookies may affect the functionality of our platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Retention */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Database className="h-7 w-7 text-primary" />
                Data Retention
              </h2>

              <div className="bg-muted/50 p-6 rounded-lg border border-border">
                <div className="text-foreground space-y-4">
                  <p>
                    We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. Specific retention periods include:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Active accounts:</strong> Information is retained while your account is active</li>
                    <li><strong>Inactive accounts:</strong> Data may be retained for up to 3 years after last activity</li>
                    <li><strong>Job applications:</strong> Application data is retained for 2 years for compliance purposes</li>
                    <li><strong>Payment records:</strong> Financial information is retained for 7 years as required by law</li>
                    <li><strong>Marketing data:</strong> Removed immediately upon opt-out request</li>
                  </ul>
                  <p>
                    After these periods, we will securely delete or anonymize your information unless longer retention is required by law.
                  </p>
                </div>
              </div>
            </div>

            {/* Children's Privacy */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Shield className="h-7 w-7 text-primary" />
                Children&apos;s Privacy
              </h2>

              <div className="bg-muted/50 p-6 rounded-lg border border-border">
                <div className="text-foreground space-y-4">
                  <p>
                    Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information promptly.
                  </p>
                  <p>
                    If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* International Transfers */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <MapPin className="h-7 w-7 text-primary" />
                International Data Transfers
              </h2>

              <div className="bg-muted/50 p-6 rounded-lg border border-border">
                <div className="text-foreground space-y-4">
                  <p>
                    While Ligaye.com primarily serves the Gambian market, our hosting and service providers may be located in other countries. When we transfer your personal information internationally, we ensure appropriate safeguards are in place to protect your data in accordance with applicable data protection laws.
                  </p>
                  <p>
                    These safeguards may include standard contractual clauses, adequacy decisions, or other legally recognized transfer mechanisms.
                  </p>
                </div>
              </div>
            </div>

            {/* Changes to Privacy Policy */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Eye className="h-7 w-7 text-primary" />
                Changes to This Privacy Policy
              </h2>

              <div className="bg-muted/50 p-6 rounded-lg border border-border">
                <div className="text-foreground space-y-4">
                  <p>
                    We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Post the updated policy on our website</li>
                    <li>Update the &quot;Last updated&quot; date at the top of this policy</li>
                    <li>Notify you via email or platform notification for significant changes</li>
                    <li>Provide a summary of key changes when appropriate</li>
                  </ul>
                  <p>
                    Your continued use of our services after any changes indicates your acceptance of the updated Privacy Policy.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Mail className="h-7 w-7 text-primary" />
                Contact Us
              </h2>

              <div className="bg-muted/50 p-6 rounded-lg border border-border">
                <Link href="/contact-us">
                  <Button>Get in touch</Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
} 
import { Metadata } from 'next';
import { FileText, Users, Briefcase, Shield, DollarSign, AlertTriangle, Scale, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { generateSEOMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
    return generateSEOMetadata({
        title: 'Terms of Use',
        description: 'Read the terms and conditions for using Ligaye, Gambia\'s premier job board platform. Understand your rights and responsibilities as a user.',
        path: '/terms',
        keywords: [
            'terms of use Ligaye',
            'terms and conditions Gambia',
            'job board terms',
            'user agreement',
            'Ligaye legal terms',
            'platform rules Gambia',
            'service agreement'
        ],
    });
}

export default function TermsOfUsePage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="pt-4 md:pt-12 pb-6">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold mb-1 tracking-tight">
                            Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Use</span>
                        </h1>

                        <p className="text-base md:text-lg text-foreground max-w-2xl mx-auto">
                            Please read these terms carefully before using Ligaye&apos;s services.
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

                        {/* Acceptance of Terms */}
                        <div className="mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                                <FileText className="h-7 w-7 text-primary" />
                                Acceptance of Terms
                            </h2>
                            <div className="prose prose-lg max-w-none text-foreground space-y-4">
                                <p>
                                    Welcome to Ligaye. By accessing or using our platform, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.
                                </p>
                                <p>
                                    These Terms of Use constitute a legally binding agreement between you and Ligaye regarding your use of our job board platform and related services. Please read them carefully.
                                </p>
                            </div>
                        </div>

                        {/* About Our Service */}
                        <div className="mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                                <Users className="h-7 w-7 text-primary" />
                                About Our Service
                            </h2>

                            <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                <div className="text-foreground space-y-4">
                                    <p>
                                        Ligaye is a comprehensive job board platform designed specifically for the Gambian market. We connect job seekers with employers across all industries and experience levels. Our platform provides:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Job posting and search capabilities</li>
                                        <li>Candidate profile creation and management</li>
                                        <li>Employer company profiles and recruitment tools</li>
                                        <li>Application tracking and communication features</li>
                                        <li>Premium services for enhanced visibility and features</li>
                                        <li>Tender and procurement opportunity listings</li>
                                    </ul>
                                    <p>
                                        Ligaye serves as an intermediary platform and is not directly involved in employment relationships between job seekers and employers.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Eligibility */}
                        <div className="mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                                <Shield className="h-7 w-7 text-primary" />
                                Eligibility
                            </h2>

                            <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                <div className="text-foreground space-y-4">
                                    <p>To use Ligaye, you must:</p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Be at least 18 years of age</li>
                                        <li>Have the legal capacity to enter into binding contracts</li>
                                        <li>Provide accurate and complete registration information</li>
                                        <li>Maintain the security of your account credentials</li>
                                        <li>Comply with all applicable local, national, and international laws</li>
                                    </ul>
                                    <p>
                                        Employers must additionally provide valid business registration details and have the authority to represent the company on our platform.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* User Accounts */}
                        <div className="mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                                <Users className="h-7 w-7 text-primary" />
                                User Accounts and Responsibilities
                            </h2>

                            <div className="space-y-6">
                                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                    <h3 className="text-xl font-semibold mb-4">Account Registration</h3>
                                    <div className="text-foreground space-y-2">
                                        <p>When creating an account, you agree to:</p>
                                        <ul className="list-disc list-inside ml-4 space-y-1">
                                            <li>Provide truthful, accurate, and complete information</li>
                                            <li>Maintain and update your information to keep it current</li>
                                            <li>Keep your password secure and confidential</li>
                                            <li>Notify us immediately of any unauthorized access</li>
                                            <li>Accept responsibility for all activities under your account</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                    <h3 className="text-xl font-semibold mb-4">Account Types</h3>
                                    <div className="text-foreground space-y-3">
                                        <p><strong>Job Seeker Accounts:</strong> Designed for individuals seeking employment opportunities in The Gambia.</p>
                                        <p><strong>Employer Accounts:</strong> For companies and organizations looking to recruit talent and post job opportunities.</p>
                                        <p>You may only maintain one active account per email address. Creating multiple accounts to circumvent platform limitations is prohibited.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Job Seeker Terms */}
                        <div className="mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                                <Users className="h-7 w-7 text-primary" />
                                Job Seeker Terms
                            </h2>

                            <div className="space-y-6">
                                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                    <h3 className="text-xl font-semibold mb-4">Profile and Applications</h3>
                                    <div className="text-foreground space-y-2">
                                        <p>As a job seeker, you agree to:</p>
                                        <ul className="list-disc list-inside ml-4 space-y-1">
                                            <li>Provide accurate information about your qualifications and experience</li>
                                            <li>Only apply for jobs you are genuinely interested in and qualified for</li>
                                            <li>Respond professionally to employer communications</li>
                                            <li>Not misrepresent your skills, experience, or credentials</li>
                                            <li>Own all content you upload (resumes, cover letters, portfolios)</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                    <h3 className="text-xl font-semibold mb-4">Profile Visibility</h3>
                                    <div className="text-foreground">
                                        <p>
                                            Your profile information may be visible to employers using our platform. You can control your privacy settings through your account dashboard. We are not responsible for how employers use information you share through our platform.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Employer Terms */}
                        <div className="mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                                <Briefcase className="h-7 w-7 text-primary" />
                                Employer Terms
                            </h2>

                            <div className="space-y-6">
                                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                    <h3 className="text-xl font-semibold mb-4">Job Postings</h3>
                                    <div className="text-foreground space-y-2">
                                        <p>Employers agree to:</p>
                                        <ul className="list-disc list-inside ml-4 space-y-1">
                                            <li>Post only legitimate job openings for actual positions</li>
                                            <li>Provide accurate job descriptions, requirements, and compensation details</li>
                                            <li>Comply with all applicable employment and anti-discrimination laws</li>
                                            <li>Not post jobs that require illegal activities or are fraudulent in nature</li>
                                            <li>Respect candidate privacy and handle applicant data responsibly</li>
                                            <li>Not use the platform to collect resumes without genuine hiring intent</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                    <h3 className="text-xl font-semibold mb-4">Candidate Interactions</h3>
                                    <div className="text-foreground">
                                        <p>
                                            Employers must treat all candidates with respect and professionalism. You may not share, sell, or distribute candidate information obtained through Ligaye to third parties without explicit consent. All recruitment activities must comply with Gambian labor laws and regulations.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                    <h3 className="text-xl font-semibold mb-4">Job Posting Approval</h3>
                                    <div className="text-foreground">
                                        <p>
                                            Ligaye reserves the right to review, approve, reject, or remove job postings that violate these terms or are deemed inappropriate, fraudulent, or not in the best interest of our community.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Terms */}
                        <div className="mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                                <DollarSign className="h-7 w-7 text-primary" />
                                Payment Terms
                            </h2>

                            <div className="space-y-6">
                                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                    <h3 className="text-xl font-semibold mb-4">Premium Services</h3>
                                    <div className="text-foreground space-y-2">
                                        <p>Certain features and services on Ligaye require payment, including:</p>
                                        <ul className="list-disc list-inside ml-4 space-y-1">
                                            <li>Premium job posting packages with enhanced visibility</li>
                                            <li>Featured company profiles</li>
                                            <li>Advanced candidate search and filtering tools</li>
                                            <li>Additional job posting slots beyond free tier limits</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                    <h3 className="text-xl font-semibold mb-4">Pricing and Billing</h3>
                                    <div className="text-foreground space-y-3">
                                        <p>
                                            All prices are listed on our pricing page and are subject to change with notice. Payments are processed through secure third-party payment processors. You agree to provide accurate payment information and authorize us to charge your payment method.
                                        </p>
                                        <p>
                                            Fees are non-refundable except as required by law or as specified in our refund policy. Subscriptions will auto-renew unless cancelled before the renewal date.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Intellectual Property */}
                        <div className="mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                                <FileText className="h-7 w-7 text-primary" />
                                Intellectual Property
                            </h2>

                            <div className="space-y-6">
                                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                    <h3 className="text-xl font-semibold mb-4">Platform Ownership</h3>
                                    <div className="text-foreground">
                                        <p>
                                            The Ligaye platform, including its design, features, code, text, graphics, logos, and all related intellectual property, is owned by Ligaye and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                    <h3 className="text-xl font-semibold mb-4">User Content</h3>
                                    <div className="text-foreground space-y-3">
                                        <p>
                                            You retain ownership of content you submit to Ligaye (profiles, resumes, job postings, etc.). By submitting content, you grant Ligaye a worldwide, non-exclusive, royalty-free license to use, display, reproduce, and distribute your content as necessary to provide our services.
                                        </p>
                                        <p>
                                            You represent and warrant that you own or have the necessary rights to all content you submit and that such content does not violate any third-party rights or applicable laws.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Prohibited Activities */}
                        <div className="mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                                <AlertTriangle className="h-7 w-7 text-primary" />
                                Prohibited Activities
                            </h2>

                            <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                <div className="text-foreground space-y-4">
                                    <p>You may not use Ligaye to:</p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Post false, misleading, or fraudulent information</li>
                                        <li>Impersonate any person or entity</li>
                                        <li>Harassment, discrimination, or abusive behavior toward other users</li>
                                        <li>Scrape, crawl, or harvest data from the platform without permission</li>
                                        <li>Transmit spam, unsolicited marketing, or malicious code</li>
                                        <li>Circumvent security features or platform limitations</li>
                                        <li>Use automated systems or bots to access the platform</li>
                                        <li>Post jobs for illegal activities or pyramid schemes</li>
                                        <li>Collect user data for purposes outside the platform</li>
                                        <li>Interfere with or disrupt the platform&apos;s functionality</li>
                                        <li>Violate any applicable laws or regulations</li>
                                    </ul>
                                    <p>
                                        Violation of these prohibitions may result in account suspension or termination and potential legal action.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Disclaimer of Warranties */}
                        <div className="mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                                <Shield className="h-7 w-7 text-primary" />
                                Disclaimer of Warranties
                            </h2>

                            <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                <div className="text-foreground space-y-4">
                                    <p>
                                        Ligaye is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. We do not guarantee that:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>The platform will be uninterrupted, secure, or error-free</li>
                                        <li>Job postings are accurate, legitimate, or current</li>
                                        <li>User profiles contain truthful or complete information</li>
                                        <li>You will find employment or suitable candidates through our platform</li>
                                        <li>The platform will meet your specific requirements</li>
                                    </ul>
                                    <p>
                                        We strongly recommend conducting your own due diligence when interacting with other users, applying for jobs, or hiring candidates.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Limitation of Liability */}
                        <div className="mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                                <AlertTriangle className="h-7 w-7 text-primary" />
                                Limitation of Liability
                            </h2>

                            <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                <div className="text-foreground space-y-4">
                                    <p>
                                        To the maximum extent permitted by law, Ligaye and its officers, directors, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Your use or inability to use the platform</li>
                                        <li>Interactions or disputes with other users</li>
                                        <li>Employment decisions or hiring outcomes</li>
                                        <li>Unauthorized access to your account or data</li>
                                        <li>Errors, omissions, or inaccuracies in platform content</li>
                                        <li>Loss of data, profits, or business opportunities</li>
                                    </ul>
                                    <p>
                                        Our total liability for any claims related to the platform shall not exceed the amount you paid to Ligaye in the twelve months preceding the claim, or GMD 1,000, whichever is less.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Indemnification */}
                        <div className="mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                                <Shield className="h-7 w-7 text-primary" />
                                Indemnification
                            </h2>

                            <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                <div className="text-foreground">
                                    <p>
                                        You agree to indemnify, defend, and hold harmless Ligaye and its affiliates from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the platform, your violation of these Terms of Use, your violation of any rights of another party, or your violation of any applicable laws.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Termination */}
                        <div className="mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                                <AlertTriangle className="h-7 w-7 text-primary" />
                                Termination
                            </h2>

                            <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                <div className="text-foreground space-y-4">
                                    <p>
                                        We reserve the right to suspend or terminate your account at any time, with or without notice, for violations of these Terms of Use, suspicious activity, or any other reason we deem necessary to protect our platform and community.
                                    </p>
                                    <p>
                                        You may terminate your account at any time through your account settings. Upon termination, your right to use the platform will immediately cease. Provisions regarding intellectual property, disclaimers, limitations of liability, and indemnification shall survive termination.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Dispute Resolution */}
                        <div className="mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                                <Scale className="h-7 w-7 text-primary" />
                                Dispute Resolution and Governing Law
                            </h2>

                            <div className="space-y-6">
                                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                    <h3 className="text-xl font-semibold mb-4">Governing Law</h3>
                                    <div className="text-foreground">
                                        <p>
                                            These Terms of Use shall be governed by and construed in accordance with the laws of The Gambia, without regard to its conflict of law provisions.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                    <h3 className="text-xl font-semibold mb-4">Dispute Resolution</h3>
                                    <div className="text-foreground space-y-3">
                                        <p>
                                            In the event of any dispute arising from these Terms of Use or your use of Ligaye, you agree to first attempt to resolve the dispute informally by contacting us. If the dispute cannot be resolved informally within 30 days, it shall be resolved through arbitration or the courts of The Gambia.
                                        </p>
                                        <p>
                                            You agree that any legal action related to these Terms of Use must be commenced within one year after the claim arose, or such claim shall be permanently barred.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Changes to Terms */}
                        <div className="mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                                <FileText className="h-7 w-7 text-primary" />
                                Changes to These Terms
                            </h2>

                            <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                <div className="text-foreground space-y-4">
                                    <p>
                                        We reserve the right to modify these Terms of Use at any time. When we make material changes, we will:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Post the updated terms on our website</li>
                                        <li>Update the &quot;Last updated&quot; date at the top of this page</li>
                                        <li>Notify you via email or platform notification for significant changes</li>
                                        <li>Provide a reasonable notice period before changes take effect</li>
                                    </ul>
                                    <p>
                                        Your continued use of Ligaye after any changes indicates your acceptance of the updated Terms of Use. If you do not agree with the changes, you must stop using the platform and close your account.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Severability */}
                        <div className="mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                                <Scale className="h-7 w-7 text-primary" />
                                Severability and Entire Agreement
                            </h2>

                            <div className="space-y-6">
                                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                    <h3 className="text-xl font-semibold mb-4">Severability</h3>
                                    <div className="text-foreground">
                                        <p>
                                            If any provision of these Terms of Use is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                    <h3 className="text-xl font-semibold mb-4">Entire Agreement</h3>
                                    <div className="text-foreground">
                                        <p>
                                            These Terms of Use, together with our Privacy Policy and any other legal notices published on the platform, constitute the entire agreement between you and Ligaye regarding your use of our services.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                                <Mail className="h-7 w-7 text-primary" />
                                Contact Us
                            </h2>

                            <div className="bg-muted/50 p-6 rounded-lg border border-border">
                                <div className="text-foreground space-y-4">
                                    <p>
                                        If you have any questions about these Terms of Use, please contact us:
                                    </p>
                                    <Link href="/contact-us">
                                        <Button>Get in touch</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EmployerLaunchPromoProps {
  name: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
// Use baseUrl for development, fallback to production domain if needed
const logoUrl = baseUrl ? `${baseUrl}/full_logo_branding.png` : 'https://ligaye.com/full_logo_branding.png';

export const EmployerLaunchPromo: React.FC<Readonly<EmployerLaunchPromoProps>> = ({
  name,
}) => (
  <Html>
    <Head />
    <Preview>🚀 Introducing Ligaye - 2 Months FREE Job Posting for Launch Partners!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={{ marginTop: '32px' }}>
          <Img
            src={logoUrl}
            width="400"
            height="200"
            alt="Ligaye.com"
            style={logo}
          />
        </Section>
        
        <Heading style={h1}>🚀 Welcome to the Future of Recruitment in The Gambia!</Heading>
        
        <Text style={greeting}>Dear {name},</Text>
        
        <Text style={text}>
          We're excited to introduce you to <strong>Ligaye</strong> - The Gambia's newest and most innovative talent marketplace, designed specifically for connecting with talent and forward-thinking employers like yourself.
        </Text>

        <Section style={highlightBox}>
          <Text style={highlightTitle}>🎉 EXCLUSIVE LAUNCH OFFER</Text>
          <Text style={highlightText}>
            <strong>2 MONTHS OF FREE JOB POSTING</strong><br/>
            Valid from June 1, 2025 to July 30, 2025
          </Text>
          <Text style={highlightSubtext}>
            Be among the first employers to discover top talent!
          </Text>
        </Section>

        <Text style={text}>
          As we launch this groundbreaking platform, we're looking for visionary employers who want to be part of revolutionizing how recruitment works in The Gambia. Here's what makes Ligaye different:
        </Text>

        <Section style={featuresList}>
          <Text style={featureItem}>✅ <strong>Local Focus:</strong> Built specifically for the Gambian job market</Text>
          <Text style={featureItem}>✅ <strong>Flexible Payment Options:</strong> Pay online with Stripe or cash payments</Text>
          <Text style={featureItem}>✅ <strong>Smart Matching:</strong> Advanced filters to find the right candidates</Text>
          <Text style={featureItem}>✅ <strong>Easy Management:</strong> Simple dashboard to track applications</Text>
          <Text style={featureItem}>✅ <strong>Tenders & Procurement:</strong> Post and manage tender opportunities</Text>
          <Text style={featureItem}>✅ <strong>Mobile Optimized:</strong> Reach candidates wherever they are</Text>
          <Text style={featureItem}>✅ <strong>Mobile App:</strong> Coming soon for even better accessibility</Text>
        </Section>

        <Text style={text}>
          This is your opportunity to be a founding partner of The Gambia's premier job platform. Join us in shaping the future of work in our country.
        </Text>

        <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
          <Button style={button} href={`${baseUrl}/employer/register`}>
            Claim Your FREE 2 Months Now
          </Button>
        </Section>

        <Text style={text}>
          Don't miss this limited-time opportunity. Our launch offer is only available until July 30, 2025, and spots are filling up fast.
        </Text>

        <Text style={text}>
          Ready to discover your next great hire? Let's build the future of employment together.
        </Text>

        <Text style={signature}>
          Best regards,<br />
          <strong>The Ligaye Launch Team</strong><br />
          <em>Where Talent Meets Opportunity</em>
        </Text>

        <Section style={footer}>
          <Text style={footerText}>
            Questions? Reply to this email or visit our website for more information.
          </Text>
          <Text style={footerText}>
            Ligaye - Proudly Gambian, Globally Competitive
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default EmployerLaunchPromo;

const main = {
  backgroundColor: '#f8faff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e1e5f2',
  borderRadius: '12px',
  margin: '0 auto',
  padding: '40px 30px',
  maxWidth: '600px',
};

const logo = {
  margin: '0 auto',
  display: 'block',
  objectFit: 'contain' as const,
};

const h1 = {
  color: '#1a1e2d',
  fontSize: '28px',
  fontWeight: '700',
  textAlign: 'center' as const,
  margin: '30px 0 20px 0',
  lineHeight: '1.3',
};

const greeting = {
  color: '#1a1e2d',
  fontSize: '18px',
  fontWeight: '600',
  margin: '20px 0 10px 0',
};

const text = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const highlightBox = {
  backgroundColor: '#e9efff',
  border: '2px solid #4a6cfa',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const highlightTitle = {
  color: '#4a6cfa',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 12px 0',
};

const highlightText = {
  color: '#1a1e2d',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 8px 0',
  lineHeight: '1.4',
};

const highlightSubtext = {
  color: '#4a6cfa',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
  fontStyle: 'italic',
};

const featuresList = {
  margin: '20px 0',
};

const featureItem = {
  color: '#4a5568',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '8px 0',
};

const button = {
  backgroundColor: '#4a6cfa',
  color: '#ffffff',
  padding: '16px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '18px',
  fontWeight: '600',
  display: 'inline-block',
  textAlign: 'center' as const,
};

const signature = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '32px 0 24px 0',
};

const footer = {
  borderTop: '1px solid #e1e5f2',
  paddingTop: '20px',
  marginTop: '32px',
};

const footerText = {
  color: '#9aa3bc',
  fontSize: '13px',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  margin: '8px 0',
}; 
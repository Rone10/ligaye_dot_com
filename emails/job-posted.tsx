import {
    Body,
    Button,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Text,
  } from '@react-email/components';

  interface JobPostedEmailProps {
    employerName: string;
    jobTitle: string;
    jobLocation: string;
    dashboardUrl: string;
  }
  
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = process.env.BASE_URL || 'https://ligaye.com';
  
  const logoSrc = isProduction
    ? `${baseUrl}/branding/full_logo.png` // NOTE: Assumes production logo is in /branding/
    : '/static/full_logo.png';

  export const JobPostedEmail = ({
    employerName,
    jobTitle,
    jobLocation,
    dashboardUrl,
  }: JobPostedEmailProps) => (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>
          Your job posting for {jobTitle} is now live on Ligaye.com!
        </Preview>
        <Container style={container}>
          <Img
            src={logoSrc}
            width="250"
            height="250"
            alt="Ligaye.com"
            style={logo}
          />
          <Text style={paragraph}>Hi {employerName},</Text>
          <Text style={paragraph}>
            Great news! Your job posting for <strong>{jobTitle}</strong> in {jobLocation} is now live on Ligaye.com. 
            Qualified candidates can now discover and apply to your position.
          </Text>
          <Text style={paragraph}>
            You can track applications and manage your job posting from your employer dashboard.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={dashboardUrl}>
              View Dashboard
            </Button>
          </Section>
          <Text style={paragraph}>
            Thank you for choosing Ligaye.com for your recruitment needs.
          </Text>
          <Text style={paragraph}>
            Best regards,
            <br />
            The Ligaye.com Team
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            © {new Date().getFullYear()} Ligaye.com. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
  
  JobPostedEmail.PreviewProps = {
    employerName: 'John Doe',
    jobTitle: 'Software Engineer',
    jobLocation: 'Remote',
    dashboardUrl: 'https://ligaye.com/dashboard',
  } as JobPostedEmailProps;
  
  export default JobPostedEmail;
  
  const main = {
    backgroundColor: '#ffffff',
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  };
  
  const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
  };
  
  const logo = {
    margin: '0 auto',
  };
  
  const paragraph = {
    fontSize: '16px',
    lineHeight: '26px',
  };
  
  const btnContainer = {
    textAlign: 'center' as const,
  };
  
  const button = {
    backgroundColor: '#3B82F6',
    borderRadius: '3px',
    color: '#fff',
    fontSize: '16px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px',
  };
  
  const hr = {
    borderColor: '#cccccc',
    margin: '20px 0',
  };
  
  const footer = {
    color: '#8898aa',
    fontSize: '12px',
  };
  
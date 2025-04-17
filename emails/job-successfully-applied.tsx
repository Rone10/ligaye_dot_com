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

interface JobSuccessfullyAppliedEmailProps {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  applicationDate: string;
  dashboardUrl: string;
  exploreMoreJobsUrl: string;
}

// Always use absolute URLs for email images
const logoUrl = 'https://ligaye.com/branding/full_logo.png';

export const JobSuccessfullyAppliedEmail = ({
  candidateName,
  jobTitle,
  companyName,
  applicationDate,
  dashboardUrl,
  exploreMoreJobsUrl,
}: JobSuccessfullyAppliedEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>
        Your application for {jobTitle} at {companyName} has been submitted successfully!
      </Preview>
      <Container style={container}>
        <Img
          src={logoUrl}
          width="250"
          height="250"
          alt="Ligaye.com"
          style={logo}
        />
        <Text style={paragraph}>Hi <strong>{candidateName}</strong>,</Text>
        <Text style={paragraph}>
          Great news! Your application for <strong>{jobTitle}</strong> at <strong>{companyName}</strong> was successfully submitted on {applicationDate}.
        </Text>
        <Text style={paragraph}>
          The employer has been notified of your application and will review your qualifications. You can track the status of your application through your candidate dashboard.
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={dashboardUrl}>
            Track Application
          </Button>
        </Section>
        <Text style={paragraph}>
          Here are some next steps you might consider:
        </Text>
        <Text style={listContainer}>
          • Prepare for a potential interview by researching <strong>{companyName}</strong>
          <br />
          • Update your profile with any additional relevant skills or experiences
          <br />
          • Continue exploring other job opportunities that match your qualifications
        </Text>
        <Section style={btnContainer}>
          <Button style={secondaryButton} href={exploreMoreJobsUrl}>
            Explore More Jobs
          </Button>
        </Section>
        <Text style={paragraph}>
          Thank you for using <strong>Ligaye.com</strong> for your job search.
        </Text>
        <Text style={paragraph}>
          Best regards,
          <br />
          The <strong>Ligaye.com</strong> Team
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          © {new Date().getFullYear()} Ligaye.com. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
);

JobSuccessfullyAppliedEmail.PreviewProps = {
  candidateName: 'Sarah Smith',
  jobTitle: 'Software Engineer',
  companyName: 'Tech Solutions Inc.',
  applicationDate: 'June 15, 2023',
  dashboardUrl: 'https://ligaye.com/dashboard/applications',
  exploreMoreJobsUrl: 'https://ligaye.com/jobs',
} as JobSuccessfullyAppliedEmailProps;

export default JobSuccessfullyAppliedEmail;

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

const listContainer = {
  fontSize: '16px',
  lineHeight: '26px',
  marginBottom: '16px',
};

const btnContainer = {
  textAlign: 'center' as const,
  margin: '16px 0',
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

const secondaryButton = {
  backgroundColor: '#ffffff',
  borderRadius: '3px',
  border: '1px solid #3B82F6',
  color: '#3B82F6',
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
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

interface JobAppliedEmailProps {
  employerName: string;
  candidateName: string;
  jobTitle: string;
  applicationDate: string;
  dashboardUrl: string;
}

// Always use absolute URLs for email images
const logoUrl = 'https://ligaye.com/branding/full_logo.png';

export const JobAppliedEmail = ({
  employerName,
  candidateName,
  jobTitle,
  applicationDate,
  dashboardUrl,
}: JobAppliedEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>
        New application from {candidateName} for your {jobTitle} position!
      </Preview>
      <Container style={container}>
        <Img
          src={logoUrl}
          width="250"
          height="250"
          alt="Ligaye.com"
          style={logo}
        />
        <Text style={paragraph}>Hi <strong>{employerName}</strong>,</Text>
        <Text style={paragraph}>
          You have received a new application for <strong>{jobTitle}</strong> from <strong>{candidateName}</strong> on {applicationDate}.
        </Text>
        <Text style={paragraph}>
          Review the application details and resume in your employer dashboard to evaluate this candidate.
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={dashboardUrl}>
            Review Application
          </Button>
        </Section>
        <Text style={paragraph}>
          Thank you for using <strong>Ligaye.com</strong> for your recruitment needs.
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

JobAppliedEmail.PreviewProps = {
  employerName: 'John Doe',
  candidateName: 'Sarah Smith',
  jobTitle: 'Software Engineer',
  applicationDate: 'June 15, 2023',
  dashboardUrl: 'https://ligaye.com/dashboard/applications',
} as JobAppliedEmailProps;

export default JobAppliedEmail;

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
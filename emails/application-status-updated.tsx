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

interface ApplicationStatusUpdatedEmailProps {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  newStatus: 'REVIEWING' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'INTERVIEWED' | 'OFFER_EXTENDED' | 'HIRED' | 'REJECTED';
  interviewDate?: string;
  interviewLocation?: string;
  additionalNotes?: string;
  dashboardUrl: string;
}

const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = process.env.BASE_URL || 'https://ligaye.com';

const logoSrc = isProduction
  ? `${baseUrl}/branding/full_logo.png`
  : '/static/full_logo.png';

// Status-specific content
const getStatusContent = (status: string, props: ApplicationStatusUpdatedEmailProps) => {
  switch (status) {
    case 'REVIEWING':
      return {
        subject: `Your application for ${props.jobTitle} at ${props.companyName} is being reviewed`,
        body: `Your application for ${props.jobTitle} at ${props.companyName} is now being reviewed by the hiring team. We'll update you as your application progresses.`,
        buttonText: 'View Application',
      };
    case 'SHORTLISTED':
      return {
        subject: `You've been shortlisted for ${props.jobTitle} at ${props.companyName}`,
        body: `Congratulations! Your application for ${props.jobTitle} at ${props.companyName} has been shortlisted. The hiring team was impressed with your qualifications and experience.`,
        buttonText: 'View Application',
      };
    case 'INTERVIEW_SCHEDULED':
      return {
        subject: `Interview scheduled for ${props.jobTitle} at ${props.companyName}`,
        body: `Your interview for ${props.jobTitle} at ${props.companyName} has been scheduled for ${props.interviewDate || '[Date TBD]'} ${props.interviewLocation ? `at ${props.interviewLocation}` : ''}. Please confirm your availability through your dashboard.`,
        buttonText: 'Confirm Interview',
      };
    case 'INTERVIEWED':
      return {
        subject: `Thank you for interviewing for ${props.jobTitle} at ${props.companyName}`,
        body: `Thank you for completing your interview for the ${props.jobTitle} position at ${props.companyName}. The hiring team is currently evaluating all candidates and will provide an update soon.`,
        buttonText: 'View Application',
      };
    case 'OFFER_EXTENDED':
      return {
        subject: `Job offer for ${props.jobTitle} at ${props.companyName}`,
        body: `Congratulations! We're pleased to inform you that ${props.companyName} would like to offer you the ${props.jobTitle} position. Please check your dashboard for more details and next steps.`,
        buttonText: 'View Offer Details',
      };
    case 'HIRED':
      return {
        subject: `Welcome to ${props.companyName}!`,
        body: `Congratulations! Your hiring process for ${props.jobTitle} at ${props.companyName} is complete. We're excited to welcome you to the team. Please check your dashboard for onboarding details.`,
        buttonText: 'View Onboarding Details',
      };
    case 'REJECTED':
      return {
        subject: `Update on your application for ${props.jobTitle} at ${props.companyName}`,
        body: `Thank you for your interest in the ${props.jobTitle} position at ${props.companyName}. After careful consideration, the hiring team has decided to pursue other candidates whose qualifications more closely match their current needs. We appreciate your time and encourage you to apply for future positions that match your skills and experience.`,
        buttonText: 'Explore Other Jobs',
      };
    default:
      return {
        subject: `Update on your application for ${props.jobTitle} at ${props.companyName}`,
        body: `There has been an update to your application for ${props.jobTitle} at ${props.companyName}. Please check your dashboard for more details.`,
        buttonText: 'View Application',
      };
  }
};

export const ApplicationStatusUpdatedEmail = (props: ApplicationStatusUpdatedEmailProps) => {
  const { candidateName, jobTitle, companyName, newStatus, additionalNotes, dashboardUrl } = props;
  const statusContent = getStatusContent(newStatus, props);

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>{statusContent.subject}</Preview>
        <Container style={container}>
          <Img
            src={logoSrc}
            width="250"
            height="250"
            alt="Ligaye.com"
            style={logo}
          />
          <Text style={paragraph}>Hi {candidateName},</Text>
          <Text style={paragraph}>
            {statusContent.body}
          </Text>

          {additionalNotes && (
            <Text style={paragraph}>
              <strong>Additional notes:</strong> {additionalNotes}
            </Text>
          )}

          <Section style={btnContainer}>
            <Button style={button} href={dashboardUrl}>
              {statusContent.buttonText}
            </Button>
          </Section>

          <Text style={paragraph}>
            If you have any questions, please respond to this email or contact the employer directly.
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
};

ApplicationStatusUpdatedEmail.PreviewProps = {
  candidateName: 'John Doe',
  jobTitle: 'Software Engineer',
  companyName: 'Tech Solutions Inc.',
  newStatus: 'SHORTLISTED',
  dashboardUrl: 'https://ligaye.com/dashboard/applications',
} as ApplicationStatusUpdatedEmailProps;

export default ApplicationStatusUpdatedEmail;

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
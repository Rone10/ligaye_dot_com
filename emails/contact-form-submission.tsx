import React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
  Tailwind,
} from '@react-email/components';

interface ContactFormSubmissionEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactFormSubmissionEmail: React.FC<ContactFormSubmissionEmailProps> = ({ name, email, subject, message }) => {
  const previewText = `New Contact Form Submission: ${subject}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body style={main}>
          <Container style={container}>
            <Heading style={heading}>New Contact Form Submission</Heading>
            <Text style={paragraph}>You have received a new message via the contact form on Ligaye.com.</Text>
            <Hr style={hr} />
            <Text style={detailLabel}>From:</Text>
            <Text style={detailValue}>{name}</Text>
            <Text style={detailLabel}>Email:</Text>
            <Text style={detailValue}>{email}</Text>
            <Hr style={hrSmall} />
            <Text style={detailLabel}>Subject:</Text>
            <Text style={detailValue}>{subject}</Text>
             <Hr style={hrSmall} />
            <Text style={detailLabel}>Message:</Text>
            {/* Preserve line breaks from the message */}
            <Text style={messageContent}>
              {message.split('\n').map((line, index) => (
                <React.Fragment key={index}>{line}<br /></React.Fragment>
              ))}
            </Text>
             <Hr style={hr} />
            <Text style={footer}>Ligaye.com Contact System</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default ContactFormSubmissionEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  border: '1px solid #f0f0f0',
  borderRadius: '4px',
};

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginTop: '48px',
  marginBottom: '20px',
  textAlign: 'center' as const,
  color: '#4a6cfa', // Primary Blue
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  color: '#5f6368',
  padding: '0 40px',
};

const detailLabel = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1a1e2d', // Dark
  margin: '0 40px 4px 40px',
};

const detailValue = {
  fontSize: '16px',
  color: '#5f6368',
  margin: '0 40px 16px 40px',
};

const messageContent = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#3c4043',
  margin: '0 40px 20px 40px',
  padding: '15px',
  border: '1px solid #e1e5f2', // Gray
  borderRadius: '8px',
  backgroundColor: '#f8faff', // Light
  whiteSpace: 'pre-wrap' as const, // Ensure line breaks are respected visually
};

const hr = {
  borderColor: '#e1e5f2', // Gray
  margin: '20px 0',
};

const hrSmall = {
  borderColor: '#f0f0f0',
  margin: '5px 40px',
};

const footer = {
  color: '#9aa3bc', // Gray Dark
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '20px',
}; 
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  name: string;
}

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({
  name,
}) => (
  <Html>
    <Head />
    <Preview>Welcome to Ligaye.com!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome aboard, {name}!</Heading>
        <Text style={text}>
          We are thrilled to have you join the Ligaye.com community. We are on a
          mission to connect Gambian talent with the best opportunities.
        </Text>
        <Text style={text}>
          You can now explore job listings, set up your profile, and start your
          career journey with us.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

const main = {
  backgroundColor: '#f6f9fc',
  padding: '20px',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '4px',
  margin: '0 auto',
  padding: '20px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '30px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '24px',
};

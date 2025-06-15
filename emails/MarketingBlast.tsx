import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface MarketingBlastProps {
  name: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
// const logoUrl = 'https://ligaye.com/branding/full_logo.png';
const logoUrl = 'https://ligaye.com/logo.PNG';

export const MarketingBlast: React.FC<Readonly<MarketingBlastProps>> = ({
  name,
}) => (
  <Html>
    <Head />
    <Preview>New Job Opportunities Just For You!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={{ marginTop: '32px' }}>
          <Img
            src={logoUrl}
            width="500"
            // height="200"
            alt="Ligaye.com"
            style={logo}
          />
        </Section>
        <Heading style={h1}>Hi, {name}!</Heading>
        <Text style={text}>
          We're reaching out with a new batch of exciting job opportunities that
          match your profile. Don't miss out on your next career move.
        </Text>
        <Text style={text}>
          Our platform has been updated with roles from top employers in The
          Gambia, across all sectors.
        </Text>
        <Section style={{ textAlign: 'center', marginTop: '26px' }}>
          <Button style={button} href={`${baseUrl}/jobs`}>
            Explore Jobs Now
          </Button>
        </Section>
        <Text style={text}>
          Best of luck with your applications!
          <br />
          The Ligaye.com Team
        </Text>
        <Section style={{ marginTop: '32px' }}>
          <Text style={footer}>
            Ligaye.com - Connecting Gambian Talent with Opportunity
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default MarketingBlast;

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  padding: '20px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  border: '1px solid #E5E5E5',
  borderRadius: '5px',
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const text = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '1.5',
};

const button = {
  backgroundColor: '#007bff',
  color: '#ffffff',
  padding: '12px 20px',
  borderRadius: '5px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: 'bold',
  display: 'inline-block',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
};

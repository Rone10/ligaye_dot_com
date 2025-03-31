import { EmailTemplate } from '@/components/email-template';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function GET() {
  return POST();
}

export async function POST() {
  // TODO: Add rate limiting to this route (only allow logged in users to send emails)
  try {
    const { data, error } = await resend.emails.send({
      from: 'Ligaye.com <admin@ligaye.com>',
      to: ['devrone10@gmail.com'],
      subject: 'Hello world',
      react: EmailTemplate({ firstName: 'Haruna' }),
    });

    if (error) {
      console.log('Error sending email', error);
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    console.log('Error sending email 2', error);
    return Response.json({ error }, { status: 500 });
  }
}
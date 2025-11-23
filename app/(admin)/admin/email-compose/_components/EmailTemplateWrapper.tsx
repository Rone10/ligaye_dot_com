import * as React from 'react';

interface EmailTemplateWrapperProps {
  content: string;
  previewMode?: boolean;
}

// Email-safe styles
const emailStyles = {
  main: {
    backgroundColor: '#f8faff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px 0',
  },
  container: {
    backgroundColor: '#ffffff',
    border: '1px solid #e1e5f2',
    borderRadius: '12px',
    margin: '0 auto',
    padding: '40px 30px',
    maxWidth: '600px',
  },
  logoContainer: {
    textAlign: 'center' as const,
    marginBottom: '32px',
  },
  logo: {
    width: '250px',
    height: 'auto',
    objectFit: 'contain' as const,
    margin: '0 auto',
    display: 'block',
  },
  content: {
    color: '#4a5568',
    fontSize: '16px',
    lineHeight: '1.6',
  },
  footer: {
    borderTop: '1px solid #e1e5f2',
    paddingTop: '20px',
    marginTop: '32px',
  },
  footerText: {
    color: '#9aa3bc',
    fontSize: '13px',
    lineHeight: '1.5',
    textAlign: 'center' as const,
    margin: '8px 0',
  },
};

export function EmailTemplateWrapper({ content, previewMode = false }: EmailTemplateWrapperProps) {
  const logoUrl = previewMode
    ? '/branding/full_logo.png'
    : 'https://ligaye.com/branding/full_logo.png';

  // Process the content to ensure proper styling
  const processedContent = content
    // Ensure lists have proper styling with list-style
    .replace(/<ul>/g, '<ul style="margin: 16px 0; padding-left: 20px; list-style-type: disc; list-style-position: inside;">')
    .replace(/<ol>/g, '<ol style="margin: 16px 0; padding-left: 20px; list-style-type: decimal; list-style-position: inside;">')
    .replace(/<li>/g, '<li style="margin-bottom: 8px; display: list-item;">')
    // Ensure paragraphs have spacing
    .replace(/<p>/g, '<p style="margin: 16px 0;">')
    // Style links
    .replace(/<a /g, '<a style="color: #4a6cfa; text-decoration: none;" ')
    // Style headings
    .replace(/<h1>/g, '<h1 style="color: #1a1e2d; font-size: 28px; font-weight: 700; margin: 24px 0;">')
    .replace(/<h2>/g, '<h2 style="color: #1a1e2d; font-size: 24px; font-weight: 600; margin: 20px 0;">')
    .replace(/<h3>/g, '<h3 style="color: #1a1e2d; font-size: 20px; font-weight: 600; margin: 16px 0;">');

  const emailHtml = `
    <div style="${Object.entries(emailStyles.main).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}">
      <div style="${Object.entries(emailStyles.container).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}">
        <div style="${Object.entries(emailStyles.logoContainer).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}">
          <img 
            src="${logoUrl}" 
            alt="Ligaye.com" 
            style="${Object.entries(emailStyles.logo).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}"
          />
        </div>
        
        <div style="${Object.entries(emailStyles.content).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}">
          ${processedContent}
        </div>
        
        <div style="${Object.entries(emailStyles.footer).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}">
          <p style="${Object.entries(emailStyles.footerText).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}">
            This email was sent by Ligaye
          </p>
          <p style="${Object.entries(emailStyles.footerText).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}">
            Ligaye - Where Talent Meets Opportunity
          </p>
          <p style="${Object.entries(emailStyles.footerText).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}">
            © ${new Date().getFullYear()} Ligaye. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  return previewMode ? (
    <div dangerouslySetInnerHTML={{ __html: emailHtml }} />
  ) : (
    emailHtml
  );
}

// Extract plain text from HTML for email bodyText
export function extractPlainText(html: string): string {
  // Remove HTML tags and decode entities
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '') // Remove style tags
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]+>/g, ' ') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp;
    .replace(/&amp;/g, '&') // Replace &amp;
    .replace(/&lt;/g, '<') // Replace &lt;
    .replace(/&gt;/g, '>') // Replace &gt;
    .replace(/&quot;/g, '"') // Replace &quot;
    .replace(/&#39;/g, "'") // Replace &#39;
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}
import { EmailComposer } from './_components/EmailComposer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, FileText } from 'lucide-react';
import Link from 'next/link';
import { getDrafts } from './_actions';

export default async function AdminEmailComposePage() {
  // Get available email templates
  const templates = [
    { value: 'welcome', label: 'Welcome Email' },
    { value: 'job-posted', label: 'Job Posted Confirmation' },
    { value: 'application-received', label: 'Application Received' },
    { value: 'launch-promo', label: 'Launch Promotion' },
  ];

  // Get user's drafts
  const draftsResult = await getDrafts();
  const drafts = draftsResult.success ? draftsResult.data : [];

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 max-w-7xl mx-auto">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/email-send">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Bulk Email
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Compose Individual Email
          </h1>
        </div>
      </div>

      {/* Drafts section if any exist */}
      {drafts && drafts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Drafts
            </CardTitle>
            <CardDescription>
              Continue working on your saved email drafts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {drafts.slice(0, 5).map((draft) => (
                <Link
                  key={draft.id}
                  href={`/admin/email-compose?draft=${draft.id}`}
                  className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">
                        {draft.subject || 'No subject'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        To: {draft.recipient || 'No recipient'}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(draft.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Composer */}
      <EmailComposer templates={templates} />
    </main>
  );
}
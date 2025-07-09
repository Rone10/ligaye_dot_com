import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Users,
  Globe,
  Mail,
  Phone,
  Link as LinkIcon,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { JobStatusBadge } from "../../_components/JobStatusBadge";

interface JobDetailsProps {
  job: any; // Type would be more specific in production
}

export function JobDetails({ job }: JobDetailsProps) {
  // Parse HTML and extract text content for safer rendering
  const parseJobDescription = (description: string | null | undefined) => {
    if (!description) return '';
    
    // Ensure description is a string
    const descriptionStr = typeof description === 'string' ? description : String(description);
    
    // Replace HTML entities first
    let parsedText = descriptionStr
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ');
    
    // Replace paragraph tags with appropriate markup
    parsedText = parsedText
      .replace(/<p\s*[^>]*>/g, '<div class="mb-4">')
      .replace(/<\/p>/g, '</div>')
      .replace(/<br\s*\/?>/g, '<br />');
    
    // Handle headers with proper styling
    parsedText = parsedText
      .replace(/<h1\s*[^>]*>(.*?)<\/h1>/g, '<div class="text-3xl font-bold mb-4">$1</div>')
      .replace(/<h2\s*[^>]*>(.*?)<\/h2>/g, '<div class="text-2xl font-bold mb-3">$1</div>')
      .replace(/<h3\s*[^>]*>(.*?)<\/h3>/g, '<div class="text-xl font-bold mb-2">$1</div>')
      .replace(/<h4\s*[^>]*>(.*?)<\/h4>/g, '<div class="text-lg font-semibold mb-2">$1</div>')
      .replace(/<h5\s*[^>]*>(.*?)<\/h5>/g, '<div class="text-base font-semibold mb-1">$1</div>')
      .replace(/<h6\s*[^>]*>(.*?)<\/h6>/g, '<div class="text-sm font-semibold mb-1">$1</div>');
    
    // Preserve text formatting
    parsedText = parsedText
      .replace(/<strong\s*[^>]*>(.*?)<\/strong>/g, '<span class="font-bold">$1</span>')
      .replace(/<b\s*[^>]*>(.*?)<\/b>/g, '<span class="font-bold">$1</span>')
      .replace(/<em\s*[^>]*>(.*?)<\/em>/g, '<span class="italic">$1</span>')
      .replace(/<i\s*[^>]*>(.*?)<\/i>/g, '<span class="italic">$1</span>')
      .replace(/<u\s*[^>]*>(.*?)<\/u>/g, '<span class="underline">$1</span>');
    
    // Handle lists
    parsedText = parsedText
      .replace(/<ul\s*[^>]*>/g, '<div class="pl-6 mb-4 space-y-1">')
      .replace(/<\/ul>/g, '</div>')
      .replace(/<ol\s*[^>]*>/g, '<div class="pl-6 mb-4 space-y-1 list-decimal">')
      .replace(/<\/ol>/g, '</div>')
      .replace(/<li\s*[^>]*>(.*?)<\/li>/g, '<div class="flex"><span class="mr-2">•</span><span>$1</span></div>');
    
    // Clean up any potentially unsafe tags while keeping our safe ones
    const safeTagsRegex = /<(?!\/?(div|span|br)(?!\w)[^>]*>)([^>]*)>/g;
    parsedText = parsedText.replace(safeTagsRegex, '');
    
    return parsedText;
  };
  const formatSalary = () => {
    if (job.salaryDisplayType === "NEGOTIABLE") return "Negotiable";
    
    const min = job.salaryMin ? `D${job.salaryMin.toLocaleString()}` : "";
    const max = job.salaryMax ? `D${job.salaryMax.toLocaleString()}` : "";
    const frequency = job.salaryFrequency?.toLowerCase() || "month";
    
    if (job.salaryDisplayType === "RANGE" && min && max) return `${min} - ${max} per ${frequency}`;
    if (job.salaryDisplayType === "STARTING_AMOUNT" && min) return `From ${min} per ${frequency}`;
    if (job.salaryDisplayType === "MAXIMUM_AMOUNT" && max) return `Up to ${max} per ${frequency}`;
    if (job.salaryDisplayType === "FIXED" && min) return `${min} per ${frequency}`;
    return "Not specified";
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Type:</strong> {job.jobType.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Location:</strong> {job.location?.city || "Remote"} ({job.workLocation.replace("_", " ").toLowerCase()})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Experience:</strong> {job.experienceLevel.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Salary:</strong> {formatSalary()}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Posted:</strong> {format(new Date(job.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Expires:</strong> {job.expiresAt ? format(new Date(job.expiresAt), "MMM d, yyyy") : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Application Deadline:</strong> {job.applicationDeadline ? format(new Date(job.applicationDeadline), "MMM d, yyyy") : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Applications:</strong> {job.applicationCount}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Status</h4>
              <JobStatusBadge status={job.status} />
            </div>

            {job.skills && job.skills.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill: any) => (
                      <Badge key={skill.id} variant="secondary">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <div className="prose-rich-text max-w-none text-sm text-muted-foreground">
                <div 
                  dangerouslySetInnerHTML={{ __html: parseJobDescription(job.description) }}
                />
              </div>
            </div>

            {job.educationRequirements && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Education Requirements</h4>
                  <div className="prose-rich-text max-w-none text-sm text-muted-foreground">
                    <div 
                      dangerouslySetInnerHTML={{ __html: parseJobDescription(job.educationRequirements) }}
                    />
                  </div>
                </div>
              </>
            )}

            {job.experienceRequirements && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Experience Requirements</h4>
                  <div className="prose-rich-text max-w-none text-sm text-muted-foreground">
                    <div 
                      dangerouslySetInnerHTML={{ __html: parseJobDescription(job.experienceRequirements) }}
                    />
                  </div>
                </div>
              </>
            )}

            {job.benefits && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Benefits</h4>
                  <div className="prose-rich-text max-w-none text-sm text-muted-foreground">
                    <div 
                      dangerouslySetInnerHTML={{ __html: parseJobDescription(job.benefits) }}
                    />
                  </div>
                </div>
              </>
            )}

            {job.applicationInstructions && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Application Instructions</h4>
                  <div className="prose-rich-text max-w-none text-sm text-muted-foreground">
                    <div 
                      dangerouslySetInnerHTML={{ __html: parseJobDescription(job.applicationInstructions) }}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold">{job.employer?.companyName || "Unknown Company"}</h4>
            </div>
            
            {job.employer?.companyWebsite && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={job.employer.companyWebsite} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {job.employer.companyWebsite}
                </a>
              </div>
            )}
            
            {job.employer?.companyEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`mailto:${job.employer.companyEmail}`}
                  className="text-sm text-primary hover:underline"
                >
                  {job.employer.companyEmail}
                </a>
              </div>
            )}
            
            {job.employer?.companyPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{job.employer.companyPhone}</span>
              </div>
            )}

            {job.employer?.companyDescription && (
              <>
                <Separator className="my-3" />
                <div>
                  <h5 className="font-medium mb-1">About</h5>
                  <p className="text-sm text-muted-foreground">
                    {job.employer.companyDescription}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {job.applicationEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Email:</strong> {job.applicationEmail}
                </span>
              </div>
            )}
            
            {job.applicationUrl && (
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={job.applicationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  External Application Link
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {job.employer?.user && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Person</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold">
                  {job.employer.user.firstName} {job.employer.user.lastName}
                </h4>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`mailto:${job.employer.user.email}`}
                  className="text-sm text-primary hover:underline"
                >
                  {job.employer.user.email}
                </a>
              </div>
              
              {job.employer.user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{job.employer.user.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
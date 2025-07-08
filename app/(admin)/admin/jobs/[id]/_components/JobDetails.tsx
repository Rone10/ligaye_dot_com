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
              <div className="prose prose-sm max-w-none text-sm text-muted-foreground">
                {job.description}
              </div>
            </div>

            {job.requirements && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Requirements</h4>
                  <div className="prose prose-sm max-w-none text-sm text-muted-foreground">
                    {job.requirements}
                  </div>
                </div>
              </>
            )}

            {job.responsibilities && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Responsibilities</h4>
                  <div className="prose prose-sm max-w-none text-sm text-muted-foreground">
                    {job.responsibilities}
                  </div>
                </div>
              </>
            )}

            {job.benefits && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Benefits</h4>
                  <div className="prose prose-sm max-w-none text-sm text-muted-foreground">
                    {job.benefits}
                  </div>
                </div>
              </>
            )}

            {job.applicationInstructions && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Application Instructions</h4>
                  <div className="prose prose-sm max-w-none text-sm text-muted-foreground">
                    {job.applicationInstructions}
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
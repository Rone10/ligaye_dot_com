import { Education, Experience } from '@/lib/db/schema';

// Format date for display
export function formatDate(date: Date | null | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });
}

// Format date for form inputs
export function formatDateForInput(date: Date | null | undefined): string {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
}

// Transform education data for form
export function transformEducationForForm(education: Education) {
  return {
    ...education,
    startDate: education.startDate ? formatDateForInput(education.startDate) : '',
    endDate: education.endDate ? formatDateForInput(education.endDate) : '',
  };
}

// Transform experience data for form
export function transformExperienceForForm(experience: Experience) {
  return {
    ...experience,
    startDate: experience.startDate ? new Date(experience.startDate) : new Date(),
    endDate: experience.endDate ? new Date(experience.endDate) : null,
    description: experience.description || '',
    location: experience.location || '',
  };
}

// Transform form data to education record
export function transformFormToEducation(formData: Record<string, any>, candidateProfileId: string) {
  return {
    candidateProfileId,
    institution: formData.institution,
    degree: formData.degree,
    fieldOfStudy: formData.fieldOfStudy || null,
    startDate: formData.startDate ? new Date(formData.startDate) : null,
    endDate: formData.endDate ? new Date(formData.endDate) : null,
    description: formData.description || null,
  };
}

// Transform form data to experience record
export function transformFormToExperience(formData: Record<string, any>, candidateProfileId: string) {
  return {
    candidateProfileId,
    jobTitle: formData.jobTitle,
    companyName: formData.companyName,
    location: formData.location || null,
    startDate: formData.startDate ? new Date(formData.startDate) : null,
    endDate: formData.isCurrent ? null : (formData.endDate ? new Date(formData.endDate) : null),
    isCurrent: !!formData.isCurrent,
    description: formData.description || null,
  };
}

// Get skill names from skill IDs
export function getSkillNames(skills: Array<{id: string, name: string, candidateSkillId: string}> = []) {
  return skills.map(skill => skill.name).join(', ');
} 
export interface TenderDocument {
  name: string;
  type: string;
}

export interface TenderContact {
  name: string;
  title: string;
  email: string;
  phone: string;
}

export interface Tender {
  id: string;
  title: string;
  organization: string;
  location: string;
  type: string;
  deadline: string;
  postedDate: string;
  status: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  scope: string[];
  requirements: string[];
  documents: TenderDocument[];
  contact: TenderContact;
}

export interface SimilarTender {
  id: string;
  title: string;
  organization: string;
  deadline: string;
}

// Mock data
const mockTender: Tender = {
  id: '1',
  title: 'Construction of Municipal Office Building',
  organization: 'City Development Authority',
  location: 'Chicago, IL',
  type: 'Construction',
  deadline: 'March 15, 2025',
  postedDate: 'February 1, 2025',
  status: 'Published',
  budget: {
    min: 5,
    max: 7,
    currency: 'USD',
  },
  description: 'The City Development Authority is seeking qualified contractors for the construction of a new municipal office building...',
  scope: [
    'Construction of a 5-story office building',
    'Implementation of sustainable building practices',
    'Integration of modern security systems',
  ],
  requirements: [
    'Minimum 10 years of experience in commercial construction',
    'Valid construction licenses and certifications',
    'Proven track record of similar projects',
  ],
  documents: [
    {
      name: 'Detailed Technical Specifications',
      type: 'pdf',
    },
    {
      name: 'Financial Requirements Document',
      type: 'pdf',
    },
  ],
  contact: {
    name: 'John Smith',
    title: 'Procurement Officer',
    email: 'procurement@citydevelopment.gov',
    phone: '(555) 123-4567',
  },
};

const mockSimilarTenders: SimilarTender[] = [
  {
    id: '2',
    title: 'Road Infrastructure Project',
    organization: 'State Highway Department',
    deadline: 'April 1, 2025',
  },
  {
    id: '3',
    title: 'Public Park Development',
    organization: 'Parks & Recreation Department',
    deadline: 'March 30, 2025',
  },
];

export async function getTenderById(id: string): Promise<Tender | null> {
  // In a real application, this would fetch from an API
  // For now, return mock data if ID matches
  if (id === mockTender.id) {
    return mockTender;
  }
  return null;
}

export async function getSimilarTenders(currentTenderId: string): Promise<SimilarTender[]> {
  // In a real application, this would fetch related tenders based on category, type, etc.
  // For now, return mock similar tenders
  return mockSimilarTenders;
} 
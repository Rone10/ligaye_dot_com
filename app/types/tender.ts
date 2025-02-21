export type TenderType = 'Construction' | 'IT Services' | 'Consulting';
export type TenderStatus = 'Published' | 'Closed' | 'Canceled';

export interface Tender {
  id: string;
  title: string;
  organization: string;
  location: string;
  type: TenderType;
  deadline: string;
  description: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  status: TenderStatus;
}
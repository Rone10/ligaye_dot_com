import {
  Bell,
  Lock,
  Mail,
  Shield,
  CreditCard,
  Users,
  Briefcase,
  Globe,
} from 'lucide-react';

export interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export interface SecuritySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export const settingsSections = [
  {
    id: 'account',
    title: 'Account Settings',
    description: 'Manage your account information and preferences',
    icon: Users,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Configure how you receive notifications',
    icon: Bell,
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Manage your security preferences',
    icon: Shield,
  },
  {
    id: 'billing',
    title: 'Billing & Plans',
    description: 'Manage your subscription and billing details',
    icon: CreditCard,
  },
];

export const accountSettings = {
  company: {
    name: 'TechCorp Solutions',
    size: '50-100 employees',
    industry: 'Information Technology',
    website: 'https://techcorp.com',
    description: 'Leading technology company specializing in innovative software solutions',
  },
  contact: {
    email: 'contact@techcorp.com',
    phone: '+220 7123 4567',
    address: '123 Innovation Drive',
    city: 'Banjul',
    country: 'The Gambia',
  },
  preferences: {
    language: 'English',
    timezone: 'GMT+0',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
  },
};

export const notificationSettings: NotificationSetting[] = [
  {
    id: 'new_applications',
    title: 'New Job Applications',
    description: 'Receive notifications when candidates apply for your jobs',
    enabled: true,
  },
  {
    id: 'application_updates',
    title: 'Application Status Updates',
    description: 'Get notified about changes in application status',
    enabled: true,
  },
  {
    id: 'messages',
    title: 'New Messages',
    description: 'Receive notifications for new messages from candidates',
    enabled: true,
  },
  {
    id: 'job_alerts',
    title: 'Job Posting Alerts',
    description: 'Get notified when your job posts are about to expire',
    enabled: true,
  },
  {
    id: 'marketing_emails',
    title: 'Marketing Updates',
    description: 'Receive updates about new features and promotions',
    enabled: false,
  },
];

export const securitySettings: SecuritySetting[] = [
  {
    id: 'two_factor',
    title: 'Two-Factor Authentication',
    description: 'Add an extra layer of security to your account',
    enabled: true,
  },
  {
    id: 'login_alerts',
    title: 'Login Alerts',
    description: 'Get notified of new login attempts',
    enabled: true,
  },
  {
    id: 'device_management',
    title: 'Device Management',
    description: 'Manage devices that have access to your account',
    enabled: true,
  },
];

export const billingPlan = {
  currentPlan: {
    name: 'Premium',
    price: '$99/month',
    billingCycle: 'Monthly',
    features: [
      'Unlimited job postings',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'API access',
    ],
  },
  billingHistory: [
    {
      id: '1',
      date: '2024-02-01',
      amount: '$99.00',
      status: 'Paid',
      invoice: 'INV-2024-001',
    },
    {
      id: '2',
      date: '2024-01-01',
      amount: '$99.00',
      status: 'Paid',
      invoice: 'INV-2024-002',
    },
    {
      id: '3',
      date: '2023-12-01',
      amount: '$99.00',
      status: 'Paid',
      invoice: 'INV-2024-003',
    },
  ],
  paymentMethod: {
    type: 'Credit Card',
    last4: '4242',
    expiry: '12/25',
    name: 'John Doe',
  },
}; 
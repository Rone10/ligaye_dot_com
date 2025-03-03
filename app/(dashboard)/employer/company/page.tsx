'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Globe2,
  MapPin,
  Phone,
  Mail,
  Link,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Clock,
  Pencil,
  Users,
  Building2,
  LucideProps,
} from 'lucide-react';
import { getCompanyProfile, getCompanyStats } from '@/app/actions/employer/company';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { CompanyProfileData, CompanyStatData } from '@/app/actions/employer/company';
import { useRouter } from 'next/navigation';

// Map of icon names to components
const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Users,
  Building2,
  MapPin,
  Clock,
};

export default function CompanyProfilePage() {
  const router = useRouter();
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileData | null>(null);
  const [companyStats, setCompanyStats] = useState<CompanyStatData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profileData, statsData] = await Promise.all([
          getCompanyProfile(),
          getCompanyStats()
        ]);
        
        if (profileData) {
          setCompanyProfile(profileData);
        }
        
        if (statsData) {
          setCompanyStats(statsData);
        }
      } catch (error) {
        console.error('Error loading company data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading company profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!companyProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Company Profile Not Found</h2>
          <p className="mt-2 text-gray-600">
            We couldn't find your company profile. Please contact support if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header with Cover Image */}
        <div className="relative h-64 rounded-xl overflow-hidden">
          <Image
            src={companyProfile.coverImage}
            alt="Company Cover"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
          <Button
            variant="outline"
            className="absolute top-4 right-4 bg-white"
            onClick={() => router.push('/employer/company/edit')}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Company Info Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="relative -mt-20 z-10">
            <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-white bg-white">
              <Image
                src={companyProfile.logo}
                alt={companyProfile.name}
                width={128}
                height={128}
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{companyProfile.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">{companyProfile.industry}</Badge>
              <Badge variant="secondary">{companyProfile.companySize}</Badge>
            </div>
            <p className="mt-4 text-gray-600">{companyProfile.description}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {companyStats.map((stat, index) => {
            // Get the icon component from the map using the string identifier
            const IconComponent = iconMap[stat.icon] || Users; // Fallback to Users if not found
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg border p-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`${stat.className} p-3 rounded-lg`}>
                    <IconComponent className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="culture">Culture</TabsTrigger>
            <TabsTrigger value="office">Office</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Globe2 className="w-5 h-5" />
                  <a href={companyProfile.website} className="hover:text-blue-600">
                    {companyProfile.website || 'Not provided'}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-5 h-5" />
                  <a href={`mailto:${companyProfile.contact.email}`} className="hover:text-blue-600">
                    {companyProfile.contact.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-5 h-5" />
                  {companyProfile.contact.phone}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  {`${companyProfile.location.address}, ${companyProfile.location.city}, ${companyProfile.location.country}`}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  {companyProfile.workingHours}
                </div>
                <div className="flex items-center gap-4">
                  <a href={companyProfile.contact.socialMedia.facebook} className="text-gray-600 hover:text-blue-600">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href={companyProfile.contact.socialMedia.twitter} className="text-gray-600 hover:text-blue-600">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href={companyProfile.contact.socialMedia.linkedin} className="text-gray-600 hover:text-blue-600">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href={companyProfile.contact.socialMedia.instagram} className="text-gray-600 hover:text-blue-600">
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companyProfile.benefits.map((benefit, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{benefit.icon}</span>
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="culture" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Culture</CardTitle>
                <CardDescription>{companyProfile.culture.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {companyProfile.culture.values.map((value, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 text-center"
                    >
                      <h3 className="font-medium">{value}</h3>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="office" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companyProfile.officePhotos.map((photo, index) => (
                <div key={index} className="relative h-64 rounded-lg overflow-hidden">
                  <Image
                    src={photo}
                    alt={`Office Photo ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
} 
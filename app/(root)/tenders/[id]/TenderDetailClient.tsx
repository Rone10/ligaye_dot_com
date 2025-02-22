'use client';

import { motion } from 'framer-motion';
import { MapPin, Tag, Calendar, Clock, Heart, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Tender, SimilarTender } from '@/app/actions/tenders';
import Link from 'next/link';

interface TenderDetailClientProps {
  tender: Tender;
  similarTenders: SimilarTender[];
}

export default function TenderDetailClient({ tender, similarTenders }: TenderDetailClientProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 space-y-6"
          >
            {/* Tender Header */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{tender.title}</h1>
                    <Link href="#" className="text-blue-600 hover:underline">
                      {tender.organization}
                    </Link>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{tender.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  <span>{tender.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Deadline: {tender.deadline}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Posted: {tender.postedDate}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Apply for Tender
                </Button>
                <Button variant="outline">Save Tender</Button>
              </div>
            </div>

            {/* Tender Description */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Tender Description</h2>
              <p className="text-gray-600 mb-6">{tender.description}</p>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Scope of Work:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    {tender.scope.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Requirements:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    {tender.requirements.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Tender Documents */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Tender Documents</h2>
              <div className="space-y-3">
                {tender.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-600" />
                      </div>
                      <span className="font-medium">{doc.name}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-80 space-y-6"
          >
            {/* Tender Details */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Tender Details</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Budget Range</h3>
                  <p className="text-gray-600">
                    ${tender.budget.min}M - ${tender.budget.max}M {tender.budget.currency}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Sector</h3>
                  <p className="text-gray-600">Public Infrastructure</p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Contact Information</h3>
                  <div className="text-gray-600">
                    <p>{tender.contact.name}</p>
                    <p>{tender.contact.title}</p>
                    <p>Email: {tender.contact.email}</p>
                    <p>Phone: {tender.contact.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Similar Tenders */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Similar Tenders</h2>
              <div className="space-y-4">
                {similarTenders.map((tender) => (
                  <Link
                    key={tender.id}
                    href={`/tenders/${tender.id}`}
                    className="block group"
                  >
                    <h3 className="font-medium text-blue-600 group-hover:underline">
                      {tender.title}
                    </h3>
                    <p className="text-gray-600">{tender.organization}</p>
                    <p className="text-sm text-gray-500">
                      Deadline: {tender.deadline}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 
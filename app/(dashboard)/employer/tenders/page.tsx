// 'use client';

// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Input } from '@/components/ui/input';
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from '@/components/ui/accordion';
// import {
//   Calendar,
//   DollarSign,
//   Download,
//   FileText,
//   Plus,
//   Search,
//   Users,
// } from 'lucide-react';
// import { tenders, tenderStats, tenderFilters, type Tender } from '@/app/actions/employer/tenders-mock-data';

// export default function TendersPage() {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedStatus, setSelectedStatus] = useState('All');
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const [selectedDepartment, setSelectedDepartment] = useState('All');

//   // Filter tenders based on search and filters
//   const filteredTenders = tenders.filter((tender) => {
//     const matchesSearch = 
//       tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       tender.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       tender.description.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = selectedStatus === 'All' || tender.status === selectedStatus;
//     const matchesCategory = selectedCategory === 'All' || tender.category === selectedCategory;
//     const matchesDepartment = selectedDepartment === 'All' || tender.department === selectedDepartment;

//     return matchesSearch && matchesStatus && matchesCategory && matchesDepartment;
//   });

//   const getStatusColor = (status: Tender['status']) => {
//     switch (status) {
//       case 'Published':
//         return 'bg-green-50 text-green-600';
//       case 'Draft':
//         return 'bg-gray-50 text-gray-600';
//       case 'Under Review':
//         return 'bg-blue-50 text-blue-600';
//       case 'Awarded':
//         return 'bg-purple-50 text-purple-600';
//       case 'Closed':
//         return 'bg-red-50 text-red-600';
//       default:
//         return 'bg-gray-50 text-gray-600';
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="space-y-6"
//       >
//         {/* Header */}
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-bold mb-2">Tenders</h1>
//             <p className="text-gray-600">Manage and track your tender opportunities</p>
//           </div>
//           <Button className="bg-blue-600">
//             <Plus className="w-4 h-4 mr-2" />
//             Create Tender
//           </Button>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           {tenderStats.map((stat, index) => {
//             const Icon = stat.icon;
//             return (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//                 className="bg-white rounded-lg border p-6"
//               >
//                 <div className="flex items-center gap-4">
//                   <div className={`${stat.className} p-3 rounded-lg`}>
//                     <Icon className={`w-6 h-6 ${stat.iconColor}`} />
//                   </div>
//                   <div>
//                     <div className="text-2xl font-semibold">{stat.value}</div>
//                     <div className="text-gray-600">{stat.label}</div>
//                   </div>
//                 </div>
//               </motion.div>
//             );
//           })}
//         </div>

//         {/* Filters */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Search and Filter Tenders</CardTitle>
//             <CardDescription>Use the filters below to find specific tenders</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                 <Input
//                   placeholder="Search tenders..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-9"
//                 />
//               </div>
//               <Select value={selectedStatus} onValueChange={setSelectedStatus}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {tenderFilters.status.map((status) => (
//                     <SelectItem key={status} value={status}>
//                       {status}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <Select value={selectedCategory} onValueChange={setSelectedCategory}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {tenderFilters.category.map((category) => (
//                     <SelectItem key={category} value={category}>
//                       {category}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Department" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {tenderFilters.department.map((department) => (
//                     <SelectItem key={department} value={department}>
//                       {department}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <Button variant="outline" onClick={() => {
//                 setSearchTerm('');
//                 setSelectedStatus('All');
//                 setSelectedCategory('All');
//                 setSelectedDepartment('All');
//               }}>
//                 Reset Filters
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Tenders List */}
//         <div className="space-y-4">
//           {filteredTenders.map((tender) => (
//             <motion.div
//               key={tender.id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="bg-white rounded-lg border"
//             >
//               <Accordion type="single" collapsible>
//                 <AccordionItem value={tender.id}>
//                   <div className="p-6">
//                     <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
//                       <div className="space-y-1">
//                         <div className="flex items-center gap-2">
//                           <h3 className="text-lg font-semibold">{tender.title}</h3>
//                           <Badge className={getStatusColor(tender.status)}>
//                             {tender.status}
//                           </Badge>
//                         </div>
//                         <p className="text-sm text-gray-500">Reference: {tender.reference}</p>
//                       </div>
//                       <div className="flex flex-wrap gap-4 text-sm text-gray-600">
//                         <div className="flex items-center gap-1">
//                           <DollarSign className="w-4 h-4" />
//                           {tender.budget}
//                         </div>
//                         <div className="flex items-center gap-1">
//                           <Calendar className="w-4 h-4" />
//                           Deadline: {new Date(tender.deadline).toLocaleDateString()}
//                         </div>
//                         <div className="flex items-center gap-1">
//                           <Users className="w-4 h-4" />
//                           {tender.submissions} submissions
//                         </div>
//                       </div>
//                       <div className="flex gap-2">
//                         <Button variant="outline">Edit</Button>
//                         <Button>View Submissions</Button>
//                       </div>
//                     </div>
//                   </div>

//                   <AccordionTrigger className="px-6 text-sm text-gray-600">
//                     View Details
//                   </AccordionTrigger>
//                   <AccordionContent className="px-6 pb-6">
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                       <div className="space-y-4">
//                         <div>
//                           <h4 className="font-medium mb-2">Description</h4>
//                           <p className="text-gray-600">{tender.description}</p>
//                         </div>
//                         <div>
//                           <h4 className="font-medium mb-2">Requirements</h4>
//                           <ul className="list-disc list-inside text-gray-600 space-y-1">
//                             {tender.requirements.map((req, index) => (
//                               <li key={index}>{req}</li>
//                             ))}
//                           </ul>
//                         </div>
//                       </div>
//                       <div className="space-y-4">
//                         <div>
//                           <h4 className="font-medium mb-2">Documents</h4>
//                           <div className="space-y-2">
//                             {tender.documents.map((doc, index) => (
//                               <div
//                                 key={index}
//                                 className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
//                               >
//                                 <div className="flex items-center gap-2">
//                                   <FileText className="w-4 h-4 text-gray-600" />
//                                   <span className="text-sm">{doc.name}</span>
//                                   <span className="text-xs text-gray-500">({doc.size})</span>
//                                 </div>
//                                 <Button variant="ghost" size="sm">
//                                   <Download className="w-4 h-4" />
//                                 </Button>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                         <div>
//                           <h4 className="font-medium mb-2">Eligibility Criteria</h4>
//                           <ul className="list-disc list-inside text-gray-600 space-y-1">
//                             {tender.eligibilityCriteria.map((criteria, index) => (
//                               <li key={index}>{criteria}</li>
//                             ))}
//                           </ul>
//                         </div>
//                       </div>
//                     </div>
//                   </AccordionContent>
//                 </AccordionItem>
//               </Accordion>
//             </motion.div>
//           ))}
//         </div>
//       </motion.div>
//     </div>
//   );
// } 
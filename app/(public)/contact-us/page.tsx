"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { contactFormSchema, type ContactFormValues } from "./_utils/validation"; // Import from utils
import { sendContactMessage } from "./_actions"; // Import the actual server action

export default function ContactUsPage() {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitStatus, setSubmitStatus] = React.useState<{ success: boolean; message?: string; error?: string } | null>(null); // Allow error message

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
        },
    });

    async function onSubmit(values: ContactFormValues) {
        setIsSubmitting(true);
        setSubmitStatus(null);
        try {
            const result = await sendContactMessage(values);
            setSubmitStatus(result);
            if (result.success) {
                form.reset(); // Reset form on success
            }
        } catch (error) {
            console.error("Submission error:", error);
            setSubmitStatus({ success: false, error: "An error occurred. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    }

    const glassmorphicCardClass =
    "bg-white/70 dark:bg-black/60 backdrop-blur-lg border border-white/30 dark:border-black/40 rounded-2xl shadow-lg";

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <section className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-primary-blue dark:text-blue-400 mb-4">
                        Get In Touch
                    </h1>
                    <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                        Have questions or want to collaborate? Send us a message, and we'll get back to you soon.
                    </p>
                </section>

                {/* Contact Form and Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     {/* Contact Form Card */}
                    <Card className={glassmorphicCardClass}>
                        <CardHeader>
                            <CardTitle className="text-2xl font-semibold text-dark dark:text-light">Send Us a Message</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 dark:text-gray-300">Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Your Name" {...field} className="bg-white/80 dark:bg-black/70 border-gray-300 dark:border-gray-600 focus:border-primary-blue focus:ring-primary-blue/50 rounded-lg" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 dark:text-gray-300">Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="your.email@example.com" {...field} className="bg-white/80 dark:bg-black/70 border-gray-300 dark:border-gray-600 focus:border-primary-blue focus:ring-primary-blue/50 rounded-lg" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="subject"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 dark:text-gray-300">Subject</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Subject of your message" {...field} className="bg-white/80 dark:bg-black/70 border-gray-300 dark:border-gray-600 focus:border-primary-blue focus:ring-primary-blue/50 rounded-lg" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 dark:text-gray-300">Message</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Type your message here..."
                                                        rows={5}
                                                        {...field}
                                                        className="bg-white/80 dark:bg-black/70 border-gray-300 dark:border-gray-600 focus:border-primary-blue focus:ring-primary-blue/50 rounded-lg resize-none"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={isSubmitting} className="w-full bg-primary-blue hover:bg-primary-blue/90 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 rounded-lg">
                                        {isSubmitting ? "Sending..." : "Send Message"}
                                    </Button>
                                </form>
                            </Form>
                             {submitStatus && (
                                <p className={`mt-4 text-center text-sm font-medium ${submitStatus.success ? 'text-secondary-green dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {submitStatus.success ? submitStatus.message : submitStatus.error}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                     {/* Contact Info Section */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-dark dark:text-light mb-4">Contact Information</h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            Alternatively, you can reach us through the following channels (details are placeholders):
                        </p>
                        <div className="space-y-4">
                             <div className="flex items-start gap-4">
                                <div className="mt-1 flex-shrink-0 bg-primary-blue/10 dark:bg-blue-900/30 p-3 rounded-full">
                                    <Mail className="h-5 w-5 text-primary-blue dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-dark dark:text-light">Email</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">info@ligaye.com</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                 <div className="mt-1 flex-shrink-0 bg-primary-blue/10 dark:bg-blue-900/30 p-3 rounded-full">
                                    <Phone className="h-5 w-5 text-primary-blue dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-dark dark:text-light">Phone</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">+220 123 4567</p>
                                </div>
                            </div>
                           <div className="flex items-start gap-4">
                                <div className="mt-1 flex-shrink-0 bg-primary-blue/10 dark:bg-blue-900/30 p-3 rounded-full">
                                    <MapPin className="h-5 w-5 text-primary-blue dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-dark dark:text-light">Address</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">123 Job Lane, Serekunda, The Gambia (Placeholder)</p>
                                </div>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
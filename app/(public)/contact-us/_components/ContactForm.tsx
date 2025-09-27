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
import { contactFormSchema, type ContactFormValues } from "../_utils/validation";
import { sendContactMessage } from "../_actions";

export default function ContactForm() {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitStatus, setSubmitStatus] = React.useState<{ success: boolean; message?: string; error?: string } | null>(null);

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
        try {
            const result = await sendContactMessage(values);
            setSubmitStatus(result);
            
            if (result.success) {
                form.reset();
            }
        } catch (error) {
            setSubmitStatus({
                success: false,
                error: "Failed to send message. Please try again later.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const glassmorphicCardClass =
        'bg-white/70 dark:bg-black/60 backdrop-blur-lg border border-white/30 dark:border-black/40 rounded-2xl shadow-lg';

    return (
        <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--bg-gradient-from))] to-[hsl(var(--bg-gradient-to))] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <section className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-primary-blue mb-4">
                        Contact Us
                    </h1>
                    <p className="text-lg text-theme-gray-dark max-w-2xl mx-auto">
                        Have a question or feedback? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
                    </p>
                </section>

                {/* Contact Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <Card className={glassmorphicCardClass}>
                        <CardContent className="p-6 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-blue/10 mb-4">
                                <Mail className="h-6 w-6 text-primary-blue" />
                            </div>
                            <h3 className="font-semibold text-theme-dark mb-1">Email</h3>
                            <p className="text-theme-gray-dark text-sm">support@ligaye.com</p>
                        </CardContent>
                    </Card>

                    <Card className={glassmorphicCardClass}>
                        <CardContent className="p-6 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-blue/10 mb-4">
                                <Phone className="h-6 w-6 text-primary-blue" />
                            </div>
                            <h3 className="font-semibold text-theme-dark mb-1">Phone</h3>
                            <p className="text-theme-gray-dark text-sm">+220 123 4567</p>
                        </CardContent>
                    </Card>

                    <Card className={glassmorphicCardClass}>
                        <CardContent className="p-6 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-blue/10 mb-4">
                                <MapPin className="h-6 w-6 text-primary-blue" />
                            </div>
                            <h3 className="font-semibold text-theme-dark mb-1">Location</h3>
                            <p className="text-theme-gray-dark text-sm">Banjul, The Gambia</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Form */}
                <Card className={glassmorphicCardClass}>
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Send us a Message</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="Your name" 
                                                        {...field}
                                                        className="bg-white/50 dark:bg-black/50 backdrop-blur-sm"
                                                    />
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
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="email" 
                                                        placeholder="your@email.com" 
                                                        {...field}
                                                        className="bg-white/50 dark:bg-black/50 backdrop-blur-sm"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="subject"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subject</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="What is this about?" 
                                                    {...field}
                                                    className="bg-white/50 dark:bg-black/50 backdrop-blur-sm"
                                                />
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
                                            <FormLabel>Message</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Your message..."
                                                    className="min-h-[150px] bg-white/50 dark:bg-black/50 backdrop-blur-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Status Messages */}
                                {submitStatus && (
                                    <div className={`p-4 rounded-lg ${
                                        submitStatus.success 
                                            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                                            : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                    }`}>
                                        {submitStatus.success 
                                            ? submitStatus.message 
                                            : submitStatus.error
                                        }
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary-blue hover:bg-primary-blue-light text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                                >
                                    {isSubmitting ? "Sending..." : "Send Message"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
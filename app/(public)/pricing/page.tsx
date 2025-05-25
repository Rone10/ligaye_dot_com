import { Check, Star, Phone, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - Ligaye.com | Job Board for The Gambia',
  description: 'Simple, transparent pricing for job posting in The Gambia. Choose from one-off postings at D3,500 or unlimited annual subscriptions at D35,000. Special launch offer: 2 months free!',
  keywords: 'job posting pricing, Gambia jobs, employment costs, recruitment pricing, job board subscription',
  openGraph: {
    title: 'Pricing - Ligaye.com',
    description: 'Simple, transparent pricing for job posting in The Gambia. Special launch offer: 2 months free!',
    type: 'website',
  },
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e9efff] to-[#f4f7ff]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4a6cfa]/5 to-[#05ce91]/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Badge className="bg-[#05ce91]/10 text-[#00ABE4] border-[#05ce91]/20 px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Limited Time Launch Offer
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1e2d] mb-6 leading-tight">
              Simple, Transparent
              <span className="block text-[#4a6cfa]">Pricing</span>
            </h1>
            <p className="text-lg md:text-xl text-[#9aa3bc] max-w-3xl mx-auto leading-relaxed">
              Choose the perfect plan for your hiring needs. Start posting jobs today and connect with top talent in The Gambia.
            </p>
          </div>
        </div>
      </div>

      {/* Launch Promo Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4a6cfa] to-[#7b90ff] p-8 text-center">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          <div className="relative">
            <div className="flex justify-center mb-4">
              <Star className="w-8 h-8 text-yellow-300 fill-current" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              🎉 Big Launch Celebration!
            </h2>
            <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
              Get <strong>2 months of FREE posting</strong> during our launch period
            </p>
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
              <span className="text-sm">Valid from June 1, 2025 to July 30, 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          
          {/* One-off Posting */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4a6cfa]/20 to-[#7b90ff]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="relative bg-white/70 backdrop-blur-[10px] border border-white/30 rounded-2xl p-8 shadow-[0_8px_32px_rgba(31,38,135,0.1)] hover:shadow-[0_15px_35px_rgba(31,38,135,0.15)] transition-all duration-300 hover:-translate-y-2">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#1a1e2d] mb-4">One-off Posting</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-[#4a6cfa]">D3,500</span>
                  <span className="text-[#9aa3bc] text-lg ml-2">per job</span>
                </div>
                <p className="text-[#9aa3bc] mb-8 leading-relaxed">
                  Perfect for occasional hiring needs. Post a single job and reach qualified candidates.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-[#05ce91] mr-3 flex-shrink-0" />
                    <span className="text-[#1a1e2d]">30-day job visibility</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-[#05ce91] mr-3 flex-shrink-0" />
                    <span className="text-[#1a1e2d]">Unlimited applications</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-[#05ce91] mr-3 flex-shrink-0" />
                    <span className="text-[#1a1e2d]">Basic applicant filtering</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-[#05ce91] mr-3 flex-shrink-0" />
                    <span className="text-[#1a1e2d]">Email notifications</span>
                  </div>
                </div>

                <Button className="w-full bg-[#4a6cfa] hover:bg-[#7b90ff] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                  Get Started
                </Button>
              </div>
            </div>
          </div>

          {/* Annual Subscription - Most Popular */}
          <div className="relative group">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-[#05ce91] text-white px-4 py-2 text-sm font-semibold shadow-lg">
                Most Popular
              </Badge>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#05ce91]/20 to-[#4a6cfa]/20 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500" />
            <div className="relative bg-white/80 backdrop-blur-[10px] border-2 border-[#05ce91]/30 rounded-2xl p-8 shadow-[0_15px_35px_rgba(31,38,135,0.15)] hover:shadow-[0_24px_48px_rgba(31,38,135,0.2)] transition-all duration-300 hover:-translate-y-2 scale-105">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#1a1e2d] mb-4">Annual Subscription</h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-[#05ce91]">D35,000</span>
                  <span className="text-[#9aa3bc] text-lg ml-2">per year</span>
                </div>
                <div className="mb-6">
                  <span className="text-sm text-[#05ce91] font-semibold bg-[#05ce91]/10 px-3 py-1 rounded-full">
                    Save 2 months (17% off)
                  </span>
                </div>
                <p className="text-[#9aa3bc] mb-8 leading-relaxed">
                  Best value for active recruiters. Unlimited job postings with premium features.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-[#05ce91] mr-3 flex-shrink-0" />
                    <span className="text-[#1a1e2d] font-medium">Unlimited job postings</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-[#05ce91] mr-3 flex-shrink-0" />
                    <span className="text-[#1a1e2d]">Extended 60-day visibility</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-[#05ce91] mr-3 flex-shrink-0" />
                    <span className="text-[#1a1e2d]">Advanced applicant filtering</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-[#05ce91] mr-3 flex-shrink-0" />
                    <span className="text-[#1a1e2d]">Priority customer support</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-[#05ce91] mr-3 flex-shrink-0" />
                    <span className="text-[#1a1e2d]">Analytics dashboard</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-[#05ce91] mr-3 flex-shrink-0" />
                    <span className="text-[#1a1e2d]">Featured job listings</span>
                  </div>
                </div>

                <Button className="w-full bg-[#05ce91] hover:bg-[#05ce91]/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                  Start Free Trial
                </Button>
              </div>
            </div>
          </div>

          {/* Enterprise/Contact Sales */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#9aa3bc]/20 to-[#1a1e2d]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="relative bg-white/70 backdrop-blur-[10px] border border-white/30 rounded-2xl p-8 shadow-[0_8px_32px_rgba(31,38,135,0.1)] hover:shadow-[0_15px_35px_rgba(31,38,135,0.15)] transition-all duration-300 hover:-translate-y-2">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#1a1e2d] mb-4">Enterprise</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-[#1a1e2d]">Custom</span>
                  <span className="text-[#9aa3bc] text-lg ml-2">pricing</span>
                </div>
                <p className="text-[#9aa3bc] mb-8 leading-relaxed">
                  Tailored solutions for large organizations with specific requirements.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-[#05ce91] mr-3 flex-shrink-0" />
                    <span className="text-[#1a1e2d]">Custom job posting limits</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-[#05ce91] mr-3 flex-shrink-0" />
                    <span className="text-[#1a1e2d]">Dedicated account manager</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-[#05ce91] mr-3 flex-shrink-0" />
                    <span className="text-[#1a1e2d]">API access</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-[#05ce91] mr-3 flex-shrink-0" />
                    <span className="text-[#1a1e2d]">Custom integrations</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-[#05ce91] mr-3 flex-shrink-0" />
                    <span className="text-[#1a1e2d]">White-label options</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-[#05ce91] mr-3 flex-shrink-0" />
                    <span className="text-[#1a1e2d]">24/7 priority support</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full border-[#1a1e2d] text-[#1a1e2d] hover:bg-[#1a1e2d] hover:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1e2d] mb-6">
            Frequently Asked Questions
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/70 backdrop-blur-[10px] border border-white/30 rounded-xl p-6 text-left">
                <h3 className="font-semibold text-[#1a1e2d] mb-3">What payment methods do you accept?</h3>
                <p className="text-[#9aa3bc] leading-relaxed">We accept Stripe payments (credit/debit cards) and cash payments. For cash payments, please contact our sales team.</p>
              </div>
              <div className="bg-white/70 backdrop-blur-[10px] border border-white/30 rounded-xl p-6 text-left">
                <h3 className="font-semibold text-[#1a1e2d] mb-3">Can I upgrade or downgrade my plan?</h3>
                <p className="text-[#9aa3bc] leading-relaxed">Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the next billing cycle.</p>
              </div>
              <div className="bg-white/70 backdrop-blur-[10px] border border-white/30 rounded-xl p-6 text-left">
                <h3 className="font-semibold text-[#1a1e2d] mb-3">How long are jobs visible?</h3>
                <p className="text-[#9aa3bc] leading-relaxed">One-off postings are visible for 30 days, while annual subscription jobs get extended 60-day visibility for better reach.</p>
              </div>
              <div className="bg-white/70 backdrop-blur-[10px] border border-white/30 rounded-xl p-6 text-left">
                <h3 className="font-semibold text-[#1a1e2d] mb-3">Is there a free trial?</h3>
                <p className="text-[#9aa3bc] leading-relaxed">Yes! During our launch period (June 1 - July 30, 2025), enjoy 2 months of free posting. After that, we offer a 14-day free trial for annual subscriptions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <div className="bg-white/70 backdrop-blur-[10px] border border-white/30 rounded-2xl p-12 shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1e2d] mb-6">
              Ready to Find Your Next Great Hire?
            </h2>
            <p className="text-lg text-[#9aa3bc] mb-8 max-w-2xl mx-auto leading-relaxed">
              Join hundreds of employers who trust Ligaye.com to connect them with top talent in The Gambia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#4a6cfa] hover:bg-[#7b90ff] text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                Start Posting Jobs
              </Button>
              <Button variant="outline" className="border-[#9aa3bc] text-[#9aa3bc] hover:bg-[#9aa3bc] hover:text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
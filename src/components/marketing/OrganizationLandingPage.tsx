'use client';

import { 
  ArrowRight,
  Award, 
  Calendar,
  CheckCircle, 
  DollarSign,
  Gift,
  GraduationCap, 
  TrendingUp, 
  Users} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface Campaign {
  id: string;
  name: string;
  campaign_type: string;
  description: string;
  discount_type: string;
  discount_value: number;
  promo_code: string;
  end_date: string;
  current_redemptions: number;
  max_redemptions: number;
}

interface Fee {
  fee_type: string;
  amount: number;
  description: string;
  payment_frequency: string;
}

interface Props {
  organization: any;
  landingPage: any;
  campaigns: Campaign[];
  fees: Fee[];
}

export default function OrganizationLandingPage({ 
  organization, 
  landingPage,
  campaigns,
  fees 
}: Props) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    campaigns[0] || null
  );

  const stats = landingPage?.stats || {
    students: 0,
    teachers: 0,
    years: 0,
    satisfaction: 98
  };

  const registrationFee = fees.find(f => f.fee_type === 'registration_fee');
  const discountedAmount = selectedCampaign && registrationFee
    ? selectedCampaign.discount_type === 'percentage'
      ? registrationFee.amount * (1 - selectedCampaign.discount_value / 100)
      : registrationFee.amount - selectedCampaign.discount_value
    : registrationFee?.amount || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        {landingPage?.hero_image_url && (
          <div className="absolute inset-0 opacity-20">
            <Image
              src={landingPage.hero_image_url}
              alt="Hero"
              fill
              className="object-cover"
            />
          </div>
        )}
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {organization.logo_url && (
              <div className="mb-8 flex justify-center">
                <Image
                  src={organization.logo_url}
                  alt={organization.name}
                  width={120}
                  height={120}
                  className="rounded-full shadow-2xl"
                />
              </div>
            )}
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {landingPage?.hero_title || `Welcome to ${organization.name}`}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              {landingPage?.hero_subtitle || organization.registration_message}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-white text-blue-600 hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
              >
                {landingPage?.hero_cta_text || 'Register Now'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              
              <a
                href="#pricing"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg border-2 border-white text-white hover:bg-white/10 transition-all"
              >
                View Pricing
              </a>
            </div>

            {/* Campaign Banner */}
            {selectedCampaign && (
              <div className="mt-8 inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full font-semibold shadow-lg">
                <Gift className="h-5 w-5" />
                <span>{selectedCampaign.name} - Save {selectedCampaign.discount_value}%!</span>
              </div>
            )}
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900">{stats.students}+</div>
              <div className="text-gray-600 mt-1">Students</div>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <GraduationCap className="h-12 w-12 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900">{stats.teachers}+</div>
              <div className="text-gray-600 mt-1">Teachers</div>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Award className="h-12 w-12 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900">{stats.years}+</div>
              <div className="text-gray-600 mt-1">Years</div>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <TrendingUp className="h-12 w-12 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900">{stats.satisfaction}%</div>
              <div className="text-gray-600 mt-1">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Campaigns Section */}
      {campaigns.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-yellow-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                🎉 Special Offers
              </h2>
              <p className="text-xl text-gray-600">
                Limited time promotions - Register today and save!
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {campaigns.map((campaign) => {
                const spotsLeft = campaign.max_redemptions 
                  ? campaign.max_redemptions - campaign.current_redemptions 
                  : null;
                const isLimited = spotsLeft && spotsLeft <= 20;

                return (
                  <div 
                    key={campaign.id}
                    className="bg-white rounded-2xl shadow-xl p-8 border-2 border-yellow-400 relative overflow-hidden hover:shadow-2xl transition-shadow"
                  >
                    {isLimited && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 text-sm font-bold">
                        Only {spotsLeft} spots left!
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <Gift className="h-8 w-8 text-yellow-500" />
                      <h3 className="text-2xl font-bold text-gray-900">
                        {campaign.name}
                      </h3>
                    </div>

                    <p className="text-gray-600 mb-6">{campaign.description}</p>

                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-6 mb-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-orange-600 mb-2">
                          {campaign.discount_value}%
                        </div>
                        <div className="text-gray-700 font-semibold">OFF</div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Code: <strong>{campaign.promo_code}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>Valid until {new Date(campaign.end_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <Link
                      href={`/register?promo=${campaign.promo_code}`}
                      className="block w-full text-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105"
                    >
                      Apply & Register
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              No hidden fees. All costs clearly outlined.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {registrationFee && (
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Registration Fee
                    </h3>
                    <p className="text-gray-600">{registrationFee.description}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>

                <div className="flex items-baseline gap-4">
                  {selectedCampaign ? (
                    <>
                      <div className="text-3xl font-bold text-gray-400 line-through">
                        R{registrationFee.amount.toFixed(2)}
                      </div>
                      <div className="text-5xl font-bold text-green-600">
                        R{discountedAmount.toFixed(2)}
                      </div>
                      <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Save R{(registrationFee.amount - discountedAmount).toFixed(2)}
                      </div>
                    </>
                  ) : (
                    <div className="text-5xl font-bold text-gray-900">
                      R{registrationFee.amount.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                All Fees for 2026
              </h3>
              
              <div className="space-y-4">
                {fees.map((fee, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center py-4 border-b last:border-b-0"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">
                        {fee.fee_type.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600">{fee.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {fee.payment_frequency}
                      </div>
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      R{fee.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Join {organization.name}?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Secure your child's spot for the 2026 academic year today.
          </p>
          
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold rounded-lg bg-white text-blue-600 hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
          >
            Start Registration
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>

          {selectedCampaign && (
            <div className="mt-6 text-yellow-300 font-semibold">
              💰 Use code <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded">{selectedCampaign.promo_code}</span> to save {selectedCampaign.discount_value}%
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

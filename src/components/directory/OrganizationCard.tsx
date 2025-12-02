'use client';

import { Calendar, GraduationCap, MapPin, Tag,TrendingUp, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface OrganizationCardProps {
  id: string;
  name: string;
  slug: string;
  organizationType: string;
  tagline?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  city?: string;
  province?: string;
  establishedYear?: number;
  totalStudents?: number;
  totalTeachers?: number;
  featured?: boolean;
  activeCampaignsCount?: number;
  bestDiscountPercentage?: number;
  registrationFee?: number;
  monthlyTuition?: number;
}

const organizationTypeLabels: Record<string, string> = {
  preschool: 'Preschool',
  primary_school: 'Primary School',
  high_school: 'High School',
  combined_school: 'Combined School',
  fet_college: 'FET College',
  training_center: 'Training Center',
  university: 'University',
  other: 'Educational Institution',
};

const organizationTypeColors: Record<string, string> = {
  preschool: 'bg-pink-100 text-pink-800 border-pink-200',
  primary_school: 'bg-blue-100 text-blue-800 border-blue-200',
  high_school: 'bg-purple-100 text-purple-800 border-purple-200',
  combined_school: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  fet_college: 'bg-green-100 text-green-800 border-green-200',
  training_center: 'bg-orange-100 text-orange-800 border-orange-200',
  university: 'bg-red-100 text-red-800 border-red-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function OrganizationCard({
  name,
  slug,
  organizationType,
  tagline,
  logoUrl,
  primaryColor = '#3B82F6',
  city,
  province,
  establishedYear,
  totalStudents,
  totalTeachers,
  featured,
  activeCampaignsCount,
  bestDiscountPercentage,
  registrationFee,
  monthlyTuition,
}: OrganizationCardProps) {
  const typeLabel = organizationTypeLabels[organizationType] || organizationType;
  const typeColorClass = organizationTypeColors[organizationType] || organizationTypeColors.other;

  return (
    <Link href={`/${slug}`}>
      <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-gray-300 h-full flex flex-col">
        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Featured
          </div>
        )}

        {/* Active Campaign Badge */}
        {activeCampaignsCount !== undefined && activeCampaignsCount > 0 && bestDiscountPercentage && (
          <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1 animate-pulse">
            <Tag className="w-3 h-3" />
            {bestDiscountPercentage}% OFF
          </div>
        )}

        {/* Header with Logo */}
        <div 
          className="h-32 relative flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}30 100%)`,
          }}
        >
          {logoUrl ? (
            <div className="relative w-20 h-20 rounded-full bg-white shadow-lg overflow-hidden border-4 border-white">
              <Image
                src={logoUrl}
                alt={`${name} logo`}
                fill
                className="object-contain p-2"
              />
            </div>
          ) : (
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Organization Type Badge */}
          <div className="mb-3">
            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold border ${typeColorClass}`}>
              {typeLabel}
            </span>
          </div>

          {/* Name */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {name}
          </h3>

          {/* Tagline */}
          {tagline && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
              {tagline}
            </p>
          )}

          {/* Location */}
          {(city || province) && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {[city, province].filter(Boolean).join(', ')}
              </span>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-gray-100">
            {/* Students */}
            {totalStudents !== undefined && totalStudents > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Students</div>
                  <div className="text-sm font-semibold text-gray-900">{totalStudents}</div>
                </div>
              </div>
            )}

            {/* Teachers */}
            {totalTeachers !== undefined && totalTeachers > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Teachers</div>
                  <div className="text-sm font-semibold text-gray-900">{totalTeachers}</div>
                </div>
              </div>
            )}

            {/* Established */}
            {establishedYear && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Since</div>
                  <div className="text-sm font-semibold text-gray-900">{establishedYear}</div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing */}
          {(registrationFee || monthlyTuition) && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              {registrationFee && (
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Registration</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {bestDiscountPercentage ? (
                      <>
                        <span className="line-through text-gray-400 text-xs mr-1">
                          R{registrationFee.toFixed(2)}
                        </span>
                        <span className="text-green-600">
                          R{(registrationFee * (1 - bestDiscountPercentage / 100)).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      `R${registrationFee.toFixed(2)}`
                    )}
                  </span>
                </div>
              )}
              {monthlyTuition && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Monthly</span>
                  <span className="text-sm font-semibold text-gray-900">
                    R{monthlyTuition.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div 
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-center text-white transition-all duration-300 group-hover:shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              View Details →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

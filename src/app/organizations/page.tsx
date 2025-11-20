'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  BookOpen,
  Briefcase,
  Building2,
  Filter,
  GraduationCap,
  Mail,
  MapPin,
  School,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import OrganizationCard from '@/components/directory/OrganizationCard';

type OrganizationType = 'all' | 'preschool' | 'primary_school' | 'high_school' | 'combined_school' | 'fet_college' | 'training_center' | 'university';

interface Organization {
  id: string;
  name: string;
  slug: string;
  organization_type: string;
  tagline?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  city?: string;
  province?: string;
  established_year?: number;
  total_students?: number;
  total_teachers?: number;
  featured?: boolean;
  active_campaigns_count?: number;
  best_discount_percentage?: number;
  registration_fee?: number;
  monthly_tuition?: number;
}

interface DirectoryStats {
  total_organizations: number;
  by_type: Record<string, number>;
  by_province: Record<string, number>;
  total_students: number;
  total_teachers: number;
  featured_count: number;
}

const categoryFilters = [
  { id: 'all', label: 'All Schools', icon: School, color: 'blue', comingSoon: false },
  { id: 'preschool', label: 'Preschools', icon: Building2, color: 'pink', comingSoon: false },
  { id: 'primary_school', label: 'Primary Schools', icon: BookOpen, color: 'blue', comingSoon: true },
  { id: 'high_school', label: 'High Schools', icon: GraduationCap, color: 'purple', comingSoon: true },
  { id: 'fet_college', label: 'FET Colleges', icon: Briefcase, color: 'green', comingSoon: true },
  { id: 'training_center', label: 'Training Centers', icon: Users, color: 'orange', comingSoon: false },
];

const provinces = [
  'All Provinces',
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
];

const sortOptions = [
  { id: 'featured', label: 'Featured First' },
  { id: 'name_asc', label: 'A to Z' },
  { id: 'name_desc', label: 'Z to A' },
  { id: 'students_desc', label: 'Most Students' },
  { id: 'newest', label: 'Newest' },
];

const SALES_EMAIL = 'sales@edudashpro.org.za';

export default function OrganizationsDirectory() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [stats, setStats] = useState<DirectoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<OrganizationType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchOrganizations();
    fetchStats();
  }, [selectedCategory, searchQuery, selectedProvince]);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_organizations_by_category', {
        p_category: selectedCategory === 'all' ? null : selectedCategory,
        p_search: searchQuery || null,
        p_province: selectedProvince === 'All Provinces' ? null : selectedProvince,
        p_limit: 50,
        p_offset: 0,
      });

      if (error) throw error;

      // Client-side sorting
      const sorted = sortOrganizations(data || [], sortBy);
      setOrganizations(sorted);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_directory_stats');
      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const sortOrganizations = (orgs: Organization[], sort: string) => {
    const sorted = [...orgs];
    
    switch (sort) {
      case 'name_asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'students_desc':
        return sorted.sort((a, b) => (b.total_students || 0) - (a.total_students || 0));
      case 'newest':
        return sorted.sort((a, b) => (b.established_year || 0) - (a.established_year || 0));
      case 'featured':
      default:
        return sorted.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return a.name.localeCompare(b.name);
        });
    }
  };

  useEffect(() => {
    const sorted = sortOrganizations(organizations, sortBy);
    setOrganizations(sorted);
  }, [sortBy]);

  const getCategoryCount = (categoryId: string) => {
    if (!stats?.by_type) return 0;
    if (categoryId === 'all') return stats.total_organizations;
    return stats.by_type[categoryId] || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-stone-900 dark:to-stone-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold text-blue-50">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 backdrop-blur">
                <Image src="/icons/favicon-32x32.png" alt="EduDash Pro" width={20} height={20} className="h-5 w-5" />
                EduDash Pro Network
              </span>
              <a
                href={`mailto:${SALES_EMAIL}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-blue-700 shadow-lg shadow-blue-900/20 transition hover:bg-blue-50"
              >
                <Mail className="h-4 w-4" />
                {SALES_EMAIL}
              </a>
            </div>
            <h1 className="text-5xl font-bold mb-4 text-white">
              Discover Educational Excellence
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Browse through our network of {stats?.total_organizations || 0}+ registered educational institutions across South Africa
            </p>

            {/* Stats Banner */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold">{stats.total_organizations}</div>
                  <div className="text-sm text-blue-100 mt-1">Institutions</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold">{stats.total_students?.toLocaleString() || 0}</div>
                  <div className="text-sm text-blue-100 mt-1">Students</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold">{stats.total_teachers?.toLocaleString() || 0}</div>
                  <div className="text-sm text-blue-100 mt-1">Teachers</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold">{Object.keys(stats.by_province || {}).length}</div>
                  <div className="text-sm text-blue-100 mt-1">Provinces</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-stone-800 rounded-xl shadow-md p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
            />
          </div>

          {/* Filter Toggle (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 dark:bg-stone-700 rounded-lg mb-4 text-stone-900 dark:text-stone-100"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {/* Filters (Desktop always visible, Mobile toggle) */}
          <div className={`space-y-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
            {/* Province Filter */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 flex-shrink-0">
                <MapPin className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="border border-gray-300 dark:border-stone-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
                >
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 dark:border-stone-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-max">
            {categoryFilters.map((filter) => {
              const Icon = filter.icon;
              const isActive = selectedCategory === filter.id;
              const count = getCategoryCount(filter.id);

              return (
                <button
                  key={filter.id}
                  onClick={() => !filter.comingSoon && setSelectedCategory(filter.id as OrganizationType)}
                  disabled={filter.comingSoon}
                  className={`
                    relative flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200
                    ${filter.comingSoon
                      ? 'bg-gray-200 dark:bg-stone-700 text-gray-400 dark:text-stone-500 cursor-not-allowed opacity-60'
                      : isActive
                      ? `bg-${filter.color}-600 text-white shadow-lg scale-105`
                      : 'bg-white dark:bg-stone-800 text-gray-700 dark:text-stone-300 hover:bg-gray-50 dark:hover:bg-stone-700 border border-gray-200 dark:border-stone-600'
                    }
                  `}
                  style={
                    !filter.comingSoon && isActive
                      ? {
                          backgroundColor: filter.color === 'blue' ? '#2563eb' :
                                          filter.color === 'pink' ? '#ec4899' :
                                          filter.color === 'purple' ? '#9333ea' :
                                          filter.color === 'green' ? '#16a34a' :
                                          filter.color === 'orange' ? '#ea580c' : '#2563eb'
                        }
                      : {}
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{filter.label}</span>
                  {filter.comingSoon ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                      Coming Soon
                    </span>
                  ) : (
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-bold
                      ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-stone-700'}
                    `}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{organizations.length}</span> {selectedCategory === 'all' ? 'institutions' : categoryFilters.find(f => f.id === selectedCategory)?.label.toLowerCase()}
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedProvince !== 'All Provinces' && ` in ${selectedProvince}`}
          </p>
        </div>

        {/* Organizations Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md h-96 animate-pulse">
                <div className="h-32 bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : organizations.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <School className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No organizations found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Try adjusting your filters or search query to find what you&apos;re looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <OrganizationCard
                key={org.id}
                id={org.id}
                name={org.name}
                slug={org.slug}
                organizationType={org.organization_type}
                tagline={org.tagline}
                logoUrl={org.logo_url}
                primaryColor={org.primary_color}
                secondaryColor={org.secondary_color}
                city={org.city}
                province={org.province}
                establishedYear={org.established_year}
                totalStudents={org.total_students}
                totalTeachers={org.total_teachers}
                featured={org.featured}
                activeCampaignsCount={org.active_campaigns_count}
                bestDiscountPercentage={org.best_discount_percentage}
                registrationFee={org.registration_fee}
                monthlyTuition={org.monthly_tuition}
              />
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Want Your Institution Listed?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our growing network of educational institutions and reach more students and parents across South Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`mailto:${SALES_EMAIL}`}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Contact Sales
            </a>
            <a
              href="/pricing"
              className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors border border-white/20"
            >
              View Pricing
            </a>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3 text-sm text-blue-100">
            <Image src="/icons/favicon-32x32.png" alt="EduDash Pro" width={28} height={28} className="h-7 w-7" />
            <span>We respond within one business day – {SALES_EMAIL}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

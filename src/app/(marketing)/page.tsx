import { ArrowRight, CheckCircle2, Facebook, Instagram, Linkedin, Mail, Phone, School, Star, Twitter } from 'lucide-react';
import Link from 'next/link';

import { formatZAR, PRICING_TIERS } from '@/lib/pricing';

export default function Home() {
  const TENANT_ONBOARDING_ROUTE = '/onboarding';

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-stone-800 to-stone-900 px-4 py-20 text-white md:py-32">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            {/* Schools Live Badge */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2">
              <span className="text-sm font-bold uppercase tracking-wide">🏫 Schools</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
                LIVE
              </span>
            </div>

            <div className="mb-4 inline-block rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold">
              🎉 Limited Time: Save up to 33% with Bulk Packages
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              NCF-Aligned Websites for
              <br />
              <span className="text-amber-300">South African ECD Centres</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-stone-200 md:text-xl">
              Professional website creation for Early Childhood Development centres. POPIA-compliant, mobile-responsive, and ready in 48 hours. Showcase your NCF curriculum and connect with parents seamlessly.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={TENANT_ONBOARDING_ROUTE}
                className="rounded-lg bg-amber-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-amber-700 hover:shadow-lg"
              >
                Register Your Centre →
              </Link>
              <Link
                href="/organizations"
                className="rounded-lg border-2 border-white px-8 py-4 text-lg font-semibold transition-all hover:bg-white hover:text-stone-800 flex items-center gap-2"
              >
                <School className="h-5 w-5" />
                Browse Our Schools
              </Link>
            </div>
            <p className="mt-4 text-sm text-stone-400">
              ✓ No credit card required  ✓ Setup in 48 hours  ✓ Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-stone-200 bg-white px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-amber-600">100+</div>
              <div className="text-stone-600">ECD Centres Served</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-amber-600">6</div>
              <div className="text-stone-600">NCF Pillars Covered</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-amber-600">33%</div>
              <div className="text-stone-600">Bulk Discount Savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="bg-stone-50 px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-stone-900 md:text-4xl">
              Affordable Packages for Every Need
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-stone-600">
              Professional websites starting from {formatZAR(2999)}. Save more with bulk packages.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`rounded-2xl bg-white p-8 shadow-lg ${
                  tier.popular ? 'ring-4 ring-amber-500' : ''
                }`}
              >
                {tier.popular && (
                  <div className="mb-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                    Most Popular
                  </div>
                )}
                <h3 className="mb-2 text-2xl font-bold text-stone-900">{tier.name}</h3>
                <div className="mb-6">
                  <div className="mb-2 text-4xl font-bold text-stone-900">
                    {formatZAR(tier.setupFee)}
                  </div>
                  <div className="text-stone-600">Setup fee</div>
                  <div className="mt-2 text-lg">
                    {formatZAR(tier.monthlyPerCentre)}
                    <span className="text-stone-600">/month per centre</span>
                  </div>
                </div>
                <ul className="mb-8 space-y-3">
                  {tier.features.slice(0, 4).map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="mt-1 mr-2 h-5 w-5 flex-shrink-0 text-amber-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-stone-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing"
                  className="block w-full rounded-lg bg-amber-600 py-3 text-center font-semibold text-white transition-colors hover:bg-amber-700"
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NCF Section */}
      <section className="bg-gradient-to-br from-stone-900 to-stone-800 px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Aligned with South Africa&apos;s National Curriculum Framework
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-stone-300">
              Our templates are designed around the six pillars of early learning and development.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Well-being', icon: '❤️', color: 'red', slug: 'welcome-play' },
              { title: 'Identity & Belonging', icon: '🤝', color: 'blue', slug: 'bright-start' },
              { title: 'Communication', icon: '💬', color: 'purple', slug: 'storytime' },
              { title: 'Mathematics', icon: '🔢', color: 'indigo', slug: 'coding-blocks' },
              { title: 'Creativity', icon: '🎨', color: 'pink', slug: 'digital-storytellers' },
              {
                title: 'Knowledge of the World',
                icon: '🌍',
                color: 'green',
                slug: 'little-engineers',
              },
            ].map((pillar, idx) => (
              <Link
                key={idx}
                href={`/templates/${pillar.slug}`}
                className="group rounded-lg border-2 border-stone-700 bg-stone-800/50 p-6 backdrop-blur transition-all hover:scale-105 hover:border-amber-500 hover:bg-stone-700/50"
              >
                <div className="mb-3 text-4xl">{pillar.icon}</div>
                <h3 className="text-lg font-semibold text-white group-hover:text-amber-400">
                  {pillar.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-stone-900 md:text-4xl">
              Trusted by ECD Centres Across South Africa
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-stone-600">
              See what principals and educators are saying about EduSitePro
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-stone-50 p-6 shadow-md">
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mb-4 text-stone-700">
                &quot;EduSitePro transformed our online presence. Parents love the easy registration and we&apos;ve seen a 40% increase in enquiries!&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200 font-bold text-amber-800">
                  YE
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Young Eagles Preschool</div>
                  <div className="text-sm text-stone-600">Pretoria, Gauteng</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-stone-50 p-6 shadow-md">
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mb-4 text-stone-700">
                &quot;The NCF-aligned templates saved us weeks of work. Our website now properly showcases our curriculum and POPIA compliance.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-200 font-bold text-blue-800">
                  LS
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Little Stars Academy</div>
                  <div className="text-sm text-stone-600">Johannesburg, Gauteng</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-stone-50 p-6 shadow-md">
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mb-4 text-stone-700">
                &quot;The bulk discount was perfect for our group of 5 centres. Professional support throughout the setup process.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-200 font-bold text-green-800">
                  SE
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Sunshine Education Group</div>
                  <div className="text-sm text-stone-600">Cape Town, Western Cape</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-y border-stone-200 bg-stone-50 px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 text-center md:grid-cols-4">
            <div>
              <div className="mb-2 text-3xl font-bold text-amber-600">100%</div>
              <div className="text-sm text-stone-600">POPIA Compliant</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-amber-600">24/7</div>
              <div className="text-sm text-stone-600">Support Available</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-amber-600">4.9★</div>
              <div className="text-sm text-stone-600">Average Rating</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-amber-600">48h</div>
              <div className="text-sm text-stone-600">Setup Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Social Links */}
      <section className="bg-gradient-to-r from-stone-800 to-stone-900 px-4 py-16 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ready to Get Your ECD Centre Online?
          </h2>
          <p className="mb-8 text-lg text-stone-200">
            Join 100+ South African ECD centres with professional, NCF-aligned websites.
          </p>
          <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/bulk"
              className="inline-block rounded-lg bg-amber-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-amber-700 hover:shadow-lg"
            >
              Get Bulk Quote
            </Link>
            <Link
              href={TENANT_ONBOARDING_ROUTE}
              className="inline-block rounded-lg border-2 border-white px-8 py-4 text-lg font-semibold transition-all hover:bg-white hover:text-stone-800"
            >
              Register Now
            </Link>
          </div>

          {/* Contact Info */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-6 text-sm">
            <a href="mailto:hello@edusitepro.edudashpro.org.za" className="flex items-center gap-2 hover:text-amber-400">
              <Mail className="h-4 w-4" />
              hello@edusitepro.edudashpro.org.za
            </a>
            <a href="tel:+27674770975" className="flex items-center gap-2 hover:text-amber-400">
              <Phone className="h-4 w-4" />
              +27 67 477 0975
            </a>
          </div>

          {/* Social Media Links */}
          <div className="border-t border-stone-700 pt-8">
            <p className="mb-4 text-sm text-stone-400">Follow us on social media</p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://facebook.com/edusitepro"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-stone-700 p-3 transition-all hover:bg-amber-600 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/edusitepro"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-stone-700 p-3 transition-all hover:bg-amber-600 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/company/edusitepro"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-stone-700 p-3 transition-all hover:bg-amber-600 hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/edusitepro"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-stone-700 p-3 transition-all hover:bg-amber-600 hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Schools Directory Showcase Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 px-4 py-20 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-6 py-2 text-sm font-semibold border border-white/30">
              <School className="h-5 w-5" />
              Our Growing Network
            </div>
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              Join 100+ Schools Already Listed
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-blue-100">
              Get your institution featured in our public directory. Reach thousands of parents searching for quality education in South Africa.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <CheckCircle2 className="h-10 w-10 mb-4 text-green-300" />
              <h3 className="text-xl font-bold mb-2">Instant Visibility</h3>
              <p className="text-blue-100">
                Get discovered by parents actively looking for schools in your area. SEO-optimized for maximum reach.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <CheckCircle2 className="h-10 w-10 mb-4 text-green-300" />
              <h3 className="text-xl font-bold mb-2">Marketing Campaigns</h3>
              <p className="text-blue-100">
                Run promotional campaigns with discount codes. Attract more enrollments during peak registration periods.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <CheckCircle2 className="h-10 w-10 mb-4 text-green-300" />
              <h3 className="text-xl font-bold mb-2">Professional Branding</h3>
              <p className="text-blue-100">
                Showcase your logo, colors, curriculum, and unique selling points. Stand out from competitors.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/organizations"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 transition-all hover:bg-blue-50 hover:shadow-xl"
            >
              <School className="h-5 w-5" />
              Browse All Schools
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href={TENANT_ONBOARDING_ROUTE}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white hover:text-blue-600"
            >
              List Your School
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">100+</div>
              <div className="text-sm text-blue-100">Listed Schools</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">15K+</div>
              <div className="text-sm text-blue-100">Monthly Visitors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">9</div>
              <div className="text-sm text-blue-100">Provinces Covered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">24/7</div>
              <div className="text-sm text-blue-100">Always Online</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

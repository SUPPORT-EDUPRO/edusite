import { Clock, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { getAllTemplatesMetadata } from '@/lib/templates/registry';

export default function TemplatesPage() {
  const templates = getAllTemplatesMetadata();

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container mx-auto max-w-7xl px-4 py-16">
        {/* Header */}
        <Link href="/" className="mb-8 inline-block text-amber-600 hover:text-amber-700">
          ← Back to Home
        </Link>

        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold text-stone-900 md:text-5xl">
            NCF-Aligned Templates
          </h1>
          <p className="text-lg text-stone-600">
            Comprehensive activity templates aligned with South Africa&apos;s National Curriculum
            Framework. Each template includes detailed instructions, materials lists, assessment
            tools, and parent engagement strategies.
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Link
              key={template.slug}
              href={`/templates/${template.slug}`}
              className="group block overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-all hover:shadow-lg"
            >
              {/* Template Image */}
              <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-amber-100 to-amber-200">
                <Image
                  src={template.frontmatter.cover}
                  alt={template.frontmatter.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>

              {/* Template Content */}
              <div className="p-6">
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                    {template.frontmatter.pillar}
                  </span>
                  <span className="text-xs text-stone-500">{template.frontmatter.difficulty}</span>
                </div>

                <h3 className="mb-2 text-xl font-bold text-stone-900">
                  {template.frontmatter.title}
                </h3>

                <p className="mb-4 text-sm text-stone-600">{template.frontmatter.description}</p>

                <div className="flex items-center gap-4 text-xs text-stone-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{template.frontmatter.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{template.frontmatter.ageRange}</span>
                  </div>
                </div>

                <div className="mt-4 text-sm font-medium text-amber-600 group-hover:text-amber-700">
                  View Template →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-xl bg-stone-700 p-8 text-center text-white">
          <h2 className="mb-4 text-2xl font-bold">Need More Templates?</h2>
          <p className="mb-6 text-stone-200">
            Get access to our full library of 50+ NCF-aligned templates with EduDash Pro
          </p>
          <Link
            href="https://edudashpro.org.za"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-700"
          >
            Explore EduDash Pro
          </Link>
        </div>
      </div>
    </div>
  );
}

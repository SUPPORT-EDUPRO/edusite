import { ArrowLeft, BookOpen, Clock, Download, Share2, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MDXRenderer } from '@/components/templates/MDXRenderer';
import { getAllTemplatesMetadata, getTemplateMetadataBySlug } from '@/lib/templates/registry';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const templates = getAllTemplatesMetadata();
  return templates.map((template) => ({
    slug: template.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const template = getTemplateMetadataBySlug(params.slug);

  if (!template) {
    return {
      title: 'Template Not Found',
    };
  }

  return {
    title: `${template.frontmatter.title} - NCF Template | EduSitePro`,
    description: template.frontmatter.description,
    keywords: template.frontmatter.keywords.join(', '),
    openGraph: {
      title: template.frontmatter.title,
      description: template.frontmatter.description,
      images: [template.frontmatter.cover],
    },
  };
}

export default function TemplatePage({ params }: PageProps) {
  const template = getTemplateMetadataBySlug(params.slug);

  if (!template) {
    notFound();
  }

  const { frontmatter } = template;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-600 to-amber-700">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <Link
            href="/templates"
            className="mb-6 inline-flex items-center gap-2 text-white hover:text-amber-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Templates
          </Link>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-medium text-white">
                  {frontmatter.pillar}
                </span>
                <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-sm text-white">
                  {frontmatter.difficulty}
                </span>
              </div>

              <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
                {frontmatter.title}
              </h1>
              <p className="mb-6 text-lg text-amber-100">{frontmatter.description}</p>

              <div className="flex flex-wrap gap-6 text-sm text-white">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{frontmatter.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{frontmatter.ageRange}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>{frontmatter.groupSize}</span>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-amber-600 transition-colors hover:bg-amber-50">
                  <Download className="h-5 w-5" />
                  Download PDF
                </button>
                <button className="inline-flex items-center gap-2 rounded-lg border-2 border-white px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10">
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
              </div>
            </div>

            <div className="relative h-64 overflow-hidden rounded-xl shadow-2xl lg:h-96">
              <Image
                src={frontmatter.cover}
                alt={frontmatter.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                NCF Pillars
              </h3>
              <div className="flex flex-wrap gap-2">
                {frontmatter.ncfPillars.map((pillar) => (
                  <span
                    key={pillar}
                    className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                  >
                    {pillar}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Author</h3>
              <p className="text-gray-900 dark:text-white">{frontmatter.author}</p>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                Language
              </h3>
              <p className="text-gray-900 dark:text-white">{frontmatter.locale}</p>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                Materials
              </h3>
              <p className="text-gray-900 dark:text-white">{frontmatter.materials.length} items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Template Content (MDX) */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <article className="prose prose-lg prose-stone dark:prose-invert prose-headings:font-bold prose-h2:border-b prose-h2:pb-2 prose-a:text-amber-600 hover:prose-a:text-amber-700 max-w-none">
          <MDXRenderer slug={params.slug} />
        </article>
      </div>

      {/* CTA Section */}
      <div className="border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Manage Your ECD Centre with EduDash Pro
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Track activities, share with parents, and access 50+ more NCF-aligned templates
          </p>
          <Link
            href="https://edudashpro.org.za"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-amber-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-amber-700"
          >
            Try EduDash Pro Free
          </Link>
        </div>
      </div>
    </div>
  );
}

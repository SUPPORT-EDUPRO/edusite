import Link from 'next/link';

import BulkQuoteForm from '@/components/forms/BulkQuoteForm';

export const metadata = {
  title: 'Get Bulk Quote | EduSitePro',
  description:
    'Request a custom quote for multiple ECD centre websites. Save up to 33% with bulk packages.',
};

export default function BulkPage() {
  return (
    <div className="min-h-screen bg-stone-100">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <Link
          href="/"
          className="mb-8 inline-block text-amber-600 transition-colors hover:text-amber-700"
        >
          ← Back to Home
        </Link>
        <h1 className="mb-4 text-4xl font-bold text-stone-900">Get a Bulk Quote</h1>
        <p className="mb-8 text-lg text-stone-600">
          Tell us about your ECD network and we&apos;ll provide a custom quote with bulk discounts.
        </p>

        <div className="rounded-2xl border border-stone-300 bg-stone-50 p-8 shadow-md">
          <BulkQuoteForm />
        </div>
      </div>
    </div>
  );
}

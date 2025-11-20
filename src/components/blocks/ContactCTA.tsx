'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

// ContactCTA block schema
export const contactCTASchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  subtitle: z.string().max(200).optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
  address: z.string().optional(),
  showForm: z.boolean().default(true),
  mapEmbedUrl: z.string().url('Invalid URL').optional(),
});

export type ContactCTAProps = z.infer<typeof contactCTASchema>;

export default function ContactCTA({
  title,
  subtitle,
  phone,
  email,
  address,
  showForm = true,
  mapEmbedUrl,
}: ContactCTAProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
      to: email || 'info@youngeagles.org.za', // Send to school email
    };

    try {
      // TODO: Implement email API endpoint
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-stone-50 px-4 py-16 dark:bg-stone-900">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-stone-900 dark:text-stone-100 md:text-4xl">{title}</h2>
          {subtitle && <p className="mx-auto max-w-2xl text-lg text-stone-600 dark:text-stone-400">{subtitle}</p>}
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Get in Touch</h3>

            {phone && (
              <div className="flex items-start gap-3">
                <svg
                  className="mt-1 h-5 w-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div>
                  <p className="font-medium text-stone-900 dark:text-stone-100">Phone</p>
                  <a href={`tel:${phone}`} className="text-stone-600 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-500">
                    {phone}
                  </a>
                </div>
              </div>
            )}

            {email && (
              <div className="flex items-start gap-3">
                <svg
                  className="mt-1 h-5 w-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <p className="font-medium text-stone-900 dark:text-stone-100">Email</p>
                  <a href={`mailto:${email}`} className="text-stone-600 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-500">
                    {email}
                  </a>
                </div>
              </div>
            )}

            {address && (
              <div className="flex items-start gap-3">
                <svg
                  className="mt-1 h-5 w-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <p className="font-medium text-stone-900 dark:text-stone-100">Address</p>
                  <p className="text-stone-600 dark:text-stone-400">{address}</p>
                </div>
              </div>
            )}

            {mapEmbedUrl && (
              <div className="mt-6 aspect-video overflow-hidden rounded-lg">
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location map"
                />
              </div>
            )}
          </div>

          {/* Contact Form */}
          {showForm && (
            <div className="rounded-lg bg-white dark:bg-stone-800 p-6 shadow-lg">
              {submitted ? (
                <div className="py-8 text-center">
                  <div className="mb-4 text-5xl">✓</div>
                  <h3 className="mb-2 text-xl font-semibold text-green-600 dark:text-green-400">Message Sent!</h3>
                  <p className="text-stone-600 dark:text-stone-400">We'll get back to you soon.</p>
                </div>
              ) : (
                <>
                  <h3 className="mb-6 text-xl font-semibold text-stone-900 dark:text-stone-100">Send us a message</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        disabled={loading}
                        className="w-full rounded-lg border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 px-4 py-3 text-stone-900 dark:text-stone-100 transition-colors focus:border-amber-600 focus:ring-2 focus:ring-amber-600 focus:outline-none disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        disabled={loading}
                        className="w-full rounded-lg border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 px-4 py-3 text-stone-900 dark:text-stone-100 transition-colors focus:border-amber-600 focus:ring-2 focus:ring-amber-600 focus:outline-none disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        required
                        disabled={loading}
                        className="w-full rounded-lg border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 px-4 py-3 text-stone-900 dark:text-stone-100 transition-colors focus:border-amber-600 focus:ring-2 focus:ring-amber-600 focus:outline-none disabled:opacity-50"
                      />
                    </div>

                    {error && (
                      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-lg bg-amber-600 py-3 font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Export schema for form generation
ContactCTA.schema = contactCTASchema;
ContactCTA.displayName = 'Contact CTA';
ContactCTA.category = 'contact';

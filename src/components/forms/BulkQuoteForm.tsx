'use client';

import HCaptcha from '@hcaptcha/react-hcaptcha';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { LANGUAGES, type LeadFormData, leadFormSchema, SA_PROVINCES } from '@/lib/validation';

export default function BulkQuoteForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const captchaRef = useRef<HCaptcha>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      provinces: [],
      preferredLanguages: [],
      interestedInEduDashPro: false,
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Call Supabase Edge Function instead of Next.js API route
      const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-lead`;

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: result.message || 'Quote request submitted successfully!',
        });
        reset();
        captchaRef.current?.resetCaptcha();
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.message || 'Failed to submit. Please try again.',
        });
      }
    } catch {
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hcaptchaSiteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  if (!hcaptchaSiteKey) {
    console.error('hCaptcha site key is not configured. Please set NEXT_PUBLIC_HCAPTCHA_SITE_KEY.');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitStatus && (
        <div
          className={`rounded-lg p-4 ${
            submitStatus.type === 'success'
              ? 'bg-amber-50 text-amber-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      {/* Contact Name */}
      <div>
        <label htmlFor="contactName" className="mb-2 block font-semibold text-stone-700">
          Contact Name *
        </label>
        <input
          id="contactName"
          type="text"
          {...register('contactName')}
          className="w-full rounded-lg border-2 border-stone-300 bg-white px-4 py-3 text-stone-900 transition-colors placeholder:text-stone-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-600 focus:outline-none"
          placeholder="Your full name"
        />
        {errors.contactName && (
          <p className="mt-1 text-sm text-red-600">{errors.contactName.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-2 block font-semibold text-stone-700">
          Email Address *
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full rounded-lg border-2 border-stone-300 bg-white px-4 py-3 text-stone-900 transition-colors placeholder:text-stone-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-600 focus:outline-none"
          placeholder="your@email.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="mb-2 block font-semibold text-stone-700">
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          {...register('phone')}
          className="w-full rounded-lg border-2 border-stone-300 bg-white px-4 py-3 text-stone-900 transition-colors placeholder:text-stone-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-600 focus:outline-none"
          placeholder="+27 82 123 4567"
        />
        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
      </div>

      {/* Centre Count */}
      <div>
        <label htmlFor="centreCount" className="mb-2 block font-semibold text-stone-700">
          Number of Centres *
        </label>
        <input
          id="centreCount"
          type="number"
          min="1"
          {...register('centreCount')}
          className="w-full rounded-lg border-2 border-stone-300 bg-white px-4 py-3 text-stone-900 transition-colors placeholder:text-stone-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-600 focus:outline-none"
          placeholder="e.g. 5"
        />
        {errors.centreCount && (
          <p className="mt-1 text-sm text-red-600">{errors.centreCount.message}</p>
        )}
      </div>

      {/* Provinces */}
      <div>
        <label className="mb-2 block font-semibold text-stone-700">Provinces *</label>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {SA_PROVINCES.map((province) => (
            <label key={province} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={province}
                {...register('provinces')}
                className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-600"
              />
              <span className="text-sm text-stone-700">
                {province
                  .split('-')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')}
              </span>
            </label>
          ))}
        </div>
        {errors.provinces && (
          <p className="mt-1 text-sm text-red-600">{errors.provinces.message}</p>
        )}
      </div>

      {/* Languages */}
      <div>
        <label className="mb-2 block font-semibold text-stone-700">Preferred Languages *</label>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {LANGUAGES.map((lang) => {
            const labels: Record<string, string> = {
              en: 'English',
              af: 'Afrikaans',
              zu: 'isiZulu',
              xh: 'isiXhosa',
              st: 'Sesotho',
              tn: 'Setswana',
            };
            return (
              <label key={lang} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={lang}
                  {...register('preferredLanguages')}
                  className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-600"
                />
                <span className="text-sm text-stone-700">{labels[lang]}</span>
              </label>
            );
          })}
        </div>
        {errors.preferredLanguages && (
          <p className="mt-1 text-sm text-red-600">{errors.preferredLanguages.message}</p>
        )}
      </div>

      {/* EduDash Pro Interest */}
      <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            {...register('interestedInEduDashPro')}
            className="mt-1 h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-600"
          />
          <div>
            <span className="font-semibold text-stone-900">I&apos;m interested in EduDash Pro</span>
            <p className="text-sm text-stone-600">
              Get seamless parent communication and analytics with our mobile app
            </p>
          </div>
        </label>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="mb-2 block font-semibold text-stone-700">
          Additional Information
        </label>
        <textarea
          id="message"
          rows={4}
          {...register('message')}
          className="w-full rounded-lg border-2 border-stone-300 bg-white px-4 py-3 text-stone-900 transition-colors placeholder:text-stone-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-600 focus:outline-none"
          placeholder="Tell us more about your ECD centres..."
        />
        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
      </div>

      {/* hCaptcha */}
      <div>
        {hcaptchaSiteKey ? (
          <>
            <HCaptcha
              ref={captchaRef}
              sitekey={hcaptchaSiteKey}
              onVerify={(token) => setValue('captchaToken', token)}
              onExpire={() => setValue('captchaToken', '')}
            />
            {errors.captchaToken && (
              <p className="mt-1 text-sm text-red-600">{errors.captchaToken.message}</p>
            )}
          </>
        ) : (
          <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4 text-red-800">
            <p className="font-semibold">Configuration Error</p>
            <p className="text-sm">hCaptcha is not properly configured. Please contact support.</p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !hcaptchaSiteKey}
        className="w-full rounded-lg bg-amber-600 py-4 font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Request Quote'}
      </button>

      <p className="text-center text-sm text-stone-600">
        We&apos;ll respond within 24 hours with a custom quote for your needs.
      </p>
    </form>
  );
}

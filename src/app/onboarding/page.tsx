import { ArrowRight, ShieldCheck, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';

import BulkQuoteForm from '@/components/forms/BulkQuoteForm';

export const metadata = {
  title: 'Onboard Your Centre | EduSitePro',
  description:
    'Start your EduSitePro onboarding in minutes. Share your school details and our team will provision a branded microsite plus AI-ready parent tools.',
};

const highlights = [
  {
    icon: Sparkles,
    title: '48 Hour Setup',
    description: 'Pre-built NCF templates accelerate launch while we plug in your branding and content.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & POPIA Ready',
    description: 'Enterprise-grade Supabase + regional hosting keeps family data safe and compliant.',
  },
  {
    icon: Users,
    title: 'Multi-Centre Friendly',
    description: 'Group onboarding for trusts and networks with built-in analytics and permissions.',
  },
];

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-800 text-white">
      <section className="px-4 py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white/70">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              EduSitePro Tenant Onboarding
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-tight text-white md:text-5xl">
              Launch your school&apos;s digital front door in one form
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Share a few details about your centre (or network) and we&apos;ll spin up a branded landing site,
              AI-ready registration workflow, and access to EduDash Pro&apos;s support team.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-1 min-w-[230px] items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <item.icon className="h-6 w-6 text-amber-300" />
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="text-sm text-white/70">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-6 text-sm text-white/80">
              <p className="font-semibold text-white">Onboarding checklist</p>
              <ul className="mt-3 space-y-2 text-white/70">
                <li>• School details, primary contact, and provinces served</li>
                <li>• Preferred languages + templates so we can match your brand</li>
                <li>• Optional EduDash Pro mobile app interest for parent engagement</li>
              </ul>
              <p className="mt-4 text-xs text-white/60">
                You&apos;ll receive a confirmation email and Slack invite within 24 hours. Need help now?{' '}
                <a href="mailto:sales@edudashpro.org.za" className="font-semibold text-amber-300 underline">
                  sales@edudashpro.org.za
                </a>
              </p>
            </div>
          </div>

          <div className="flex-1 rounded-3xl bg-white p-8 text-stone-900 shadow-2xl">
            <div className="mb-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">Step 1</p>
              <h2 className="text-2xl font-bold text-stone-900">Tell us about your organization</h2>
              <p className="mt-2 text-sm text-stone-500">Our onboarding team will configure your tenant within 48 hours.</p>
            </div>

            <BulkQuoteForm />

            <p className="mt-6 text-center text-xs text-stone-500">
              Need NDA or procurement docs first?{' '}
              <Link href="/legal" className="font-semibold text-amber-600">
                View compliance pack →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-stone-950/60 px-4 py-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/70">
            What happens next?
          </div>
          <h3 className="text-3xl font-bold">White-glove onboarding with real humans</h3>
          <p className="max-w-3xl text-base text-white/70">
            Once your form lands in our queue, we provision Supabase tenants, attach AI copilots, invite your
            administrators, and guide you through domain + billing setup. You stay focused on learners while we take
            care of the infrastructure.
          </p>
          <div className="grid w-full gap-4 md:grid-cols-3">
            {['Provision tenant workspace', 'Design review + content import', 'Launch & ongoing support'].map(
              (step, idx) => (
                <div key={step} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                  <p className="text-sm font-semibold text-white/60">Phase {idx + 1}</p>
                  <p className="text-lg font-bold text-white">{step}</p>
                </div>
              ),
            )}
          </div>
          <p className="text-sm text-white/70">
            Ready to dive deeper?{' '}
            <Link href="/docs/connection-strategy" className="font-semibold text-amber-300">
              View the full technical plan
            </Link>
          </p>
        </div>
      </section>

      <section className="border-t border-white/5 bg-stone-900 px-4 py-12 text-sm text-white/70">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 text-center md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-white">Need help?</p>
            <p>Call +27 67 477 0975 or WhatsApp +27 67 477 0975 for rapid onboarding support.</p>
          </div>
          <Link
            href="mailto:sales@edudashpro.org.za"
            className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 font-semibold text-stone-900 shadow-lg transition hover:bg-amber-400"
          >
            Email sales@edudashpro.org.za
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

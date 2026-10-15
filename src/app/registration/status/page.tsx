import type { Metadata } from 'next';

import { RegistrationStatusTracker } from '@/components/registration/RegistrationStatusTracker';

export const metadata: Metadata = {
  title: 'Track registration | Young Eagles Preschool',
  description: 'Check the current status of a Young Eagles Preschool registration application.',
};

export default function RegistrationStatusPage({
  searchParams,
}: {
  searchParams?: { ref?: string };
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ece8ff,_transparent_34%),linear-gradient(135deg,_#f7faff,_#f6f2ff)] px-3 py-8 text-[#2b3e5c] sm:px-6">
      <RegistrationStatusTracker initialReference={searchParams?.ref ?? ''} />
    </main>
  );
}

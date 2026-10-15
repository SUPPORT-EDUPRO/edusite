import type { Metadata } from 'next';

import { ProofOfPaymentUpload } from '@/components/registration/ProofOfPaymentUpload';

export const metadata: Metadata = {
  title: 'Upload proof of payment | Young Eagles Preschool',
  description: 'Send proof of payment for a Young Eagles Preschool registration.',
};

export default function UploadPaymentPage({ searchParams }: { searchParams?: { ref?: string } }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ece8ff,_transparent_34%),linear-gradient(135deg,_#f7faff,_#f6f2ff)] px-3 py-8 text-[#2b3e5c] sm:px-6">
      <ProofOfPaymentUpload initialReference={searchParams?.ref ?? ''} />
    </main>
  );
}

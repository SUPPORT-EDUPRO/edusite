import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page',
  description: 'ECD Centre Page',
};

export default function ClientPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* No Header/Footer - just the page content blocks */}
      {children}
    </>
  );
}

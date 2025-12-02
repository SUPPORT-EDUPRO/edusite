'use client';

import { Mail } from 'lucide-react';
import { useState } from 'react';

interface ResendEmailButtonProps {
  registrationId: string;
  guardianEmail: string;
}

export default function ResendEmailButton({ registrationId, guardianEmail }: ResendEmailButtonProps) {
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    if (!confirm(`Resend confirmation email to ${guardianEmail}?`)) {
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/registrations/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend email');
      }

      alert(`✅ Email resent successfully to ${guardianEmail}`);
    } catch (error: any) {
      console.error('Resend email error:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <button
      onClick={handleResend}
      disabled={sending}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Mail className="h-4 w-4" />
      {sending ? 'Sending...' : 'Resend Confirmation Email'}
    </button>
  );
}

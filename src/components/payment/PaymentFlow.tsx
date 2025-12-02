'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  AlertCircle,
  Building2, 
  CheckCircle,
  CreditCard, 
  Loader2,
  Smartphone, 
  Upload} from 'lucide-react';
import { useState } from 'react';

type PaymentMethod = 'credit_card' | 'eft' | 'bank_transfer' | 'ozow' | 'payfast' | 'snapscan';

interface Props {
  registrationId: string;
  amount: number;
  organizationId: string;
  organizationName: string;
  campaignId?: string;
  onSuccess?: () => void;
}

export default function PaymentFlow({ 
  registrationId, 
  amount, 
  organizationId,
  organizationName,
  campaignId,
  onSuccess 
}: Props) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // EFT/Bank Transfer fields
  const [reference, setReference] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const supabase = createClientComponentClient();

  const paymentMethods = [
    {
      id: 'credit_card' as PaymentMethod,
      name: 'Credit/Debit Card',
      description: 'Pay online instantly with card',
      icon: CreditCard,
      available: true,
      processingTime: 'Instant'
    },
    {
      id: 'eft' as PaymentMethod,
      name: 'EFT (Bank Transfer)',
      description: 'Direct bank transfer',
      icon: Building2,
      available: true,
      processingTime: '1-3 business days'
    },
    {
      id: 'ozow' as PaymentMethod,
      name: 'Ozow Instant EFT',
      description: 'Pay from your bank account',
      icon: Smartphone,
      available: true,
      processingTime: 'Instant'
    },
    {
      id: 'snapscan' as PaymentMethod,
      name: 'SnapScan / Zapper',
      description: 'Scan QR code to pay',
      icon: Smartphone,
      available: true,
      processingTime: 'Instant'
    }
  ];

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${registrationId}-${Date.now()}.${fileExt}`;
      const filePath = `payment-proofs/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) return;
    
    setLoading(true);
    setError(null);

    try {
      let proofUrl = null;

      // Upload proof of payment for EFT/Bank Transfer
      if ((selectedMethod === 'eft' || selectedMethod === 'bank_transfer') && proofFile) {
        proofUrl = await handleFileUpload(proofFile);
        if (!proofUrl) {
          throw new Error('Failed to upload proof of payment');
        }
      }

      // Create payment transaction
      const { data: payment, error: paymentError } = await supabase
        .from('payment_transactions')
        .insert({
          organization_id: organizationId,
          registration_request_id: registrationId,
          payer_name: 'From Registration', // Will be updated from registration data
          payer_email: 'From Registration',
          fee_type: 'registration_fee',
          amount: amount,
          payment_method: selectedMethod,
          payment_status: selectedMethod === 'eft' || selectedMethod === 'bank_transfer' 
            ? 'awaiting_proof' 
            : 'pending',
          payment_reference: reference || undefined,
          proof_of_payment_url: proofUrl || undefined,
          campaign_id: campaignId || undefined
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update registration request with payment info
      const { error: updateError } = await supabase
        .from('registration_requests')
        .update({
          registration_fee_payment_id: payment.id,
          registration_fee_paid: selectedMethod !== 'eft' && selectedMethod !== 'bank_transfer'
        })
        .eq('id', registrationId);

      if (updateError) throw updateError;

      // Handle different payment gateways
      if (selectedMethod === 'credit_card') {
        // Redirect to card payment gateway (integrate with PayFast, Stripe, etc.)
        window.location.href = `/api/payment/card?transaction_id=${payment.id}`;
      } else if (selectedMethod === 'ozow') {
        // Redirect to Ozow
        window.location.href = `/api/payment/ozow?transaction_id=${payment.id}`;
      } else if (selectedMethod === 'eft' || selectedMethod === 'bank_transfer') {
        // Show success message with banking details
        setSuccess(true);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Submitted Successfully!
        </h3>
        <p className="text-gray-600 mb-6">
          Your payment is being processed. You will receive a confirmation email once verified.
        </p>
        
        {(selectedMethod === 'eft' || selectedMethod === 'bank_transfer') && (
          <div className="bg-white rounded-lg p-6 text-left">
            <h4 className="font-semibold text-gray-900 mb-4">Banking Details:</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Bank:</span> FNB</div>
              <div><span className="font-medium">Account Name:</span> {organizationName}</div>
              <div><span className="font-medium">Account Number:</span> 1234567890</div>
              <div><span className="font-medium">Branch Code:</span> 250655</div>
              <div><span className="font-medium">Reference:</span> <span className="bg-yellow-100 px-2 py-1 rounded font-mono">{registrationId.substring(0, 8)}</span></div>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Please use the reference number when making the payment. Upload your proof of payment above.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Complete Your Payment
        </h2>
        <p className="text-gray-600">
          Registration fee: <span className="text-2xl font-bold text-green-600">R{amount.toFixed(2)}</span>
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Payment Method Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Choose Payment Method
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                disabled={!method.available}
                className={`relative p-6 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : method.available
                    ? 'border-gray-200 hover:border-blue-300 bg-white'
                    : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {method.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {method.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Processing: {method.processingTime}
                    </p>
                  </div>

                  {isSelected && (
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* EFT/Bank Transfer Details */}
      {(selectedMethod === 'eft' || selectedMethod === 'bank_transfer') && (
        <div className="mb-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Banking Details</h4>
          
          <div className="bg-white rounded-lg p-4 mb-4 space-y-2 text-sm">
            <div className="grid grid-cols-2">
              <span className="font-medium">Bank:</span>
              <span>FNB</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="font-medium">Account Name:</span>
              <span>{organizationName}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="font-medium">Account Number:</span>
              <span>1234567890</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="font-medium">Branch Code:</span>
              <span>250655</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="font-medium">Your Reference:</span>
              <span className="bg-yellow-100 px-2 py-1 rounded font-mono">
                {registrationId.substring(0, 8)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Reference (Optional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Enter your bank reference number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Proof of Payment
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="proof-upload"
                />
                <label htmlFor="proof-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {proofFile ? proofFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG or PDF (max 5MB)
                  </p>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handlePayment}
        disabled={!selectedMethod || loading || (selectedMethod === 'eft' && !proofFile)}
        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {selectedMethod === 'eft' || selectedMethod === 'bank_transfer'
              ? 'Submit Payment Details'
              : 'Proceed to Payment'}
          </>
        )}
      </button>

      <p className="mt-4 text-center text-sm text-gray-500">
        Secure payment processing. Your information is protected.
      </p>
    </div>
  );
}

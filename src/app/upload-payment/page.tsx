'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function UploadPaymentContent() {
  const searchParams = useSearchParams();
  const paymentRef = searchParams.get('ref');
  
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!paymentRef) {
      setError('Invalid or missing payment reference');
      setLoading(false);
      return;
    }

    // Fetch registration by payment reference
    const fetchRegistration = async () => {
      try {
        const { data, error } = await supabase
          .from('registration_requests')
          .select('*')
          .eq('payment_reference', paymentRef)
          .maybeSingle(); // Use maybeSingle() instead of single() to handle 0 or 1 results

        if (error) throw error;
        
        if (!data) {
          setError('Registration not found with this payment reference');
        } else {
          setRegistration(data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load registration');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistration();
  }, [paymentRef, supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF or image file (JPG, PNG)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file || !registration) return;
    
    setUploading(true);
    setError('');
    
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${paymentRef}-${Date.now()}.${fileExt}`;
      const filePath = `payment-proofs/${fileName}`; // Include folder prefix
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL - construct manually to ensure correct path
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payment-proofs/${filePath}`;
      
      // Update registration with POP URL
      const { error: updateError } = await supabase
        .from('registration_requests')
        .update({
          proof_of_payment_url: publicUrl,
          payment_date: new Date().toISOString(),
          payment_amount: registration.registration_fee_amount,
          status: 'pending'
        })
        .eq('id', registration.id);
      
      if (updateError) throw updateError;
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to upload proof of payment');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registration details...</p>
        </div>
      </div>
    );
  }

  if (error && !registration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your proof of payment has been received. Our admin team will review it shortly and you'll receive a confirmation email once approved.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Payment Reference:</strong> {paymentRef}
              </p>
              <p className="text-sm text-blue-800 mt-2">
                Please keep this reference for your records.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
            <h1 className="text-3xl font-bold text-white text-center">
              Upload Proof of Payment
            </h1>
            <p className="text-blue-100 text-center mt-2">
              Complete your registration by uploading your payment proof
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            {/* Registration Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Registration Details</h2>
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Payment Reference</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded border">
                    {paymentRef}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Student Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {registration?.student_first_name} {registration?.student_last_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Parent/Guardian</dt>
                  <dd className="mt-1 text-sm text-gray-900">{registration?.guardian_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Amount to Pay</dt>
                  <dd className="mt-1 text-lg font-bold text-green-600">
                    R{registration?.registration_fee_amount?.toFixed(2) || '200.00'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Banking Details Reminder */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Banking Details</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-blue-700 font-medium">Bank</dt>
                  <dd className="text-blue-900">First National Bank (FNB)</dd>
                </div>
                <div>
                  <dt className="text-blue-700 font-medium">Account Number</dt>
                  <dd className="text-blue-900 font-mono">62777403181</dd>
                </div>
                <div>
                  <dt className="text-blue-700 font-medium">Branch Code</dt>
                  <dd className="text-blue-900 font-mono">250655</dd>
                </div>
                <div>
                  <dt className="text-blue-700 font-medium">Account Type</dt>
                  <dd className="text-blue-900">Business</dd>
                </div>
              </dl>
              <p className="text-xs text-blue-700 mt-3">
                <strong>Important:</strong> Use reference <span className="font-mono bg-blue-100 px-1 rounded">{paymentRef}</span> when making payment
              </p>
            </div>

            {/* Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Proof of Payment
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Please upload a clear image or PDF of your payment confirmation (max 5MB)
              </p>
              
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    cursor-pointer"
                />
              </div>
              
              {file && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <strong>Selected file:</strong> {file.name}
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                !file || uploading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Upload Proof of Payment'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              After uploading, our team will verify your payment and complete your registration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UploadPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <UploadPaymentContent />
    </Suspense>
  );
}

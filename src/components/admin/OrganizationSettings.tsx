'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  AlertCircle,
  CheckCircle,
  DollarSign, 
  Globe,
  Palette, 
  Save,
  School, 
  Upload,
  X
} from 'lucide-react';
import { useEffect,useState } from 'react';

interface OrganizationSettings {
  id: string;
  name: string;
  slug: string;
  organization_type: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  registration_open: boolean;
  registration_message: string | null;
  min_age: number | null;
  max_age: number | null;
  custom_domain: string | null;
  domain_verified: boolean;
  terms_and_conditions_url: string | null;
  terms_and_conditions_text: string | null;
  form_config?: {
    showDetailedParentInfo?: boolean;
    showSecondaryGuardian?: boolean;
    showTransport?: boolean;
    showMealPlan?: boolean;
    showDoctorInfo?: boolean;
    showEmergencyContact?: boolean;
  } | null;
}

interface FeeStructure {
  id: string;
  fee_type: string;
  amount: number;
  description: string;
  payment_frequency: string;
  mandatory: boolean;
  active: boolean;
}

export default function OrganizationSettings({ organizationId }: { organizationId: string }) {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [fees, setFees] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [termsFile, setTermsFile] = useState<File | null>(null);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchSettings();
    fetchFees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFees = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_fee_structures')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('academic_year', '2026')
        .order('fee_type');

      if (error) throw error;
      setFees(data || []);
    } catch (error) {
      console.error('Error fetching fees:', error);
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${organizationId}-logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      setSettings(prev => prev ? { ...prev, logo_url: publicUrl } : null);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      return null;
    }
  };

  const handleTermsUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${organizationId}-terms-${Date.now()}.${fileExt}`;
      const filePath = `terms/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      setSettings(prev => prev ? { ...prev, terms_and_conditions_url: publicUrl } : null);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading terms:', error);
      return null;
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    setMessage(null);

    try {
      let logoUrl = settings.logo_url;
      let termsUrl = settings.terms_and_conditions_url;

      // Upload logo if new file selected
      if (logoFile) {
        logoUrl = await handleLogoUpload(logoFile);
      }

      // Upload terms if new file selected
      if (termsFile) {
        termsUrl = await handleTermsUpload(termsFile);
      }

      const { error } = await supabase
        .from('organizations')
        .update({
          name: settings.name,
          organization_type: settings.organization_type,
          logo_url: logoUrl,
          primary_color: settings.primary_color,
          secondary_color: settings.secondary_color,
          registration_open: settings.registration_open,
          registration_message: settings.registration_message,
          min_age: settings.min_age,
          max_age: settings.max_age,
          custom_domain: settings.custom_domain,
          terms_and_conditions_url: termsUrl,
          terms_and_conditions_text: settings.terms_and_conditions_text,
          form_config: settings.form_config || null
        })
        .eq('id', organizationId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setLogoFile(null);
      setTermsFile(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const addFee = async () => {
    try {
      const { error } = await supabase
        .from('organization_fee_structures')
        .insert({
          organization_id: organizationId,
          fee_type: 'registration_fee',
          amount: 0,
          description: 'New fee',
          payment_frequency: 'once',
          mandatory: true,
          active: true,
          academic_year: '2026'
        });

      if (error) throw error;
      fetchFees();
    } catch (error) {
      console.error('Error adding fee:', error);
    }
  };

  const updateFee = async (id: string, updates: Partial<FeeStructure>) => {
    try {
      const { error } = await supabase
        .from('organization_fee_structures')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      fetchFees();
    } catch (error) {
      console.error('Error updating fee:', error);
    }
  };

  const deleteFee = async (id: string) => {
    if (!confirm('Delete this fee?')) return;
    
    try {
      const { error } = await supabase
        .from('organization_fee_structures')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchFees();
    } catch (error) {
      console.error('Error deleting fee:', error);
    }
  };

  if (loading || !settings) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
        <p className="text-gray-600 mt-1">Manage your school's information and configuration</p>
      </div>

      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <p>{message.text}</p>
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <School className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Type
            </label>
            <select
              value={settings.organization_type}
              onChange={(e) => setSettings({ ...settings, organization_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="preschool">Preschool</option>
              <option value="primary_school">Primary School</option>
              <option value="high_school">High School</option>
              <option value="k12_school">K-12 School</option>
              <option value="fet_college">FET College</option>
              <option value="training_center">Training Center</option>
              <option value="university">University</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Age
              </label>
              <input
                type="number"
                value={settings.min_age || ''}
                onChange={(e) => setSettings({ ...settings, min_age: parseInt(e.target.value) || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Age
              </label>
              <input
                type="number"
                value={settings.max_age || ''}
                onChange={(e) => setSettings({ ...settings, max_age: parseInt(e.target.value) || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Branding</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            <div className="flex items-center gap-4">
              {settings.logo_url && (
                <img
                  src={settings.logo_url}
                  alt="Logo"
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
              )}
              <label className="cursor-pointer px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {logoFile ? logoFile.name : 'Choose Logo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.primary_color || '#3B82F6'}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primary_color || '#3B82F6'}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.secondary_color || '#10B981'}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.secondary_color || '#10B981'}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Registration Settings</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.registration_open}
              onChange={(e) => setSettings({ ...settings, registration_open: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-900">Accept New Registrations</span>
              <p className="text-sm text-gray-500">Allow new students to register online</p>
            </div>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Message
            </label>
            <textarea
              rows={3}
              value={settings.registration_message || ''}
              onChange={(e) => setSettings({ ...settings, registration_message: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Now enrolling for 2026! Limited spots available."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Domain (Optional)
            </label>
            <input
              type="text"
              value={settings.custom_domain || ''}
              onChange={(e) => setSettings({ ...settings, custom_domain: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="www.yourschool.co.za"
            />
            {settings.domain_verified ? (
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Domain verified
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-1">Domain not verified yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Registration Form</h2>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">Choose which sections appear on your public registration form.</p>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(settings.form_config?.showDetailedParentInfo ?? true)}
              onChange={(e) => setSettings({
                ...settings,
                form_config: {
                  ...(settings.form_config || {}),
                  showDetailedParentInfo: e.target.checked,
                },
              })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-900">Detailed Parent/Guardian Info</span>
              <p className="text-sm text-gray-500">Include separate parent details with contact and occupation fields.</p>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(settings.form_config?.showSecondaryGuardian ?? false)}
              onChange={(e) => setSettings({
                ...settings,
                form_config: {
                  ...(settings.form_config || {}),
                  showSecondaryGuardian: e.target.checked,
                },
              })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-900">Secondary Guardian</span>
              <p className="text-sm text-gray-500">Allow adding a second guardian/contact person.</p>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(settings.form_config?.showTransport ?? false)}
              onChange={(e) => setSettings({
                ...settings,
                form_config: {
                  ...(settings.form_config || {}),
                  showTransport: e.target.checked,
                },
              })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-900">Transport Options</span>
              <p className="text-sm text-gray-500">Ask about school transport needs and routes.</p>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(settings.form_config?.showMealPlan ?? false)}
              onChange={(e) => setSettings({
                ...settings,
                form_config: {
                  ...(settings.form_config || {}),
                  showMealPlan: e.target.checked,
                },
              })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-900">Meal Plan</span>
              <p className="text-sm text-gray-500">Collect dietary preferences and meal selections if applicable.</p>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(settings.form_config?.showDoctorInfo ?? false)}
              onChange={(e) => setSettings({
                ...settings,
                form_config: {
                  ...(settings.form_config || {}),
                  showDoctorInfo: e.target.checked,
                },
              })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-900">Doctor & Medical Info</span>
              <p className="text-sm text-gray-500">Add fields for doctor contact and medical details.</p>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(settings.form_config?.showEmergencyContact ?? true)}
              onChange={(e) => setSettings({
                ...settings,
                form_config: {
                  ...(settings.form_config || {}),
                  showEmergencyContact: e.target.checked,
                },
              })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-900">Emergency Contact</span>
              <p className="text-sm text-gray-500">Request an alternate contact for emergencies.</p>
            </div>
          </label>

          {/* Preview of active sections */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Preview: Active Sections</h3>
            <div className="flex flex-wrap gap-2">
              {Boolean(settings.form_config?.showDetailedParentInfo ?? true) && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  👨‍👩‍👧 Detailed Parent Info
                </span>
              )}
              {Boolean(settings.form_config?.showSecondaryGuardian ?? false) && (
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                  👤 Secondary Guardian
                </span>
              )}
              {Boolean(settings.form_config?.showTransport ?? false) && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                  🚌 Transport
                </span>
              )}
              {Boolean(settings.form_config?.showMealPlan ?? false) && (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                  🍽️ Meal Plan
                </span>
              )}
              {Boolean(settings.form_config?.showDoctorInfo ?? false) && (
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                  🩺 Doctor Info
                </span>
              )}
              {Boolean(settings.form_config?.showEmergencyContact ?? true) && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                  🚨 Emergency Contact
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {settings.organization_type === 'preschool' ? 
                'Preschools show base sections + selected optional sections above.' :
                'Only selected sections above will appear in the registration form.'}
            </p>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Terms and Conditions</h2>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Upload a PDF or enter custom terms that parents must accept during registration.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Terms Document (PDF)
            </label>
            <div className="flex items-center gap-4">
              {settings.terms_and_conditions_url && (
                <a
                  href={settings.terms_and_conditions_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  View current document
                </a>
              )}
              <label className="cursor-pointer px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {termsFile ? termsFile.name : 'Choose PDF'}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setTermsFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              {termsFile && (
                <button
                  onClick={() => setTermsFile(null)}
                  className="p-1 text-gray-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Terms Text
            </label>
            <textarea
              rows={8}
              value={settings.terms_and_conditions_text || ''}
              onChange={(e) => setSettings({ ...settings, terms_and_conditions_text: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Enter your custom terms and conditions here..."
            />
            <p className="text-xs text-gray-500 mt-1">
              If both PDF and text are provided, PDF takes priority.
            </p>
          </div>
        </div>
      </div>

      {/* Fee Structure */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Fee Structure (2026)</h2>
          </div>
          <button
            onClick={addFee}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            + Add Fee
          </button>
        </div>

        <div className="space-y-3">
          {fees.map((fee) => (
            <div key={fee.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <select
                value={fee.fee_type}
                onChange={(e) => updateFee(fee.id, { fee_type: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1"
              >
                <option value="registration_fee">Registration Fee</option>
                <option value="tuition_monthly">Tuition (Monthly)</option>
                <option value="tuition_annual">Tuition (Annual)</option>
                <option value="deposit">Deposit</option>
                <option value="uniform">Uniform</option>
                <option value="books">Books</option>
                <option value="activities">Activities</option>
                <option value="transport">Transport</option>
                <option value="meals">Meals</option>
              </select>

              <input
                type="number"
                value={fee.amount}
                onChange={(e) => updateFee(fee.id, { amount: parseFloat(e.target.value) })}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Amount"
              />

              <input
                type="text"
                value={fee.description}
                onChange={(e) => updateFee(fee.id, { description: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Description"
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={fee.active}
                  onChange={(e) => updateFee(fee.id, { active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Active</span>
              </label>

              <button
                onClick={() => deleteFee(fee.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {fees.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No fees configured yet. Click "Add Fee" to create one.
            </p>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Save className="h-5 w-5" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}

'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  BarChart3,
  Check,
  Copy,
  Edit, 
  Eye,
  EyeOff,
  Gift,
  Plus, 
  Trash2, 
  TrendingUp, 
  Users} from 'lucide-react';
import { useEffect,useState } from 'react';

interface Campaign {
  id: string;
  name: string;
  campaign_type: string;
  description: string;
  discount_type: string;
  discount_value: number;
  promo_code: string;
  max_redemptions: number | null;
  current_redemptions: number;
  start_date: string;
  end_date: string;
  active: boolean;
  featured: boolean;
}

export default function CampaignsManagement() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCampaign = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchCampaigns();
    } catch (error) {
      console.error('Error toggling campaign:', error);
    }
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const getCampaignStatus = (campaign: Campaign) => {
    const now = new Date();
    const start = new Date(campaign.start_date);
    const end = new Date(campaign.end_date);

    if (!campaign.active) return { text: 'Inactive', color: 'bg-gray-500' };
    if (now < start) return { text: 'Scheduled', color: 'bg-blue-500' };
    if (now > end) return { text: 'Expired', color: 'bg-red-500' };
    if (campaign.max_redemptions && campaign.current_redemptions >= campaign.max_redemptions) {
      return { text: 'Fully Redeemed', color: 'bg-orange-500' };
    }
    return { text: 'Active', color: 'bg-green-500' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalRedemptions = campaigns.reduce((sum, c) => sum + c.current_redemptions, 0);
  const activeCampaigns = campaigns.filter(c => {
    const now = new Date();
    const end = new Date(c.end_date);
    return c.active && now <= end;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Campaigns</h1>
          <p className="text-gray-600 mt-1">Manage promotional offers and discounts</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create Campaign
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Campaigns</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{campaigns.length}</p>
            </div>
            <Gift className="h-12 w-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Now</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{activeCampaigns}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Redemptions</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{totalRedemptions}</p>
            </div>
            <Users className="h-12 w-12 text-purple-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">
                {campaigns.length > 0 ? Math.round((totalRedemptions / campaigns.length) * 10) : 0}%
              </p>
            </div>
            <BarChart3 className="h-12 w-12 text-orange-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Campaigns</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {campaigns.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-6">Create your first promotional campaign to attract more registrations.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                Create First Campaign
              </button>
            </div>
          ) : (
            campaigns.map((campaign) => {
              const status = getCampaignStatus(campaign);
              const progress = campaign.max_redemptions
                ? (campaign.current_redemptions / campaign.max_redemptions) * 100
                : 0;

              return (
                <div key={campaign.id} className="px-6 py-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {campaign.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${status.color}`}>
                          {status.text}
                        </span>
                        {campaign.featured && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 mb-4">{campaign.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Promo Code</p>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-sm font-mono font-bold text-blue-600">
                              {campaign.promo_code}
                            </code>
                            <button
                              onClick={() => copyPromoCode(campaign.promo_code)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              {copiedCode === campaign.promo_code ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Discount</p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {campaign.discount_type === 'percentage' 
                              ? `${campaign.discount_value}%` 
                              : `R${campaign.discount_value}`}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Redemptions</p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {campaign.current_redemptions}
                            {campaign.max_redemptions && ` / ${campaign.max_redemptions}`}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Valid Until</p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {new Date(campaign.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {campaign.max_redemptions && (
                        <div className="mb-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {Math.round(progress)}% redeemed
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => toggleCampaign(campaign.id, campaign.active)}
                        className={`p-2 rounded-lg transition-colors ${
                          campaign.active
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={campaign.active ? 'Deactivate' : 'Activate'}
                      >
                        {campaign.active ? (
                          <Eye className="h-5 w-5" />
                        ) : (
                          <EyeOff className="h-5 w-5" />
                        )}
                      </button>

                      <button
                        onClick={() => {/* Open edit modal */}}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>

                      <button
                        onClick={() => deleteCampaign(campaign.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchCampaigns();
          }}
        />
      )}
    </div>
  );
}

// Create Campaign Modal Component
function CreateCampaignModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    campaign_type: 'early_bird',
    description: '',
    discount_type: 'percentage',
    discount_value: 20,
    promo_code: '',
    max_redemptions: 100,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    featured: true,
    auto_apply: false
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .insert({
          ...formData,
          active: true
        });

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Create New Campaign</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Early Bird Registration 2026"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Type *
              </label>
              <select
                value={formData.campaign_type}
                onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="early_bird">Early Bird</option>
                <option value="sibling_discount">Sibling Discount</option>
                <option value="referral_bonus">Referral Bonus</option>
                <option value="seasonal_promo">Seasonal Promo</option>
                <option value="bundle_offer">Bundle Offer</option>
                <option value="scholarship">Scholarship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promo Code *
              </label>
              <input
                type="text"
                required
                value={formData.promo_code}
                onChange={(e) => setFormData({ ...formData, promo_code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="EARLYBIRD2026"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Register before deadline and save!"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Type *
              </label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed_amount">Fixed Amount (R)</option>
                <option value="waive_registration">Waive Registration Fee</option>
              </select>
            </div>

            {formData.discount_type !== 'waive_registration' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={formData.discount_type === 'percentage' ? 100 : undefined}
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={formData.discount_type === 'percentage' ? '20' : '500'}
                />
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Redemptions (optional)
            </label>
            <input
              type="number"
              min="1"
              value={formData.max_redemptions}
              onChange={(e) => setFormData({ ...formData, max_redemptions: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="100"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited redemptions</p>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show on landing page</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.auto_apply}
                onChange={(e) => setFormData({ ...formData, auto_apply: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Auto-apply discount</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

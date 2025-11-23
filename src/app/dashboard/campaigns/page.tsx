'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Calendar, Tag, TrendingUp, Users, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

interface Campaign {
  id: string;
  organization_id: string;
  campaign_name: string;
  coupon_code: string;
  discount_percentage: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [organizationId, setOrganizationId] = useState<string>('');
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    campaign_name: '',
    coupon_code: '',
    discount_percentage: 10,
    max_uses: '',
    valid_from: '',
    valid_until: '',
    is_active: true,
  });

  // Check auth and get organization_id
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/dashboard/campaigns');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', session.user.id)
        .single();

      if (!profile?.organization_id) {
        console.error('No organization_id found for user');
        return;
      }

      setOrganizationId(profile.organization_id);
      loadCampaigns(profile.organization_id);
    };

    checkAuth();
  }, []);

  const loadCampaigns = async (orgId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;

    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .insert({
          organization_id: organizationId,
          campaign_name: formData.campaign_name,
          coupon_code: formData.coupon_code.toUpperCase(),
          discount_percentage: formData.discount_percentage,
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          valid_from: formData.valid_from,
          valid_until: formData.valid_until,
          is_active: formData.is_active,
          current_uses: 0,
        });

      if (error) throw error;

      // Reset form
      setFormData({
        campaign_name: '',
        coupon_code: '',
        discount_percentage: 10,
        max_uses: '',
        valid_from: '',
        valid_until: '',
        is_active: true,
      });
      setShowCreateModal(false);
      loadCampaigns(organizationId);
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    }
  };

  const handleUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;

    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .update({
          campaign_name: formData.campaign_name,
          coupon_code: formData.coupon_code.toUpperCase(),
          discount_percentage: formData.discount_percentage,
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          valid_from: formData.valid_from,
          valid_until: formData.valid_until,
          is_active: formData.is_active,
        })
        .eq('id', editingCampaign.id);

      if (error) throw error;

      setEditingCampaign(null);
      setFormData({
        campaign_name: '',
        coupon_code: '',
        discount_percentage: 10,
        max_uses: '',
        valid_from: '',
        valid_until: '',
        is_active: true,
      });
      loadCampaigns(organizationId);
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('Failed to update campaign. Please try again.');
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      loadCampaigns(organizationId);
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign. Please try again.');
    }
  };

  const handleToggleActive = async (campaign: Campaign) => {
    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .update({ is_active: !campaign.is_active })
        .eq('id', campaign.id);

      if (error) throw error;
      loadCampaigns(organizationId);
    } catch (error) {
      console.error('Error toggling campaign status:', error);
    }
  };

  const startEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      campaign_name: campaign.campaign_name,
      coupon_code: campaign.coupon_code,
      discount_percentage: campaign.discount_percentage,
      max_uses: campaign.max_uses?.toString() || '',
      valid_from: campaign.valid_from,
      valid_until: campaign.valid_until,
      is_active: campaign.is_active,
    });
  };

  const cancelEdit = () => {
    setEditingCampaign(null);
    setFormData({
      campaign_name: '',
      coupon_code: '',
      discount_percentage: 10,
      max_uses: '',
      valid_from: '',
      valid_until: '',
      is_active: true,
    });
  };

  const toggleExpanded = (campaignId: string) => {
    const newExpanded = new Set(expandedCampaigns);
    if (newExpanded.has(campaignId)) {
      newExpanded.delete(campaignId);
    } else {
      newExpanded.add(campaignId);
    }
    setExpandedCampaigns(newExpanded);
  };

  const getUsagePercentage = (campaign: Campaign) => {
    if (!campaign.max_uses) return 0;
    return (campaign.current_uses / campaign.max_uses) * 100;
  };

  const isExpired = (campaign: Campaign) => {
    return new Date(campaign.valid_until) < new Date();
  };

  const isUpcoming = (campaign: Campaign) => {
    return new Date(campaign.valid_from) > new Date();
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-300 border-t-amber-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Marketing Campaigns</h1>
          <p className="mt-1 text-sm text-stone-600">
            Create and manage promotional campaigns with coupon codes
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
        >
          <Plus size={18} />
          Create Campaign
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <TrendingUp size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-stone-600">Total Campaigns</p>
              <p className="text-xl font-bold text-stone-900">{campaigns.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Check size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-stone-600">Active Campaigns</p>
              <p className="text-xl font-bold text-stone-900">
                {campaigns.filter((c) => c.is_active && !isExpired(c)).length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-stone-600">Total Redemptions</p>
              <p className="text-xl font-bold text-stone-900">
                {campaigns.reduce((sum, c) => sum + c.current_uses, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Calendar size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-stone-600">Upcoming</p>
              <p className="text-xl font-bold text-stone-900">
                {campaigns.filter((c) => isUpcoming(c)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone-200">
              <Tag size={24} className="text-stone-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-stone-900">No campaigns yet</h3>
            <p className="mb-6 text-sm text-stone-600">
              Get started by creating your first marketing campaign
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
            >
              <Plus size={18} />
              Create Your First Campaign
            </button>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="rounded-lg border border-stone-200 bg-white overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-stone-900 truncate">
                        {campaign.campaign_name}
                      </h3>
                      {campaign.is_active && !isExpired(campaign) && !isUpcoming(campaign) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          <Check size={12} />
                          Active
                        </span>
                      )}
                      {isExpired(campaign) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                          <X size={12} />
                          Expired
                        </span>
                      )}
                      {isUpcoming(campaign) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                          <Calendar size={12} />
                          Upcoming
                        </span>
                      )}
                      {!campaign.is_active && !isExpired(campaign) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-stone-600">
                      <div className="flex items-center gap-2">
                        <Tag size={16} />
                        <span className="font-mono font-semibold">{campaign.coupon_code}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} />
                        <span>{campaign.discount_percentage}% off</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>
                          {campaign.current_uses}
                          {campaign.max_uses ? ` / ${campaign.max_uses}` : ''} uses
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpanded(campaign.id)}
                      className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
                      title={expandedCampaigns.has(campaign.id) ? 'Collapse' : 'Expand'}
                    >
                      {expandedCampaigns.has(campaign.id) ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                    <button
                      onClick={() => handleToggleActive(campaign)}
                      className={`p-2 rounded-lg transition-colors ${
                        campaign.is_active
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-stone-400 hover:bg-stone-100'
                      }`}
                      title={campaign.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {campaign.is_active ? <Check size={20} /> : <X size={20} />}
                    </button>
                    <button
                      onClick={() => startEdit(campaign)}
                      className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                      title="Edit campaign"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete campaign"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Usage Progress Bar */}
                {campaign.max_uses && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1 text-xs text-stone-600">
                      <span>Usage</span>
                      <span>{Math.round(getUsagePercentage(campaign))}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-stone-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          getUsagePercentage(campaign) >= 90
                            ? 'bg-red-500'
                            : getUsagePercentage(campaign) >= 70
                            ? 'bg-amber-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(getUsagePercentage(campaign), 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Expanded Details */}
                {expandedCampaigns.has(campaign.id) && (
                  <div className="mt-4 pt-4 border-t border-stone-200 space-y-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-stone-600 mb-1">Valid From</p>
                        <p className="text-sm text-stone-900">
                          {new Date(campaign.valid_from).toLocaleDateString('en-ZA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-stone-600 mb-1">Valid Until</p>
                        <p className="text-sm text-stone-900">
                          {new Date(campaign.valid_until).toLocaleDateString('en-ZA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-stone-600 mb-1">Created</p>
                        <p className="text-sm text-stone-900">
                          {new Date(campaign.created_at).toLocaleDateString('en-ZA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-stone-600 mb-1">Last Updated</p>
                        <p className="text-sm text-stone-900">
                          {new Date(campaign.updated_at).toLocaleDateString('en-ZA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCampaign) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4">
              <h2 className="text-xl font-bold text-stone-900">
                {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
              </h2>
            </div>
            <form onSubmit={editingCampaign ? handleUpdateCampaign : handleCreateCampaign} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="e.g., Early Bird Registration"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.coupon_code}
                  onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 font-mono focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="e.g., EARLYBIRD2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Discount Percentage *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Max Uses (optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Valid From *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Valid Until *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-stone-700">
                  Active campaign
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
                >
                  {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    cancelEdit();
                  }}
                  className="flex-1 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

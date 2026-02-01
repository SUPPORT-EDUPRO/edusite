'use client';

import {Edit2, Plus, Save, Ticket, Trash2, X } from 'lucide-react';
import { useEffect,useState } from 'react';

import AdminLayout from '@/components/admin/AdminLayout';
import { getServiceRoleClient } from '@/lib/supabase';

interface Campaign {
  id: string;
  organization_id: string;
  name: string;
  promo_code: string;
  campaign_type: 'early_bird' | 'sibling_discount' | 'referral_bonus' | 'seasonal_promo' | 'bundle_offer' | 'scholarship';
  description?: string | null;
  terms_conditions?: string | null;
  discount_type: 'percentage' | 'fixed_amount' | 'waive_registration' | 'first_month_free';
  discount_value: number | null;
  max_redemptions: number | null;
  current_redemptions: number;
  start_date: string;
  end_date: string;
  active: boolean;
  created_at: string;
}

interface EditingCampaign {
  id: string;
  max_redemptions: number;
  current_redemptions: number;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingCampaign | null>(null);
  const [creating, setCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    promo_code: '',
    campaign_type: 'early_bird' as Campaign['campaign_type'],
    description: '',
    terms_conditions: '',
    discount_type: 'percentage' as Campaign['discount_type'],
    discount_value: 50,
    max_redemptions: 50,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days
    active: true,
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const supabase = getServiceRoleClient();
      
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      alert('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      const supabase = getServiceRoleClient();

      // Get current user's organization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('You must be logged in to create campaigns');
        return;
      }

      // Get user's organization_id from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', session.user.id)
        .single();

      if (!profile?.organization_id) {
        alert('Could not determine your organization. Please contact support.');
        return;
      }

      const { error } = await supabase
        .from('marketing_campaigns')
        .insert({
          organization_id: profile.organization_id,
          name: newCampaign.name,
          promo_code: newCampaign.promo_code.toUpperCase(),
          campaign_type: newCampaign.campaign_type,
          description: newCampaign.description || null,
          terms_conditions: newCampaign.terms_conditions || null,
          discount_type: newCampaign.discount_type,
          discount_value: ['percentage', 'fixed_amount'].includes(newCampaign.discount_type)
            ? newCampaign.discount_value
            : null,
          max_redemptions: newCampaign.max_redemptions,
          current_redemptions: 0,
          start_date: newCampaign.start_date,
          end_date: newCampaign.end_date,
          active: newCampaign.active,
        });

      if (error) throw error;

      alert('✅ Campaign created successfully!');
      setCreating(false);
      setNewCampaign({
        name: '',
        promo_code: '',
        campaign_type: 'early_bird',
        description: '',
        terms_conditions: '',
        discount_type: 'percentage',
        discount_value: 50,
        max_redemptions: 50,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        active: true,
      });
      fetchCampaigns();
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      alert(`Failed to create campaign: ${error.message}`);
    }
  };

  const handleUpdateSlots = async (campaignId: string, maxRedemptions: number, currentRedemptions: number) => {
    if (currentRedemptions > maxRedemptions) {
      alert('⚠️ Current redemptions cannot exceed maximum redemptions!');
      return;
    }

    try {
      const supabase = getServiceRoleClient();

      const { error } = await supabase
        .from('marketing_campaigns')
        .update({
          max_redemptions: maxRedemptions,
          current_redemptions: currentRedemptions,
        })
        .eq('id', campaignId);

      if (error) throw error;

      alert('✅ Campaign slots updated successfully!');
      setEditing(null);
      fetchCampaigns();
    } catch (error: any) {
      console.error('Error updating campaign:', error);
      alert(`Failed to update campaign: ${error.message}`);
    }
  };

  const handleToggleActive = async (campaignId: string, currentActive: boolean) => {
    try {
      const supabase = getServiceRoleClient();

      const { error } = await supabase
        .from('marketing_campaigns')
        .update({ active: !currentActive })
        .eq('id', campaignId);

      if (error) throw error;

      fetchCampaigns();
    } catch (error: any) {
      console.error('Error toggling campaign:', error);
      alert(`Failed to toggle campaign: ${error.message}`);
    }
  };

  const handleDeleteCampaign = async (campaignId: string, promoCode: string) => {
    if (!confirm(`Are you sure you want to delete campaign "${promoCode}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const supabase = getServiceRoleClient();

      const { error } = await supabase
        .from('marketing_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      alert('✅ Campaign deleted successfully!');
      fetchCampaigns();
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      alert(`Failed to delete campaign: ${error.message}`);
    }
  };

  const getDiscountDisplay = (campaign: Campaign) => {
    const value = campaign.discount_value ?? 0;
    if (campaign.discount_type === 'percentage') {
      return `${value}% off`;
    }
    if (campaign.discount_type === 'fixed_amount') {
      return `R${value} off`;
    }
    if (campaign.discount_type === 'waive_registration') {
      return 'Registration Fee Waived';
    }
    if (campaign.discount_type === 'first_month_free') {
      return 'First Month Free';
    }
    return 'Discount';
  };

  const getRemainingSlots = (campaign: Campaign) => {
    if (campaign.max_redemptions === null) return null;
    return Math.max(0, campaign.max_redemptions - campaign.current_redemptions);
  };

  const getUsagePercentage = (campaign: Campaign) => {
    if (!campaign.max_redemptions || campaign.max_redemptions <= 0) return 0;
    return (campaign.current_redemptions / campaign.max_redemptions) * 100;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading campaigns...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Marketing Campaigns
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage promo codes and registration discounts
            </p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Create Campaign
          </button>
        </div>

        {/* Create Campaign Form */}
        {creating && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Campaign
              </h2>
              <button
                onClick={() => setCreating(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Early Bird Registration 2026"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Campaign Type
                </label>
                <select
                  value={newCampaign.campaign_type}
                  onChange={(e) => setNewCampaign({ ...newCampaign, campaign_type: e.target.value as Campaign['campaign_type'] })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Promo Code
                </label>
                <input
                  type="text"
                  value={newCampaign.promo_code}
                  onChange={(e) => setNewCampaign({ ...newCampaign, promo_code: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono uppercase dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="WELCOME2026"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Discount Type
                </label>
                <select
                  value={newCampaign.discount_type}
                  onChange={(e) => setNewCampaign({ ...newCampaign, discount_type: e.target.value as Campaign['discount_type'] })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="percentage">Percentage Off</option>
                  <option value="fixed_amount">Fixed Amount Off</option>
                  <option value="waive_registration">Waive Registration Fee</option>
                  <option value="first_month_free">First Month Free</option>
                </select>
              </div>

              {newCampaign.discount_type === 'percentage' ? (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discount Percentage
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newCampaign.discount_value}
                    onChange={(e) => setNewCampaign({ ...newCampaign, discount_value: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              ) : newCampaign.discount_type === 'fixed_amount' ? (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discount Amount (Rands)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newCampaign.discount_value}
                    onChange={(e) => setNewCampaign({ ...newCampaign, discount_value: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              ) : (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  This discount type does not require a numeric value.
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Maximum Redemptions
                </label>
                <input
                  type="number"
                  min="1"
                  value={newCampaign.max_redemptions}
                  onChange={(e) => setNewCampaign({ ...newCampaign, max_redemptions: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newCampaign.start_date}
                  onChange={(e) => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  End Date
                </label>
                <input
                  type="date"
                  value={newCampaign.end_date}
                  onChange={(e) => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={newCampaign.active}
                  onChange={(e) => setNewCampaign({ ...newCampaign, active: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <label htmlFor="active" className="text-sm text-gray-700 dark:text-gray-300">
                  Activate immediately
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleCreateCampaign}
                disabled={!newCampaign.name || !newCampaign.promo_code}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Create Campaign
              </button>
              <button
                onClick={() => setCreating(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {campaigns.map((campaign) => {
            const remaining = getRemainingSlots(campaign);
            const usagePercent = getUsagePercentage(campaign);
            const isExpired = new Date(campaign.end_date) < new Date();
            const isActive = campaign.active && !isExpired;

            return (
              <div
                key={campaign.id}
                className={`rounded-lg border p-6 shadow-sm transition ${
                  isActive
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Ticket className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {campaign.name}
                      </h3>
                    </div>
                    <p className="mt-1 font-mono text-sm text-gray-600 dark:text-gray-400">
                      Code: <span className="font-bold text-purple-600 dark:text-purple-400">{campaign.promo_code}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(campaign.id, campaign.active)}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                        campaign.active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {campaign.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                {/* Discount Info */}
                <div className="mb-4 rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-800 dark:text-purple-300">Discount</span>
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {getDiscountDisplay(campaign)}
                    </span>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Redemptions</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {campaign.current_redemptions} / {campaign.max_redemptions ?? '∞'}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-full transition-all ${
                        usagePercent >= 90
                          ? 'bg-red-500'
                          : usagePercent >= 70
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {remaining === null ? 'Unlimited slots' : `${remaining} slots remaining`}
                  </p>
                </div>

                {/* Edit Slots */}
                {editing?.id === campaign.id ? (
                  <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                    <p className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-200">
                      Edit Campaign Slots
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-xs text-blue-800 dark:text-blue-300">
                          Max Slots
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editing.max_redemptions}
                          onChange={(e) => setEditing({ ...editing, max_redemptions: parseInt(e.target.value) || 0 })}
                          className="w-full rounded border border-blue-300 px-2 py-1 text-sm dark:border-blue-700 dark:bg-blue-900/40 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-blue-800 dark:text-blue-300">
                          Current Used
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={editing.max_redemptions}
                          value={editing.current_redemptions}
                          onChange={(e) => setEditing({ ...editing, current_redemptions: parseInt(e.target.value) || 0 })}
                          className="w-full rounded border border-blue-300 px-2 py-1 text-sm dark:border-blue-700 dark:bg-blue-900/40 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleUpdateSlots(campaign.id, editing.max_redemptions, editing.current_redemptions)}
                        className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                      >
                        <Save className="h-3 w-3" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="rounded border border-blue-300 px-3 py-1 text-xs text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/40"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditing({
                      id: campaign.id,
                      max_redemptions: campaign.max_redemptions ?? 0,
                      current_redemptions: campaign.current_redemptions,
                    })}
                    className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Slots
                  </button>
                )}

                {/* Dates */}
                <div className="mb-4 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Start: {new Date(campaign.start_date).toLocaleDateString()}</span>
                    <span>End: {new Date(campaign.end_date).toLocaleDateString()}</span>
                  </div>
                  {isExpired && (
                    <p className="mt-1 text-red-600 dark:text-red-400">⚠️ Expired</p>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteCampaign(campaign.id, campaign.promo_code)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Campaign
                </button>
              </div>
            );
          })}
        </div>

        {campaigns.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <Ticket className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              No campaigns yet
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Create your first marketing campaign to offer registration discounts
            </p>
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              Create Campaign
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

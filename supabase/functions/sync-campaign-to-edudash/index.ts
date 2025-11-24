// Edge Function: sync-campaign-to-edudash
// Syncs marketing campaigns from EduSitePro → EduDashPro

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CampaignPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: any;
  old_record: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: CampaignPayload = await req.json();
    console.log('[sync-campaign-to-edudash] Received payload:', payload.type, payload.record?.id);

    // Get EduDashPro credentials from environment
    const edudashUrl = Deno.env.get('EDUDASH_SUPABASE_URL');
    const edudashKey = Deno.env.get('EDUDASH_SERVICE_ROLE_KEY');

    if (!edudashUrl || !edudashKey) {
      throw new Error('EduDashPro credentials not configured');
    }

    const edudashClient = createClient(edudashUrl, edudashKey);

    const campaign = payload.record;

    // Map organization_id (EduSitePro) to preschool_id (EduDashPro)
    const { data: preschoolMapping } = await edudashClient
      .from('preschools')
      .select('id, name')
      .eq('name', 'Young Eagles') // We'll need to enhance this with proper mapping
      .single();

    if (!preschoolMapping) {
      console.log('[sync-campaign-to-edudash] No matching preschool found in EduDashPro');
      return new Response(
        JSON.stringify({ success: false, error: 'Preschool not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const campaignData = {
      id: campaign.id, // Keep same ID for tracking
      organization_id: preschoolMapping.id,
      name: campaign.name,
      campaign_type: campaign.campaign_type,
      description: campaign.description,
      terms_conditions: campaign.terms_conditions,
      target_audience: campaign.target_audience,
      target_classes: campaign.target_classes,
      discount_type: campaign.discount_type,
      discount_value: campaign.discount_value,
      max_discount_amount: campaign.max_discount_amount,
      promo_code: campaign.promo_code,
      max_redemptions: campaign.max_redemptions,
      current_redemptions: campaign.current_redemptions,
      min_purchase_amount: campaign.min_purchase_amount,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      auto_apply: campaign.auto_apply,
      auto_apply_conditions: campaign.auto_apply_conditions,
      active: campaign.active,
      featured: campaign.featured,
    };

    if (payload.type === 'INSERT' || payload.type === 'UPDATE') {
      // Upsert to EduDashPro
      const { error: upsertError } = await edudashClient
        .from('marketing_campaigns')
        .upsert(campaignData, { onConflict: 'id' });

      if (upsertError) {
        console.error('[sync-campaign-to-edudash] Upsert error:', upsertError);
        throw upsertError;
      }

      console.log(`[sync-campaign-to-edudash] ✅ ${payload.type} synced:`, campaign.id);
    } else if (payload.type === 'DELETE') {
      // Delete from EduDashPro
      const { error: deleteError } = await edudashClient
        .from('marketing_campaigns')
        .delete()
        .eq('id', payload.old_record.id);

      if (deleteError) {
        console.error('[sync-campaign-to-edudash] Delete error:', deleteError);
        throw deleteError;
      }

      console.log('[sync-campaign-to-edudash] ✅ DELETE synced:', payload.old_record.id);
    }

    return new Response(
      JSON.stringify({ success: true, operation: payload.type }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[sync-campaign-to-edudash] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

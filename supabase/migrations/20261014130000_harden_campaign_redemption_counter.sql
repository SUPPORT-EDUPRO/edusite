-- increment_campaign_redemptions was executable by every signed-in user, so any parent could
-- burn a limited campaign (e.g. EARLYBIRD, max 30). It also never counted campaigns with no
-- maximum (SIBLING) because `current < NULL` is never true. Only the server (service role)
-- redeems campaigns, when a registration is approved.

CREATE OR REPLACE FUNCTION public.increment_campaign_redemptions(campaign_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.marketing_campaigns
  SET current_redemptions = COALESCE(current_redemptions, 0) + 1
  WHERE id = campaign_id
    AND (max_redemptions IS NULL OR COALESCE(current_redemptions, 0) < max_redemptions);
END;
$function$;

REVOKE ALL ON FUNCTION public.increment_campaign_redemptions(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_campaign_redemptions(uuid) TO service_role;

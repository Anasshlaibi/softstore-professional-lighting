-- ============================================================================
-- GEARSHOP.MA / VERDANOVE SARL — Phase 1 Security RLS Hardening Migration
-- REVIEW CAREFULLY BEFORE APPLYING IN SUPABASE SQL EDITOR.
-- This script enforces server/database-side Row Level Security (RLS) so:
--   1. Only verified admin accounts can read/modify CRM & subscriber tables.
--   2. Authenticated customers can ONLY read their own quote_requests by email.
--   3. Storefront public visitors can read "products gearshop" and submit leads,
--      but cannot read other customers' PII or modify catalog products.
-- ============================================================================

-- Helper function: checks if the current JWT belongs to an authorized admin
CREATE OR REPLACE FUNCTION public.is_gearshop_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR lower(COALESCE(auth.jwt() ->> 'email', '')) IN (
      'anasshlaibi@gmail.com',
      'verdanove@gmail.com'
    ),
    false
  );
$$;

-- ----------------------------------------------------------------------------
-- 1. newsletter_subscribers (Previously readable by anon!)
-- ----------------------------------------------------------------------------
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public insert newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admin full access newsletter" ON public.newsletter_subscribers;

CREATE POLICY "newsletter_public_insert"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "newsletter_admin_select"
  ON public.newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (public.is_gearshop_admin());

CREATE POLICY "newsletter_admin_update_delete"
  ON public.newsletter_subscribers
  FOR ALL
  TO authenticated
  USING (public.is_gearshop_admin())
  WITH CHECK (public.is_gearshop_admin());

-- ----------------------------------------------------------------------------
-- 2. quote_requests (Orders, Devis & Client Tracking)
-- ----------------------------------------------------------------------------
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read quotes" ON public.quote_requests;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.quote_requests;
DROP POLICY IF EXISTS "Allow public insert quotes" ON public.quote_requests;
DROP POLICY IF EXISTS "Admin full access quotes" ON public.quote_requests;

-- Storefront checkout & quote forms can create new requests
CREATE POLICY "quote_requests_public_insert"
  ON public.quote_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated customers can ONLY read their own quote_requests; admins read all
CREATE POLICY "quote_requests_owner_or_admin_select"
  ON public.quote_requests
  FOR SELECT
  TO authenticated
  USING (
    public.is_gearshop_admin()
    OR (
      email IS NOT NULL
      AND lower(email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
    )
  );

-- Only admins can update pipeline status / deal value or delete quotes
CREATE POLICY "quote_requests_admin_update_delete"
  ON public.quote_requests
  FOR UPDATE
  TO authenticated
  USING (public.is_gearshop_admin())
  WITH CHECK (public.is_gearshop_admin());

CREATE POLICY "quote_requests_admin_delete"
  ON public.quote_requests
  FOR DELETE
  TO authenticated
  USING (public.is_gearshop_admin());

-- ----------------------------------------------------------------------------
-- 3. contact_leads, product_requests, product_alerts
-- ----------------------------------------------------------------------------
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.contact_leads;
CREATE POLICY "contact_leads_public_insert" ON public.contact_leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "contact_leads_admin_all" ON public.contact_leads FOR ALL TO authenticated USING (public.is_gearshop_admin()) WITH CHECK (public.is_gearshop_admin());

ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.product_requests;
CREATE POLICY "product_requests_public_insert" ON public.product_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "product_requests_admin_all" ON public.product_requests FOR ALL TO authenticated USING (public.is_gearshop_admin()) WITH CHECK (public.is_gearshop_admin());

ALTER TABLE public.product_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.product_alerts;
CREATE POLICY "product_alerts_public_insert" ON public.product_alerts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "product_alerts_admin_all" ON public.product_alerts FOR ALL TO authenticated USING (public.is_gearshop_admin()) WITH CHECK (public.is_gearshop_admin());

-- ----------------------------------------------------------------------------
-- 4. email_campaigns, meta_capi_logs, cookie_consents
-- ----------------------------------------------------------------------------
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.email_campaigns;
CREATE POLICY "email_campaigns_admin_all" ON public.email_campaigns FOR ALL TO authenticated USING (public.is_gearshop_admin()) WITH CHECK (public.is_gearshop_admin());

ALTER TABLE public.meta_capi_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.meta_capi_logs;
CREATE POLICY "meta_capi_logs_public_insert" ON public.meta_capi_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "meta_capi_logs_admin_select" ON public.meta_capi_logs FOR SELECT TO authenticated USING (public.is_gearshop_admin());

ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.cookie_consents;
CREATE POLICY "cookie_consents_public_insert" ON public.cookie_consents FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "cookie_consents_admin_select" ON public.cookie_consents FOR SELECT TO authenticated USING (public.is_gearshop_admin());

-- ----------------------------------------------------------------------------
-- 5. "products gearshop" (Public catalog read, Admin-only write)
-- ----------------------------------------------------------------------------
ALTER TABLE public."products gearshop" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read products" ON public."products gearshop";
DROP POLICY IF EXISTS "Allow admin write products" ON public."products gearshop";

CREATE POLICY "products_public_select"
  ON public."products gearshop"
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "products_admin_insert"
  ON public."products gearshop"
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_gearshop_admin());

CREATE POLICY "products_admin_update"
  ON public."products gearshop"
  FOR UPDATE
  TO authenticated
  USING (public.is_gearshop_admin())
  WITH CHECK (public.is_gearshop_admin());

CREATE POLICY "products_admin_delete"
  ON public."products gearshop"
  FOR DELETE
  TO authenticated
  USING (public.is_gearshop_admin());

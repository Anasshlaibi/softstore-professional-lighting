-- ============================================================================
-- GEARSHOP.MA / VERDANOVE SARL — Phase 1 Security RLS Hardening Migration
-- Safe & idempotent: checks to_regclass() before altering optional tables.
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

DO $$
BEGIN
  -- 1. newsletter_subscribers
  IF to_regclass('public.newsletter_subscribers') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public read newsletter" ON public.newsletter_subscribers';
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.newsletter_subscribers';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public insert newsletter" ON public.newsletter_subscribers';
    EXECUTE 'DROP POLICY IF EXISTS "Admin full access newsletter" ON public.newsletter_subscribers';
    EXECUTE 'DROP POLICY IF EXISTS "newsletter_public_insert" ON public.newsletter_subscribers';
    EXECUTE 'DROP POLICY IF EXISTS "newsletter_admin_select" ON public.newsletter_subscribers';
    EXECUTE 'DROP POLICY IF EXISTS "newsletter_admin_update_delete" ON public.newsletter_subscribers';

    EXECUTE 'CREATE POLICY "newsletter_public_insert" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "newsletter_admin_select" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.is_gearshop_admin())';
    EXECUTE 'CREATE POLICY "newsletter_admin_update_delete" ON public.newsletter_subscribers FOR ALL TO authenticated USING (public.is_gearshop_admin()) WITH CHECK (public.is_gearshop_admin())';
  END IF;

  -- 2. quote_requests (Orders, Devis & Client Tracking)
  IF to_regclass('public.quote_requests') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public read quotes" ON public.quote_requests';
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.quote_requests';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public insert quotes" ON public.quote_requests';
    EXECUTE 'DROP POLICY IF EXISTS "Admin full access quotes" ON public.quote_requests';
    EXECUTE 'DROP POLICY IF EXISTS "quote_requests_public_insert" ON public.quote_requests';
    EXECUTE 'DROP POLICY IF EXISTS "quote_requests_owner_or_admin_select" ON public.quote_requests';
    EXECUTE 'DROP POLICY IF EXISTS "quote_requests_admin_update_delete" ON public.quote_requests';
    EXECUTE 'DROP POLICY IF EXISTS "quote_requests_admin_delete" ON public.quote_requests';

    EXECUTE 'CREATE POLICY "quote_requests_public_insert" ON public.quote_requests FOR INSERT TO anon, authenticated WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "quote_requests_owner_or_admin_select" ON public.quote_requests FOR SELECT TO authenticated USING (public.is_gearshop_admin() OR (email IS NOT NULL AND lower(email) = lower(COALESCE(auth.jwt() ->> ''email'', ''''))))';
    EXECUTE 'CREATE POLICY "quote_requests_admin_update_delete" ON public.quote_requests FOR UPDATE TO authenticated USING (public.is_gearshop_admin()) WITH CHECK (public.is_gearshop_admin())';
    EXECUTE 'CREATE POLICY "quote_requests_admin_delete" ON public.quote_requests FOR DELETE TO authenticated USING (public.is_gearshop_admin())';
  END IF;

  -- 3. contact_leads
  IF to_regclass('public.contact_leads') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.contact_leads';
    EXECUTE 'DROP POLICY IF EXISTS "contact_leads_public_insert" ON public.contact_leads';
    EXECUTE 'DROP POLICY IF EXISTS "contact_leads_admin_all" ON public.contact_leads';
    EXECUTE 'CREATE POLICY "contact_leads_public_insert" ON public.contact_leads FOR INSERT TO anon, authenticated WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "contact_leads_admin_all" ON public.contact_leads FOR ALL TO authenticated USING (public.is_gearshop_admin()) WITH CHECK (public.is_gearshop_admin())';
  END IF;

  -- 4. product_requests
  IF to_regclass('public.product_requests') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.product_requests';
    EXECUTE 'DROP POLICY IF EXISTS "product_requests_public_insert" ON public.product_requests';
    EXECUTE 'DROP POLICY IF EXISTS "product_requests_admin_all" ON public.product_requests';
    EXECUTE 'CREATE POLICY "product_requests_public_insert" ON public.product_requests FOR INSERT TO anon, authenticated WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "product_requests_admin_all" ON public.product_requests FOR ALL TO authenticated USING (public.is_gearshop_admin()) WITH CHECK (public.is_gearshop_admin())';
  END IF;

  -- 5. product_alerts
  IF to_regclass('public.product_alerts') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.product_alerts ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.product_alerts';
    EXECUTE 'DROP POLICY IF EXISTS "product_alerts_public_insert" ON public.product_alerts';
    EXECUTE 'DROP POLICY IF EXISTS "product_alerts_admin_all" ON public.product_alerts';
    EXECUTE 'CREATE POLICY "product_alerts_public_insert" ON public.product_alerts FOR INSERT TO anon, authenticated WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "product_alerts_admin_all" ON public.product_alerts FOR ALL TO authenticated USING (public.is_gearshop_admin()) WITH CHECK (public.is_gearshop_admin())';
  END IF;

  -- 6. email_campaigns
  IF to_regclass('public.email_campaigns') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.email_campaigns';
    EXECUTE 'DROP POLICY IF EXISTS "email_campaigns_admin_all" ON public.email_campaigns';
    EXECUTE 'CREATE POLICY "email_campaigns_admin_all" ON public.email_campaigns FOR ALL TO authenticated USING (public.is_gearshop_admin()) WITH CHECK (public.is_gearshop_admin())';
  END IF;

  -- 7. meta_capi_logs (optional)
  IF to_regclass('public.meta_capi_logs') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.meta_capi_logs ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.meta_capi_logs';
    EXECUTE 'DROP POLICY IF EXISTS "meta_capi_logs_public_insert" ON public.meta_capi_logs';
    EXECUTE 'DROP POLICY IF EXISTS "meta_capi_logs_admin_select" ON public.meta_capi_logs';
    EXECUTE 'CREATE POLICY "meta_capi_logs_public_insert" ON public.meta_capi_logs FOR INSERT TO anon, authenticated WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "meta_capi_logs_admin_select" ON public.meta_capi_logs FOR SELECT TO authenticated USING (public.is_gearshop_admin())';
  END IF;

  -- 8. cookie_consents (optional)
  IF to_regclass('public.cookie_consents') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.cookie_consents';
    EXECUTE 'DROP POLICY IF EXISTS "cookie_consents_public_insert" ON public.cookie_consents';
    EXECUTE 'DROP POLICY IF EXISTS "cookie_consents_admin_select" ON public.cookie_consents';
    EXECUTE 'CREATE POLICY "cookie_consents_public_insert" ON public.cookie_consents FOR INSERT TO anon, authenticated WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "cookie_consents_admin_select" ON public.cookie_consents FOR SELECT TO authenticated USING (public.is_gearshop_admin())';
  END IF;

  -- 9. "products gearshop" (Public catalog read, Admin-only write)
  IF to_regclass('public."products gearshop"') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public."products gearshop" ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public read products" ON public."products gearshop"';
    EXECUTE 'DROP POLICY IF EXISTS "Allow admin write products" ON public."products gearshop"';
    EXECUTE 'DROP POLICY IF EXISTS "products_public_select" ON public."products gearshop"';
    EXECUTE 'DROP POLICY IF EXISTS "products_admin_insert" ON public."products gearshop"';
    EXECUTE 'DROP POLICY IF EXISTS "products_admin_update" ON public."products gearshop"';
    EXECUTE 'DROP POLICY IF EXISTS "products_admin_delete" ON public."products gearshop"';
    EXECUTE 'CREATE POLICY "products_public_select" ON public."products gearshop" FOR SELECT TO anon, authenticated USING (true)';
    EXECUTE 'CREATE POLICY "products_admin_insert" ON public."products gearshop" FOR INSERT TO authenticated WITH CHECK (public.is_gearshop_admin())';
    EXECUTE 'CREATE POLICY "products_admin_update" ON public."products gearshop" FOR UPDATE TO authenticated USING (public.is_gearshop_admin()) WITH CHECK (public.is_gearshop_admin())';
    EXECUTE 'CREATE POLICY "products_admin_delete" ON public."products gearshop" FOR DELETE TO authenticated USING (public.is_gearshop_admin())';
  END IF;
END $$;

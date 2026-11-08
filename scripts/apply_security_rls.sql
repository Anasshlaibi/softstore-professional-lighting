-- ==============================================================================
-- SECURITY HARDENING: SUPABASE ROW LEVEL SECURITY (RLS) LOCKDOWN
-- Run this in the Supabase SQL Editor to secure the product catalog, customer PII,
-- and admin tables so ONLY the authenticated admin (anasshlaibi@gmail.com) can
-- read customer leads or modify products.
-- ==============================================================================

-- 1. Secure "products gearshop" (Public SELECT, Admin-Only INSERT/UPDATE/DELETE)
ALTER TABLE public."products gearshop" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read products gearshop" ON public."products gearshop";
DROP POLICY IF EXISTS "Enable read access for all users" ON public."products gearshop";
DROP POLICY IF EXISTS "Enable insert for all users" ON public."products gearshop";
DROP POLICY IF EXISTS "Enable update for all users" ON public."products gearshop";
DROP POLICY IF EXISTS "Enable delete for all users" ON public."products gearshop";
DROP POLICY IF EXISTS "Allow admin insert products gearshop" ON public."products gearshop";
DROP POLICY IF EXISTS "Allow admin update products gearshop" ON public."products gearshop";
DROP POLICY IF EXISTS "Allow admin delete products gearshop" ON public."products gearshop";

CREATE POLICY "Allow public read products gearshop" ON public."products gearshop"
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow admin insert products gearshop" ON public."products gearshop"
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com');

CREATE POLICY "Allow admin update products gearshop" ON public."products gearshop"
  FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com');

CREATE POLICY "Allow admin delete products gearshop" ON public."products gearshop"
  FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com');

-- 2. Drop old insecure or overly permissive policies on customer/lead tables
DROP POLICY IF EXISTS "Allow public select newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public update newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public delete newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated select newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated update newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated delete newsletter" ON public.newsletter_subscribers;

DROP POLICY IF EXISTS "Allow public select product requests" ON public.product_requests;
DROP POLICY IF EXISTS "Allow authenticated select product requests" ON public.product_requests;
DROP POLICY IF EXISTS "Allow authenticated update product requests" ON public.product_requests;
DROP POLICY IF EXISTS "Allow authenticated delete product requests" ON public.product_requests;

DROP POLICY IF EXISTS "Allow public select quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Allow public update quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Allow public delete quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Allow authenticated select quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Allow authenticated update quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Allow authenticated delete quote requests" ON public.quote_requests;

DROP POLICY IF EXISTS "Allow public select product alerts" ON public.product_alerts;
DROP POLICY IF EXISTS "Allow public update product alerts" ON public.product_alerts;
DROP POLICY IF EXISTS "Allow public delete product alerts" ON public.product_alerts;
DROP POLICY IF EXISTS "Allow authenticated select product alerts" ON public.product_alerts;
DROP POLICY IF EXISTS "Allow authenticated update product alerts" ON public.product_alerts;
DROP POLICY IF EXISTS "Allow authenticated delete product alerts" ON public.product_alerts;

DROP POLICY IF EXISTS "Allow public select contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Allow public update contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Allow public delete contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Allow authenticated select contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Allow authenticated update contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Allow authenticated delete contact leads" ON public.contact_leads;

DROP POLICY IF EXISTS "Allow public select campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Allow public insert campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Allow public update campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Allow public delete campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Allow authenticated select campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Allow authenticated insert campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Allow authenticated update campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Allow authenticated delete campaigns" ON public.email_campaigns;

-- 3. Enable RLS on all customer & lead tables
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- 4. Anonymous visitors can ONLY INSERT leads/consents with input validation
DROP POLICY IF EXISTS "Allow public insert newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Allow public insert newsletter" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3);

DROP POLICY IF EXISTS "Allow public insert product requests" ON public.product_requests;
CREATE POLICY "Allow public insert product requests" ON public.product_requests
  FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3);

DROP POLICY IF EXISTS "Allow public insert quote requests" ON public.quote_requests;
CREATE POLICY "Allow public insert quote requests" ON public.quote_requests
  FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3 OR length(phone) > 5);

DROP POLICY IF EXISTS "Allow public insert product alerts" ON public.product_alerts;
CREATE POLICY "Allow public insert product alerts" ON public.product_alerts
  FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3);

DROP POLICY IF EXISTS "Allow public insert contact leads" ON public.contact_leads;
CREATE POLICY "Allow public insert contact leads" ON public.contact_leads
  FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3 OR length(phone) > 5);

DROP POLICY IF EXISTS "Allow public insert cookie consents" ON public.cookie_consents;
CREATE POLICY "Allow public insert cookie consents" ON public.cookie_consents
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 5. Restrict SELECT, UPDATE, DELETE strictly to Admin Email (anasshlaibi@gmail.com)
CREATE POLICY "Allow admin select newsletter" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com');
CREATE POLICY "Allow admin update newsletter" ON public.newsletter_subscribers
  FOR UPDATE TO authenticated USING ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com');
CREATE POLICY "Allow admin delete newsletter" ON public.newsletter_subscribers
  FOR DELETE TO authenticated USING ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com');

CREATE POLICY "Allow admin select product requests" ON public.product_requests
  FOR SELECT TO authenticated USING ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com');
CREATE POLICY "Allow admin update product requests" ON public.product_requests
  FOR UPDATE TO authenticated USING ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com');
CREATE POLICY "Allow admin delete product requests" ON public.product_requests
  FOR DELETE TO authenticated USING ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com');

CREATE POLICY "Allow admin select quote requests" ON public.quote_requests
  FOR SELECT TO authenticated USING ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com');
CREATE POLICY "Allow admin update quote requests" ON public.quote_requests
  FOR UPDATE TO authenticated USING ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com');
CREATE POLICY "Allow admin delete quote requests" ON public.quote_requests
  FOR DELETE TO authenticated USING ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com');

CREATE POLICY "Allow admin select product alerts" ON public.product_alerts
  FOR SELECT TO authenticated USING ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com');
CREATE POLICY "Allow admin update product alerts" ON public.product_alerts
  FOR UPDATE TO authenticated USING ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com');
CREATE POLICY "Allow admin delete product alerts" ON public.product_alerts
  FOR DELETE TO authenticated USING ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com');

CREATE POLICY "Allow admin select contact leads" ON public.contact_leads
  FOR SELECT TO authenticated USING ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com');
CREATE POLICY "Allow admin update contact leads" ON public.contact_leads
  FOR UPDATE TO authenticated USING ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com');
CREATE POLICY "Allow admin delete contact leads" ON public.contact_leads
  FOR DELETE TO authenticated USING ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com');

CREATE POLICY "Allow admin all campaigns" ON public.email_campaigns
  FOR ALL TO authenticated USING ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'anasshlaibi@gmail.com');

-- ==============================================================================
-- SECURITY HARDENING: SUPABASE ROW LEVEL SECURITY (RLS) LOCKDOWN
-- Run this in the Supabase SQL Editor to secure customer PII & admin tables
-- ==============================================================================

-- 1. Drop old insecure policies if they exist
DROP POLICY IF EXISTS "Allow public select newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public update newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public delete newsletter" ON public.newsletter_subscribers;

DROP POLICY IF EXISTS "Allow public select product requests" ON public.product_requests;
DROP POLICY IF EXISTS "Allow public select quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Allow public update quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Allow public delete quote requests" ON public.quote_requests;

DROP POLICY IF EXISTS "Allow public select product alerts" ON public.product_alerts;
DROP POLICY IF EXISTS "Allow public update product alerts" ON public.product_alerts;
DROP POLICY IF EXISTS "Allow public delete product alerts" ON public.product_alerts;

DROP POLICY IF EXISTS "Allow public select contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Allow public update contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Allow public delete contact leads" ON public.contact_leads;

DROP POLICY IF EXISTS "Allow public select campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Allow public insert campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Allow public update campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Allow public delete campaigns" ON public.email_campaigns;

DROP POLICY IF EXISTS "Allow public select capi logs" ON public.meta_capi_logs;
DROP POLICY IF EXISTS "Allow public insert capi logs" ON public.meta_capi_logs;

-- 2. Ensure RLS is active on all sensitive tables
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_capi_logs ENABLE ROW LEVEL SECURITY;

-- 3. Anonymous users can ONLY INSERT with input length validation
CREATE POLICY "Allow public insert newsletter" ON public.newsletter_subscribers 
  FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3);

CREATE POLICY "Allow public insert product requests" ON public.product_requests 
  FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3);

CREATE POLICY "Allow public insert quote requests" ON public.quote_requests 
  FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3 OR length(phone) > 5);

CREATE POLICY "Allow public insert product alerts" ON public.product_alerts 
  FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3);

CREATE POLICY "Allow public insert contact leads" ON public.contact_leads 
  FOR INSERT TO anon, authenticated WITH CHECK (length(email) > 3 OR length(phone) > 5);

CREATE POLICY "Allow public insert cookie consents" ON public.cookie_consents 
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 4. Customer records & admin management restricted strictly to authenticated users
CREATE POLICY "Allow authenticated select newsletter" ON public.newsletter_subscribers 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update newsletter" ON public.newsletter_subscribers 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete newsletter" ON public.newsletter_subscribers 
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated select product requests" ON public.product_requests 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update product requests" ON public.product_requests 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete product requests" ON public.product_requests 
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated select quote requests" ON public.quote_requests 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update quote requests" ON public.quote_requests 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete quote requests" ON public.quote_requests 
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated select product alerts" ON public.product_alerts 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update product alerts" ON public.product_alerts 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete product alerts" ON public.product_alerts 
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated select contact leads" ON public.contact_leads 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update contact leads" ON public.contact_leads 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete contact leads" ON public.contact_leads 
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated select campaigns" ON public.email_campaigns 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert campaigns" ON public.email_campaigns 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update campaigns" ON public.email_campaigns 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete campaigns" ON public.email_campaigns 
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated select capi logs" ON public.meta_capi_logs 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert capi logs" ON public.meta_capi_logs 
  FOR INSERT TO authenticated WITH CHECK (true);

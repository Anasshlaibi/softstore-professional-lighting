import { supabase } from '../lib/supabase';
import { getAttributionData, AttributionData } from './attributionTracker';
import { calculateLeadScore, ScoreResult } from './leadScoringEngine';
import { trackLead, sendOfflinePurchaseEvent } from './metaCapiService';

export interface Subscriber {
  id: number;
  email: string;
  interests: string[];
  created_at: string;
}

export interface ProductRequestItem {
  id: number;
  product_name: string;
  brand?: string;
  budget?: string;
  notes?: string;
  email: string;
  fbclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing_page?: string;
  created_at: string;
}

export interface QuoteRequestItem {
  id: number;
  product_id?: number;
  product_name: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  quantity: number;
  message?: string;
  score: number;
  score_label: 'Hot' | 'Warm' | 'Cold';
  score_breakdown?: Record<string, number>;
  status: 'New' | 'Contacted' | 'Negotiating' | 'Waiting' | 'Won' | 'Lost';
  deal_value: number;
  fbclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_page?: string;
  referrer?: string;
  whatsapp_clicked?: boolean;
  time_to_close_days?: number;
  created_at: string;
}

export interface ProductAlertItem {
  id: number;
  product_id?: number;
  product_name: string;
  email: string;
  status: string;
  created_at: string;
}

export interface ContactLeadItem {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  score: number;
  score_label: 'Hot' | 'Warm' | 'Cold';
  score_breakdown?: Record<string, number>;
  status: 'New' | 'Contacted' | 'Negotiating' | 'Waiting' | 'Won' | 'Lost';
  deal_value: number;
  fbclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing_page?: string;
  whatsapp_clicked?: boolean;
  time_to_close_days?: number;
  created_at: string;
}

export interface EmailCampaignItem {
  id: number;
  subject: string;
  segment: string;
  type: string;
  body: string;
  recipient_count: number;
  sent_at: string;
}

// ===== 1. NEWSLETTER & CUSTOMER INTERESTS =====
export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Adresse email invalide');
  }

  const { data: existing } = await supabase
    .from('newsletter_subscribers')
    .select('id')
    .eq('email', cleanEmail)
    .single();

  if (existing) {
    return { success: true, message: 'Vous êtes déjà inscrit à la newsletter!' };
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert([{ email: cleanEmail, interests: [] }]);

  if (error) {
    console.error('Supabase newsletter error:', error);
    throw new Error('Erreur lors de l\'inscription à la newsletter');
  }

  trackLead('Newsletter', cleanEmail);
  return { success: true, message: 'Inscription réussie!' };
}

export async function updateSubscriberInterests(email: string, interests: string[]): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ interests })
    .eq('email', cleanEmail);

  if (error) {
    console.error('Error updating subscriber interests:', error);
    return false;
  }
  return true;
}

export async function getSubscribers(): Promise<Subscriber[]> {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error('Impossible de charger les abonnés');
  return (data || []).map(row => ({
    ...row,
    interests: Array.isArray(row.interests) ? row.interests : []
  }));
}

export async function deleteSubscriber(id: number): Promise<boolean> {
  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ===== 2. PRODUCT REQUESTS =====
export async function createProductRequest(data: {
  productName: string;
  brand?: string;
  budget?: string;
  notes?: string;
  email: string;
}): Promise<boolean> {
  const attr = getAttributionData();
  const { error } = await supabase.from('product_requests').insert([{
    product_name: data.productName,
    brand: data.brand || '',
    budget: data.budget || '',
    notes: data.notes || '',
    email: data.email.trim().toLowerCase(),
    fbclid: attr.fbclid,
    utm_source: attr.utm_source,
    utm_medium: attr.utm_medium,
    utm_campaign: attr.utm_campaign,
    landing_page: attr.landing_page,
    referrer: attr.referrer
  }]);

  if (error) throw new Error('Erreur lors de l\'envoi de la demande');
  trackLead('ProductRequest', data.email);
  return true;
}

export async function getProductRequests(): Promise<ProductRequestItem[]> {
  const { data, error } = await supabase.from('product_requests').select('*').order('created_at', { ascending: false });
  if (error) throw new Error('Impossible de charger les demandes de produits');
  return data || [];
}

// ===== 3. QUOTE REQUESTS WITH LEAD SCORING & ATTRIBUTION =====
export async function createQuoteRequest(data: {
  productId?: number;
  productName: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  quantity?: number;
  message?: string;
}): Promise<boolean> {
  const attr = getAttributionData();
  const scoring = calculateLeadScore(
    {
      email: data.email,
      phone: data.phone,
      company: data.company,
      quantity: data.quantity,
      productName: data.productName
    },
    attr
  );

  const { error } = await supabase.from('quote_requests').insert([{
    product_id: data.productId || null,
    product_name: data.productName,
    name: data.name,
    email: data.email.trim().toLowerCase(),
    phone: data.phone,
    company: data.company || '',
    quantity: data.quantity || 1,
    message: data.message || '',
    score: scoring.score,
    score_label: scoring.score_label,
    score_breakdown: scoring.breakdown,
    status: 'New',
    deal_value: 0,
    fbclid: attr.fbclid,
    utm_source: attr.utm_source,
    utm_medium: attr.utm_medium,
    utm_campaign: attr.utm_campaign,
    utm_content: attr.utm_content,
    utm_term: attr.utm_term,
    landing_page: attr.landing_page,
    referrer: attr.referrer,
    whatsapp_clicked: attr.whatsapp_clicked
  }]);

  if (error) throw new Error('Erreur lors de la demande de devis');
  trackLead('QuoteRequest', data.email, data.phone);
  return true;
}

export async function getQuoteRequests(): Promise<QuoteRequestItem[]> {
  const { data, error } = await supabase.from('quote_requests').select('*').order('created_at', { ascending: false });
  if (error) throw new Error('Impossible de charger les demandes de devis');
  return data || [];
}

// ===== 4. PRODUCT ALERTS =====
export async function createProductAlert(data: {
  productId?: number;
  productName: string;
  email: string;
}): Promise<boolean> {
  const { error } = await supabase.from('product_alerts').insert([{
    product_id: data.productId || null,
    product_name: data.productName,
    email: data.email.trim().toLowerCase(),
    status: 'pending'
  }]);

  if (error) throw new Error('Erreur lors de l\'inscription à l\'alerte');
  trackLead('StockAlert', data.email);
  return true;
}

export async function getProductAlerts(): Promise<ProductAlertItem[]> {
  const { data, error } = await supabase.from('product_alerts').select('*').order('created_at', { ascending: false });
  if (error) throw new Error('Impossible de charger les alertes produit');
  return data || [];
}

// ===== 5. CONTACT LEADS =====
export async function createContactLead(data: {
  name: string;
  email: string;
  phone?: string;
  message?: string;
}): Promise<boolean> {
  const attr = getAttributionData();
  const scoring = calculateLeadScore({ email: data.email, phone: data.phone }, attr);

  const { error } = await supabase.from('contact_leads').insert([{
    name: data.name,
    email: data.email.trim().toLowerCase(),
    phone: data.phone || '',
    message: data.message || '',
    score: scoring.score,
    score_label: scoring.score_label,
    score_breakdown: scoring.breakdown,
    status: 'New',
    deal_value: 0,
    fbclid: attr.fbclid,
    utm_source: attr.utm_source,
    utm_medium: attr.utm_medium,
    utm_campaign: attr.utm_campaign,
    landing_page: attr.landing_page,
    whatsapp_clicked: attr.whatsapp_clicked
  }]);

  if (error) throw new Error('Erreur lors de l\'enregistrement du contact');
  trackLead('ContactForm', data.email, data.phone);
  return true;
}

export async function getContactLeads(): Promise<ContactLeadItem[]> {
  const { data, error } = await supabase.from('contact_leads').select('*').order('created_at', { ascending: false });
  if (error) throw new Error('Impossible de charger les contacts');
  return data || [];
}

// ===== 6. PIPELINE STATUS & OFFLINE CAPI PURCHASE TRIGGER =====
export async function updateQuoteStatusAndValue(
  id: number,
  status: 'New' | 'Contacted' | 'Negotiating' | 'Waiting' | 'Won' | 'Lost',
  dealValueMAD: number = 0,
  quoteItem?: QuoteRequestItem
): Promise<boolean> {
  const closed_at = status === 'Won' || status === 'Lost' ? new Date().toISOString() : null;

  let time_to_close_days = 0;
  if (closed_at && quoteItem && quoteItem.created_at) {
    const start = new Date(quoteItem.created_at).getTime();
    const end = new Date(closed_at).getTime();
    time_to_close_days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  }

  const { error } = await supabase
    .from('quote_requests')
    .update({
      status,
      deal_value: dealValueMAD,
      closed_at,
      time_to_close_days
    })
    .eq('id', id);

  if (error) throw error;

  // OFFLINE CONVERSION EVENT: Dispatch Purchase CAPI ONLY if status is Won
  if (status === 'Won' && quoteItem) {
    sendOfflinePurchaseEvent(
      { email: quoteItem.email, phone: quoteItem.phone, productName: quoteItem.product_name },
      dealValueMAD
    );
  }

  return true;
}

// ===== 7. COOKIE CONSENTS =====
export async function saveCookieConsent(accepted: boolean, marketingAllowed: boolean): Promise<boolean> {
  try {
    localStorage.setItem('gearshop_cookie_consent', JSON.stringify({ accepted, marketingAllowed, date: new Date().toISOString() }));
    await supabase.from('cookie_consents').insert([{ consent_given: accepted, marketing_allowed: marketingAllowed }]);
    return true;
  } catch (err) {
    return true;
  }
}

// ===== 8. EMAIL CAMPAIGNS =====
export async function getEmailCampaigns(): Promise<EmailCampaignItem[]> {
  const { data, error } = await supabase.from('email_campaigns').select('*').order('sent_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function sendEmailCampaign(data: {
  subject: string;
  segment: string;
  type: string;
  body: string;
  resendApiKey?: string;
}): Promise<{ success: boolean; recipientCount: number; message: string }> {
  const subscribers = await getSubscribers();
  let recipients = subscribers;

  if (data.segment !== 'All') {
    recipients = subscribers.filter(sub =>
      sub.interests.some(i => i.toLowerCase().includes(data.segment.toLowerCase()))
    );
  }

  const recipientCount = recipients.length;

  await supabase.from('email_campaigns').insert([{
    subject: data.subject,
    segment: data.segment,
    type: data.type,
    body: data.body,
    recipient_count: recipientCount
  }]);

  const apiKey = data.resendApiKey || import.meta.env.VITE_RESEND_API_KEY;
  if (apiKey && recipients.length > 0) {
    try {
      const emailList = recipients.map(r => r.email);
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'GearShop Maroc <newsletter@gearshop.ma>',
          to: emailList.slice(0, 50),
          subject: data.subject,
          html: `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">${data.body.replace(/\n/g, '<br/>')}</div>`
        })
      });
    } catch (err) {}
  }

  return {
    success: true,
    recipientCount,
    message: `Campagne "${data.subject}" enregistrée pour ${recipientCount} abonnés!`
  };
}

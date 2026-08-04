import { supabase } from '../lib/supabase';

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
  status: 'New' | 'Contacted' | 'Closed';
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

  // Check if subscriber exists
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

  if (error) {
    console.error('Error fetching subscribers:', error);
    throw new Error('Impossible de charger les abonnés depuis la base de données');
  }
  return (data || []).map(row => ({
    ...row,
    interests: Array.isArray(row.interests) ? row.interests : []
  }));
}

export async function deleteSubscriber(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting subscriber:', error);
    throw error;
  }
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
  const { error } = await supabase
    .from('product_requests')
    .insert([{
      product_name: data.productName,
      brand: data.brand || '',
      budget: data.budget || '',
      notes: data.notes || '',
      email: data.email.trim().toLowerCase()
    }]);

  if (error) {
    console.error('Error creating product request:', error);
    throw new Error('Erreur lors de l\'envoi de la demande de matériel');
  }
  return true;
}

export async function getProductRequests(): Promise<ProductRequestItem[]> {
  const { data, error } = await supabase
    .from('product_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching product requests:', error);
    throw new Error('Impossible de charger les demandes de produits');
  }
  return data || [];
}

// ===== 3. QUOTE REQUESTS =====
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
  const { error } = await supabase
    .from('quote_requests')
    .insert([{
      product_id: data.productId || null,
      product_name: data.productName,
      name: data.name,
      email: data.email.trim().toLowerCase(),
      phone: data.phone,
      company: data.company || '',
      quantity: data.quantity || 1,
      message: data.message || ''
    }]);

  if (error) {
    console.error('Error creating quote request:', error);
    throw new Error('Erreur lors de l\'envoi de la demande de devis');
  }
  return true;
}

export async function getQuoteRequests(): Promise<QuoteRequestItem[]> {
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quote requests:', error);
    throw new Error('Impossible de charger les demandes de devis');
  }
  return data || [];
}

// ===== 4. PRODUCT ALERTS (BACK IN STOCK) =====
export async function createProductAlert(data: {
  productId?: number;
  productName: string;
  email: string;
}): Promise<boolean> {
  const { error } = await supabase
    .from('product_alerts')
    .insert([{
      product_id: data.productId || null,
      product_name: data.productName,
      email: data.email.trim().toLowerCase(),
      status: 'pending'
    }]);

  if (error) {
    console.error('Error creating product alert:', error);
    throw new Error('Erreur lors de l\'inscription à l\'alerte stock');
  }
  return true;
}

export async function getProductAlerts(): Promise<ProductAlertItem[]> {
  const { data, error } = await supabase
    .from('product_alerts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching product alerts:', error);
    throw new Error('Impossible de charger les alertes produit');
  }
  return data || [];
}

// ===== 5. CONTACT LEADS =====
export async function createContactLead(data: {
  name: string;
  email: string;
  phone?: string;
  message?: string;
}): Promise<boolean> {
  const { error } = await supabase
    .from('contact_leads')
    .insert([{
      name: data.name,
      email: data.email.trim().toLowerCase(),
      phone: data.phone || '',
      message: data.message || '',
      status: 'New'
    }]);

  if (error) {
    console.error('Error saving contact lead:', error);
    throw new Error('Erreur lors de l\'enregistrement du contact');
  }
  return true;
}

export async function getContactLeads(): Promise<ContactLeadItem[]> {
  const { data, error } = await supabase
    .from('contact_leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contact leads:', error);
    throw new Error('Impossible de charger les contacts');
  }
  return data || [];
}

export async function updateContactLeadStatus(id: number, status: 'New' | 'Contacted' | 'Closed'): Promise<boolean> {
  const { error } = await supabase
    .from('contact_leads')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating lead status:', error);
    throw error;
  }
  return true;
}

// ===== 6. COOKIE CONSENTS =====
export async function saveCookieConsent(accepted: boolean, marketingAllowed: boolean): Promise<boolean> {
  try {
    localStorage.setItem('gearshop_cookie_consent', JSON.stringify({ accepted, marketingAllowed, date: new Date().toISOString() }));
    await supabase.from('cookie_consents').insert([{ consent_given: accepted, marketing_allowed: marketingAllowed }]);
    return true;
  } catch (err) {
    console.warn('Cookie consent save note:', err);
    return true;
  }
}

// ===== 7. EMAIL CAMPAIGNS & RESEND =====
export async function getEmailCampaigns(): Promise<EmailCampaignItem[]> {
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .order('sent_at', { ascending: false });

  if (error) {
    console.warn('Could not fetch campaigns from DB:', error);
    return [];
  }
  return data || [];
}

export async function sendEmailCampaign(data: {
  subject: string;
  segment: string;
  type: string;
  body: string;
  resendApiKey?: string;
}): Promise<{ success: boolean; recipientCount: number; message: string }> {
  // Fetch recipients from subscribers based on segment
  const subscribers = await getSubscribers();
  let recipients = subscribers;

  if (data.segment !== 'All') {
    recipients = subscribers.filter(sub =>
      sub.interests.some(i => i.toLowerCase().includes(data.segment.toLowerCase()))
    );
  }

  const recipientCount = recipients.length;

  // Store campaign record in Supabase
  await supabase.from('email_campaigns').insert([{
    subject: data.subject,
    segment: data.segment,
    type: data.type,
    body: data.body,
    recipient_count: recipientCount
  }]);

  // If Resend API Key is available, trigger API call
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
          to: emailList.slice(0, 50), // Batch limits
          subject: data.subject,
          html: `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">${data.body.replace(/\n/g, '<br/>')}</div>`
        })
      });
    } catch (err) {
      console.warn('Resend API call error:', err);
    }
  }

  return {
    success: true,
    recipientCount,
    message: `Campagne "${data.subject}" enregistrée pour ${recipientCount} abonnés (${data.segment})!`
  };
}

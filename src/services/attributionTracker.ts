export interface AttributionData {
  fbclid: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  landing_page: string;
  referrer: string;
  visit_count: number;
  visited_products: string[];
  whatsapp_clicked: boolean;
  first_visit_time: string;
}

const STORAGE_KEY = 'gearshop_attribution_data';

export function initAttributionTracker(): AttributionData {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Read existing attribution or initialize new
  let existing: Partial<AttributionData> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (raw) existing = JSON.parse(raw);
  } catch (e) {
    existing = {};
  }

  // Extract new params if present in URL
  const fbclid = urlParams.get('fbclid') || existing.fbclid || '';
  const utm_source = urlParams.get('utm_source') || existing.utm_source || (document.referrer.includes('instagram') ? 'instagram' : document.referrer.includes('facebook') ? 'facebook' : document.referrer.includes('google') ? 'google' : 'direct');
  const utm_medium = urlParams.get('utm_medium') || existing.utm_medium || (fbclid ? 'cpc' : 'organic');
  const utm_campaign = urlParams.get('utm_campaign') || existing.utm_campaign || 'organic_traffic';
  const utm_content = urlParams.get('utm_content') || existing.utm_content || '';
  const utm_term = urlParams.get('utm_term') || existing.utm_term || '';
  const landing_page = existing.landing_page || window.location.pathname;
  const referrer = existing.referrer || document.referrer || 'direct';
  const visit_count = (existing.visit_count || 0) + 1;
  const first_visit_time = existing.first_visit_time || new Date().toISOString();
  const visited_products = existing.visited_products || [];
  const whatsapp_clicked = existing.whatsapp_clicked || false;

  const updatedData: AttributionData = {
    fbclid,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    landing_page,
    referrer,
    visit_count,
    visited_products,
    whatsapp_clicked,
    first_visit_time
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  } catch (e) {
    // Ignore storage quota errors
  }

  return updatedData;
}

export function recordProductView(productName: string): AttributionData {
  const current = initAttributionTracker();
  if (!current.visited_products.includes(productName)) {
    current.visited_products.push(productName);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {}
  }
  return current;
}

export function recordWhatsAppClick(): AttributionData {
  const current = initAttributionTracker();
  current.whatsapp_clicked = true;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {}
  return current;
}

export function getAttributionData(): AttributionData {
  return initAttributionTracker();
}

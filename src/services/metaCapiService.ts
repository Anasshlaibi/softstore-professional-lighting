import { supabase } from '../lib/supabase';

// Standard Crypto SHA-256 helper for Meta CAPI PII Hashing
async function hashSha256(str: string): Promise<string> {
  const clean = str.trim().toLowerCase();
  if (!clean) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(clean);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return clean;
  }
}

export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

interface MetaCapiEventOptions {
  eventName: string;
  eventId?: string;
  email?: string;
  phone?: string;
  value?: number;
  currency?: string;
  customData?: Record<string, any>;
}

export async function sendMetaCapiEvent(options: MetaCapiEventOptions): Promise<boolean> {
  const eventId = options.eventId || generateEventId();
  const pixelId = import.meta.env.VITE_META_PIXEL_ID || '1030771603130215';
  const token = import.meta.env.VITE_META_CAPI_TOKEN || localStorage.getItem('gearshop_capi_token') || '';

  // 1. Client-Side Meta Pixel dispatch (if loaded in window)
  if (typeof window !== 'undefined' && (window as any).fbq) {
    try {
      (window as any).fbq('track', options.eventName, {
        currency: options.currency || 'MAD',
        value: options.value || 0,
        ...options.customData
      }, { eventID: eventId });
    } catch (e) {
      console.warn('Pixel client track warning:', e);
    }
  }

  // 2. Server-Side CAPI POST if token available
  if (token && pixelId) {
    try {
      const hashedEmail = options.email ? await hashSha256(options.email) : '';
      const hashedPhone = options.phone ? await hashSha256(options.phone) : '';

      const payload = {
        data: [
          {
            event_name: options.eventName,
            event_time: Math.floor(Date.now() / 1000),
            event_id: eventId,
            action_source: 'website',
            user_data: {
              em: hashedEmail ? [hashedEmail] : [],
              ph: hashedPhone ? [hashedPhone] : [],
              client_user_agent: navigator.userAgent
            },
            custom_data: {
              currency: options.currency || 'MAD',
              value: options.value || 0,
              ...options.customData
            }
          }
        ]
      };

      const res = await fetch(`https://graph.facebook.net/v19.0/${pixelId}/events?access_token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resJson = await res.json();
      await supabase.from('meta_capi_logs').insert([{
        event_name: options.eventName,
        event_id: eventId,
        email: options.email || '',
        phone: options.phone || '',
        deal_value: options.value || 0,
        currency: options.currency || 'MAD',
        response_status: res.ok ? 'SUCCESS' : `ERROR: ${JSON.stringify(resJson)}`
      }]);

    } catch (err) {
      console.warn('Meta CAPI error:', err);
    }
  }

  return true;
}

// Convenience Helpers
export async function trackViewContent(productName: string, price: number, category: string) {
  return sendMetaCapiEvent({
    eventName: 'ViewContent',
    value: price,
    currency: 'MAD',
    customData: { content_name: productName, content_category: category }
  });
}

export async function trackSearch(query: string) {
  return sendMetaCapiEvent({
    eventName: 'Search',
    customData: { search_string: query }
  });
}

export async function trackContact(channel: 'WhatsApp' | 'ContactForm') {
  return sendMetaCapiEvent({
    eventName: 'Contact',
    customData: { channel }
  });
}

export async function trackLead(leadType: string, email: string, phone?: string, value?: number) {
  return sendMetaCapiEvent({
    eventName: 'Lead',
    email,
    phone,
    value: value || 0,
    currency: 'MAD',
    customData: { lead_type: leadType }
  });
}

// OFFLINE PURCHASE EVENT - Triggered ONLY when Admin marks a deal as "Won"
export async function sendOfflinePurchaseEvent(
  leadData: { email: string; phone?: string; productName?: string },
  dealValueMAD: number
) {
  return sendMetaCapiEvent({
    eventName: 'Purchase',
    email: leadData.email,
    phone: leadData.phone,
    value: dealValueMAD,
    currency: 'MAD',
    customData: {
      content_name: leadData.productName || 'Matériel Pro',
      offline_conversion: true
    }
  });
}

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
  customData?: Record<string, unknown>;
}

export async function sendMetaCapiEvent(options: MetaCapiEventOptions): Promise<boolean> {
  const eventId = options.eventId || generateEventId();

  // 1. Client-Side Meta Pixel dispatch (if loaded in window)
  if (typeof window !== 'undefined' && (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq) {
    try {
      (window as unknown as { fbq: (...args: unknown[]) => void }).fbq('track', options.eventName, {
        currency: options.currency || 'MAD',
        value: options.value || 0,
        ...options.customData
      }, { eventID: eventId });
    } catch (e) {
      console.warn('Pixel client track warning:', e);
    }
  }

  // 2. Server-Side CAPI Proxy through /api/meta-capi
  try {
    const res = await fetch('/api/meta-capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...options,
        eventId
      })
    });

    if (res.ok) {
      // Log event to Supabase logs table if user is authenticated
      supabase.from('meta_capi_logs').insert([{
        event_name: options.eventName,
        event_id: eventId,
        email: options.email || '',
        phone: options.phone || '',
        deal_value: options.value || 0,
        currency: options.currency || 'MAD',
        response_status: 'SUCCESS'
      }]).catch(() => {
        // silent catch if anonymous
      });
    }
  } catch {
    // Graceful fallback on client
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

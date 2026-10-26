type AnalyticsParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function sendEvent(eventName: string, params: AnalyticsParams) {
  if (typeof window === 'undefined') return;

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });
}

export interface WhatsAppLeadDetails {
  source: string;
  itemId?: string | number;
  itemName?: string;
  value?: number;
}

/**
 * A WhatsApp handoff is an enquiry, not a completed sale. This event is sent
 * before the visitor leaves GearShop so GA4 can count it as a lead.
 */
export function trackWhatsAppLead(details: WhatsAppLeadDetails) {
  sendEvent('generate_lead', {
    lead_channel: 'whatsapp',
    cta_source: details.source,
    item_id: details.itemId ? String(details.itemId) : undefined,
    item_name: details.itemName,
    value: details.value,
    currency: details.value ? 'MAD' : undefined,
  });
}

export function trackCheckoutStarted(value: number, itemCount: number) {
  sendEvent('begin_checkout', {
    currency: 'MAD',
    value,
    items_count: itemCount,
  });
}

/** Capture ordinary WhatsApp links used in headers, footers, FAQs and pages. */
export function initWhatsAppLeadTracking() {
  const handler = (event: MouseEvent) => {
    const target = event.target as Element | null;
    const link = target?.closest?.('a[href*="wa.me"]') as HTMLAnchorElement | null;
    if (!link) return;

    trackWhatsAppLead({
      source: link.getAttribute('data-whatsapp-source') || 'website_link',
    });
  };

  document.addEventListener('click', handler, true);
  return () => document.removeEventListener('click', handler, true);
}

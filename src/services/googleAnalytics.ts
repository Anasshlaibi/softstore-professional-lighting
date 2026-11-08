export interface GA4EcommerceItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_brand?: string;
  price: number;
  quantity?: number;
}

type AnalyticsParams = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
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

export function trackPageView(pagePath: string, pageTitle?: string) {
  if (typeof window === 'undefined') return;
  const pageLocation = window.location.href;
  sendEvent('page_view', {
    page_path: pagePath,
    page_location: pageLocation,
    page_title: pageTitle || document.title,
  });
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
}

export function trackViewItem(item: GA4EcommerceItem) {
  sendEvent('view_item', {
    currency: 'MAD',
    value: item.price,
    items: [
      {
        item_id: item.item_id,
        item_name: item.item_name,
        item_category: item.item_category,
        item_brand: item.item_brand,
        price: item.price,
        quantity: 1,
      },
    ],
  });
}

export function trackAddToCart(item: GA4EcommerceItem) {
  const qty = item.quantity || 1;
  const value = item.price * qty;
  sendEvent('add_to_cart', {
    currency: 'MAD',
    value,
    items: [
      {
        item_id: item.item_id,
        item_name: item.item_name,
        item_category: item.item_category,
        item_brand: item.item_brand,
        price: item.price,
        quantity: qty,
      },
    ],
  });
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'AddToCart', {
      content_ids: [item.item_id],
      content_name: item.item_name,
      content_category: item.item_category || 'Gear',
      content_type: 'product',
      value,
      currency: 'MAD',
    });
  }
}

export function trackRemoveFromCart(item: GA4EcommerceItem) {
  const qty = item.quantity || 1;
  sendEvent('remove_from_cart', {
    currency: 'MAD',
    value: item.price * qty,
    items: [
      {
        item_id: item.item_id,
        item_name: item.item_name,
        item_category: item.item_category,
        price: item.price,
        quantity: qty,
      },
    ],
  });
}

export function trackViewCart(value: number, items: GA4EcommerceItem[]) {
  sendEvent('view_cart', {
    currency: 'MAD',
    value,
    items,
  });
}

export interface WhatsAppLeadDetails {
  source: string;
  itemId?: string | number;
  itemName?: string;
  value?: number;
}

/**
 * A WhatsApp handoff is an enquiry or COD checkout handoff, not a completed online payment.
 * Distinguish checkout_whatsapp_order vs product_detail_order vs website_link via cta_source.
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

export function trackCheckoutStarted(
  value: number,
  itemCount: number,
  items?: GA4EcommerceItem[]
) {
  sendEvent('begin_checkout', {
    currency: 'MAD',
    value,
    items_count: itemCount,
    ...(items && items.length > 0 ? { items } : {}),
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

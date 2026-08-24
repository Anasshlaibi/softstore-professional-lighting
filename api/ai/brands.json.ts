/**
 * /api/ai/brands.json.ts — Vercel Edge Function
 *
 * Machine-readable index of supported brands, mount systems, and product offerings.
 */

export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://gunuqwikqhtllwplzcru.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_jFxYbBAqatWzrUOZ3N28ZA_xjxh5WET';

export default async function handler(req: Request) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/products%20gearshop?select=*&order=id.asc`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Supabase error ${res.status}`);
    }

    const products = await res.json();
    const baseUrl = 'https://gearshop.ma';

    const brandDetails: Record<string, any> = {
      '7artisans': {
        name: '7Artisans',
        role: 'Official Direct Distributor in Morocco',
        description: 'Manufacturer of high-performance autofocus F1.8 primes and T2.0 cinema lenses for Sony E, Canon RF, Nikon Z, Lumix L, Fuji FX.',
        popular_series: ['Autofocus F1.8 Series', 'Spectrum Cinema T2.0', 'Vision Cinema T2.1', 'Manual Fast Primes (F1.2, F1.4)'],
        mounts_supported: ['Sony E', 'Canon RF (EOS-R)', 'Nikon Z', 'Panasonic Lumix (L-Mount)', 'Micro 4/3', 'Fujifilm X (FX)'],
      },
      'kf-concept': {
        name: 'K&F Concept',
        role: 'Official Authorized Retailer in Morocco',
        description: 'Premium photographic filters, Variable ND filters, Black Diffusion Black Mist filters, CPL polarizers, and precision step-up rings.',
        popular_series: ['Nano-Xcel True Color VND', 'Black Mist 1/4 & 1/8 Diffusion', 'Slim CPL Polarizing', 'Step-Up Adapter Ring Sets'],
        mounts_supported: ['All Filter Thread Diameters (37mm to 95mm)'],
      },
      'sony': {
        name: 'Sony E-Mount Ecosystem',
        role: 'Compatible Systems',
        description: 'Full-frame and APS-C lenses and accessories engineered for Sony Alpha (A7 IV, A7R V, A7C II, FX3, FX30, ZV-E1).',
        popular_series: ['AF 24mm F1.8', 'AF 35mm F1.8', 'AF 50mm F1.8', 'AF 135mm F1.8', '35mm T2.0 Cine', '50mm T2.0 Cine'],
        mounts_supported: ['Sony E (Full Frame & APS-C)'],
      },
      'canon': {
        name: 'Canon RF / EOS-R Ecosystem',
        role: 'Compatible Systems',
        description: 'Native RF-Mount lenses for Canon EOS R system cameras (R5, R6 II, R8, R7, C70).',
        popular_series: ['35mm F1.4 Mark III FF', '35mm T2.0 Cine RF', '50mm T2.0 Cine RF', '10mm T2.1 RF', '16mm T2.1 RF'],
        mounts_supported: ['Canon RF (EOS-R)'],
      },
      'nikon': {
        name: 'Nikon Z-Mount Ecosystem',
        role: 'Compatible Systems',
        description: 'High resolution autofocus and cinema prime lenses for Nikon Z mirrorless cameras (Z5, Z6 II/III, Z7 II, Z8, Z9, Zf).',
        popular_series: ['AF 24mm F1.8 Z', 'AF 35mm F1.8 Z', 'AF 50mm F1.8 Z', 'AF 135mm F1.8 Z', '35mm T2.0 Cine Z', '50mm T2.0 Cine Z'],
        mounts_supported: ['Nikon Z'],
      },
      'panasonic': {
        name: 'Panasonic Lumix (L-Mount & M43)',
        role: 'Compatible Systems',
        description: 'L-Mount full-frame autofocus lenses and Micro 4/3 cine primes for Lumix S5, S5II, S1H, GH5, GH6.',
        popular_series: ['AF 24mm F1.8 L', 'AF 35mm F1.8 L', 'AF 50mm F1.8 L', 'AF 135mm F1.8 L', '10mm T2.1 M43', '16mm T2.1 M43'],
        mounts_supported: ['Leica/Panasonic L-Mount', 'Micro 4/3 (M43)'],
      },
      'fujifilm': {
        name: 'Fujifilm X-Mount',
        role: 'Compatible Systems',
        description: 'Autofocus and fast manual prime lenses tuned for Fuji X-Trans APS-C cameras (X-T5, X-T4, X-H2S, X-T30).',
        popular_series: ['AF 35mm F1.4 FX', 'AF 35mm F1.8 FX', 'AF 50mm F1.8 FX', '50mm F1.2 FX', '10mm T2.1 Cine FX'],
        mounts_supported: ['Fujifilm X (FX)'],
      },
      'dji': {
        name: 'DJI',
        role: 'Authorized Retailer',
        description: 'Pocket vlogging cameras, gimbals, and action accessories in Morocco.',
        popular_series: ['DJI Osmo Pocket 4 Pro', 'Osmo Action', 'DJI Wireless Mics'],
        mounts_supported: ['DJI Proprietary / Universal'],
      },
      'godox': {
        name: 'Godox',
        role: 'Authorized Retailer',
        description: 'Studio COB LED continuous lighting, on-camera RGB video torches, and portable modifiers in Morocco.',
        popular_series: ['LED COB Spotlights', 'RGB Tube & Pocket Lights', 'Parabolic Softboxes'],
        mounts_supported: ['Bowens Mount / 1/4" Thread / Cold Shoe'],
      },
    };

    const brands = Object.entries(brandDetails).map(([slug, details]) => ({
      slug,
      name: details.name,
      role_in_morocco: details.role,
      description: details.description,
      url: `${baseUrl}/marque/${slug}`,
      popular_series: details.popular_series,
      mounts_supported: details.mounts_supported,
      warranty: '1 year local Moroccan warranty backed by GearShop Casablanca',
    }));

    return new Response(JSON.stringify({
      '@context': 'https://schema.org',
      store: 'GearShop Maroc',
      updated_at: new Date().toISOString(),
      total_brands: brands.length,
      brands,
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Failed to load brands', message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
}

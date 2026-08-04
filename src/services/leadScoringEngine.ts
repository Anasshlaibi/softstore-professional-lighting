import scoringRules from '../data/scoringRules.json';
import { AttributionData } from './attributionTracker';

export interface ScoreResult {
  score: number;
  score_label: 'Hot' | 'Warm' | 'Cold';
  breakdown: Record<string, number>;
}

export function calculateLeadScore(
  formData: {
    email: string;
    phone?: string;
    company?: string;
    quantity?: number;
    budget?: string;
    productName?: string;
  },
  attribution: AttributionData
): ScoreResult {
  let score = 0;
  const breakdown: Record<string, number> = {};

  // 1. Pro / Company Email check
  const email = (formData.email || '').toLowerCase();
  const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  const domain = email.split('@')[1] || '';
  const isProEmail = domain && !freeDomains.includes(domain);

  if (formData.company || isProEmail) {
    const pts = scoringRules.company_email || 25;
    score += pts;
    breakdown['Company/Pro Email'] = pts;
  }

  // 2. Phone Provided
  if (formData.phone && formData.phone.trim().length >= 8) {
    const pts = scoringRules.phone_provided || 20;
    score += pts;
    breakdown['Phone Number Provided'] = pts;
  }

  // 3. High Budget / High Price
  const budgetStr = (formData.budget || '').replace(/[^0-9]/g, '');
  const budgetVal = parseInt(budgetStr) || 0;
  if (budgetVal >= 20000 || (formData.productName && formData.productName.toLowerCase().includes('35mm t2.0'))) {
    const pts = scoringRules.budget_over_20k || 25;
    score += pts;
    breakdown['High Value Budget (>20k MAD)'] = pts;
  }

  // 4. Cinema / Anamorphic Category
  const prodName = (formData.productName || '').toLowerCase();
  if (prodName.includes('cine') || prodName.includes('t2.0') || prodName.includes('t2.1') || prodName.includes('anamorphic')) {
    const pts = scoringRules.cinema_category || 20;
    score += pts;
    breakdown['Cinema / Pro Gear'] = pts;
  }

  // 5. Multiple Quantity / Products
  if ((formData.quantity && formData.quantity > 1) || (attribution.visited_products && attribution.visited_products.length > 3)) {
    const pts = scoringRules.multiple_items || 15;
    score += pts;
    breakdown['Multiple Items / Quantity'] = pts;
  }

  // 6. Visited 5+ Products
  if (attribution.visited_products && attribution.visited_products.length >= 5) {
    const pts = scoringRules.visited_5_products || 10;
    score += pts;
    breakdown['Deep Browsing (5+ Products)'] = pts;
  }

  // 7. Returned 3+ Times
  if (attribution.visit_count && attribution.visit_count >= 3) {
    const pts = scoringRules.visited_3_times || 15;
    score += pts;
    breakdown['Repeat Visitor (3+ Visits)'] = pts;
  }

  // 8. WhatsApp Clicked
  if (attribution.whatsapp_clicked) {
    const pts = scoringRules.whatsapp_clicked || 15;
    score += pts;
    breakdown['Clicked WhatsApp'] = pts;
  }

  // Score label categorization
  let score_label: 'Hot' | 'Warm' | 'Cold' = 'Cold';
  if (score >= 80) score_label = 'Hot';
  else if (score >= 50) score_label = 'Warm';

  return {
    score,
    score_label,
    breakdown
  };
}

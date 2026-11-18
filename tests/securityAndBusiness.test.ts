import { describe, it, expect } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAdminUser, verifyAdminRequest } from '../api/_lib/auth';
import sendEmailHandler from '../api/send-email';
import metaCapiHandler from '../api/meta-capi';
import clientOrdersHandler from '../api/client-orders';
import aiDevisHandler from '../api/ai-devis';
import { calculateErpTotals, numberToFrenchWordsMAD } from '../src/utils/devisInvoiceGenerator';

function createMockRes() {
  const res: { statusCode: number; body: unknown; status: (c: number) => typeof res; json: (b: unknown) => typeof res } = {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

function createMockReq(overrides: Partial<VercelRequest> = {}): VercelRequest {
  return {
    method: 'POST',
    headers: {},
    body: {},
    socket: { remoteAddress: '127.0.0.1' },
    ...overrides,
  } as unknown as VercelRequest;
}

describe('Phase 1 Security — Admin & API Authorization', () => {
  it('rejects null or non-admin customer users in isAdminUser', () => {
    expect(isAdminUser(null)).toBe(false);
    expect(isAdminUser({ id: 'u1', email: 'customer@gmail.com' })).toBe(false);
    expect(isAdminUser({ id: 'u2', email: 'customer@gmail.com', app_metadata: { role: 'user' } })).toBe(false);
  });

  it('accepts configured admin emails and app_metadata.role === admin', () => {
    expect(isAdminUser({ id: 'a1', email: 'anasshlaibi@gmail.com' })).toBe(true);
    expect(isAdminUser({ id: 'a2', email: 'Verdanove@gmail.com' })).toBe(true);
    expect(isAdminUser({ id: 'a3', email: 'staff@gearshop.ma', app_metadata: { role: 'admin' } })).toBe(true);
  });

  it('rejects unauthenticated requests in verifyAdminRequest with 401', async () => {
    const result = await verifyAdminRequest(createMockReq());
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.status).toBe(401);
    }
  });

  it('blocks unauthenticated POST to /api/send-email with 401', async () => {
    const res = createMockRes();
    await sendEmailHandler(
      createMockReq({
        body: { to: 'victim@example.com', subject: 'Spam', html: '<p>Hi</p>' },
      }),
      res as unknown as VercelResponse
    );
    expect(res.statusCode).toBe(401);
  });

  it('blocks unauthenticated POST to /api/ai-devis with 401', async () => {
    const res = createMockRes();
    await aiDevisHandler(
      createMockReq({ body: { contents: [{ role: 'user', parts: [{ text: 'hi' }] }] } }),
      res as unknown as VercelResponse
    );
    expect(res.statusCode).toBe(401);
  });

  it('blocks unauthenticated /api/client-orders bulk lookups without ref+phone', async () => {
    const res = createMockRes();
    await clientOrdersHandler(
      createMockReq({ body: { phone: '0724664656', ref: '' } }),
      res as unknown as VercelResponse
    );
    expect(res.statusCode).toBe(401);
  });

  it('validates eventName and value in /api/meta-capi', async () => {
    const badEventRes = createMockRes();
    await metaCapiHandler(
      createMockReq({ body: { eventName: 'ArbitraryCustomHack', value: 100 } }),
      badEventRes as unknown as VercelResponse
    );
    expect(badEventRes.statusCode).toBe(400);

    const badValueRes = createMockRes();
    await metaCapiHandler(
      createMockReq({ body: { eventName: 'Purchase', value: -50 } }),
      badValueRes as unknown as VercelResponse
    );
    expect(badValueRes.statusCode).toBe(400);

    const validRes = createMockRes();
    await metaCapiHandler(
      createMockReq({ body: { eventName: 'Lead', value: 21690, currency: 'MAD' } }),
      validRes as unknown as VercelResponse
    );
    expect(validRes.statusCode).toBe(200);
  });
});

describe('Phase 2 & ERP — Devis & TVA Calculations', () => {
  it('extracts 20% TVA accurately when taxMode is ttc_includes_20', () => {
    const totals = calculateErpTotals({
      docType: 'DEVIS',
      docNumber: 'FA2600001',
      issueDate: '2026-11-18',
      clientName: 'Client Test',
      items: [{ name: 'Nikon ZR', quantity: 1, unitPriceTtc: 12000 }],
      taxMode: 'ttc_includes_20',
      shippingCostTtc: 0,
    });
    expect(Math.round(totals.afterDiscountHt)).toBe(10000);
    expect(Math.round(totals.totalTva)).toBe(2000);
    expect(Math.round(totals.grandTotalTtc)).toBe(12000);
  });

  it('formats French MAD amount words cleanly', () => {
    expect(numberToFrenchWordsMAD(12000).toLowerCase()).toContain('douze mille');
  });
});

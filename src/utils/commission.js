/**
 * Platform commission — percentage-based slabs.
 *
 * Mirrors the backend rule in shopidoo_backend/src/utils/commission.util.js:
 *   commission = (product selling price × matching slab %) / 100
 *
 * Slab shape: { minPrice, maxPrice (null = no limit), commissionPercent }
 */

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/** Percentage held by a slab, tolerating payloads saved by an older client. */
export const slabPercent = (slab) => {
  const raw = slab?.commissionPercent ?? slab?.commissionPercentage ?? slab?.percent;
  const n = toNumberOrNull(raw);
  return n === null || n < 0 ? 0 : n;
};

/** Parse the stored slab value (array or JSON string) into a clean ascending list. */
export const normalizeCommissionSlabs = (raw) => {
  let slabs = raw;
  if (typeof slabs === 'string') {
    try { slabs = JSON.parse(slabs); } catch { return []; }
  }
  if (!Array.isArray(slabs)) return [];

  return slabs
    .map((slab) => {
      const minPrice = toNumberOrNull(slab?.minPrice);
      if (minPrice === null || minPrice < 0) return null;
      return { minPrice, maxPrice: toNumberOrNull(slab?.maxPrice), commissionPercent: slabPercent(slab) };
    })
    .filter(Boolean)
    .sort((a, b) => a.minPrice - b.minPrice);
};

/**
 * Slab that applies to a price: minPrice <= price <= maxPrice (maxPrice
 * inclusive, null = ∞). Ties go to the higher minPrice; a price that falls in a
 * gap between slabs uses the nearest slab below it.
 */
export const findSlabForPrice = (price, slabs) => {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return null;
  const list = normalizeCommissionSlabs(slabs);
  if (!list.length) return null;

  let matched = null;
  let fallback = null;
  for (const slab of list) {
    const { minPrice, maxPrice } = slab;
    if (amount >= minPrice && (maxPrice === null || amount <= maxPrice)) {
      if (!matched || minPrice > matched.minPrice) matched = slab;
    }
    if (amount >= minPrice && (!fallback || minPrice > fallback.minPrice)) fallback = slab;
  }
  return matched || fallback;
};

/** Commission percentage (0–100) for a price. */
export const getCommissionPercentForPrice = (price, slabs) => {
  const slab = findSlabForPrice(price, slabs);
  return slab ? slab.commissionPercent : 0;
};

/** Commission in ₹ for a single unit at `price`. */
export const calculateUnitCommission = (price, slabs) => {
  const p = Number(price);
  if (!Number.isFinite(p) || p <= 0) return 0;
  const percent = getCommissionPercentForPrice(p, slabs);
  return percent ? round2((p * percent) / 100) : 0;
};

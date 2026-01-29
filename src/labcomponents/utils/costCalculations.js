/**
 * Centralized Cost Calculation Utilities for Soap Making
 * 
 * Handles material cost, pricing, and totals calculation
 * with consistent unit handling and field name normalization.
 */

// Numeric helper - ensures values are always numbers
export const num = (v, def = 0) => {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : def;
};

/**
 * Get cost per unit from an inventory item
 * Handles various field naming conventions
 * @param {object} inv - Inventory item
 * @returns {number} Cost per unit
 */
export const getCostPerUnit = (inv) => {
  if (!inv) return 0;
  return num(inv.costPerUnit ?? inv.costPerKg ?? inv.cost ?? inv.price, 0);
};

/**
 * Get unit from inventory item with fallback
 * @param {object} inv - Inventory item
 * @returns {string} Unit in lowercase
 */
export const getUnit = (inv) => {
  return (inv?.unit || 'kg').toLowerCase();
};

/**
 * Calculate price per gram based on unit type
 * @param {number} costPerUnit - Cost per unit
 * @param {string} unit - Unit type (kg, g, l, ml)
 * @returns {number} Price per gram
 */
export const getPricePerGram = (costPerUnit, unit) => {
  const u = (unit || 'kg').toLowerCase();
  switch (u) {
    case 'kg':
      return costPerUnit / 1000;
    case 'g':
      return costPerUnit;
    case 'l':
    case 'liter':
    case 'litre':
      return costPerUnit / 1000; // Assume 1ml = 1g (close for most oils)
    case 'ml':
      return costPerUnit;
    default:
      return costPerUnit / 1000; // Default: assume kg
  }
};

/**
 * Find inventory item by key or name
 * @param {array} inventory - Inventory array
 * @param {object} item - Item to find (with key and/or name)
 * @returns {object|null} Matching inventory item
 */
export const findInventoryItem = (inventory, item) => {
  if (!inventory || !item) return null;
  return (
    inventory.find((g) => g.key === item.key) ||
    inventory.find((g) => (g.name || '').toLowerCase() === (item.name || '').toLowerCase())
  );
};

/**
 * Calculate total material cost for a soap recipe
 * @param {array} inventory - Inventory array
 * @param {array} oils - Array of oils with weights
 * @param {number} naoh - NaOH weight in grams
 * @param {number} water - Water weight in grams (usually free/negligible)
 * @param {array} additives - Array of additives with amounts
 * @param {object} options - Additional options { wastageBuffer: 0.05 }
 * @returns {number} Total material cost
 */
export const computeMaterialCost = (inventory = [], oils = [], naoh = 0, water = 0, additives = [], options = {}) => {
  let cost = 0;
  const wastageBuffer = num(options.wastageBuffer, 0.05); // 5% default

  // Oils cost
  (oils || []).forEach((it) => {
    const inv = findInventoryItem(inventory, it);
    const costPerUnit = getCostPerUnit(inv);
    const unit = getUnit(inv);
    const pricePerG = getPricePerGram(costPerUnit, unit);
    const weightG = num(it.weight, 0);
    cost += weightG * pricePerG;
  });

  // Additives cost
  (additives || []).forEach((a) => {
    const inv = findInventoryItem(inventory, a);
    const costPerUnit = getCostPerUnit(inv);
    const unit = getUnit(inv);
    const pricePerG = getPricePerGram(costPerUnit, unit);
    const amountG = num(a.amount, 0);
    cost += amountG * pricePerG;
  });

  // NaOH (alkali) cost
  const naohInv = inventory.find((g) => (g.category || '').toLowerCase() === 'alkali');
  if (naohInv) {
    const costPerUnit = getCostPerUnit(naohInv);
    const unit = getUnit(naohInv);
    const pricePerG = getPricePerGram(costPerUnit, unit);
    cost += num(naoh, 0) * pricePerG;
  }

  // Water is typically free, but could add water cost here if needed

  // Add wastage buffer
  return num(cost, 0) * (1 + wastageBuffer);
};

/**
 * Build totals object for pricing calculations
 * @param {object} costObj - Object with material, working, packaging costs
 * @param {number} bars - Number of bars
 * @returns {object} Totals object
 */
export const buildTotals = (costObj = {}, bars = 1) => {
  const baseCost = num(costObj.material, 0);
  const workingCost = num(costObj.working, 0);
  const packagingCost = num(costObj.packaging, 0);
  const safeBars = Math.max(1, num(bars, 1));
  const totalCost = baseCost + workingCost + packagingCost;
  const perBar = totalCost / safeBars;
  
  return {
    baseCost,
    workingCost,
    packagingCost,
    totalCost,
    perBar,
    bars: safeBars,
  };
};

/**
 * Compute pricing based on cost per bar
 * @param {number} perBar - Cost per bar
 * @param {object} opts - Options { markup, margin, fixedPrice, multiplier }
 * @returns {object} { sellingPrice, profit, margin }
 */
export const computePricing = (perBar, opts = {}) => {
  const multiplier = opts.multiplier ?? 2.5;
  const markupPct = opts.markup ?? null;
  let marginPct = opts.margin ?? null;
  const fixed = opts.fixedPrice ?? null;
  let sp = fixed;

  if (!sp) {
    if (markupPct != null && perBar > 0) {
      // Markup: selling = cost * (1 + markup%)
      sp = perBar * (1 + markupPct / 100);
    } else if (marginPct != null && perBar > 0) {
      // Margin: profit / sellingPrice
      if (marginPct >= 100) marginPct = 99.9;
      sp = perBar / (1 - marginPct / 100);
    } else {
      sp = perBar * multiplier;
    }
  }

  // Ensure non-negative selling price
  sp = Math.max(0, Number(sp) || 0);
  
  // Psychological rounding (e.g., ₹99, ₹199)
  let rounded = Math.round(sp / 10) * 10 - 1;
  if (rounded < 0) rounded = 0;

  const profit = rounded - perBar;
  const margin = rounded > 0 ? Math.round((profit / rounded) * 100) : 0;
  
  return {
    sellingPrice: rounded,
    profit: Math.round(profit),
    margin,
  };
};

/**
 * Sanitize totals object to guarantee numeric fields
 * @param {object} t - Totals object
 * @returns {object} Sanitized totals
 */
export const sanitizeTotals = (t) => ({
  baseCost: Number(num(t?.baseCost, 0)),
  workingCost: Number(num(t?.workingCost, 0)),
  packagingCost: Number(num(t?.packagingCost, 0)),
  totalCost: Number(num(t?.totalCost, 0)),
  perBar: Number(num(t?.perBar, 0)),
  bars: Math.max(1, Number(num(t?.bars, 1))),
});

/**
 * Ensure totals from a recipe are always numeric
 * @param {object} recipe - Recipe object
 * @returns {object} Totals object
 */
export const ensureTotals = (recipe) => {
  const bars = Math.max(
    1,
    Math.round(num(recipe.batchSize, recipe.totalOilWeight) / num(recipe.barWeight, 100))
  );
  return buildTotals(
    {
      material: num(recipe.cost?.material, 0),
      working: num(recipe.cost?.working, 0),
      packaging: num(recipe.cost?.packaging, 0),
    },
    bars
  );
};

export default {
  num,
  getCostPerUnit,
  getUnit,
  getPricePerGram,
  findInventoryItem,
  computeMaterialCost,
  buildTotals,
  computePricing,
  sanitizeTotals,
  ensureTotals,
};

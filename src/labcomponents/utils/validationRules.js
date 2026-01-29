/**
 * Centralized Validation Rules for Soap Making
 * 
 * These rules ensure safe and effective soap formulations
 * based on industry standards and best practices.
 */

import { getSapValue } from './sapValues';

// Enums for oil metadata validation
export const OIL_GROUPS = ["conditioning", "cleansing", "butter", "lather_booster"];
export const LATHER_TYPES = ["low", "creamy", "bubbly"];
export const TRACE_SPEEDS = ["slow", "medium", "fast"];

// Helper to check if ingredient is an oil
export const isOil = (ing = {}) => {
  const t = (ing.type || ing.category || "").toLowerCase();
  return t.includes("oil") || t.includes("butter");
};

// Numeric helper
const num = (v, def = 0) => {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : def;
};

/**
 * Validate soap recipe against safety and quality rules
 * @param {object} recipe - The recipe object
 * @param {array} inventory - Inventory array for per-oil checks
 * @returns {array} Array of validation issues (empty if valid)
 */
export const validateRules = (recipe, inventory = []) => {
  const issues = [];
  const useFace = recipe.use?.includes("face");
  const useBody = recipe.use?.includes("body");
  const oils = recipe.oils?.oils ?? recipe.items ?? [];

  // Helper to get percentage of a specific oil
  const getPct = (needle) => {
    const it = oils.find(
      (i) =>
        i.key === needle ||
        i.name?.toLowerCase() === needle ||
        i.name?.toLowerCase().includes(needle)
    );
    return it ? num(it.pct ?? it.percent, 0) : 0;
  };

  const totalPct =
    recipe.oils?.totalPct ??
    oils.reduce((s, i) => s + num(i.pct ?? i.percent, 0), 0);

  const coconutPct = getPct("coconut");
  const castorPct = getPct("castor");
  
  // Calculate conditioning oils percentage
  const conditioningOils = ["olive", "almond", "sesame", "ricebran", "rice_bran", "shea", "avocado", "sunflower", "canola"];
  const conditioningPct = conditioningOils.reduce((sum, oilKey) => sum + getPct(oilKey), 0);

  // Essential oil validation
  const eoAdditives = (recipe.additives || []).filter(
    (a) => a.type === 'fragrance' || 
           (a.type || '').toLowerCase().includes('essential') ||
           (a.type || '').toLowerCase().includes('fragrance')
  );
  const totalEOg = eoAdditives.reduce((s, a) => s + num(a.amount, 0), 0);
  const totalOilWeight = num(recipe.totalOilWeight, 0);
  const eoPct = totalOilWeight > 0 ? (totalEOg / totalOilWeight) * 100 : 0;

  // Also check the old essential_oils object format
  const eoFromObj = Object.values(recipe.essential_oils || {}).reduce(
    (s, v) => s + num(v?.pct ?? v, 0),
    0
  );
  const totalEOPct = eoPct + eoFromObj;

  // ==================== CORE RULES ====================

  // Coconut oil limits (cleansing, can be drying)
  if (useFace && coconutPct > 20) {
    issues.push("Face: Coconut ≤ 20% (too cleansing for face)");
  }
  if (useBody && coconutPct > 30) {
    issues.push("Body: Coconut ≤ 30% (can be drying)");
  }

  // Castor oil limit (too much makes soap sticky/soft)
  if (castorPct > 10) {
    issues.push("Castor ≤ 10% (excess makes soap sticky)");
  }

  // Essential oil safety limits
  if (useFace && totalEOPct > 1) {
    issues.push("Face: Essential oils ≤ 1% (skin sensitization risk)");
  }
  if (useBody && totalEOPct > 2) {
    issues.push("Body: Essential oils ≤ 2% (skin sensitization risk)");
  }

  // Total oils must equal 100%
  if (Math.round(totalPct) !== 100) {
    issues.push(`Total oils must equal 100% (currently ${totalPct.toFixed(1)}%)`);
  }

  // Conditioning oils recommendation
  if (conditioningPct < 60) {
    issues.push(`Conditioning oils ≥ 60% recommended (currently ${conditioningPct.toFixed(1)}%)`);
  }

  // Superfat limits based on use
  const sf = num(recipe.superfat, 6);
  if (useFace && (sf < 7 || sf > 8)) {
    issues.push("Face: Superfat 7–8% recommended");
  }
  if (useBody && (sf < 5 || sf > 8)) {
    issues.push("Body: Superfat 5–8% recommended");
  }

  // Lye concentration limits (safety)
  const lyeConc = num(recipe.lyeConcentration, 0.3);
  if (lyeConc < 0.25 || lyeConc > 0.40) {
    issues.push("Lye concentration should be 25-40% (28-33% typical)");
  }

  // ==================== PER-OIL RULES ====================

  oils.forEach((it) => {
    const pct = num(it.pct ?? it.percent, 0);
    const inv =
      inventory.find((g) => g.key === it.key) ||
      inventory.find((g) => (g.name || "").toLowerCase() === (it.name || "").toLowerCase());
    const label = inv?.name || it.name || it.key || "Oil";
    
    if (!inv || !isOil(inv)) return;

    const recMax = num(inv.recommendedMaxPct, 70);
    const faceMax = num(inv.faceMaxPct, 100);
    const absMax = num(inv.absoluteMaxPct, 100);

    // Absolute maximum check
    if (pct > absMax) {
      issues.push(`${label}: Exceeds absolute max ${absMax}%`);
    }
    // Face-specific maximum
    if (useFace && pct > faceMax) {
      issues.push(`Face: ${label} ≤ ${faceMax}%`);
    }
    // Recommended maximum (soft warning)
    if (pct > recMax && pct <= absMax) {
      issues.push(`${label}: Recommended ≤ ${recMax}% (currently ${pct.toFixed(1)}%)`);
    }

    // Enum validation for metadata
    if (inv.oilGroup && !OIL_GROUPS.includes(String(inv.oilGroup).toLowerCase())) {
      issues.push(`${label}: oilGroup must be one of ${OIL_GROUPS.join("/")}`);
    }
    if (inv.latherType && !LATHER_TYPES.includes(String(inv.latherType).toLowerCase())) {
      issues.push(`${label}: latherType must be one of ${LATHER_TYPES.join("/")}`);
    }
    if (inv.traceSpeed && !TRACE_SPEEDS.includes(String(inv.traceSpeed).toLowerCase())) {
      issues.push(`${label}: traceSpeed must be one of ${TRACE_SPEEDS.join("/")}`);
    }
  });

  return issues;
};

/**
 * Get recommended superfat range based on soap use
 * @param {array} use - Array of use types ['face', 'body', etc.]
 * @returns {object} { min, max, label }
 */
export const getRecommendedSuperfatRange = (use = []) => {
  if (use.includes('face')) return { min: 7, max: 8, label: 'Face (7–8%)' };
  if (use.includes('body')) return { min: 5, max: 8, label: 'Body (5–8%)' };
  if (use.includes('hair')) return { min: 1, max: 3, label: 'Hair (1–3%)' };
  return { min: 5, max: 8, label: 'Default (5–8%)' };
};

/**
 * Get recommended essential oil limits based on soap use
 * @param {array} use - Array of use types
 * @returns {object} { maxPct, label }
 */
export const getEOLimits = (use = []) => {
  if (use.includes('face')) return { maxPct: 1, label: 'Face: ≤1%' };
  if (use.includes('body')) return { maxPct: 2, label: 'Body: ≤2%' };
  return { maxPct: 3, label: 'General: ≤3%' };
};

export default validateRules;

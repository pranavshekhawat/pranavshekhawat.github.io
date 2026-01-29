/**
 * Centralized SAP (Saponification) Values for Soap Making
 * 
 * SAP value = grams of NaOH needed to saponify 1 gram of oil
 * These are NaOH SAP values (for KOH, multiply by 1.403)
 * 
 * Sources: SoapCalc, Bramble Berry, industry standards
 */

// Comprehensive SAP values for all common oils and butters
export const SAP_VALUES = {
  // Common Oils
  olive: 0.134,
  olive_oil: 0.134,
  "olive oil": 0.134,
  
  coconut: 0.183,
  coconut_oil: 0.183,
  "coconut oil": 0.183,
  
  palm: 0.142,
  palm_oil: 0.142,
  "palm oil": 0.142,
  
  castor: 0.128,
  castor_oil: 0.128,
  "castor oil": 0.128,
  
  ricebran: 0.128,
  rice_bran: 0.128,
  rice_bran_oil: 0.128,
  "rice bran oil": 0.128,
  
  almond: 0.136,
  sweet_almond: 0.136,
  sweet_almond_oil: 0.136,
  "sweet almond oil": 0.136,
  
  sunflower: 0.134,
  sunflower_oil: 0.134,
  "sunflower oil": 0.134,
  
  canola: 0.124,
  canola_oil: 0.124,
  "canola oil": 0.124,
  
  sesame: 0.134,
  sesame_oil: 0.134,
  "sesame oil": 0.134,
  
  mustard: 0.124,
  mustard_oil: 0.124,
  "mustard oil": 0.124,
  
  groundnut: 0.136,
  peanut: 0.136,
  groundnut_oil: 0.136,
  peanut_oil: 0.136,
  "groundnut oil": 0.136,
  "peanut oil": 0.136,
  
  avocado: 0.133,
  avocado_oil: 0.133,
  "avocado oil": 0.133,
  
  jojoba: 0.066,
  jojoba_oil: 0.066,
  "jojoba oil": 0.066,
  
  grapeseed: 0.127,
  grapeseed_oil: 0.127,
  "grapeseed oil": 0.127,
  
  apricot: 0.135,
  apricot_kernel: 0.135,
  apricot_kernel_oil: 0.135,
  "apricot kernel oil": 0.135,
  
  hemp: 0.135,
  hempseed: 0.135,
  hemp_seed_oil: 0.135,
  "hemp seed oil": 0.135,
  
  safflower: 0.136,
  safflower_oil: 0.136,
  "safflower oil": 0.136,
  
  flaxseed: 0.136,
  linseed: 0.136,
  flaxseed_oil: 0.136,
  linseed_oil: 0.136,
  "flaxseed oil": 0.136,
  "linseed oil": 0.136,
  
  neem: 0.139,
  neem_oil: 0.139,
  "neem oil": 0.139,
  
  walnut: 0.135,
  walnut_oil: 0.135,
  "walnut oil": 0.135,
  
  macadamia: 0.139,
  macadamia_nut: 0.139,
  macadamia_nut_oil: 0.139,
  "macadamia nut oil": 0.139,
  
  hazelnut: 0.136,
  hazelnut_oil: 0.136,
  "hazelnut oil": 0.136,
  
  wheat_germ: 0.131,
  wheat_germ_oil: 0.131,
  "wheat germ oil": 0.131,
  
  evening_primrose: 0.136,
  evening_primrose_oil: 0.136,
  "evening primrose oil": 0.136,
  
  rosehip: 0.138,
  rosehip_seed: 0.138,
  rosehip_seed_oil: 0.138,
  "rosehip seed oil": 0.138,
  
  babassu: 0.175,
  babassu_oil: 0.175,
  "babassu oil": 0.175,
  
  palm_kernel: 0.176,
  palm_kernel_oil: 0.176,
  "palm kernel oil": 0.176,
  
  lard: 0.138,
  pig_fat: 0.138,
  "lard (pig fat)": 0.138,
  
  tallow: 0.140,
  beef_fat: 0.140,
  "tallow (beef fat)": 0.140,
  
  // Butters
  shea: 0.128,
  shea_butter: 0.128,
  "shea butter": 0.128,
  
  cocoa: 0.137,
  cocoa_butter: 0.137,
  "cocoa butter": 0.137,
  
  mango: 0.128,
  mango_butter: 0.128,
  "mango butter": 0.128,
  
  kokum: 0.135,
  kokum_butter: 0.135,
  "kokum butter": 0.135,
  
  sal: 0.130,
  sal_butter: 0.130,
  "sal butter": 0.130,
  
  illipe: 0.136,
  illipe_butter: 0.136,
  "illipe butter": 0.136,
  
  cupuacu: 0.137,
  cupuacu_butter: 0.137,
  "cupuacu butter": 0.137,
  
  murumuru: 0.171,
  murumuru_butter: 0.171,
  "murumuru butter": 0.171,
  
  tucuma: 0.172,
  tucuma_butter: 0.172,
  "tucuma butter": 0.172,
};

/**
 * Get SAP value for an oil/butter
 * @param {string|object} oil - Oil name, key, or object with name/key
 * @param {object} inventory - Optional inventory array to check for custom SAP values
 * @returns {number} SAP value or 0 if not found
 */
export const getSapValue = (oil, inventory = []) => {
  // If oil is an object, try to get SAP from it directly
  if (typeof oil === 'object' && oil !== null) {
    if (oil.sap && oil.sap > 0) return oil.sap;
    
    // Try to find in inventory
    const inv = inventory.find(
      (g) => g.key === oil.key || 
      (g.name || '').toLowerCase() === (oil.name || '').toLowerCase()
    );
    if (inv?.sap && inv.sap > 0) return inv.sap;
    
    // Try SAP_VALUES lookup
    const key = (oil.key || oil.name || '').toString().toLowerCase().replace(/\s+/g, '_');
    if (SAP_VALUES[key]) return SAP_VALUES[key];
    
    // Try without underscores
    const keyNoUnderscore = (oil.key || oil.name || '').toString().toLowerCase().replace(/[_\s]+/g, '');
    if (SAP_VALUES[keyNoUnderscore]) return SAP_VALUES[keyNoUnderscore];
    
    return 0;
  }
  
  // If oil is a string
  if (typeof oil === 'string') {
    const key = oil.toLowerCase().replace(/\s+/g, '_');
    if (SAP_VALUES[key]) return SAP_VALUES[key];
    
    const keyNoUnderscore = oil.toLowerCase().replace(/[_\s]+/g, '');
    if (SAP_VALUES[keyNoUnderscore]) return SAP_VALUES[keyNoUnderscore];
  }
  
  return 0;
};

/**
 * Oil metadata presets (for AddIngredient autocomplete)
 */
export const SAP_PRESETS = [
  // Common Oils
  { name: "Olive Oil", sap: 0.134, oilGroup: "conditioning", latherType: "creamy", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 100, absoluteMaxPct: 100 },
  { name: "Coconut Oil", sap: 0.183, oilGroup: "cleansing", latherType: "bubbly", traceSpeed: "fast", hardness: "High", recommendedMaxPct: 30, absoluteMaxPct: 33 },
  { name: "Palm Oil", sap: 0.142, oilGroup: "conditioning", latherType: "creamy", traceSpeed: "medium", hardness: "High", recommendedMaxPct: 35, absoluteMaxPct: 50 },
  { name: "Castor Oil", sap: 0.128, oilGroup: "lather_booster", latherType: "bubbly", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 10, absoluteMaxPct: 15 },
  { name: "Rice Bran Oil", sap: 0.128, oilGroup: "conditioning", latherType: "creamy", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 20, absoluteMaxPct: 30 },
  { name: "Sweet Almond Oil", sap: 0.136, oilGroup: "conditioning", latherType: "low", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 20, absoluteMaxPct: 30 },
  { name: "Sunflower Oil", sap: 0.134, oilGroup: "conditioning", latherType: "low", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 20, absoluteMaxPct: 25 },
  { name: "Canola Oil", sap: 0.124, oilGroup: "conditioning", latherType: "low", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 20, absoluteMaxPct: 30 },
  { name: "Sesame Oil", sap: 0.134, oilGroup: "conditioning", latherType: "creamy", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 20, absoluteMaxPct: 25 },
  { name: "Mustard Oil", sap: 0.124, oilGroup: "conditioning", latherType: "creamy", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 15, absoluteMaxPct: 20 },
  { name: "Groundnut Oil / Peanut Oil", sap: 0.136, oilGroup: "conditioning", latherType: "low", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 20, absoluteMaxPct: 25 },
  { name: "Avocado Oil", sap: 0.133, oilGroup: "conditioning", latherType: "creamy", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 20, absoluteMaxPct: 30 },
  { name: "Jojoba Oil", sap: 0.066, oilGroup: "conditioning", latherType: "low", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 10, absoluteMaxPct: 15 },
  { name: "Grapeseed Oil", sap: 0.127, oilGroup: "conditioning", latherType: "low", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 15, absoluteMaxPct: 20 },
  { name: "Apricot Kernel Oil", sap: 0.135, oilGroup: "conditioning", latherType: "low", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 20, absoluteMaxPct: 25 },
  { name: "Hemp Seed Oil", sap: 0.135, oilGroup: "conditioning", latherType: "low", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 15, absoluteMaxPct: 20 },
  { name: "Safflower Oil", sap: 0.136, oilGroup: "conditioning", latherType: "low", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 15, absoluteMaxPct: 20 },
  { name: "Flaxseed Oil / Linseed Oil", sap: 0.136, oilGroup: "conditioning", latherType: "low", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 10, absoluteMaxPct: 15 },
  { name: "Neem Oil", sap: 0.139, oilGroup: "conditioning", latherType: "creamy", traceSpeed: "medium", hardness: "Medium", recommendedMaxPct: 10, absoluteMaxPct: 15 },
  { name: "Walnut Oil", sap: 0.135, oilGroup: "conditioning", latherType: "low", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 15, absoluteMaxPct: 20 },
  { name: "Macadamia Nut Oil", sap: 0.139, oilGroup: "conditioning", latherType: "creamy", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 20, absoluteMaxPct: 25 },
  { name: "Hazelnut Oil", sap: 0.136, oilGroup: "conditioning", latherType: "low", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 20, absoluteMaxPct: 25 },
  { name: "Wheat Germ Oil", sap: 0.131, oilGroup: "conditioning", latherType: "low", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 10, absoluteMaxPct: 15 },
  { name: "Evening Primrose Oil", sap: 0.136, oilGroup: "conditioning", latherType: "low", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 10, absoluteMaxPct: 15 },
  { name: "Rosehip Seed Oil", sap: 0.138, oilGroup: "conditioning", latherType: "low", traceSpeed: "slow", hardness: "Low", recommendedMaxPct: 10, absoluteMaxPct: 15 },
  { name: "Babassu Oil", sap: 0.175, oilGroup: "cleansing", latherType: "bubbly", traceSpeed: "fast", hardness: "High", recommendedMaxPct: 33, absoluteMaxPct: 40 },
  { name: "Palm Kernel Oil", sap: 0.176, oilGroup: "cleansing", latherType: "bubbly", traceSpeed: "fast", hardness: "High", recommendedMaxPct: 30, absoluteMaxPct: 35 },
  { name: "Lard (Pig Fat)", sap: 0.138, oilGroup: "conditioning", latherType: "creamy", traceSpeed: "medium", hardness: "High", recommendedMaxPct: 70, absoluteMaxPct: 100 },
  { name: "Tallow (Beef Fat)", sap: 0.140, oilGroup: "conditioning", latherType: "creamy", traceSpeed: "medium", hardness: "High", recommendedMaxPct: 70, absoluteMaxPct: 100 },
  
  // Butters
  { name: "Shea Butter", sap: 0.128, oilGroup: "butter", latherType: "creamy", traceSpeed: "medium", hardness: "Medium", recommendedMaxPct: 15, absoluteMaxPct: 20 },
  { name: "Cocoa Butter", sap: 0.137, oilGroup: "butter", latherType: "creamy", traceSpeed: "fast", hardness: "High", recommendedMaxPct: 15, absoluteMaxPct: 20 },
  { name: "Mango Butter", sap: 0.128, oilGroup: "butter", latherType: "creamy", traceSpeed: "medium", hardness: "Medium", recommendedMaxPct: 15, absoluteMaxPct: 20 },
  { name: "Kokum Butter", sap: 0.135, oilGroup: "butter", latherType: "creamy", traceSpeed: "fast", hardness: "High", recommendedMaxPct: 15, absoluteMaxPct: 20 },
  { name: "Sal Butter", sap: 0.130, oilGroup: "butter", latherType: "creamy", traceSpeed: "medium", hardness: "High", recommendedMaxPct: 15, absoluteMaxPct: 20 },
  { name: "Illipe Butter", sap: 0.136, oilGroup: "butter", latherType: "creamy", traceSpeed: "medium", hardness: "High", recommendedMaxPct: 15, absoluteMaxPct: 20 },
  { name: "Cupuacu Butter", sap: 0.137, oilGroup: "butter", latherType: "creamy", traceSpeed: "medium", hardness: "Medium", recommendedMaxPct: 15, absoluteMaxPct: 20 },
  { name: "Murumuru Butter", sap: 0.171, oilGroup: "butter", latherType: "bubbly", traceSpeed: "fast", hardness: "High", recommendedMaxPct: 15, absoluteMaxPct: 20 },
  { name: "Tucuma Butter", sap: 0.172, oilGroup: "butter", latherType: "bubbly", traceSpeed: "fast", hardness: "High", recommendedMaxPct: 15, absoluteMaxPct: 20 },
];

export default SAP_VALUES;

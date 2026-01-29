/**
 * Recipe Presets and Oil Properties for Soap Making
 * 
 * Common recipe templates and oil property calculations
 */

// Common Recipe Presets
export const RECIPE_PRESETS = [
  {
    id: 'basic_beginner',
    name: '🌿 Basic Beginner',
    description: 'Simple 3-oil recipe, great for learning',
    oils: [
      { name: 'Olive Oil', key: 'olive_oil', pct: 50 },
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 30 },
      { name: 'Palm Oil', key: 'palm_oil', pct: 20 },
    ],
    superfat: 5,
    use: ['body'],
    goal: 'balanced',
    notes: 'Classic beginner recipe. Palm can be replaced with lard/tallow.',
  },
  {
    id: 'castile',
    name: '🫒 100% Castile',
    description: 'Pure olive oil, extremely gentle, long cure',
    oils: [
      { name: 'Olive Oil', key: 'olive_oil', pct: 100 },
    ],
    superfat: 7,
    use: ['face', 'body'],
    goal: 'moisturising',
    notes: 'Requires 6-12 month cure. Very gentle, minimal lather.',
  },
  {
    id: 'bastile',
    name: '🌾 Bastile (70% Olive)',
    description: 'Mostly olive with coconut for lather',
    oils: [
      { name: 'Olive Oil', key: 'olive_oil', pct: 70 },
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 20 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 10 },
    ],
    superfat: 6,
    use: ['face', 'body'],
    goal: 'moisturising',
    notes: 'Best of both worlds - gentle with good lather.',
  },
  {
    id: 'luxurious_face',
    name: '✨ Luxurious Face Bar',
    description: 'Gentle, moisturizing, high conditioning',
    oils: [
      { name: 'Olive Oil', key: 'olive_oil', pct: 40 },
      { name: 'Shea Butter', key: 'shea_butter', pct: 20 },
      { name: 'Sweet Almond Oil', key: 'sweet_almond_oil', pct: 15 },
      { name: 'Avocado Oil', key: 'avocado_oil', pct: 10 },
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 10 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 5 },
    ],
    superfat: 8,
    use: ['face'],
    goal: 'moisturising',
    notes: 'Very gentle and conditioning. Low lather but luxurious feel.',
  },
  {
    id: 'lathering_body',
    name: '🧼 Bubbly Body Bar',
    description: 'Lots of lather, good cleansing',
    oils: [
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 35 },
      { name: 'Olive Oil', key: 'olive_oil', pct: 30 },
      { name: 'Palm Oil', key: 'palm_oil', pct: 20 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 10 },
      { name: 'Rice Bran Oil', key: 'rice_bran_oil', pct: 5 },
    ],
    superfat: 5,
    use: ['body'],
    goal: 'leather rich',
    notes: 'Great lather and cleansing. May be too harsh for dry skin.',
  },
  {
    id: 'sensitive_skin',
    name: '🌸 Sensitive Skin',
    description: 'Extra gentle, hypoallergenic',
    oils: [
      { name: 'Olive Oil', key: 'olive_oil', pct: 50 },
      { name: 'Sweet Almond Oil', key: 'sweet_almond_oil', pct: 20 },
      { name: 'Shea Butter', key: 'shea_butter', pct: 15 },
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 10 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 5 },
    ],
    superfat: 8,
    use: ['face', 'body'],
    skinType: ['sensitive'],
    goal: 'moisturising',
    notes: 'No fragrance recommended. Very gentle formula.',
  },
  {
    id: 'shampoo_bar',
    name: '💇 Shampoo Bar',
    description: 'Designed for hair, extra lather',
    oils: [
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 40 },
      { name: 'Olive Oil', key: 'olive_oil', pct: 30 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 15 },
      { name: 'Avocado Oil', key: 'avocado_oil', pct: 10 },
      { name: 'Jojoba Oil', key: 'jojoba_oil', pct: 5 },
    ],
    superfat: 2,
    use: ['body'],
    goal: 'leather rich',
    notes: 'Low superfat for hair. Add citric acid for harder water areas.',
  },
  {
    id: 'palm_free',
    name: '🌱 Palm-Free',
    description: 'Sustainable, no palm oil',
    oils: [
      { name: 'Olive Oil', key: 'olive_oil', pct: 40 },
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 25 },
      { name: 'Shea Butter', key: 'shea_butter', pct: 20 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 10 },
      { name: 'Rice Bran Oil', key: 'rice_bran_oil', pct: 5 },
    ],
    superfat: 6,
    use: ['body'],
    goal: 'balanced',
    notes: 'Environmentally conscious recipe without palm oil.',
  },
];

// Oil Properties Database
export const OIL_PROPERTIES = {
  olive_oil: { cleansing: 0, conditioning: 82, bubbly: 0, creamy: 0, hardness: 17, iodine: 85, ins: 109 },
  coconut_oil: { cleansing: 67, conditioning: 10, bubbly: 67, creamy: 0, hardness: 79, iodine: 10, ins: 258 },
  palm_oil: { cleansing: 0, conditioning: 49, bubbly: 0, creamy: 0, hardness: 50, iodine: 53, ins: 145 },
  castor_oil: { cleansing: 0, conditioning: 95, bubbly: 90, creamy: 90, hardness: 0, iodine: 86, ins: 95 },
  shea_butter: { cleansing: 0, conditioning: 79, bubbly: 0, creamy: 0, hardness: 45, iodine: 59, ins: 116 },
  cocoa_butter: { cleansing: 0, conditioning: 61, bubbly: 0, creamy: 0, hardness: 61, iodine: 37, ins: 157 },
  sweet_almond_oil: { cleansing: 0, conditioning: 76, bubbly: 0, creamy: 0, hardness: 0, iodine: 99, ins: 97 },
  avocado_oil: { cleansing: 0, conditioning: 74, bubbly: 0, creamy: 0, hardness: 15, iodine: 86, ins: 99 },
  rice_bran_oil: { cleansing: 0, conditioning: 63, bubbly: 0, creamy: 0, hardness: 26, iodine: 103, ins: 70 },
  sunflower_oil: { cleansing: 0, conditioning: 70, bubbly: 0, creamy: 0, hardness: 11, iodine: 133, ins: 63 },
  jojoba_oil: { cleansing: 0, conditioning: 83, bubbly: 0, creamy: 0, hardness: 11, iodine: 83, ins: 69 },
  neem_oil: { cleansing: 0, conditioning: 61, bubbly: 0, creamy: 0, hardness: 24, iodine: 71, ins: 124 },
  sesame_oil: { cleansing: 0, conditioning: 55, bubbly: 0, creamy: 0, hardness: 18, iodine: 110, ins: 81 },
  lard: { cleansing: 1, conditioning: 44, bubbly: 0, creamy: 1, hardness: 43, iodine: 58, ins: 139 },
  tallow: { cleansing: 6, conditioning: 43, bubbly: 0, creamy: 6, hardness: 50, iodine: 44, ins: 147 },
};

// Ideal ranges for soap properties
export const PROPERTY_RANGES = {
  cleansing: { min: 12, max: 22, ideal: 17, label: 'Cleansing' },
  conditioning: { min: 44, max: 69, ideal: 56, label: 'Conditioning' },
  bubbly: { min: 14, max: 46, ideal: 30, label: 'Bubbly Lather' },
  creamy: { min: 16, max: 48, ideal: 32, label: 'Creamy Lather' },
  hardness: { min: 29, max: 54, ideal: 42, label: 'Hardness' },
  iodine: { min: 41, max: 70, ideal: 55, label: 'Iodine (shelf life)' },
  ins: { min: 136, max: 165, ideal: 150, label: 'INS (balance)' },
};

/**
 * Calculate soap properties from oil percentages
 * @param {array} oils - Array of oils with pct and key
 * @returns {object} Calculated properties
 */
export const calculateSoapProperties = (oils = []) => {
  const result = {
    cleansing: 0,
    conditioning: 0,
    bubbly: 0,
    creamy: 0,
    hardness: 0,
    iodine: 0,
    ins: 0,
  };

  oils.forEach(oil => {
    const key = (oil.key || oil.name || '').toLowerCase().replace(/\s+/g, '_');
    const props = OIL_PROPERTIES[key] || OIL_PROPERTIES[key.replace('_oil', '')] || null;
    const pct = oil.pct || oil.percent || 0;
    
    if (props && pct > 0) {
      Object.keys(result).forEach(prop => {
        result[prop] += (props[prop] || 0) * (pct / 100);
      });
    }
  });

  return result;
};

/**
 * Get property rating (poor, fair, good, ideal, high)
 * @param {string} property - Property name
 * @param {number} value - Property value
 * @returns {object} Rating info
 */
export const getPropertyRating = (property, value) => {
  const range = PROPERTY_RANGES[property];
  if (!range) return { rating: 'unknown', color: '#999' };

  if (value < range.min * 0.5) return { rating: 'very-low', color: '#f44336', label: 'Very Low' };
  if (value < range.min) return { rating: 'low', color: '#ff9800', label: 'Low' };
  if (value > range.max * 1.5) return { rating: 'very-high', color: '#f44336', label: 'Very High' };
  if (value > range.max) return { rating: 'high', color: '#ff9800', label: 'High' };
  
  // Calculate how close to ideal
  const distFromIdeal = Math.abs(value - range.ideal);
  const rangeWidth = range.max - range.min;
  
  if (distFromIdeal < rangeWidth * 0.2) return { rating: 'ideal', color: '#4caf50', label: 'Ideal' };
  return { rating: 'good', color: '#8bc34a', label: 'Good' };
};

/**
 * Get suggestions to balance a recipe
 * @param {object} properties - Current calculated properties
 * @returns {array} Suggestions
 */
export const getBalanceSuggestions = (properties) => {
  const suggestions = [];

  if (properties.cleansing < PROPERTY_RANGES.cleansing.min) {
    suggestions.push({ type: 'add', text: 'Add more coconut oil for cleansing power', priority: 'medium' });
  }
  if (properties.cleansing > PROPERTY_RANGES.cleansing.max) {
    suggestions.push({ type: 'reduce', text: 'Reduce coconut oil - may be too stripping', priority: 'high' });
  }
  
  if (properties.conditioning < PROPERTY_RANGES.conditioning.min) {
    suggestions.push({ type: 'add', text: 'Add olive, shea, or avocado for conditioning', priority: 'medium' });
  }
  
  if (properties.hardness < PROPERTY_RANGES.hardness.min) {
    suggestions.push({ type: 'add', text: 'Add palm, cocoa butter, or tallow for hardness', priority: 'low' });
  }
  if (properties.hardness > PROPERTY_RANGES.hardness.max) {
    suggestions.push({ type: 'reduce', text: 'Too hard - may crack. Add liquid oils.', priority: 'medium' });
  }
  
  if (properties.bubbly < 10 && properties.creamy < 10) {
    suggestions.push({ type: 'add', text: 'Add castor oil (5-10%) for lather boost', priority: 'high' });
  }

  if (properties.iodine > PROPERTY_RANGES.iodine.max) {
    suggestions.push({ type: 'note', text: 'High iodine may reduce shelf life - cure longer', priority: 'low' });
  }

  return suggestions;
};

/**
 * Suggest oils to balance recipe to 100%
 * @param {array} currentOils - Current oils in recipe
 * @param {number} remainingPct - Percentage remaining to 100
 * @returns {array} Suggested oils with percentages
 */
export const suggestBalancingOils = (currentOils = [], remainingPct = 0) => {
  if (remainingPct <= 0) return [];
  
  const currentProperties = calculateSoapProperties(currentOils);
  const suggestions = [];
  
  // Check what properties need boosting
  const needsCleansing = currentProperties.cleansing < PROPERTY_RANGES.cleansing.min;
  const needsConditioning = currentProperties.conditioning < PROPERTY_RANGES.conditioning.min;
  const needsHardness = currentProperties.hardness < PROPERTY_RANGES.hardness.min;
  const needsLather = currentProperties.bubbly < 10;
  
  // Has any coconut?
  const hasCoconut = currentOils.some(o => (o.key || o.name || '').toLowerCase().includes('coconut'));
  const hasCastor = currentOils.some(o => (o.key || o.name || '').toLowerCase().includes('castor'));
  
  if (!hasCastor && remainingPct >= 5) {
    suggestions.push({ name: 'Castor Oil', key: 'castor_oil', pct: Math.min(10, remainingPct), reason: 'Lather boost' });
  }
  
  if (!hasCoconut && needsCleansing && remainingPct >= 15) {
    suggestions.push({ name: 'Coconut Oil', key: 'coconut_oil', pct: Math.min(25, remainingPct), reason: 'Cleansing & lather' });
  }
  
  if (needsConditioning && remainingPct >= 10) {
    suggestions.push({ name: 'Olive Oil', key: 'olive_oil', pct: remainingPct, reason: 'Conditioning' });
  }
  
  if (needsHardness && remainingPct >= 10) {
    suggestions.push({ name: 'Shea Butter', key: 'shea_butter', pct: Math.min(20, remainingPct), reason: 'Hardness & conditioning' });
  }
  
  // Default filler
  if (suggestions.length === 0) {
    suggestions.push({ name: 'Olive Oil', key: 'olive_oil', pct: remainingPct, reason: 'Balanced filler' });
  }
  
  return suggestions;
};

export default {
  RECIPE_PRESETS,
  OIL_PROPERTIES,
  PROPERTY_RANGES,
  calculateSoapProperties,
  getPropertyRating,
  getBalanceSuggestions,
  suggestBalancingOils,
};

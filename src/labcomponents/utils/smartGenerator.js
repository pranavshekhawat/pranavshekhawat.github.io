/**
 * Smart Soap Recipe Generator
 * Uses AI-like logic to create balanced, purposeful recipes
 * 
 * Features:
 * - Goal-based generation (moisturizing, cleansing, balanced, etc.)
 * - Skin type matching
 * - Dosha balancing (Ayurvedic)
 * - Ingredient synergy optimization
 * - Seasonal recommendations
 * - Cost optimization options
 * - Fragrance pairing suggestions
 */

import { getSapValue, SAP_PRESETS } from './sapValues';
import { getHindiName, suggestHindiRecipeName, DOSHA_NAMES, RECIPE_NAME_SUGGESTIONS } from './hindiNames';
import { num, computeMaterialCost, buildTotals, computePricing } from './costCalculations';

// ===== OIL PROPERTIES DATABASE =====
export const OIL_PROPERTIES = {
  // Cleansing oils (high lauric/myristic acid)
  coconut_oil: { 
    cleansing: 95, conditioning: 20, hardness: 85, lather: 90, creaminess: 20,
    skinTypes: ['oily', 'normal'], 
    doshas: ['kapha'], 
    seasons: ['summer', 'monsoon'],
    pairsWith: ['olive_oil', 'shea_butter', 'castor_oil'],
    benefits: ['Deep cleansing', 'Excellent lather', 'Hard bar'],
  },
  palm_kernel_oil: { 
    cleansing: 90, conditioning: 15, hardness: 80, lather: 85, creaminess: 15,
    skinTypes: ['oily'], doshas: ['kapha'], seasons: ['summer'],
    pairsWith: ['olive_oil', 'avocado_oil'],
    benefits: ['Cleansing', 'Bubbly lather'],
  },
  babassu_oil: { 
    cleansing: 80, conditioning: 30, hardness: 75, lather: 80, creaminess: 25,
    skinTypes: ['oily', 'normal'], doshas: ['kapha', 'pitta'], seasons: ['summer'],
    pairsWith: ['olive_oil', 'shea_butter'],
    benefits: ['Cleansing without drying', 'Great coconut alternative'],
  },
  
  // Conditioning oils (high oleic acid)
  olive_oil: { 
    cleansing: 10, conditioning: 95, hardness: 20, lather: 15, creaminess: 85,
    skinTypes: ['dry', 'sensitive', 'mature', 'all'], 
    doshas: ['vata', 'pitta'],
    seasons: ['winter', 'autumn'],
    pairsWith: ['coconut_oil', 'castor_oil', 'shea_butter'],
    benefits: ['Ultra moisturizing', 'Gentle', 'Classic Castile base'],
  },
  sweet_almond_oil: { 
    cleansing: 15, conditioning: 90, hardness: 25, lather: 10, creaminess: 80,
    skinTypes: ['dry', 'sensitive', 'normal'], doshas: ['vata', 'pitta'],
    seasons: ['winter', 'autumn'],
    pairsWith: ['olive_oil', 'coconut_oil', 'honey'],
    benefits: ['Lightweight moisturizing', 'Vitamin E rich'],
  },
  avocado_oil: { 
    cleansing: 10, conditioning: 95, hardness: 30, lather: 15, creaminess: 85,
    skinTypes: ['dry', 'mature', 'sensitive'], doshas: ['vata'],
    seasons: ['winter'],
    pairsWith: ['olive_oil', 'shea_butter', 'cocoa_butter'],
    benefits: ['Deep nourishment', 'Anti-aging', 'Vitamin rich'],
  },
  rice_bran_oil: { 
    cleansing: 20, conditioning: 85, hardness: 35, lather: 20, creaminess: 75,
    skinTypes: ['all', 'sensitive', 'mature'], doshas: ['vata', 'pitta', 'kapha'],
    seasons: ['all'],
    pairsWith: ['coconut_oil', 'olive_oil', 'turmeric'],
    benefits: ['Brightening', 'Antioxidant rich', 'Traditional Indian oil'],
  },
  
  // Indian specialty oils
  mustard_oil: { 
    cleansing: 25, conditioning: 75, hardness: 30, lather: 30, creaminess: 65,
    skinTypes: ['normal', 'oily'], doshas: ['kapha', 'vata'],
    seasons: ['winter', 'monsoon'],
    pairsWith: ['coconut_oil', 'neem_oil', 'turmeric'],
    benefits: ['Warming', 'Antibacterial', 'Traditional Indian'],
  },
  sesame_oil: { 
    cleansing: 20, conditioning: 85, hardness: 30, lather: 25, creaminess: 70,
    skinTypes: ['dry', 'normal', 'all'], doshas: ['vata'],
    seasons: ['winter', 'autumn'],
    pairsWith: ['coconut_oil', 'olive_oil', 'neem_oil'],
    benefits: ['Ayurvedic classic', 'Warming', 'Anti-inflammatory'],
  },
  neem_oil: { 
    cleansing: 40, conditioning: 60, hardness: 45, lather: 30, creaminess: 50,
    skinTypes: ['oily', 'acne', 'problematic'], doshas: ['pitta', 'kapha'],
    seasons: ['summer', 'monsoon'],
    pairsWith: ['coconut_oil', 'olive_oil', 'tulsi'],
    benefits: ['Antibacterial', 'Antifungal', 'Acne fighting', 'Traditional Ayurvedic'],
  },
  groundnut_oil: { 
    cleansing: 15, conditioning: 80, hardness: 30, lather: 15, creaminess: 70,
    skinTypes: ['normal', 'dry'], doshas: ['vata'],
    seasons: ['winter'],
    pairsWith: ['coconut_oil', 'sesame_oil'],
    benefits: ['Affordable', 'Moisturizing', 'Locally available'],
  },
  
  // Lather boosters
  castor_oil: { 
    cleansing: 10, conditioning: 70, hardness: 5, lather: 95, creaminess: 90,
    skinTypes: ['all'], doshas: ['vata', 'pitta', 'kapha'],
    seasons: ['all'],
    pairsWith: ['olive_oil', 'coconut_oil', 'palm_oil'],
    benefits: ['Lather booster', 'Moisturizing bubbles', 'Essential for good lather'],
  },
  
  // Hardening oils
  palm_oil: { 
    cleansing: 20, conditioning: 60, hardness: 80, lather: 25, creaminess: 60,
    skinTypes: ['all'], doshas: ['kapha'],
    seasons: ['all'],
    pairsWith: ['olive_oil', 'coconut_oil', 'castor_oil'],
    benefits: ['Hard bar', 'Creamy lather', 'Long lasting'],
  },
  
  // Butters
  shea_butter: { 
    cleansing: 5, conditioning: 95, hardness: 50, lather: 10, creaminess: 90,
    skinTypes: ['dry', 'sensitive', 'mature', 'all'], doshas: ['vata', 'pitta'],
    seasons: ['winter', 'all'],
    pairsWith: ['olive_oil', 'coconut_oil', 'cocoa_butter'],
    benefits: ['Ultra moisturizing', 'Skin healing', 'Luxurious feel'],
  },
  cocoa_butter: { 
    cleansing: 5, conditioning: 85, hardness: 75, lather: 10, creaminess: 80,
    skinTypes: ['dry', 'normal'], doshas: ['vata'],
    seasons: ['winter'],
    pairsWith: ['olive_oil', 'shea_butter', 'coconut_oil'],
    benefits: ['Hard bar', 'Chocolate scent', 'Luxurious'],
  },
  mango_butter: { 
    cleansing: 5, conditioning: 90, hardness: 55, lather: 10, creaminess: 85,
    skinTypes: ['dry', 'sensitive', 'all'], doshas: ['vata', 'pitta'],
    seasons: ['all'],
    pairsWith: ['olive_oil', 'coconut_oil', 'shea_butter'],
    benefits: ['Indian origin', 'Moisturizing', 'Gentle'],
  },
  kokum_butter: { 
    cleansing: 5, conditioning: 90, hardness: 70, lather: 10, creaminess: 80,
    skinTypes: ['dry', 'all'], doshas: ['vata', 'pitta'],
    seasons: ['all'],
    pairsWith: ['olive_oil', 'coconut_oil'],
    benefits: ['Indian origin', 'Non-greasy', 'Hard bar'],
  },
  
  // Premium oils
  jojoba_oil: { 
    cleansing: 5, conditioning: 90, hardness: 5, lather: 5, creaminess: 80,
    skinTypes: ['all', 'oily', 'acne'], doshas: ['pitta'],
    seasons: ['all'],
    pairsWith: ['olive_oil', 'coconut_oil'],
    benefits: ['Sebum-like', 'Balancing', 'Premium feel'],
  },
  argan_oil: { 
    cleansing: 5, conditioning: 95, hardness: 15, lather: 5, creaminess: 85,
    skinTypes: ['dry', 'mature', 'all'], doshas: ['vata', 'pitta'],
    seasons: ['winter', 'all'],
    pairsWith: ['olive_oil', 'shea_butter'],
    benefits: ['Anti-aging', 'Premium luxury', 'Hair benefits'],
  },
};

// ===== ADDITIVE SYNERGIES =====
export const ADDITIVE_SYNERGIES = {
  // For skin concerns
  acne: ['neem_oil', 'tea_tree', 'activated_charcoal', 'kaolin_clay', 'tulsi', 'turmeric'],
  brightening: ['turmeric', 'saffron', 'rice_bran_oil', 'vitamin_c', 'kumkumadi', 'licorice'],
  anti_aging: ['avocado_oil', 'rosehip_oil', 'vitamin_e', 'frankincense', 'sandalwood', 'saffron'],
  moisturizing: ['shea_butter', 'honey', 'aloe_vera', 'milk', 'glycerin', 'oatmeal'],
  exfoliating: ['oatmeal', 'coffee', 'walnut_shell', 'rice_flour', 'sea_salt', 'sugar'],
  soothing: ['aloe_vera', 'chamomile', 'lavender', 'oatmeal', 'calendula', 'cucumber'],
  
  // For doshas
  vata: ['sesame_oil', 'ashwagandha', 'sandalwood', 'rose', 'milk', 'honey'],
  pitta: ['coconut_oil', 'sandalwood', 'rose', 'aloe_vera', 'cucumber', 'mint'],
  kapha: ['mustard_oil', 'neem_oil', 'tulsi', 'eucalyptus', 'ginger', 'turmeric'],
};

// ===== FRAGRANCE PAIRINGS =====
export const FRAGRANCE_PAIRINGS = {
  // Traditional Indian
  sandalwood: ['rose', 'jasmine', 'vetiver', 'turmeric', 'saffron'],
  rose: ['sandalwood', 'jasmine', 'geranium', 'patchouli'],
  jasmine: ['sandalwood', 'rose', 'ylang_ylang', 'vanilla'],
  vetiver: ['sandalwood', 'patchouli', 'citrus', 'rose'],
  
  // Fresh & Herbal
  lavender: ['peppermint', 'eucalyptus', 'tea_tree', 'rosemary', 'lemon'],
  peppermint: ['eucalyptus', 'tea_tree', 'lavender', 'rosemary'],
  eucalyptus: ['peppermint', 'tea_tree', 'lavender', 'lemon'],
  lemongrass: ['ginger', 'lavender', 'eucalyptus', 'citronella'],
  
  // Warm & Spicy
  cinnamon: ['orange', 'clove', 'vanilla', 'ginger'],
  ginger: ['lemon', 'orange', 'cinnamon', 'lemongrass'],
  clove: ['orange', 'cinnamon', 'vanilla'],
};

// ===== RECIPE GOALS =====
export const RECIPE_GOALS = {
  balanced: {
    name: 'Balanced Everyday',
    hindiName: 'संतुलित साबुन',
    targets: { cleansing: 50, conditioning: 60, hardness: 55, lather: 60, creaminess: 55 },
    description: 'Well-rounded soap for daily use',
  },
  moisturizing: {
    name: 'Deep Moisturizing',
    hindiName: 'गहरी नमी साबुन',
    targets: { cleansing: 25, conditioning: 90, hardness: 45, lather: 40, creaminess: 85 },
    description: 'Ultra hydrating for dry skin',
  },
  cleansing: {
    name: 'Deep Cleansing',
    hindiName: 'गहरी सफाई साबुन',
    targets: { cleansing: 80, conditioning: 40, hardness: 70, lather: 85, creaminess: 30 },
    description: 'Thorough cleaning for oily skin',
  },
  gentle: {
    name: 'Gentle & Mild',
    hindiName: 'कोमल साबुन',
    targets: { cleansing: 20, conditioning: 85, hardness: 40, lather: 35, creaminess: 80 },
    description: 'For sensitive skin and babies',
  },
  luxurious: {
    name: 'Luxurious Spa',
    hindiName: 'विलासिता साबुन',
    targets: { cleansing: 40, conditioning: 85, hardness: 60, lather: 70, creaminess: 80 },
    description: 'Premium ingredients for indulgence',
  },
  ayurvedic: {
    name: 'Ayurvedic Healing',
    hindiName: 'आयुर्वेदिक साबुन',
    targets: { cleansing: 45, conditioning: 75, hardness: 50, lather: 50, creaminess: 70 },
    description: 'Traditional herbs and oils',
  },
  acne_fighting: {
    name: 'Acne Fighting',
    hindiName: 'मुहांसे रोधी साबुन',
    targets: { cleansing: 70, conditioning: 50, hardness: 55, lather: 65, creaminess: 40 },
    description: 'Antibacterial and purifying',
  },
  brightening: {
    name: 'Skin Brightening',
    hindiName: 'निखार साबुन',
    targets: { cleansing: 45, conditioning: 70, hardness: 50, lather: 55, creaminess: 65 },
    description: 'For radiant, glowing skin',
  },
};

// ===== SMART GENERATOR CLASS =====
export class SmartRecipeGenerator {
  constructor(ingredients = [], options = {}) {
    this.ingredients = ingredients;
    this.options = {
      totalOilWeight: 1000,
      barWeight: 100,
      defaultSuperfat: 6,
      defaultLyeConcentration: 0.30,
      ...options,
    };
  }

  // Get oil properties (from database or ingredient data)
  getOilProps(oil) {
    const key = (oil.key || oil.name || '').toLowerCase().replace(/[\s-]/g, '_');
    return OIL_PROPERTIES[key] || {
      cleansing: 30, conditioning: 50, hardness: 40, lather: 30, creaminess: 40,
      skinTypes: ['all'], doshas: ['tridosha'], seasons: ['all'],
      pairsWith: [], benefits: [],
    };
  }

  // Calculate recipe properties based on oil percentages
  calculateRecipeProperties(oils) {
    const props = { cleansing: 0, conditioning: 0, hardness: 0, lather: 0, creaminess: 0 };
    let totalPct = 0;
    
    oils.forEach(oil => {
      const pct = num(oil.pct, 0);
      const oilProps = this.getOilProps(oil);
      totalPct += pct;
      
      Object.keys(props).forEach(key => {
        props[key] += (oilProps[key] || 0) * pct;
      });
    });
    
    // Normalize
    if (totalPct > 0) {
      Object.keys(props).forEach(key => {
        props[key] = Math.round(props[key] / totalPct);
      });
    }
    
    return props;
  }

  // Score how well oils match a goal
  scoreGoalMatch(oils, goal) {
    const recipeProps = this.calculateRecipeProperties(oils);
    const targets = RECIPE_GOALS[goal]?.targets || RECIPE_GOALS.balanced.targets;
    
    let totalDiff = 0;
    Object.keys(targets).forEach(key => {
      totalDiff += Math.abs(recipeProps[key] - targets[key]);
    });
    
    return Math.max(0, 100 - totalDiff / 5); // 0-100 score
  }

  // Check skin type compatibility
  scoreSkinTypeMatch(oils, targetSkinType) {
    let matches = 0;
    oils.forEach(oil => {
      const props = this.getOilProps(oil);
      if (props.skinTypes.includes(targetSkinType) || props.skinTypes.includes('all')) {
        matches++;
      }
    });
    return (matches / oils.length) * 100;
  }

  // Check dosha compatibility
  scoreDoshaMatch(oils, targetDosha) {
    let matches = 0;
    oils.forEach(oil => {
      const props = this.getOilProps(oil);
      if (props.doshas.includes(targetDosha) || props.doshas.includes('tridosha')) {
        matches++;
      }
    });
    return (matches / oils.length) * 100;
  }

  // Check season compatibility
  scoreSeasonMatch(oils, targetSeason) {
    let matches = 0;
    oils.forEach(oil => {
      const props = this.getOilProps(oil);
      if (props.seasons.includes(targetSeason) || props.seasons.includes('all')) {
        matches++;
      }
    });
    return (matches / oils.length) * 100;
  }

  // Generate recipe based on goal
  generateByGoal(goal = 'balanced', constraints = {}) {
    const {
      skinType = 'all',
      dosha = null,
      season = 'all',
      budget = 'normal', // 'budget', 'normal', 'premium'
      indianFocus = false,
      numOils = null,
    } = constraints;

    const goalConfig = RECIPE_GOALS[goal] || RECIPE_GOALS.balanced;
    const targets = goalConfig.targets;

    // Filter available oils
    let oilPool = this.ingredients.filter(ing => {
      const cat = ((ing.category || ing.type) || '').toLowerCase();
      return cat.includes('oil') || cat.includes('butter');
    });

    if (oilPool.length < 3) {
      // Fallback to SAP_PRESETS
      oilPool = SAP_PRESETS.filter(p => !p.name.includes('Butter')).slice(0, 10);
    }

    // Indian focus filter
    if (indianFocus) {
      const indianOils = ['neem', 'sesame', 'mustard', 'groundnut', 'coconut', 'rice_bran', 'castor', 'mango', 'kokum'];
      const indianPool = oilPool.filter(o => {
        const key = (o.key || o.name || '').toLowerCase();
        return indianOils.some(io => key.includes(io));
      });
      if (indianPool.length >= 3) oilPool = indianPool;
    }

    // Score and sort oils by goal fit
    const scoredOils = oilPool.map(oil => {
      const props = this.getOilProps(oil);
      let score = 0;
      
      // Goal alignment
      if (targets.cleansing > 60 && props.cleansing > 50) score += 20;
      if (targets.conditioning > 70 && props.conditioning > 70) score += 20;
      if (targets.lather > 60 && props.lather > 50) score += 15;
      if (targets.hardness > 60 && props.hardness > 60) score += 10;
      
      // Skin type match
      if (skinType !== 'all' && (props.skinTypes.includes(skinType) || props.skinTypes.includes('all'))) {
        score += 15;
      }
      
      // Dosha match
      if (dosha && (props.doshas.includes(dosha) || props.doshas.includes('tridosha'))) {
        score += 10;
      }
      
      // Season match
      if (season !== 'all' && (props.seasons.includes(season) || props.seasons.includes('all'))) {
        score += 10;
      }
      
      return { ...oil, score, props };
    }).sort((a, b) => b.score - a.score);

    // Select oils strategically
    const targetOilCount = numOils || (goal === 'gentle' ? 3 : Math.min(5, Math.max(3, Math.floor(Math.random() * 3) + 3)));
    const selectedOils = [];
    
    // Always include at least one from each category for balance
    const categories = {
      cleansing: scoredOils.filter(o => o.props?.cleansing > 60),
      conditioning: scoredOils.filter(o => o.props?.conditioning > 70),
      latherBooster: scoredOils.filter(o => o.props?.lather > 70),
      hardener: scoredOils.filter(o => o.props?.hardness > 60),
    };

    // Build recipe based on goal priorities
    if (goal === 'moisturizing' || goal === 'gentle') {
      // Prioritize conditioning
      if (categories.conditioning.length) selectedOils.push(categories.conditioning[0]);
      if (categories.conditioning.length > 1) selectedOils.push(categories.conditioning[1]);
      if (categories.latherBooster.length) selectedOils.push(categories.latherBooster[0]);
    } else if (goal === 'cleansing' || goal === 'acne_fighting') {
      // Prioritize cleansing
      if (categories.cleansing.length) selectedOils.push(categories.cleansing[0]);
      if (categories.conditioning.length) selectedOils.push(categories.conditioning[0]);
      if (categories.latherBooster.length) selectedOils.push(categories.latherBooster[0]);
    } else {
      // Balanced approach
      if (categories.cleansing.length) selectedOils.push(categories.cleansing[0]);
      if (categories.conditioning.length) selectedOils.push(categories.conditioning[0]);
      if (categories.latherBooster.length) selectedOils.push(categories.latherBooster[0]);
    }

    // Fill remaining slots with top-scored oils
    const selectedKeys = new Set(selectedOils.map(o => o.key || o.name));
    for (const oil of scoredOils) {
      if (selectedOils.length >= targetOilCount) break;
      if (!selectedKeys.has(oil.key || oil.name)) {
        selectedOils.push(oil);
        selectedKeys.add(oil.key || oil.name);
      }
    }

    // Calculate optimal percentages
    const oils = this.optimizePercentages(selectedOils, goalConfig);

    // Choose additives based on goal
    const additives = this.selectAdditives(goal, { skinType, dosha, indianFocus });

    // Build full recipe
    return this.buildRecipe(oils, additives, {
      goal,
      goalConfig,
      skinType,
      dosha,
      season,
      indianFocus,
    });
  }

  // Optimize oil percentages for goal
  optimizePercentages(oils, goalConfig) {
    const targets = goalConfig.targets;
    
    // Start with even distribution
    let percentages = oils.map(() => 100 / oils.length);
    
    // Iterate to optimize
    for (let iteration = 0; iteration < 10; iteration++) {
      const props = this.calculateRecipeProperties(
        oils.map((o, i) => ({ ...o, pct: percentages[i] }))
      );
      
      // Adjust percentages based on gap
      oils.forEach((oil, i) => {
        const oilProps = this.getOilProps(oil);
        const maxPct = num(oil.absoluteMaxPct, 100);
        const minPct = 5;
        
        let adjustment = 0;
        
        // Increase oils that help reach targets
        if (props.conditioning < targets.conditioning && oilProps.conditioning > 70) {
          adjustment += 3;
        }
        if (props.cleansing < targets.cleansing && oilProps.cleansing > 50) {
          adjustment += 3;
        }
        if (props.lather < targets.lather && oilProps.lather > 50) {
          adjustment += 2;
        }
        
        // Decrease oils that overshoot
        if (props.cleansing > targets.cleansing + 20 && oilProps.cleansing > 60) {
          adjustment -= 3;
        }
        
        percentages[i] = Math.max(minPct, Math.min(maxPct, percentages[i] + adjustment));
      });
      
      // Normalize to 100%
      const sum = percentages.reduce((s, p) => s + p, 0);
      percentages = percentages.map(p => (p / sum) * 100);
    }
    
    // Apply max percentage constraints
    percentages = this.applyMaxConstraints(oils, percentages);
    
    return oils.map((oil, i) => ({
      ...oil,
      pct: Number(percentages[i].toFixed(2)),
      key: oil.key || oil.firebaseId || oil.name?.toLowerCase().replace(/\s+/g, '_'),
    }));
  }

  // Apply maximum percentage constraints
  applyMaxConstraints(oils, percentages) {
    for (let iter = 0; iter < 5; iter++) {
      let overflow = 0;
      let freeIndices = [];
      
      percentages = percentages.map((pct, i) => {
        const maxPct = num(oils[i].absoluteMaxPct, 100);
        if (pct > maxPct) {
          overflow += pct - maxPct;
          return maxPct;
        }
        freeIndices.push(i);
        return pct;
      });
      
      if (overflow <= 0 || freeIndices.length === 0) break;
      
      // Distribute overflow
      const freeSum = freeIndices.reduce((s, i) => s + percentages[i], 0);
      freeIndices.forEach(i => {
        percentages[i] += (percentages[i] / freeSum) * overflow;
      });
    }
    
    // Final normalize
    const sum = percentages.reduce((s, p) => s + p, 0);
    return percentages.map(p => (p / sum) * 100);
  }

  // Select appropriate additives
  selectAdditives(goal, constraints = {}) {
    const { skinType, dosha, indianFocus } = constraints;
    const additives = [];
    
    // Get additive pool
    const additivePool = this.ingredients.filter(ing => {
      const cat = ((ing.category || ing.type) || '').toLowerCase();
      return ['additive', 'clay', 'herb', 'scrub', 'liquid', 'functional', 'fragrance', 'essential', 'colour', 'color'].some(k => cat.includes(k));
    });
    
    // Goal-based additive suggestions
    const goalAdditives = {
      moisturizing: ['honey', 'aloe_vera', 'milk', 'glycerin', 'oatmeal'],
      cleansing: ['activated_charcoal', 'kaolin_clay', 'tea_tree'],
      gentle: ['oatmeal', 'aloe_vera', 'chamomile', 'lavender'],
      luxurious: ['rose', 'jasmine', 'sandalwood', 'saffron', 'honey'],
      ayurvedic: ['turmeric', 'neem', 'tulsi', 'sandalwood', 'ashwagandha'],
      acne_fighting: ['tea_tree', 'neem', 'activated_charcoal', 'turmeric'],
      brightening: ['turmeric', 'saffron', 'licorice', 'vitamin_c'],
      balanced: ['lavender', 'oatmeal', 'honey'],
    };
    
    const suggested = goalAdditives[goal] || goalAdditives.balanced;
    
    // Try to find matching additives
    suggested.forEach(suggName => {
      const found = additivePool.find(a => 
        (a.key || a.name || '').toLowerCase().includes(suggName.toLowerCase())
      );
      if (found && additives.length < 3) {
        const cat = ((found.category || found.type) || '').toLowerCase();
        const isLiquid = cat.includes('liquid') || cat.includes('milk') || cat.includes('water') || cat.includes('essential') || cat.includes('fragrance');
        additives.push({
          key: found.key || found.firebaseId || found.name,
          name: found.name,
          type: found.category || found.type || 'additive',
          amount: isLiquid ? (cat.includes('essential') ? 15 : 30) : 20,
          unit: 'g',
          appliesTo: isLiquid ? 'lye' : 'post',
          whenAdded: isLiquid ? 'pre-lye' : 'post-trace',
        });
      }
    });
    
    return additives;
  }

  // Build complete recipe object
  buildRecipe(oils, additives, metadata) {
    const { goal, goalConfig, skinType, dosha, season, indianFocus } = metadata;
    const { totalOilWeight, barWeight, defaultSuperfat, defaultLyeConcentration } = this.options;
    
    // Calculate superfat based on skin type
    let superfat = defaultSuperfat;
    if (skinType === 'dry' || skinType === 'sensitive') superfat = 8;
    else if (skinType === 'oily') superfat = 5;
    else if (goal === 'moisturizing') superfat = 8;
    else if (goal === 'gentle') superfat = 9;
    
    // Calculate lye concentration
    let lyeConcentration = defaultLyeConcentration;
    if (goal === 'gentle') lyeConcentration = 0.28;
    
    // Compute weights
    const oilsWithWeight = oils.map(o => ({
      ...o,
      weight: (o.pct / 100) * totalOilWeight,
    }));
    
    // Calculate NaOH
    const naohBase = oilsWithWeight.reduce((sum, o) => {
      const sap = getSapValue(o, this.ingredients);
      return sum + o.weight * sap;
    }, 0);
    const adjustedNaoh = naohBase * (1 - superfat / 100);
    
    // Calculate water
    const computedWater = adjustedNaoh > 0 ? (adjustedNaoh / lyeConcentration) - adjustedNaoh : 0;
    const liquidsTotal = additives.filter(a => a.appliesTo === 'lye').reduce((s, a) => s + num(a.amount, 0), 0);
    const totalWater = computedWater + liquidsTotal;
    
    // Calculate batch mass
    const totalAdditivesWeight = additives.reduce((s, a) => s + num(a.amount, 0), 0);
    const nonLyeAdditivesWeight = totalAdditivesWeight - liquidsTotal;
    const computedBatchMass = totalOilWeight + adjustedNaoh + totalWater + nonLyeAdditivesWeight;
    const bars = Math.max(1, Math.round(computedBatchMass / barWeight));
    
    // Calculate properties
    const properties = this.calculateRecipeProperties(oils);
    const goalScore = this.scoreGoalMatch(oils, goal);
    
    // Generate Hindi name
    const mainIngredients = oils.slice(0, 2).map(o => o.key || o.name);
    const hindiNameSuggestion = suggestHindiRecipeName(mainIngredients);
    
    // Per-oil details
    const perOilDetails = oilsWithWeight.map(o => {
      const sap = getSapValue(o, this.ingredients);
      const preNaoh = sap * o.weight;
      const adjNaoh = preNaoh * (1 - superfat / 100);
      const hindiName = getHindiName(o.key || o.name);
      return {
        name: o.name,
        key: o.key,
        pct: o.pct,
        weight: Number(o.weight.toFixed(2)),
        sap,
        preNaoh: Number(preNaoh.toFixed(4)),
        adjustedNaoh: Number(adjNaoh.toFixed(4)),
        hindiName: hindiName?.romanized || null,
        hindiScript: hindiName?.hindi || null,
      };
    });
    
    // Cost calculation
    const materialCost = computeMaterialCost(this.ingredients, oilsWithWeight, adjustedNaoh, totalWater, additives);
    const totals = buildTotals({ material: materialCost, working: 0, packaging: 0 }, bars);
    const pricing = computePricing(totals.perBar, { markup: 50 });
    
    // Build recipe name
    const timestamp = new Date().toLocaleTimeString();
    const goalLabel = goalConfig?.name || 'Custom';
    const recipeName = `${goalLabel} - ${timestamp}`;
    
    return {
      // Identity
      name: recipeName,
      hindiName: hindiNameSuggestion?.romanized || null,
      hindiScript: hindiNameSuggestion?.hindi || null,
      
      // Goal & metadata
      goal,
      goalLabel: goalConfig?.name,
      goalHindi: goalConfig?.hindiName,
      goalScore: Number(goalScore.toFixed(1)),
      skinType,
      dosha,
      doshaHindi: dosha ? DOSHA_NAMES[dosha]?.hindi : null,
      season,
      indianFocus,
      
      // Oils
      items: oils,
      oils,
      perOilDetails,
      
      // Additives
      additives,
      
      // Batch parameters
      totalOilWeight,
      batchSize: Number(computedBatchMass.toFixed(2)),
      computedBatchMass: Number(computedBatchMass.toFixed(2)),
      bars,
      barWeight,
      superfat,
      lyeConcentration,
      lyeRequired: Number(adjustedNaoh.toFixed(2)),
      waterWeight: Number(totalWater.toFixed(2)),
      
      // Properties
      properties,
      propertyLabels: {
        cleansing: properties.cleansing > 60 ? 'High' : properties.cleansing > 35 ? 'Medium' : 'Low',
        conditioning: properties.conditioning > 70 ? 'Very High' : properties.conditioning > 50 ? 'High' : 'Medium',
        hardness: properties.hardness > 60 ? 'Hard' : properties.hardness > 40 ? 'Medium' : 'Soft',
        lather: properties.lather > 60 ? 'Excellent' : properties.lather > 40 ? 'Good' : 'Moderate',
        creaminess: properties.creaminess > 70 ? 'Very Creamy' : properties.creaminess > 50 ? 'Creamy' : 'Light',
      },
      
      // Costs
      costs: {
        material: materialCost,
        totals,
        pricing,
      },
      
      // Timestamps
      createdAt: new Date().toISOString(),
      
      // Benefits summary
      benefits: this.generateBenefitsSummary(oils, additives, goal),
    };
  }

  // Generate benefits summary
  generateBenefitsSummary(oils, additives, goal) {
    const benefits = new Set();
    
    oils.forEach(oil => {
      const props = this.getOilProps(oil);
      (props.benefits || []).forEach(b => benefits.add(b));
    });
    
    // Goal-specific benefits
    const goalBenefits = {
      moisturizing: ['Deep hydration', 'Prevents dryness'],
      cleansing: ['Removes impurities', 'Deep clean'],
      gentle: ['Suitable for sensitive skin', 'Baby-safe'],
      luxurious: ['Spa-like experience', 'Premium feel'],
      ayurvedic: ['Traditional healing', 'Dosha balancing'],
      acne_fighting: ['Fights bacteria', 'Unclogs pores'],
      brightening: ['Evens skin tone', 'Natural glow'],
    };
    
    (goalBenefits[goal] || []).forEach(b => benefits.add(b));
    
    return Array.from(benefits).slice(0, 6);
  }

  // Generate multiple recipes with variety
  generateMultiple(count = 3, constraints = {}) {
    const recipes = [];
    const goals = Object.keys(RECIPE_GOALS);
    const usedGoals = new Set();
    
    for (let i = 0; i < count; i++) {
      // Vary the goal if not specified
      let goal = constraints.goal;
      if (!goal) {
        const availableGoals = goals.filter(g => !usedGoals.has(g));
        goal = availableGoals[Math.floor(Math.random() * availableGoals.length)] || 'balanced';
        usedGoals.add(goal);
      }
      
      const recipe = this.generateByGoal(goal, {
        ...constraints,
        numOils: constraints.numOils || (3 + Math.floor(Math.random() * 3)),
      });
      
      if (recipe) {
        recipes.push({
          ...recipe,
          name: `${recipe.goalLabel} #${i + 1} - ${new Date().toLocaleTimeString()}`,
        });
      }
    }
    
    return recipes;
  }

  // Find recipe by skin concern
  generateForConcern(concern, constraints = {}) {
    const concernToGoal = {
      dryness: 'moisturizing',
      oiliness: 'cleansing',
      acne: 'acne_fighting',
      aging: 'luxurious',
      sensitivity: 'gentle',
      dullness: 'brightening',
      general: 'balanced',
    };
    
    const goal = concernToGoal[concern] || 'balanced';
    return this.generateByGoal(goal, constraints);
  }
}

// ===== UTILITY EXPORTS =====
export const createSmartGenerator = (ingredients, options) => {
  return new SmartRecipeGenerator(ingredients, options);
};

export default SmartRecipeGenerator;

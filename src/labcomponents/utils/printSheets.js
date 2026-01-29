/**
 * Additional Print Sheets for Soap Lab
 * 
 * Contains: INCI List, Batch Cost Report, Recipe Comparison
 */

// INCI Names Database
export const INCI_NAMES = {
  // Oils
  'olive_oil': 'Olea Europaea (Olive) Fruit Oil',
  'olive oil': 'Olea Europaea (Olive) Fruit Oil',
  'coconut_oil': 'Cocos Nucifera (Coconut) Oil',
  'coconut oil': 'Cocos Nucifera (Coconut) Oil',
  'palm_oil': 'Elaeis Guineensis (Palm) Oil',
  'palm oil': 'Elaeis Guineensis (Palm) Oil',
  'castor_oil': 'Ricinus Communis (Castor) Seed Oil',
  'castor oil': 'Ricinus Communis (Castor) Seed Oil',
  'shea_butter': 'Butyrospermum Parkii (Shea) Butter',
  'shea butter': 'Butyrospermum Parkii (Shea) Butter',
  'cocoa_butter': 'Theobroma Cacao (Cocoa) Seed Butter',
  'cocoa butter': 'Theobroma Cacao (Cocoa) Seed Butter',
  'sweet_almond_oil': 'Prunus Amygdalus Dulcis (Sweet Almond) Oil',
  'sweet almond oil': 'Prunus Amygdalus Dulcis (Sweet Almond) Oil',
  'avocado_oil': 'Persea Gratissima (Avocado) Oil',
  'avocado oil': 'Persea Gratissima (Avocado) Oil',
  'rice_bran_oil': 'Oryza Sativa (Rice) Bran Oil',
  'rice bran oil': 'Oryza Sativa (Rice) Bran Oil',
  'sunflower_oil': 'Helianthus Annuus (Sunflower) Seed Oil',
  'sunflower oil': 'Helianthus Annuus (Sunflower) Seed Oil',
  'jojoba_oil': 'Simmondsia Chinensis (Jojoba) Seed Oil',
  'jojoba oil': 'Simmondsia Chinensis (Jojoba) Seed Oil',
  'neem_oil': 'Melia Azadirachta (Neem) Seed Oil',
  'neem oil': 'Melia Azadirachta (Neem) Seed Oil',
  'sesame_oil': 'Sesamum Indicum (Sesame) Seed Oil',
  'sesame oil': 'Sesamum Indicum (Sesame) Seed Oil',
  'lard': 'Adeps Suillus',
  'tallow': 'Sodium Tallowate',
  'mango_butter': 'Mangifera Indica (Mango) Seed Butter',
  'mango butter': 'Mangifera Indica (Mango) Seed Butter',
  'hemp_oil': 'Cannabis Sativa Seed Oil',
  'hemp oil': 'Cannabis Sativa Seed Oil',
  'argan_oil': 'Argania Spinosa Kernel Oil',
  'argan oil': 'Argania Spinosa Kernel Oil',
  
  // Essential Oils
  'lavender_eo': 'Lavandula Angustifolia (Lavender) Oil',
  'lavender essential oil': 'Lavandula Angustifolia (Lavender) Oil',
  'tea_tree_eo': 'Melaleuca Alternifolia (Tea Tree) Leaf Oil',
  'tea tree essential oil': 'Melaleuca Alternifolia (Tea Tree) Leaf Oil',
  'peppermint_eo': 'Mentha Piperita (Peppermint) Oil',
  'peppermint essential oil': 'Mentha Piperita (Peppermint) Oil',
  'eucalyptus_eo': 'Eucalyptus Globulus Leaf Oil',
  'eucalyptus essential oil': 'Eucalyptus Globulus Leaf Oil',
  'lemon_eo': 'Citrus Limon (Lemon) Peel Oil',
  'lemon essential oil': 'Citrus Limon (Lemon) Peel Oil',
  'orange_eo': 'Citrus Sinensis (Orange) Peel Oil',
  'orange essential oil': 'Citrus Sinensis (Orange) Peel Oil',
  'rosemary_eo': 'Rosmarinus Officinalis (Rosemary) Leaf Oil',
  'rosemary essential oil': 'Rosmarinus Officinalis (Rosemary) Leaf Oil',
  'cedarwood_eo': 'Juniperus Virginiana (Cedarwood) Oil',
  'cedarwood essential oil': 'Juniperus Virginiana (Cedarwood) Oil',
  'frankincense_eo': 'Boswellia Carterii Oil',
  'frankincense essential oil': 'Boswellia Carterii Oil',
  
  // Additives
  'activated_charcoal': 'Charcoal Powder',
  'activated charcoal': 'Charcoal Powder',
  'kaolin_clay': 'Kaolin',
  'kaolin clay': 'Kaolin',
  'bentonite_clay': 'Bentonite',
  'bentonite clay': 'Bentonite',
  'french_green_clay': 'Illite',
  'french green clay': 'Illite',
  'oatmeal': 'Avena Sativa (Oat) Kernel Meal',
  'colloidal_oatmeal': 'Avena Sativa (Oat) Kernel Flour',
  'honey': 'Mel (Honey)',
  'aloe_vera': 'Aloe Barbadensis Leaf Juice',
  'aloe vera': 'Aloe Barbadensis Leaf Juice',
  'coffee_grounds': 'Coffea Arabica (Coffee) Seed Powder',
  'coffee grounds': 'Coffea Arabica (Coffee) Seed Powder',
  'turmeric': 'Curcuma Longa (Turmeric) Root Powder',
  'spirulina': 'Spirulina Platensis Powder',
  'vitamin_e': 'Tocopherol',
  'vitamin e': 'Tocopherol',
  'rosehip_powder': 'Rosa Canina (Rose Hip) Seed Powder',
  'cocoa_powder': 'Theobroma Cacao (Cocoa) Powder',
  'cocoa powder': 'Theobroma Cacao (Cocoa) Powder',
  'sea_salt': 'Maris Sal (Sea Salt)',
  'sea salt': 'Maris Sal (Sea Salt)',
  'himalayan_salt': 'Sodium Chloride',
  'himalayan salt': 'Sodium Chloride',
  'sodium_lactate': 'Sodium Lactate',
  'sodium lactate': 'Sodium Lactate',
  'citric_acid': 'Citric Acid',
  'citric acid': 'Citric Acid',
  
  // Colorants
  'titanium_dioxide': 'CI 77891 (Titanium Dioxide)',
  'titanium dioxide': 'CI 77891 (Titanium Dioxide)',
  'iron_oxide_red': 'CI 77491 (Iron Oxide)',
  'iron oxide red': 'CI 77491 (Iron Oxide)',
  'iron_oxide_yellow': 'CI 77492 (Iron Oxide)',
  'iron oxide yellow': 'CI 77492 (Iron Oxide)',
  'iron_oxide_black': 'CI 77499 (Iron Oxide)',
  'iron oxide black': 'CI 77499 (Iron Oxide)',
  'ultramarine_blue': 'CI 77007 (Ultramarine)',
  'ultramarine blue': 'CI 77007 (Ultramarine)',
  'mica': 'Mica (CI 77019)',
  
  // Base ingredients (always present in cold process soap)
  'water': 'Aqua (Water)',
  'sodium_hydroxide': 'Sodium Hydroxide',
  'naoh': 'Sodium Hydroxide',
  'potassium_hydroxide': 'Potassium Hydroxide',
  'koh': 'Potassium Hydroxide',
};

/**
 * Get INCI name for an ingredient
 * @param {string} name - Common ingredient name
 * @returns {string} INCI name or original name if not found
 */
export const getINCI = (name) => {
  if (!name) return '';
  const key = name.toLowerCase().trim();
  return INCI_NAMES[key] || INCI_NAMES[key.replace(/\s+/g, '_')] || name;
};

/**
 * Generate full INCI list from recipe
 * @param {object} recipe - Recipe object
 * @returns {array} Sorted INCI list (descending by amount)
 */
export const generateINCIList = (recipe) => {
  const ingredients = [];
  
  // Add saponified oils (largest amounts first)
  const oils = recipe.oils || recipe.items || [];
  oils.forEach(oil => {
    const amount = oil.weight || oil.grams || 0;
    if (amount > 0) {
      // For cold process, oils become sodium XXXate
      const oilName = oil.name || oil.oil || '';
      const inciName = getINCI(oilName);
      // Convert to sodium salt form for saponified oils
      const saponifiedName = inciName.includes('Oil') || inciName.includes('Butter')
        ? `Sodium ${oilName.replace(/oil|butter/gi, '').trim()}ate (from ${inciName})`
        : inciName;
      
      ingredients.push({
        name: saponifiedName,
        inciName: inciName,
        amount,
        type: 'oil',
      });
    }
  });
  
  // Add water
  const waterAmt = recipe.waterWeight || recipe.water || 0;
  if (waterAmt > 0) {
    ingredients.push({
      name: 'Aqua (Water)',
      inciName: 'Aqua',
      amount: waterAmt,
      type: 'base',
    });
  }
  
  // Add additives
  const additives = recipe.additives || recipe.extras || [];
  additives.forEach(add => {
    const amount = add.amount || add.weight || 0;
    if (amount > 0) {
      ingredients.push({
        name: getINCI(add.name || add.type),
        inciName: getINCI(add.name || add.type),
        amount,
        type: 'additive',
      });
    }
  });
  
  // Add fragrance/essential oils
  const eo = recipe.essentialOil || recipe.fragrance;
  if (eo && eo.weight) {
    ingredients.push({
      name: getINCI(eo.name) || 'Parfum (Fragrance)',
      inciName: eo.name ? getINCI(eo.name) : 'Parfum',
      amount: eo.weight,
      type: 'fragrance',
    });
  }
  
  // Sort by amount descending
  ingredients.sort((a, b) => b.amount - a.amount);
  
  return ingredients;
};

/**
 * Print styles for additional sheets
 */
export const additionalPrintStyles = `
  .inci-list { font-size: 10pt; }
  .inci-item { padding: 8px 0; border-bottom: 1px dotted #ddd; }
  .inci-item:last-child { border-bottom: none; }
  .inci-name { font-weight: bold; font-size: 11pt; }
  .inci-common { color: #666; font-size: 9pt; margin-left: 10px; }
  .inci-warning { background: #fff3cd; padding: 10px; border-left: 3px solid #ffc107; margin: 10px 0; }
  .cost-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  .cost-table th, .cost-table td { border: 1px solid #ddd; padding: 10px; }
  .cost-table th { background: #f5f5f5; text-align: left; }
  .cost-table .right { text-align: right; }
  .cost-table .total-row { background: #e8f5e9; font-weight: bold; }
  .cost-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
  .cost-box { background: #f5f5f5; padding: 15px; border-radius: 8px; }
  .cost-big { font-size: 24pt; font-weight: bold; color: #2e7d32; }
`;

export default {
  INCI_NAMES,
  getINCI,
  generateINCIList,
  additionalPrintStyles,
};

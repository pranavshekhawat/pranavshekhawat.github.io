import React, { useState, useEffect, useMemo } from 'react';
import { subscribeToUserCollection, addUserDoc } from '../utils/userDataHelper';
import { useNavigate } from 'react-router-dom';
import LabNavbar from './LabNavbar';

/**
 * RecipeTemplates - Classic & Ayurvedic soap recipe templates
 * Route: /lab/templates
 */

// Classic soap recipe templates with traditional formulations
const CLASSIC_TEMPLATES = [
  {
    id: 'castile',
    name: 'Pure Castile Soap',
    description: '100% Olive Oil - The gentlest, most conditioning soap. Traditional Spanish recipe dating back centuries.',
    difficulty: 'Beginner',
    cureTime: '8-12 weeks',
    properties: { hardness: 'Low', lather: 'Creamy', conditioning: 'Very High' },
    oils: [{ name: 'Olive Oil', key: 'olive_oil', pct: 100 }],
    additives: [],
    superfat: 7,
    lyeConcentration: 0.28,
    tips: 'Requires longer cure time (8-12 weeks) for best results. Makes a very soft bar initially.',
    use: ['face', 'body'],
  },
  {
    id: 'marseille',
    name: 'Savon de Marseille',
    description: '72% Olive Oil - Traditional French soap with coconut for better lather.',
    difficulty: 'Beginner',
    cureTime: '4-6 weeks',
    properties: { hardness: 'Medium', lather: 'Good', conditioning: 'High' },
    oils: [
      { name: 'Olive Oil', key: 'olive_oil', pct: 72 },
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 18 },
      { name: 'Palm Oil', key: 'palm_oil', pct: 10 }
    ],
    additives: [],
    superfat: 6,
    lyeConcentration: 0.30,
    tips: 'Classic French recipe. Great everyday soap with good lather.',
    use: ['body'],
  },
  {
    id: 'bastille',
    name: 'Bastille Soap',
    description: '70%+ Olive Oil - Similar to Castile but with added oils for better lather.',
    difficulty: 'Beginner',
    cureTime: '6-8 weeks',
    properties: { hardness: 'Medium', lather: 'Good', conditioning: 'Very High' },
    oils: [
      { name: 'Olive Oil', key: 'olive_oil', pct: 70 },
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 20 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 10 }
    ],
    additives: [],
    superfat: 7,
    lyeConcentration: 0.30,
    tips: 'The castor oil boosts lather significantly. Great for beginners.',
    use: ['face', 'body'],
  },
  {
    id: 'shea_luxury',
    name: 'Shea Butter Luxury Bar',
    description: 'Rich, moisturizing bar with shea butter. Excellent for dry skin.',
    difficulty: 'Intermediate',
    cureTime: '4-6 weeks',
    properties: { hardness: 'Medium-High', lather: 'Creamy', conditioning: 'Very High' },
    oils: [
      { name: 'Olive Oil', key: 'olive_oil', pct: 40 },
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 25 },
      { name: 'Shea Butter', key: 'shea_butter', pct: 20 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 5 },
      { name: 'Rice Bran Oil', key: 'rice_bran_oil', pct: 10 }
    ],
    additives: [],
    superfat: 6,
    lyeConcentration: 0.32,
    tips: 'Melt shea butter gently to preserve nutrients.',
    use: ['body'],
  },
  {
    id: 'coconut_100',
    name: '100% Coconut (Salt Bar)',
    description: 'All coconut oil - Very cleansing, bubbly lather. Great as salt spa bar.',
    difficulty: 'Beginner',
    cureTime: '2-4 weeks',
    properties: { hardness: 'Very High', lather: 'Bubbly', conditioning: 'Low' },
    oils: [{ name: 'Coconut Oil', key: 'coconut_oil', pct: 100 }],
    additives: [
      { name: 'Sea Salt', key: 'sea_salt', amount: 50, unit: 'g', whenAdded: 'at-trace', type: 'additive' }
    ],
    superfat: 20,
    lyeConcentration: 0.33,
    tips: 'Use 20% superfat to prevent drying. Add salt at trace for spa bars.',
    use: ['body'],
  },
  {
    id: 'three_oil',
    name: 'Classic Three Oil (Beginner)',
    description: 'Simple, balanced recipe with just three oils. Perfect for learning.',
    difficulty: 'Beginner',
    cureTime: '4-6 weeks',
    properties: { hardness: 'Medium', lather: 'Good', conditioning: 'Medium-High' },
    oils: [
      { name: 'Olive Oil', key: 'olive_oil', pct: 50 },
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 30 },
      { name: 'Palm Oil', key: 'palm_oil', pct: 20 }
    ],
    additives: [],
    superfat: 5,
    lyeConcentration: 0.30,
    tips: 'Great starter recipe. Well-balanced bar with predictable behavior.',
    use: ['body'],
  },
  {
    id: 'facial_gentle',
    name: 'Gentle Facial Bar',
    description: 'Low-cleansing, high-conditioning bar for face. Very gentle.',
    difficulty: 'Intermediate',
    cureTime: '6-8 weeks',
    properties: { hardness: 'Medium', lather: 'Low-Creamy', conditioning: 'Very High' },
    oils: [
      { name: 'Olive Oil', key: 'olive_oil', pct: 50 },
      { name: 'Rice Bran Oil', key: 'rice_bran_oil', pct: 20 },
      { name: 'Shea Butter', key: 'shea_butter', pct: 15 },
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 10 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 5 }
    ],
    additives: [
      { name: 'Kaolin Clay', key: 'kaolin_clay', amount: 15, unit: 'g', whenAdded: 'at-trace', type: 'clay', optional: true }
    ],
    superfat: 8,
    lyeConcentration: 0.28,
    tips: 'Keep coconut low for face bars. Kaolin clay adds silkiness.',
    use: ['face'],
  },
  {
    id: 'cocoa_indulgent',
    name: 'Cocoa Butter Indulgent',
    description: 'Rich chocolate-scented luxury bar. Cocoa butter creates hard, smooth bar.',
    difficulty: 'Intermediate',
    cureTime: '4-6 weeks',
    properties: { hardness: 'High', lather: 'Creamy', conditioning: 'High' },
    oils: [
      { name: 'Olive Oil', key: 'olive_oil', pct: 35 },
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 25 },
      { name: 'Cocoa Butter', key: 'cocoa_butter', pct: 15 },
      { name: 'Palm Oil', key: 'palm_oil', pct: 15 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 10 }
    ],
    additives: [
      { name: 'Cocoa Powder', key: 'cocoa_powder', amount: 10, unit: 'g', whenAdded: 'at-trace', type: 'additive', optional: true }
    ],
    superfat: 6,
    lyeConcentration: 0.32,
    tips: 'Cocoa butter speeds up trace. Work quickly. Natural chocolate scent!',
    use: ['body'],
  },
  {
    id: 'avocado_hair',
    name: 'Avocado Shampoo Bar',
    description: 'Solid shampoo bar with avocado oil. Good for hair and scalp.',
    difficulty: 'Advanced',
    cureTime: '4-6 weeks',
    properties: { hardness: 'Medium', lather: 'Bubbly', conditioning: 'Medium-High' },
    oils: [
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 40 },
      { name: 'Olive Oil', key: 'olive_oil', pct: 25 },
      { name: 'Avocado Oil', key: 'avocado_oil', pct: 15 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 20 }
    ],
    additives: [],
    superfat: 3,
    lyeConcentration: 0.30,
    tips: 'Higher coconut and castor for maximum lather. Lower superfat for hair bars.',
    use: ['hair'],
  },
];

// Ayurvedic soap templates - Traditional Indian formulations
const AYURVEDIC_TEMPLATES = [
  {
    id: 'haldi_chandan',
    name: 'Haldi Chandan (Turmeric Sandalwood)',
    description: 'Traditional Indian bridal soap. Turmeric brightens skin, sandalwood soothes.',
    difficulty: 'Intermediate',
    cureTime: '4-6 weeks',
    properties: { hardness: 'Medium', lather: 'Creamy', conditioning: 'High' },
    oils: [
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 35 },
      { name: 'Olive Oil', key: 'olive_oil', pct: 30 },
      { name: 'Sesame Oil', key: 'sesame_oil', pct: 20 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 10 },
      { name: 'Neem Oil', key: 'neem_oil', pct: 5 }
    ],
    additives: [
      { name: 'Turmeric Powder', key: 'turmeric_powder', amount: 10, unit: 'g', whenAdded: 'at-trace', type: 'herb' },
      { name: 'Sandalwood Powder', key: 'sandalwood_powder', amount: 8, unit: 'g', whenAdded: 'at-trace', type: 'herb' },
      { name: 'Sandalwood Essential Oil', key: 'sandalwood_eo', amount: 15, unit: 'ml', whenAdded: 'at-trace', type: 'fragrance', optional: true }
    ],
    superfat: 7,
    lyeConcentration: 0.30,
    tips: 'Use only 1 tsp turmeric per 500g oils to avoid yellow staining. Traditional Indian beauty ritual.',
    use: ['face', 'body'],
  },
  {
    id: 'multani_mitti',
    name: 'Multani Mitti (Fuller\'s Earth)',
    description: 'Deep cleansing clay soap. Excellent for oily and acne-prone skin.',
    difficulty: 'Beginner',
    cureTime: '4-6 weeks',
    properties: { hardness: 'Medium', lather: 'Good', conditioning: 'Medium' },
    oils: [
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 30 },
      { name: 'Olive Oil', key: 'olive_oil', pct: 35 },
      { name: 'Rice Bran Oil', key: 'rice_bran_oil', pct: 20 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 10 },
      { name: 'Neem Oil', key: 'neem_oil', pct: 5 }
    ],
    additives: [
      { name: 'Multani Mitti (Fuller\'s Earth)', key: 'multani_mitti', amount: 25, unit: 'g', whenAdded: 'at-trace', type: 'clay' },
      { name: 'Rose Water', key: 'rose_water', amount: 20, unit: 'ml', whenAdded: 'replace-water', type: 'liquid', optional: true }
    ],
    superfat: 6,
    lyeConcentration: 0.30,
    tips: 'Mix multani mitti with a little water before adding. Great for oily skin.',
    use: ['face'],
  },
  {
    id: 'neem_tulsi',
    name: 'Neem Tulsi Antibacterial',
    description: 'Powerful antibacterial soap with neem and holy basil. Traditional Ayurvedic combination.',
    difficulty: 'Intermediate',
    cureTime: '4-6 weeks',
    properties: { hardness: 'Medium', lather: 'Creamy', conditioning: 'High' },
    oils: [
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 25 },
      { name: 'Olive Oil', key: 'olive_oil', pct: 35 },
      { name: 'Neem Oil', key: 'neem_oil', pct: 20 },
      { name: 'Rice Bran Oil', key: 'rice_bran_oil', pct: 10 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 10 }
    ],
    additives: [
      { name: 'Tulsi (Holy Basil) Powder', key: 'tulsi_powder', amount: 12, unit: 'g', whenAdded: 'at-trace', type: 'herb' },
      { name: 'Neem Powder', key: 'neem_powder', amount: 10, unit: 'g', whenAdded: 'at-trace', type: 'herb' },
      { name: 'Tea Tree Essential Oil', key: 'tea_tree_eo', amount: 10, unit: 'ml', whenAdded: 'at-trace', type: 'fragrance', optional: true }
    ],
    superfat: 7,
    lyeConcentration: 0.30,
    tips: 'Neem has strong smell - tea tree helps balance. Excellent for acne and skin infections.',
    use: ['body'],
  },
  {
    id: 'aloe_vera_cooling',
    name: 'Aloe Vera Cooling Soap',
    description: 'Soothing aloe vera soap. Perfect for summer and sun-exposed skin.',
    difficulty: 'Intermediate',
    cureTime: '4-6 weeks',
    properties: { hardness: 'Medium', lather: 'Creamy', conditioning: 'Very High' },
    oils: [
      { name: 'Olive Oil', key: 'olive_oil', pct: 40 },
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 25 },
      { name: 'Rice Bran Oil', key: 'rice_bran_oil', pct: 20 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 10 },
      { name: 'Shea Butter', key: 'shea_butter', pct: 5 }
    ],
    additives: [
      { name: 'Aloe Vera Gel', key: 'aloe_vera_gel', amount: 50, unit: 'g', whenAdded: 'replace-water', type: 'liquid' },
      { name: 'Cucumber Extract', key: 'cucumber_extract', amount: 10, unit: 'ml', whenAdded: 'at-trace', type: 'liquid', optional: true },
      { name: 'Peppermint Essential Oil', key: 'peppermint_eo', amount: 8, unit: 'ml', whenAdded: 'at-trace', type: 'fragrance', optional: true }
    ],
    superfat: 7,
    lyeConcentration: 0.28,
    tips: 'Use fresh aloe gel if possible. Replace 30-50% water with aloe. Very soothing for sunburn.',
    use: ['face', 'body'],
  },
  {
    id: 'shikakai_reetha',
    name: 'Shikakai Reetha Hair Bar',
    description: 'Traditional Indian shampoo bar. Shikakai and reetha used for hair care for thousands of years.',
    difficulty: 'Advanced',
    cureTime: '4-6 weeks',
    properties: { hardness: 'Medium', lather: 'Bubbly', conditioning: 'Medium-High' },
    oils: [
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 40 },
      { name: 'Olive Oil', key: 'olive_oil', pct: 25 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 20 },
      { name: 'Sesame Oil', key: 'sesame_oil', pct: 15 }
    ],
    additives: [
      { name: 'Shikakai Powder', key: 'shikakai_powder', amount: 20, unit: 'g', whenAdded: 'at-trace', type: 'herb' },
      { name: 'Reetha (Soapnut) Powder', key: 'reetha_powder', amount: 15, unit: 'g', whenAdded: 'at-trace', type: 'herb' },
      { name: 'Amla Powder', key: 'amla_powder', amount: 10, unit: 'g', whenAdded: 'at-trace', type: 'herb' },
      { name: 'Brahmi Powder', key: 'brahmi_powder', amount: 5, unit: 'g', whenAdded: 'at-trace', type: 'herb', optional: true }
    ],
    superfat: 4,
    lyeConcentration: 0.30,
    tips: 'Lower superfat for hair bars. Traditional herbal hair wash. May cause initial adjustment period.',
    use: ['hair'],
  },
  {
    id: 'ubtan_soap',
    name: 'Ubtan Brightening Soap',
    description: 'Traditional Indian ubtan in soap form. Besan, turmeric, and sandalwood for glowing skin.',
    difficulty: 'Intermediate',
    cureTime: '4-6 weeks',
    properties: { hardness: 'Medium', lather: 'Creamy', conditioning: 'High' },
    oils: [
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 30 },
      { name: 'Olive Oil', key: 'olive_oil', pct: 30 },
      { name: 'Sesame Oil', key: 'sesame_oil', pct: 20 },
      { name: 'Mustard Oil', key: 'mustard_oil', pct: 10 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 10 }
    ],
    additives: [
      { name: 'Besan (Gram Flour)', key: 'besan', amount: 20, unit: 'g', whenAdded: 'at-trace', type: 'scrub' },
      { name: 'Turmeric Powder', key: 'turmeric_powder', amount: 5, unit: 'g', whenAdded: 'at-trace', type: 'herb' },
      { name: 'Sandalwood Powder', key: 'sandalwood_powder', amount: 8, unit: 'g', whenAdded: 'at-trace', type: 'herb' },
      { name: 'Rose Petal Powder', key: 'rose_petal_powder', amount: 5, unit: 'g', whenAdded: 'at-trace', type: 'herb', optional: true }
    ],
    superfat: 7,
    lyeConcentration: 0.30,
    tips: 'Traditional bridal preparation. Besan acts as gentle exfoliant. Very effective for skin brightening.',
    use: ['face', 'body'],
  },
  {
    id: 'triphala_detox',
    name: 'Triphala Detox Soap',
    description: 'Ayurvedic triphala (three fruits) soap. Amla, haritaki, and bibhitaki for detox.',
    difficulty: 'Intermediate',
    cureTime: '4-6 weeks',
    properties: { hardness: 'Medium', lather: 'Good', conditioning: 'High' },
    oils: [
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 30 },
      { name: 'Olive Oil', key: 'olive_oil', pct: 35 },
      { name: 'Rice Bran Oil', key: 'rice_bran_oil', pct: 20 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 10 },
      { name: 'Neem Oil', key: 'neem_oil', pct: 5 }
    ],
    additives: [
      { name: 'Triphala Powder', key: 'triphala_powder', amount: 15, unit: 'g', whenAdded: 'at-trace', type: 'herb' },
      { name: 'Activated Charcoal', key: 'activated_charcoal', amount: 5, unit: 'g', whenAdded: 'at-trace', type: 'additive', optional: true }
    ],
    superfat: 6,
    lyeConcentration: 0.30,
    tips: 'Triphala is high in vitamin C. Excellent for detoxifying and anti-aging.',
    use: ['body'],
  },
  {
    id: 'kumkumadi',
    name: 'Kumkumadi Luxury Soap',
    description: 'Inspired by Kumkumadi tailam - the queen of Ayurvedic beauty. Saffron-based luxury.',
    difficulty: 'Advanced',
    cureTime: '4-6 weeks',
    properties: { hardness: 'Medium', lather: 'Creamy', conditioning: 'Very High' },
    oils: [
      { name: 'Olive Oil', key: 'olive_oil', pct: 35 },
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 25 },
      { name: 'Sesame Oil', key: 'sesame_oil', pct: 20 },
      { name: 'Shea Butter', key: 'shea_butter', pct: 10 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 10 }
    ],
    additives: [
      { name: 'Saffron (Kesar)', key: 'saffron', amount: 0.5, unit: 'g', whenAdded: 'infuse-oil', type: 'herb' },
      { name: 'Sandalwood Powder', key: 'sandalwood_powder', amount: 10, unit: 'g', whenAdded: 'at-trace', type: 'herb' },
      { name: 'Manjistha Powder', key: 'manjistha_powder', amount: 5, unit: 'g', whenAdded: 'at-trace', type: 'herb' },
      { name: 'Rose Essential Oil', key: 'rose_eo', amount: 5, unit: 'ml', whenAdded: 'at-trace', type: 'fragrance', optional: true }
    ],
    superfat: 8,
    lyeConcentration: 0.28,
    tips: 'Infuse saffron in warm oil overnight before making. Premium luxury bar. Small batch due to saffron cost.',
    use: ['face'],
  },
  {
    id: 'kesar_malai',
    name: 'Kesar Malai (Saffron Cream)',
    description: 'Luxurious saffron and milk soap. Traditional Indian royal beauty recipe.',
    difficulty: 'Advanced',
    cureTime: '4-6 weeks',
    properties: { hardness: 'Medium', lather: 'Creamy', conditioning: 'Very High' },
    oils: [
      { name: 'Olive Oil', key: 'olive_oil', pct: 35 },
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 25 },
      { name: 'Shea Butter', key: 'shea_butter', pct: 15 },
      { name: 'Rice Bran Oil', key: 'rice_bran_oil', pct: 15 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 10 }
    ],
    additives: [
      { name: 'Saffron (Kesar)', key: 'saffron', amount: 0.3, unit: 'g', whenAdded: 'infuse-milk', type: 'herb' },
      { name: 'Full Cream Milk', key: 'full_cream_milk', amount: 50, unit: 'ml', whenAdded: 'replace-water', type: 'liquid' },
      { name: 'Honey', key: 'honey', amount: 15, unit: 'g', whenAdded: 'at-trace', type: 'additive', optional: true }
    ],
    superfat: 8,
    lyeConcentration: 0.28,
    tips: 'Freeze milk before adding to lye. Saffron-infused milk creates beautiful color.',
    use: ['face', 'body'],
  },
  {
    id: 'rose_gulab',
    name: 'Gulab (Rose) Soap',
    description: 'Classic Indian rose soap. Rose water and petals for romantic fragrance.',
    difficulty: 'Beginner',
    cureTime: '4-6 weeks',
    properties: { hardness: 'Medium', lather: 'Good', conditioning: 'High' },
    oils: [
      { name: 'Olive Oil', key: 'olive_oil', pct: 40 },
      { name: 'Coconut Oil', key: 'coconut_oil', pct: 30 },
      { name: 'Rice Bran Oil', key: 'rice_bran_oil', pct: 20 },
      { name: 'Castor Oil', key: 'castor_oil', pct: 10 }
    ],
    additives: [
      { name: 'Rose Water', key: 'rose_water', amount: 30, unit: 'ml', whenAdded: 'replace-water', type: 'liquid' },
      { name: 'Rose Petal Powder', key: 'rose_petal_powder', amount: 8, unit: 'g', whenAdded: 'at-trace', type: 'herb' },
      { name: 'Rose Geranium Essential Oil', key: 'rose_geranium_eo', amount: 12, unit: 'ml', whenAdded: 'at-trace', type: 'fragrance', optional: true },
      { name: 'Pink Clay', key: 'pink_clay', amount: 10, unit: 'g', whenAdded: 'at-trace', type: 'clay', optional: true }
    ],
    superfat: 6,
    lyeConcentration: 0.30,
    tips: 'Rose fragrance fades - add extra EO. Pink clay gives beautiful color.',
    use: ['face', 'body'],
  },
];

// Combine all templates
const RECIPE_TEMPLATES = [...CLASSIC_TEMPLATES, ...AYURVEDIC_TEMPLATES];

// SAP values fallback
const SAP = {
  olive_oil: 0.134,
  coconut_oil: 0.183,
  palm_oil: 0.142,
  shea_butter: 0.128,
  castor_oil: 0.128,
  rice_bran_oil: 0.128,
  cocoa_butter: 0.137,
  tallow: 0.140,
  neem_oil: 0.139,
  avocado_oil: 0.133,
  sesame_oil: 0.133,
  mustard_oil: 0.124,
};

const DIFFICULTY_COLORS = {
  'Beginner': '#4caf50',
  'Intermediate': '#ff9800',
  'Advanced': '#f44336',
};

const ADDITIVE_TYPE_ICONS = {
  'herb': '🌿',
  'clay': '🏺',
  'liquid': '💧',
  'fragrance': '🌸',
  'additive': '✨',
  'scrub': '🧂',
};

export default function RecipeTemplates() {
  const [ingredients, setIngredients] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [batchSize, setBatchSize] = useState(1000);
  const [barWeight, setBarWeight] = useState(100);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showMissingModal, setShowMissingModal] = useState(null);
  const navigate = useNavigate();

  // Load ingredients for SAP lookup and inventory check
  useEffect(() => {
    let unsub = () => {};
    try {
      unsub = subscribeToUserCollection('ingredients', (data) => {
        // Add firebaseId to match expected structure
        const withFirebaseId = data.map(item => ({ ...item, firebaseId: item.id }));
        setIngredients(withFirebaseId);
      });
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
    return () => unsub();
  }, []);

  const getSAP = (key) => {
    const inv = ingredients.find(i => i.key === key || (i.name || '').toLowerCase().replace(/\s+/g, '_') === key);
    return inv?.sap ?? SAP[key] ?? 0.134;
  };

  // Check inventory for missing ingredients
  const checkInventory = (template) => {
    const missingOils = [];
    const missingAdditives = [];
    const lowStock = [];

    // Check oils
    template.oils.forEach(oil => {
      const inv = ingredients.find(i => 
        i.key === oil.key || 
        (i.name || '').toLowerCase().replace(/\s+/g, '_') === oil.key ||
        (i.name || '').toLowerCase() === oil.name.toLowerCase()
      );
      if (!inv) {
        missingOils.push(oil.name);
      } else {
        const requiredWeight = (oil.pct / 100) * batchSize;
        if ((inv.stock || 0) < requiredWeight) {
          lowStock.push({ name: oil.name, have: inv.stock || 0, need: requiredWeight });
        }
      }
    });

    // Check required additives (not optional)
    (template.additives || []).forEach(add => {
      if (add.optional) return;
      const inv = ingredients.find(i => 
        i.key === add.key || 
        (i.name || '').toLowerCase().replace(/\s+/g, '_') === add.key ||
        (i.name || '').toLowerCase() === add.name.toLowerCase()
      );
      if (!inv) {
        missingAdditives.push(add.name);
      }
    });

    return { missingOils, missingAdditives, lowStock, canMake: missingOils.length === 0 && missingAdditives.length === 0 };
  };

  const calculateRecipe = (template) => {
    const totalOilWeight = batchSize;
    const oilsComputed = template.oils.map(o => ({
      ...o,
      weight: (o.pct / 100) * totalOilWeight,
      sap: getSAP(o.key),
    }));

    const naohBase = oilsComputed.reduce((sum, o) => sum + o.weight * o.sap, 0);
    const adjustedNaoh = naohBase * (1 - template.superfat / 100);
    const waterWeight = (adjustedNaoh / template.lyeConcentration) - adjustedNaoh;
    const totalBatchMass = totalOilWeight + adjustedNaoh + waterWeight;
    const bars = Math.max(1, Math.round(totalBatchMass / barWeight));

    return {
      oilsComputed,
      naohBase: naohBase.toFixed(2),
      adjustedNaoh: adjustedNaoh.toFixed(2),
      waterWeight: waterWeight.toFixed(2),
      totalBatchMass: totalBatchMass.toFixed(2),
      bars,
    };
  };

  const filteredTemplates = useMemo(() => {
    if (filterCategory === 'all') return RECIPE_TEMPLATES;
    if (filterCategory === 'classic') return CLASSIC_TEMPLATES;
    if (filterCategory === 'ayurvedic') return AYURVEDIC_TEMPLATES;
    return RECIPE_TEMPLATES;
  }, [filterCategory]);

  const handleUseTemplate = async (template) => {
    const inventory = checkInventory(template);
    if (!inventory.canMake) {
      setShowMissingModal({ template, inventory });
      return;
    }

    setSaving(true);
    try {
      const calc = calculateRecipe(template);
      const recipeObj = {
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        items: template.oils.map(o => ({ ...o, weight: (o.pct / 100) * batchSize })),
        oils: template.oils.map(o => ({ ...o, weight: (o.pct / 100) * batchSize })),
        totalOilWeight: batchSize,
        batchSize: parseFloat(calc.totalBatchMass),
        barWeight,
        bars: calc.bars,
        superfat: template.superfat,
        lyeConcentration: template.lyeConcentration,
        adjustedTotalNaoh: parseFloat(calc.adjustedNaoh),
        waterWeight: parseFloat(calc.waterWeight),
        additives: template.additives || [],
        use: template.use,
        skinType: ['all'],
        goal: 'template-based',
        templateId: template.id,
        templateName: template.name,
        notes: template.tips,
        createdAt: new Date().toISOString(),
        tags: [],
        status: 'draft',
        version: 1,
      };

      await addUserDoc('recipes', recipeObj);
      alert(`Recipe "${recipeObj.name}" created from template!`);
      navigate('/lab/recipes');
    } catch (err) {
      console.error('Failed to save template recipe', err);
      alert('Failed to create recipe from template');
    } finally {
      setSaving(false);
    }
  };

  const handleEditInCreator = (template) => {
    const inventory = checkInventory(template);
    if (!inventory.canMake) {
      setShowMissingModal({ template, inventory });
      return;
    }

    const calc = calculateRecipe(template);
    const recipeData = {
      name: template.name,
      items: template.oils.map(o => ({ ...o, weight: (o.pct / 100) * batchSize })),
      totalOilWeight: batchSize,
      batchSize: parseFloat(calc.totalBatchMass),
      barWeight,
      superfat: template.superfat,
      lyeConcentration: template.lyeConcentration,
      use: template.use,
      additives: template.additives || [],
      notes: template.tips,
    };
    sessionStorage.setItem('editRecipe', JSON.stringify(recipeData));
    navigate('/lab');
  };

  return (
    <div>
      <LabNavbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16, background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 16, background: '#fff', borderRadius: 8, padding: 16 }}>
        <h2 style={{ margin: 0, fontSize: '1.4em' }}>📜 Recipe Templates</h2>
        <p style={{ margin: '4px 0 0', fontSize: '0.9em', color: '#666' }}>
          Classic & Ayurvedic formulations. Check inventory before using.
        </p>
      </div>

      {/* Category Filter + Batch Size */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 16, background: '#fff', borderRadius: 8, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { key: 'all', label: 'All Templates', count: RECIPE_TEMPLATES.length },
            { key: 'classic', label: '🌍 Classic', count: CLASSIC_TEMPLATES.length },
            { key: 'ayurvedic', label: '🕉️ Ayurvedic', count: AYURVEDIC_TEMPLATES.length },
          ].map(cat => (
            <button
              key={cat.key}
              onClick={() => setFilterCategory(cat.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: 'none',
                background: filterCategory === cat.key ? '#1976d2' : '#e0e0e0',
                color: filterCategory === cat.key ? '#fff' : '#333',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '0.85em',
              }}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 500, fontSize: '0.9em' }}>Oil Weight:</span>
            <input 
              type="number" 
              value={batchSize} 
              onChange={e => setBatchSize(Number(e.target.value))} 
              style={{ width: 70, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
            />
            <span style={{ color: '#666' }}>g</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 500, fontSize: '0.9em' }}>Bar:</span>
            <input 
              type="number" 
              value={barWeight} 
              onChange={e => setBarWeight(Number(e.target.value))} 
              style={{ width: 60, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
            />
            <span style={{ color: '#666' }}>g</span>
          </label>
        </div>
      </div>

      {/* Templates Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
        {filteredTemplates.map(template => {
          const calc = calculateRecipe(template);
          const inventory = checkInventory(template);
          const hasAdditives = (template.additives || []).length > 0;
          const requiredAdditives = (template.additives || []).filter(a => !a.optional);
          const optionalAdditives = (template.additives || []).filter(a => a.optional);

          return (
            <div 
              key={template.id} 
              style={{ 
                background: '#fff', 
                borderRadius: 12, 
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: selectedTemplate === template.id ? '2px solid #1976d2' : inventory.canMake ? '1px solid #e0e0e0' : '2px solid #ffcdd2',
                cursor: 'pointer',
                opacity: inventory.canMake ? 1 : 0.85,
              }}
              onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
            >
              {/* Header */}
              <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1.1em' }}>{template.name}</h3>
                    {!inventory.canMake && (
                      <span style={{ fontSize: '0.75em', color: '#d32f2f', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        ⚠️ Missing {inventory.missingOils.length + inventory.missingAdditives.length} ingredient(s)
                      </span>
                    )}
                  </div>
                  <span style={{ 
                    padding: '3px 10px', 
                    borderRadius: 12, 
                    fontSize: '0.75em', 
                    fontWeight: 600,
                    background: DIFFICULTY_COLORS[template.difficulty] + '20',
                    color: DIFFICULTY_COLORS[template.difficulty],
                  }}>
                    {template.difficulty}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85em', color: '#666', lineHeight: 1.4 }}>
                  {template.description}
                </p>
              </div>

              {/* Oil Breakdown */}
              <div style={{ padding: '12px 16px', background: '#fafafa' }}>
                <div style={{ fontSize: '0.8em', fontWeight: 600, color: '#555', marginBottom: 8 }}>🧴 Oils Required:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {template.oils.map(o => {
                    const inInventory = ingredients.some(i => 
                      i.key === o.key || 
                      (i.name || '').toLowerCase().replace(/\s+/g, '_') === o.key ||
                      (i.name || '').toLowerCase() === o.name.toLowerCase()
                    );
                    return (
                      <span key={o.key} style={{ 
                        padding: '3px 8px', 
                        background: inInventory ? '#e3f2fd' : '#ffebee', 
                        borderRadius: 4, 
                        fontSize: '0.8em',
                        color: inInventory ? '#1565c0' : '#c62828',
                        border: inInventory ? 'none' : '1px dashed #ef9a9a',
                      }}>
                        {inInventory ? '✓' : '✗'} {o.name}: {o.pct}%
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Additives Section */}
              {hasAdditives && (
                <div style={{ padding: '12px 16px', background: '#fff8e1', borderTop: '1px solid #ffe082' }}>
                  <div style={{ fontSize: '0.8em', fontWeight: 600, color: '#f57c00', marginBottom: 8 }}>
                    🌿 Additives:
                  </div>
                  {requiredAdditives.length > 0 && (
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: '0.7em', color: '#666', fontWeight: 500 }}>Required:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                        {requiredAdditives.map(a => {
                          const inInventory = ingredients.some(i => 
                            i.key === a.key || 
                            (i.name || '').toLowerCase() === a.name.toLowerCase()
                          );
                          return (
                            <span key={a.key || a.name} style={{ 
                              padding: '2px 6px', 
                              background: inInventory ? '#c8e6c9' : '#ffcdd2',
                              borderRadius: 4, 
                              fontSize: '0.75em',
                              color: inInventory ? '#2e7d32' : '#c62828',
                            }}>
                              {ADDITIVE_TYPE_ICONS[a.type] || '•'} {a.name} ({a.amount}{a.unit})
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {optionalAdditives.length > 0 && (
                    <div>
                      <span style={{ fontSize: '0.7em', color: '#666', fontStyle: 'italic' }}>Optional:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                        {optionalAdditives.map(a => (
                          <span key={a.key || a.name} style={{ 
                            padding: '2px 6px', 
                            background: '#f5f5f5',
                            borderRadius: 4, 
                            fontSize: '0.75em',
                            color: '#757575',
                          }}>
                            {ADDITIVE_TYPE_ICONS[a.type] || '•'} {a.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Properties */}
              <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, borderTop: '1px solid #f0f0f0' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7em', color: '#666' }}>Hardness</div>
                  <div style={{ fontSize: '0.85em', fontWeight: 500 }}>{template.properties.hardness}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7em', color: '#666' }}>Lather</div>
                  <div style={{ fontSize: '0.85em', fontWeight: 500 }}>{template.properties.lather}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7em', color: '#666' }}>Cure Time</div>
                  <div style={{ fontSize: '0.85em', fontWeight: 500 }}>{template.cureTime}</div>
                </div>
              </div>

              {/* Calculated Values */}
              <div style={{ padding: '12px 16px', background: '#f9f9f9', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, fontSize: '0.8em' }}>
                <div>
                  <div style={{ color: '#666', fontSize: '0.9em' }}>NaOH</div>
                  <div style={{ fontWeight: 600 }}>{calc.adjustedNaoh}g</div>
                </div>
                <div>
                  <div style={{ color: '#666', fontSize: '0.9em' }}>Water</div>
                  <div style={{ fontWeight: 600 }}>{calc.waterWeight}g</div>
                </div>
                <div>
                  <div style={{ color: '#666', fontSize: '0.9em' }}>Total</div>
                  <div style={{ fontWeight: 600 }}>{calc.totalBatchMass}g</div>
                </div>
                <div>
                  <div style={{ color: '#666', fontSize: '0.9em' }}>Bars</div>
                  <div style={{ fontWeight: 600 }}>~{calc.bars}</div>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedTemplate === template.id && (
                <div style={{ padding: 16, background: '#fff3e0', borderTop: '1px solid #ffe0b2' }}>
                  <div style={{ fontSize: '0.85em', marginBottom: 12 }}>
                    <strong>💡 Tips:</strong> {template.tips}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8em', color: '#666' }}>
                      Superfat: <strong>{template.superfat}%</strong>
                    </span>
                    <span style={{ fontSize: '0.8em', color: '#666' }}>
                      Lye Conc: <strong>{(template.lyeConcentration * 100).toFixed(0)}%</strong>
                    </span>
                    <span style={{ fontSize: '0.8em', color: '#666' }}>
                      Use: <strong>{template.use.join(', ')}</strong>
                    </span>
                  </div>
                  
                  {inventory.lowStock.length > 0 && (
                    <div style={{ background: '#fff3cd', padding: 8, borderRadius: 6, marginBottom: 12, fontSize: '0.8em' }}>
                      <strong>⚠️ Low Stock:</strong>
                      {inventory.lowStock.map(item => (
                        <div key={item.name}>{item.name}: Have {item.have.toFixed(0)}g, Need {item.need.toFixed(0)}g</div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleUseTemplate(template); }}
                      disabled={saving}
                      style={{ 
                        flex: 1,
                        padding: '10px 16px', 
                        background: inventory.canMake ? '#4caf50' : '#bdbdbd', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: 6, 
                        cursor: inventory.canMake ? 'pointer' : 'not-allowed',
                        fontWeight: 500,
                        opacity: saving ? 0.7 : 1,
                      }}
                    >
                      {inventory.canMake ? '✓ Save as Recipe' : '⚠️ Missing Ingredients'}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEditInCreator(template); }}
                      style={{ 
                        flex: 1,
                        padding: '10px 16px', 
                        background: inventory.canMake ? '#1976d2' : '#bdbdbd', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: 6, 
                        cursor: inventory.canMake ? 'pointer' : 'not-allowed',
                        fontWeight: 500,
                      }}
                    >
                      {inventory.canMake ? '✏️ Customize First' : '📦 Add to Inventory'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Missing Ingredients Modal */}
      {showMissingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowMissingModal(null)}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            maxWidth: 500,
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', color: '#d32f2f' }}>⚠️ Missing Ingredients</h3>
            <p style={{ fontSize: '0.9em', color: '#666', marginBottom: 16 }}>
              You need to add these ingredients to your inventory before using the <strong>{showMissingModal.template.name}</strong> template:
            </p>
            
            {showMissingModal.inventory.missingOils.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>🧴 Missing Oils:</div>
                {showMissingModal.inventory.missingOils.map(oil => (
                  <div key={oil} style={{ padding: '6px 12px', background: '#ffebee', borderRadius: 6, marginBottom: 4, fontSize: '0.9em' }}>
                    {oil}
                  </div>
                ))}
              </div>
            )}

            {showMissingModal.inventory.missingAdditives.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>🌿 Missing Additives:</div>
                {showMissingModal.inventory.missingAdditives.map(add => (
                  <div key={add} style={{ padding: '6px 12px', background: '#fff3e0', borderRadius: 6, marginBottom: 4, fontSize: '0.9em' }}>
                    {add}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button
                onClick={() => { setShowMissingModal(null); navigate('/lab/inventory'); }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#4caf50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                📦 Go to Inventory
              </button>
              <button
                onClick={() => setShowMissingModal(null)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div style={{ marginTop: 24, padding: 16, background: '#e8f5e9', borderRadius: 8, fontSize: '0.85em', color: '#2e7d32' }}>
        <strong>📚 About These Templates:</strong> Classic & Ayurvedic recipes used by soap makers for generations. 
        Templates with ✓ marks have ingredients in your inventory. Templates with ✗ marks are missing ingredients - add them first!
      </div>
    </div>
    </div>
  );
}

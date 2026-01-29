import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../utils/firebase-config';
import { collection, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { getHindiName, suggestHindiRecipeName, DOSHA_NAMES, AYURVEDIC_NAMES_HINDI } from './utils/hindiNames';
import { OIL_PROPERTIES, RECIPE_GOALS, ADDITIVE_SYNERGIES } from './utils/smartGenerator';
import { num } from './utils/costCalculations';
import LabNavbar from './LabNavbar';

/**
 * RecipeFinder - Natural language recipe search
 * "I want a moisturizing soap for dry skin" → suggests matching recipes
 * Also suggests recipes based on ingredients you have in stock
 */

// Keywords for parsing natural language queries
const QUERY_KEYWORDS = {
  goals: {
    moisturizing: ['moisturizing', 'hydrating', 'soft', 'नम', 'मृदु'],
    cleansing: ['cleansing', 'cleaning', 'deep clean', 'शुद्ध', 'साफ'],
    gentle: ['gentle', 'mild', 'baby', 'sensitive', 'कोमल', 'हल्का'],
    luxurious: ['luxurious', 'luxury', 'premium', 'fancy', 'rich'],
    balanced: ['balanced', 'everyday', 'daily', 'regular', 'संतुलित'],
    ayurvedic: ['ayurvedic', 'herbal', 'natural', 'आयुर्वेदिक', 'जड़ी बूटी'],
    acne_fighting: ['acne', 'pimple', 'oily skin', 'antibacterial', 'मुंहासे'],
    brightening: ['brightening', 'glow', 'fair', 'radiant', 'glowing', 'चमक'],
    exfoliating: ['exfoliating', 'scrub', 'exfoliate', 'dead skin'],
    healing: ['healing', 'repair', 'damage', 'soothe', 'calm'],
  },
  skinTypes: {
    dry: ['dry', 'parched', 'rough', 'flaky', 'सूखी'],
    oily: ['oily', 'greasy', 'shiny', 'तैलीय'],
    sensitive: ['sensitive', 'irritated', 'reactive', 'संवेदनशील'],
    combination: ['combination', 'mixed', 'मिश्रित'],
    normal: ['normal', 'regular', 'सामान्य'],
    mature: ['mature', 'aging', 'anti-aging', 'wrinkles'],
  },
  doshas: {
    vata: ['vata', 'वात', 'dry', 'cold'],
    pitta: ['pitta', 'पित्त', 'hot', 'inflamed', 'acne'],
    kapha: ['kapha', 'कफ', 'oily', 'heavy'],
  },
  seasons: {
    summer: ['summer', 'hot', 'गर्मी', 'sweaty'],
    winter: ['winter', 'cold', 'सर्दी', 'dry season'],
    monsoon: ['monsoon', 'rainy', 'बारिश', 'humid'],
  },
};

// Ingredient benefits for matching
const INGREDIENT_BENEFITS = {
  coconut: ['cleansing', 'lather', 'hardness'],
  olive: ['moisturizing', 'gentle', 'conditioning'],
  shea: ['moisturizing', 'luxurious', 'healing'],
  cocoa: ['moisturizing', 'hardness', 'chocolate'],
  castor: ['lather', 'moisturizing', 'hair'],
  neem: ['acne', 'antibacterial', 'ayurvedic', 'healing'],
  turmeric: ['brightening', 'ayurvedic', 'antiseptic'],
  sandalwood: ['luxurious', 'calming', 'fragrance'],
  rose: ['luxurious', 'romantic', 'gentle'],
  lavender: ['calming', 'gentle', 'sleep'],
  tea_tree: ['acne', 'antibacterial', 'cleansing'],
  charcoal: ['cleansing', 'detox', 'oily skin'],
  oatmeal: ['gentle', 'soothing', 'sensitive'],
  honey: ['moisturizing', 'antibacterial', 'gentle'],
  aloe: ['soothing', 'healing', 'gentle'],
  coffee: ['exfoliating', 'energizing', 'cellulite'],
};

function RecipeFinder() {
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedSkinType, setSelectedSkinType] = useState('');
  const [selectedDosha, setSelectedDosha] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [showHindi, setShowHindi] = useState(true);

  // Load data
  useEffect(() => {
    const unsubs = [];
    
    unsubs.push(onSnapshot(collection(db, 'recipes'), (snap) => {
      setRecipes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }));
    
    unsubs.push(onSnapshot(collection(db, 'ingredients'), (snap) => {
      setIngredients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }));

    return () => unsubs.forEach(u => u());
  }, []);

  // Parse search query for keywords
  const parseQuery = (query) => {
    const lowerQuery = query.toLowerCase();
    const parsed = {
      goals: [],
      skinTypes: [],
      doshas: [],
      seasons: [],
      ingredients: [],
    };

    // Find matching goals
    Object.entries(QUERY_KEYWORDS.goals).forEach(([goal, keywords]) => {
      if (keywords.some(kw => lowerQuery.includes(kw))) {
        parsed.goals.push(goal);
      }
    });

    // Find matching skin types
    Object.entries(QUERY_KEYWORDS.skinTypes).forEach(([type, keywords]) => {
      if (keywords.some(kw => lowerQuery.includes(kw))) {
        parsed.skinTypes.push(type);
      }
    });

    // Find matching doshas
    Object.entries(QUERY_KEYWORDS.doshas).forEach(([dosha, keywords]) => {
      if (keywords.some(kw => lowerQuery.includes(kw))) {
        parsed.doshas.push(dosha);
      }
    });

    // Find matching seasons
    Object.entries(QUERY_KEYWORDS.seasons).forEach(([season, keywords]) => {
      if (keywords.some(kw => lowerQuery.includes(kw))) {
        parsed.seasons.push(season);
      }
    });

    // Find ingredient mentions
    Object.keys(INGREDIENT_BENEFITS).forEach(ing => {
      if (lowerQuery.includes(ing)) {
        parsed.ingredients.push(ing);
      }
    });

    return parsed;
  };

  // Calculate recipe score based on filters
  const scoreRecipe = (recipe, filters) => {
    let score = 0;
    const recipeText = JSON.stringify(recipe).toLowerCase();

    // Goal matching
    filters.goals.forEach(goal => {
      if (RECIPE_GOALS[goal]) {
        // Check if recipe has ingredients good for this goal
        const goalOils = RECIPE_GOALS[goal].recommendedOils || [];
        const recipeOils = recipe.oils || [];
        recipeOils.forEach(oil => {
          const oilName = (oil.name || '').toLowerCase().replace(/\s+/g, '_');
          if (goalOils.some(g => oilName.includes(g))) {
            score += 10;
          }
        });
      }
      // Also check recipe name/description
      if (recipeText.includes(goal)) {
        score += 5;
      }
    });

    // Skin type matching
    filters.skinTypes.forEach(skinType => {
      if (recipeText.includes(skinType)) {
        score += 8;
      }
      // Check oil properties
      const recipeOils = recipe.oils || [];
      recipeOils.forEach(oil => {
        const oilKey = Object.keys(OIL_PROPERTIES).find(k => 
          (oil.name || '').toLowerCase().includes(k.toLowerCase())
        );
        if (oilKey) {
          const props = OIL_PROPERTIES[oilKey];
          if (skinType === 'dry' && props.conditioning > 3) score += 5;
          if (skinType === 'oily' && props.cleansing > 3) score += 5;
          if (skinType === 'sensitive' && props.cleansing < 3) score += 5;
        }
      });
    });

    // Dosha matching
    filters.doshas.forEach(dosha => {
      if (recipeText.includes(dosha)) {
        score += 10;
      }
      // Check for ayurvedic ingredients
      const hasAyurvedic = (recipe.additives || []).some(add => 
        Object.keys(AYURVEDIC_NAMES_HINDI).some(ayu => 
          (add.name || '').toLowerCase().includes(ayu.toLowerCase())
        )
      );
      if (hasAyurvedic) score += 5;
    });

    // Ingredient matching
    filters.ingredients.forEach(ing => {
      if (recipeText.includes(ing)) {
        score += 15;
      }
    });

    // Season matching
    filters.seasons.forEach(season => {
      const recipeOils = recipe.oils || [];
      recipeOils.forEach(oil => {
        const oilKey = Object.keys(OIL_PROPERTIES).find(k => 
          (oil.name || '').toLowerCase().includes(k.toLowerCase())
        );
        if (oilKey) {
          const props = OIL_PROPERTIES[oilKey];
          if (season === 'summer' && props.cleansing > 3) score += 3;
          if (season === 'winter' && props.conditioning > 3) score += 3;
        }
      });
    });

    return score;
  };

  // Check if recipe can be made with current stock
  const canMakeWithStock = (recipe) => {
    const stockMap = {};
    ingredients.forEach(ing => {
      stockMap[ing.name?.toLowerCase()] = num(ing.stockGrams || ing.stock, 0);
    });

    // Check oils
    const oilsOk = (recipe.oils || []).every(oil => {
      const needed = num(oil.grams, 0);
      const available = stockMap[oil.name?.toLowerCase()] || 0;
      return available >= needed;
    });

    // Check additives  
    const additivesOk = (recipe.additives || []).every(add => {
      const needed = num(add.grams, 0);
      const available = stockMap[add.name?.toLowerCase()] || 0;
      return available >= needed;
    });

    return oilsOk && additivesOk;
  };

  // Filtered and scored recipes
  const filteredRecipes = useMemo(() => {
    // Build combined filters
    const parsedQuery = searchQuery ? parseQuery(searchQuery) : { goals: [], skinTypes: [], doshas: [], seasons: [], ingredients: [] };
    
    // Add dropdown selections
    if (selectedGoal && !parsedQuery.goals.includes(selectedGoal)) {
      parsedQuery.goals.push(selectedGoal);
    }
    if (selectedSkinType && !parsedQuery.skinTypes.includes(selectedSkinType)) {
      parsedQuery.skinTypes.push(selectedSkinType);
    }
    if (selectedDosha && !parsedQuery.doshas.includes(selectedDosha)) {
      parsedQuery.doshas.push(selectedDosha);
    }

    // Score and filter recipes
    let scored = recipes.map(recipe => ({
      ...recipe,
      score: scoreRecipe(recipe, parsedQuery),
      inStock: canMakeWithStock(recipe),
    }));

    // Filter by stock if needed
    if (onlyInStock) {
      scored = scored.filter(r => r.inStock);
    }

    // Sort by score (highest first), then by name
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.name || '').localeCompare(b.name || '');
    });

    // If no filters, return all sorted by date
    const hasFilters = searchQuery || selectedGoal || selectedSkinType || selectedDosha;
    if (!hasFilters) {
      return scored;
    }

    // Only return recipes with positive score
    return scored.filter(r => r.score > 0);
  }, [recipes, ingredients, searchQuery, selectedGoal, selectedSkinType, selectedDosha, onlyInStock]);

  // Suggested recipes (top 3 based on your preferences)
  const suggestedRecipes = useMemo(() => {
    return filteredRecipes.slice(0, 3);
  }, [filteredRecipes]);

  // Quick suggestion buttons
  const quickSuggestions = [
    { label: '🧴 Moisturizing for Dry Skin', query: 'moisturizing soap for dry skin' },
    { label: '🧼 Deep Cleansing', query: 'deep cleansing for oily skin' },
    { label: '👶 Gentle Baby Soap', query: 'gentle mild baby soap' },
    { label: '✨ Brightening Glow', query: 'brightening glowing skin' },
    { label: '🌿 Ayurvedic Herbal', query: 'ayurvedic herbal neem turmeric' },
    { label: '🏖️ Summer Fresh', query: 'summer refreshing cleansing' },
    { label: '❄️ Winter Care', query: 'winter moisturizing dry skin' },
    { label: '🍯 Honey Oatmeal', query: 'honey oatmeal gentle' },
  ];

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: '2em', marginBottom: 16 }}>🔍</div>
        <div>Loading recipes...</div>
      </div>
    );
  }

  return (
    <div>
      <LabNavbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '12px 0 0', fontSize: '1.6em' }}>🔍 Recipe Finder</h1>
        <p style={{ margin: '8px 0 0', color: '#666' }}>
          Describe what you're looking for in natural language
        </p>
      </div>

      {/* Search Box */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="e.g., 'moisturizing soap for dry skin' or 'ayurvedic neem turmeric'..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ 
            width: '100%', 
            padding: 16, 
            fontSize: '1.1em', 
            border: '2px solid #1976d2', 
            borderRadius: 12,
            outline: 'none',
          }}
        />
      </div>

      {/* Quick Suggestions */}
      <div style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {quickSuggestions.map((sug, i) => (
          <button
            key={i}
            onClick={() => setSearchQuery(sug.query)}
            style={{
              padding: '8px 14px',
              background: searchQuery === sug.query ? '#1976d2' : '#e3f2fd',
              color: searchQuery === sug.query ? '#fff' : '#1976d2',
              border: 'none',
              borderRadius: 20,
              cursor: 'pointer',
              fontSize: '0.85em',
            }}
          >
            {sug.label}
          </button>
        ))}
      </div>

      {/* Filters Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <select
          value={selectedGoal}
          onChange={(e) => setSelectedGoal(e.target.value)}
          style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd', minWidth: 140 }}
        >
          <option value="">Any Goal</option>
          <option value="moisturizing">Moisturizing</option>
          <option value="cleansing">Cleansing</option>
          <option value="gentle">Gentle</option>
          <option value="luxurious">Luxurious</option>
          <option value="ayurvedic">Ayurvedic</option>
          <option value="acne_fighting">Acne Fighting</option>
          <option value="brightening">Brightening</option>
        </select>

        <select
          value={selectedSkinType}
          onChange={(e) => setSelectedSkinType(e.target.value)}
          style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd', minWidth: 140 }}
        >
          <option value="">Any Skin Type</option>
          <option value="dry">Dry Skin</option>
          <option value="oily">Oily Skin</option>
          <option value="sensitive">Sensitive</option>
          <option value="combination">Combination</option>
          <option value="mature">Mature</option>
        </select>

        <select
          value={selectedDosha}
          onChange={(e) => setSelectedDosha(e.target.value)}
          style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd', minWidth: 140 }}
        >
          <option value="">Any Dosha</option>
          <option value="vata">Vata (वात)</option>
          <option value="pitta">Pitta (पित्त)</option>
          <option value="kapha">Kapha (कफ)</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(e) => setOnlyInStock(e.target.checked)}
          />
          <span>Only recipes I can make (in stock)</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showHindi}
            onChange={(e) => setShowHindi(e.target.checked)}
          />
          <span>Show Hindi names</span>
        </label>
      </div>

      {/* Results */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: '1.1em' }}>
            {searchQuery || selectedGoal || selectedSkinType || selectedDosha 
              ? `Found ${filteredRecipes.length} matching recipes` 
              : `All ${recipes.length} recipes`}
          </h3>
          {filteredRecipes.length === 0 && (
            <Link to="/lab/generator" style={{ color: '#9c27b0', textDecoration: 'none' }}>
              Generate a new recipe →
            </Link>
          )}
        </div>

        {filteredRecipes.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', background: '#f5f5f5', borderRadius: 12 }}>
            <div style={{ fontSize: '3em', marginBottom: 16 }}>🔍</div>
            <h3 style={{ margin: '0 0 8px' }}>No recipes found</h3>
            <p style={{ color: '#666', marginBottom: 16 }}>
              Try different search terms or use the Smart Generator to create a new recipe
            </p>
            <Link 
              to="/lab/generator"
              style={{ display: 'inline-block', padding: '12px 24px', background: '#9c27b0', color: '#fff', borderRadius: 8, textDecoration: 'none' }}
            >
              🧠 Generate New Recipe
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {filteredRecipes.map(recipe => (
              <div 
                key={recipe.id}
                style={{ 
                  padding: 20, 
                  background: '#fff', 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 12,
                  borderLeft: recipe.score > 20 ? '4px solid #4caf50' : recipe.score > 10 ? '4px solid #ff9800' : '4px solid #e0e0e0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2em' }}>
                      {recipe.name || 'Untitled Recipe'}
                      {showHindi && recipe.name && (
                        <span style={{ marginLeft: 8, fontSize: '0.85em', color: '#666' }}>
                          ({suggestHindiRecipeName(recipe.name)?.hindiName || getHindiName(recipe.name)?.romanized || ''})
                        </span>
                      )}
                    </h3>
                    {recipe.description && (
                      <p style={{ margin: '4px 0 0', color: '#666', fontSize: '0.9em' }}>{recipe.description}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {recipe.inStock && (
                      <span style={{ padding: '4px 10px', background: '#e8f5e9', color: '#2e7d32', borderRadius: 12, fontSize: '0.75em' }}>
                        ✅ In Stock
                      </span>
                    )}
                    {recipe.score > 0 && (
                      <span style={{ padding: '4px 10px', background: '#e3f2fd', color: '#1565c0', borderRadius: 12, fontSize: '0.75em' }}>
                        Match: {Math.min(100, Math.round(recipe.score * 2))}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Ingredients preview */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.85em', color: '#666', marginBottom: 4 }}>Oils:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(recipe.oils || []).slice(0, 5).map((oil, i) => (
                      <span 
                        key={i}
                        style={{ padding: '4px 10px', background: '#fff3e0', borderRadius: 12, fontSize: '0.8em' }}
                      >
                        {oil.name} {showHindi && <span style={{ color: '#666' }}>({getHindiName(oil.name)?.romanized || ''})</span>}
                        <span style={{ color: '#666' }}> {num(oil.percentage, 0)}%</span>
                      </span>
                    ))}
                    {(recipe.oils || []).length > 5 && (
                      <span style={{ padding: '4px 10px', color: '#666', fontSize: '0.8em' }}>
                        +{recipe.oils.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Additives */}
                {(recipe.additives || []).length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: '0.85em', color: '#666', marginBottom: 4 }}>Additives:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {recipe.additives.slice(0, 4).map((add, i) => (
                        <span 
                          key={i}
                          style={{ padding: '4px 10px', background: '#e8f5e9', borderRadius: 12, fontSize: '0.8em' }}
                        >
                          {add.name} {showHindi && <span style={{ color: '#666' }}>({getHindiName(add.name)?.romanized || ''})</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Properties bar */}
                {recipe.properties && (
                  <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                    {['hardness', 'cleansing', 'conditioning', 'lather'].map(prop => (
                      recipe.properties[prop] ? (
                        <div key={prop} style={{ fontSize: '0.8em' }}>
                          <span style={{ textTransform: 'capitalize' }}>{prop}: </span>
                          <span style={{ fontWeight: 600 }}>{recipe.properties[prop]}</span>
                        </div>
                      ) : null
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link 
                    to={`/lab?recipe=${recipe.id}`}
                    style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: '0.85em' }}
                  >
                    Open in Calculator
                  </Link>
                  <Link 
                    to={`/lab/labels?recipe=${recipe.id}`}
                    style={{ padding: '8px 16px', background: '#e91e63', color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: '0.85em' }}
                  >
                    Create Label
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

export default RecipeFinder;

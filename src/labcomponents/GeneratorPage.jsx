import React, { useState, useEffect, useMemo } from 'react';
import { subscribeToUserCollection, addUserDoc } from '../utils/userDataHelper';
import { Link, useNavigate } from 'react-router-dom';
import { getSapValue } from './utils/sapValues';
import { num } from './utils/costCalculations';
import { getHindiName } from './utils/hindiNames';
import LabNavbar from './LabNavbar';

/**
 * GeneratorPage - Recipe Generator with Simple Smart & Full-Featured Random modes
 * 
 * Fixed issues:
 * - Only uses ingredients YOU have in inventory
 * - Random mode has full details (additives, costs, per-oil breakdown)
 * - Smart mode simplified to just 3 options (balanced, moisturizing, cleansing)
 * - All details preserved
 */

function GeneratorPage() {
  const [ingredients, setIngredients] = useState([]);
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [count, setCount] = useState(3);
  const navigate = useNavigate();

  // Simple mode toggle
  const [mode, setMode] = useState('random'); // 'random' or 'smart'
  
  // Smart mode - only 3 simple options
  const [smartGoal, setSmartGoal] = useState('balanced');
  const [showHindi, setShowHindi] = useState(true);

  // Load ingredients from YOUR inventory
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

  // Categorize YOUR ingredients
  const categorizedIngredients = useMemo(() => {
    const oils = ingredients.filter(ing => {
      const cat = (ing.category || ing.type || '').toLowerCase();
      return cat.includes('oil') || cat.includes('butter') || cat === 'oil';
    });
    const additives = ingredients.filter(ing => {
      const cat = (ing.category || ing.type || '').toLowerCase();
      return cat.includes('additive') || cat.includes('essential') || cat.includes('fragrance') || 
             cat.includes('colorant') || cat.includes('herb') || cat.includes('powder') || cat === 'additive';
    });
    const alkalis = ingredients.filter(ing => {
      const cat = (ing.category || ing.type || '').toLowerCase();
      return cat.includes('alkali') || cat.includes('lye') || cat.includes('naoh') || cat.includes('koh');
    });
    return { oils, additives, alkalis };
  }, [ingredients]);

  // Helpers
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pickRandom = (arr, n) => {
    const copy = [...arr];
    const out = [];
    while (out.length < n && copy.length) {
      const idx = Math.floor(Math.random() * copy.length);
      out.push(copy.splice(idx, 1)[0]);
    }
    return out;
  };

  // ========== RANDOM MODE GENERATOR ==========
  const generateRandomRecipe = (seedIdx = 0) => {
    const { oils: oilPool, additives: additivePool } = categorizedIngredients;
    
    if (oilPool.length === 0) {
      return null;
    }

    // Random settings
    const useOptions = ['face', 'body', 'both', 'hand'];
    const selectedUse = useOptions[randomInt(0, useOptions.length - 1)];
    const use = [selectedUse];
    
    // Pick 3-5 oils
    const oilCount = Math.max(2, Math.min(oilPool.length, randomInt(3, 5)));
    const chosenOils = pickRandom(oilPool, oilCount);
    
    // Generate random percentages
    let weights = chosenOils.map(() => Math.random() + 0.15);
    const totalWeight = weights.reduce((s, w) => s + w, 0);
    const percentages = weights.map(w => (w / totalWeight) * 100);
    
    // Create oil items with full details
    const totalOilWeight = 1000;
    const items = chosenOils.map((oil, i) => {
      const pct = Number(percentages[i].toFixed(2));
      const grams = (pct / 100) * totalOilWeight;
      const sap = getSapValue({ key: oil.key || oil.name, name: oil.name }, ingredients);
      const hindi = getHindiName(oil.key || oil.name);
      const costPerGram = num(oil.costPerUnit, 0) / Math.max(1, num(oil.unitSize, 1000));
      const cost = grams * costPerGram;
      
      return {
        name: oil.name,
        key: oil.key || oil.firebaseId || oil.name,
        pct,
        grams: Number(grams.toFixed(2)),
        sap,
        lyeContribution: Number((sap * grams).toFixed(4)),
        hindiName: hindi?.romanized || null,
        hindiScript: hindi?.hindi || null,
        costPerGram: Number(costPerGram.toFixed(4)),
        lineCost: Number(cost.toFixed(2)),
      };
    });

    // Lye calculations
    const superfat = selectedUse === 'face' ? (7 + Math.random() * 2) : (5 + Math.random() * 3);
    const lyeConcentration = Number((0.28 + Math.random() * 0.07).toFixed(3)); // 28-35%
    
    const totalLyeBeforeSF = items.reduce((s, it) => s + it.lyeContribution, 0);
    const adjustedNaoh = totalLyeBeforeSF * (1 - Math.min(Math.max(superfat, 0), 20) / 100);
    const waterWeight = adjustedNaoh > 0 ? (adjustedNaoh / Math.max(0.00001, lyeConcentration)) - adjustedNaoh : 0;
    const batchMass = totalOilWeight + adjustedNaoh + waterWeight;
    const barWeight = 100;
    const bars = Math.max(1, Math.round(batchMass / barWeight));

    // ========== ADDITIVES ==========
    const additives = [];
    if (additivePool.length > 0 && Math.random() > 0.3) { // 70% chance to add additives
      const additiveCount = randomInt(1, Math.min(3, additivePool.length));
      const chosenAdditives = pickRandom(additivePool, additiveCount);
      
      chosenAdditives.forEach(add => {
        const type = (add.category || add.type || '').toLowerCase();
        let amount, unit;
        
        if (type.includes('essential') || type.includes('fragrance')) {
          // Essential oils: 1-3% of oil weight
          amount = Number((totalOilWeight * (0.01 + Math.random() * 0.02)).toFixed(1));
          unit = 'g';
        } else if (type.includes('colorant') || type.includes('powder')) {
          // Colorants/powders: 1-2 tsp per pound of oils
          amount = Number((0.5 + Math.random() * 1.5).toFixed(1));
          unit = 'tsp';
        } else {
          // Other additives: 1-3 tbsp per pound
          amount = Number((1 + Math.random() * 2).toFixed(1));
          unit = 'tbsp';
        }
        
        const hindi = getHindiName(add.key || add.name);
        const costPerUnit = num(add.costPerUnit, 0) / Math.max(1, num(add.unitSize, 100));
        
        additives.push({
          name: add.name,
          key: add.key || add.firebaseId || add.name,
          amount,
          unit,
          grams: unit === 'g' ? amount : (unit === 'tsp' ? amount * 5 : amount * 15), // rough conversion
          hindiName: hindi?.romanized || null,
          hindiScript: hindi?.hindi || null,
          type: add.category || add.type || 'additive',
          costPerUnit,
          lineCost: Number((costPerUnit * (unit === 'g' ? amount : amount * 5)).toFixed(2)),
        });
      });
    }

    // ========== COSTS ==========
    const oilCost = items.reduce((s, it) => s + it.lineCost, 0);
    const additiveCost = additives.reduce((s, a) => s + (a.lineCost || 0), 0);
    
    // Find NaOH cost from inventory
    const naohIng = ingredients.find(i => (i.name || '').toLowerCase().includes('sodium hydroxide') || (i.name || '').toLowerCase().includes('naoh') || (i.name || '').toLowerCase().includes('lye'));
    const naohCostPerG = naohIng ? num(naohIng.costPerUnit, 0) / Math.max(1, num(naohIng.unitSize, 1000)) : 0.15;
    const lyeCost = adjustedNaoh * naohCostPerG;
    
    const materialCost = oilCost + additiveCost + lyeCost;
    const packagingCost = bars * 5; // ₹5 per bar packaging
    const laborCost = bars * 10; // ₹10 per bar labor
    const totalCost = materialCost + packagingCost + laborCost;
    const costPerBar = totalCost / bars;
    
    // Pricing
    const markup = 50 + Math.random() * 30; // 50-80% markup
    const sellingPrice = costPerBar * (1 + markup / 100);
    const profitPerBar = sellingPrice - costPerBar;
    const profitMargin = (profitPerBar / sellingPrice) * 100;

    // Recipe name suggestion
    const nameOptions = [
      `${chosenOils[0].name.split(' ')[0]} Bliss`,
      `${selectedUse.charAt(0).toUpperCase() + selectedUse.slice(1)} Care Soap`,
      `Natural ${chosenOils[0].name.split(' ')[0]} Bar`,
      `Handcrafted Soap #${seedIdx + 1}`,
      `Artisan ${chosenOils.length}-Oil Blend`,
    ];

    return {
      name: nameOptions[randomInt(0, nameOptions.length - 1)],
      description: `A ${chosenOils.length}-oil blend perfect for ${selectedUse} use with ${additives.length} special additives.`,
      
      // Oils with full details
      oils: items,
      perOilDetails: items, // Same as oils for compatibility
      
      // Additives with details
      additives,
      
      // Recipe parameters
      totalOilWeight,
      superfat: Number(superfat.toFixed(2)),
      lyeConcentration,
      lyeRequired: Number(adjustedNaoh.toFixed(2)),
      waterWeight: Number(waterWeight.toFixed(2)),
      batchMass: Number(batchMass.toFixed(2)),
      barWeight,
      bars,
      use,
      
      // Costs breakdown
      costs: {
        oils: Number(oilCost.toFixed(2)),
        additives: Number(additiveCost.toFixed(2)),
        lye: Number(lyeCost.toFixed(2)),
        material: Number(materialCost.toFixed(2)),
        packaging: Number(packagingCost.toFixed(2)),
        labor: Number(laborCost.toFixed(2)),
        total: Number(totalCost.toFixed(2)),
        perBar: Number(costPerBar.toFixed(2)),
      },
      
      // Pricing
      pricing: {
        markup: Number(markup.toFixed(0)),
        sellingPrice: Number(sellingPrice.toFixed(2)),
        profitPerBar: Number(profitPerBar.toFixed(2)),
        profitMargin: Number(profitMargin.toFixed(1)),
        totalRevenue: Number((sellingPrice * bars).toFixed(2)),
        totalProfit: Number((profitPerBar * bars).toFixed(2)),
      },
      
      // Metadata
      mode: 'random',
      createdAt: new Date().toISOString(),
    };
  };

  // ========== SMART MODE GENERATOR ==========
  // Simplified - just 3 goals: balanced, moisturizing, or cleansing
  const generateSmartRecipe = (seedIdx = 0) => {
    const { oils: oilPool, additives: additivePool } = categorizedIngredients;
    
    if (oilPool.length === 0) {
      return null;
    }

    // Simple goal-based oil selection
    const oilScores = oilPool.map(oil => {
      const name = (oil.name || '').toLowerCase();
      let score = 0;
      
      if (smartGoal === 'moisturizing') {
        // Prefer conditioning oils
        if (name.includes('olive')) score += 30;
        if (name.includes('shea')) score += 25;
        if (name.includes('cocoa')) score += 20;
        if (name.includes('avocado')) score += 25;
        if (name.includes('almond')) score += 20;
        if (name.includes('castor')) score += 15;
        if (name.includes('mango')) score += 20;
        if (name.includes('coconut')) score -= 10; // Less coconut for moisturizing
      } else if (smartGoal === 'cleansing') {
        // Prefer cleansing oils
        if (name.includes('coconut')) score += 30;
        if (name.includes('palm')) score += 20;
        if (name.includes('castor')) score += 25; // Good lather
        if (name.includes('neem')) score += 15;
        if (name.includes('olive')) score += 5; // Some olive for balance
      } else {
        // Balanced
        if (name.includes('coconut')) score += 15;
        if (name.includes('olive')) score += 15;
        if (name.includes('castor')) score += 20;
        if (name.includes('palm')) score += 10;
        if (name.includes('shea')) score += 10;
      }
      
      // Add some randomness
      score += Math.random() * 10;
      
      return { ...oil, score };
    });

    // Sort by score and pick top oils
    oilScores.sort((a, b) => b.score - a.score);
    const oilCount = Math.min(oilPool.length, randomInt(3, 5));
    const chosenOils = oilScores.slice(0, oilCount);

    // Generate percentages based on goal
    let percentages;
    if (smartGoal === 'moisturizing') {
      // Higher % for conditioning oils
      percentages = chosenOils.map((oil, i) => {
        if (i === 0) return 35 + Math.random() * 10; // Top oil gets 35-45%
        if (i === 1) return 25 + Math.random() * 10; // Second gets 25-35%
        return 10 + Math.random() * 10; // Others get 10-20%
      });
    } else if (smartGoal === 'cleansing') {
      // Higher % for cleansing oils
      percentages = chosenOils.map((oil, i) => {
        const name = (oil.name || '').toLowerCase();
        if (name.includes('coconut')) return 30 + Math.random() * 10;
        if (name.includes('castor')) return 5 + Math.random() * 5; // Castor max 10%
        return 15 + Math.random() * 10;
      });
    } else {
      // Balanced
      percentages = chosenOils.map(() => 15 + Math.random() * 15);
    }

    // Normalize to 100%
    const total = percentages.reduce((s, p) => s + p, 0);
    percentages = percentages.map(p => (p / total) * 100);

    // Build recipe using same logic as random
    const totalOilWeight = 1000;
    const items = chosenOils.map((oil, i) => {
      const pct = Number(percentages[i].toFixed(2));
      const grams = (pct / 100) * totalOilWeight;
      const sap = getSapValue({ key: oil.key || oil.name, name: oil.name }, ingredients);
      const hindi = getHindiName(oil.key || oil.name);
      const costPerGram = num(oil.costPerUnit, 0) / Math.max(1, num(oil.unitSize, 1000));
      
      return {
        name: oil.name,
        key: oil.key || oil.firebaseId || oil.name,
        pct,
        grams: Number(grams.toFixed(2)),
        sap,
        lyeContribution: Number((sap * grams).toFixed(4)),
        hindiName: hindi?.romanized || null,
        hindiScript: hindi?.hindi || null,
        costPerGram: Number(costPerGram.toFixed(4)),
        lineCost: Number((grams * costPerGram).toFixed(2)),
      };
    });

    // Lye calculations with goal-appropriate superfat
    const superfat = smartGoal === 'moisturizing' ? (7 + Math.random() * 2) : 
                     smartGoal === 'cleansing' ? (4 + Math.random() * 2) : 
                     (5 + Math.random() * 2);
    const lyeConcentration = 0.30;
    
    const totalLyeBeforeSF = items.reduce((s, it) => s + it.lyeContribution, 0);
    const adjustedNaoh = totalLyeBeforeSF * (1 - superfat / 100);
    const waterWeight = adjustedNaoh > 0 ? (adjustedNaoh / lyeConcentration) - adjustedNaoh : 0;
    const batchMass = totalOilWeight + adjustedNaoh + waterWeight;
    const barWeight = 100;
    const bars = Math.max(1, Math.round(batchMass / barWeight));

    // Goal-appropriate additives
    const additives = [];
    if (additivePool.length > 0) {
      const goalAdditives = additivePool.filter(add => {
        const name = (add.name || '').toLowerCase();
        if (smartGoal === 'moisturizing') {
          return name.includes('honey') || name.includes('oat') || name.includes('aloe') || 
                 name.includes('milk') || name.includes('glycerin') || name.includes('shea');
        } else if (smartGoal === 'cleansing') {
          return name.includes('charcoal') || name.includes('tea tree') || name.includes('neem') || 
                 name.includes('clay') || name.includes('eucalyptus') || name.includes('mint');
        }
        return true;
      });
      
      const toAdd = goalAdditives.length > 0 ? goalAdditives : additivePool;
      const additiveCount = Math.min(toAdd.length, randomInt(1, 2));
      const chosen = pickRandom(toAdd, additiveCount);
      
      chosen.forEach(add => {
        const type = (add.category || add.type || '').toLowerCase();
        const amount = type.includes('essential') ? Number((totalOilWeight * 0.02).toFixed(1)) : 
                       type.includes('powder') ? Number((1 + Math.random()).toFixed(1)) : 
                       Number((1.5 + Math.random()).toFixed(1));
        const unit = type.includes('essential') ? 'g' : type.includes('powder') ? 'tsp' : 'tbsp';
        const hindi = getHindiName(add.key || add.name);
        
        additives.push({
          name: add.name,
          key: add.key || add.firebaseId || add.name,
          amount,
          unit,
          grams: unit === 'g' ? amount : (unit === 'tsp' ? amount * 5 : amount * 15),
          hindiName: hindi?.romanized || null,
          hindiScript: hindi?.hindi || null,
          type: add.category || add.type || 'additive',
        });
      });
    }

    // Costs
    const oilCost = items.reduce((s, it) => s + it.lineCost, 0);
    const additiveCost = additives.reduce((s, a) => s + (a.lineCost || 0), 0);
    const naohIng = ingredients.find(i => (i.name || '').toLowerCase().includes('naoh') || (i.name || '').toLowerCase().includes('lye'));
    const naohCostPerG = naohIng ? num(naohIng.costPerUnit, 0) / Math.max(1, num(naohIng.unitSize, 1000)) : 0.15;
    const lyeCost = adjustedNaoh * naohCostPerG;
    const materialCost = oilCost + additiveCost + lyeCost;
    const packagingCost = bars * 5;
    const laborCost = bars * 10;
    const totalCost = materialCost + packagingCost + laborCost;
    const costPerBar = totalCost / bars;
    const markup = 60;
    const sellingPrice = costPerBar * (1 + markup / 100);
    const profitPerBar = sellingPrice - costPerBar;

    // Goal-based name
    const goalNames = {
      moisturizing: ['Hydra Glow', 'Silk Touch', 'Nourish Bar', 'Moisture Rich', 'Soft Care'],
      cleansing: ['Fresh Start', 'Deep Clean', 'Pure Bar', 'Clear Skin', 'Detox Soap'],
      balanced: ['Daily Care', 'Everyday Soap', 'All Purpose', 'Family Bar', 'Classic Blend'],
    };
    const names = goalNames[smartGoal] || goalNames.balanced;

    return {
      name: names[randomInt(0, names.length - 1)],
      description: `Smart-generated ${smartGoal} recipe using ${chosenOils.length} oils from your inventory.`,
      goal: smartGoal,
      oils: items,
      perOilDetails: items,
      additives,
      totalOilWeight,
      superfat: Number(superfat.toFixed(2)),
      lyeConcentration,
      lyeRequired: Number(adjustedNaoh.toFixed(2)),
      waterWeight: Number(waterWeight.toFixed(2)),
      batchMass: Number(batchMass.toFixed(2)),
      barWeight,
      bars,
      costs: {
        oils: Number(oilCost.toFixed(2)),
        additives: Number(additiveCost.toFixed(2)),
        lye: Number(lyeCost.toFixed(2)),
        material: Number(materialCost.toFixed(2)),
        packaging: Number(packagingCost.toFixed(2)),
        labor: Number(laborCost.toFixed(2)),
        total: Number(totalCost.toFixed(2)),
        perBar: Number(costPerBar.toFixed(2)),
      },
      pricing: {
        markup,
        sellingPrice: Number(sellingPrice.toFixed(2)),
        profitPerBar: Number(profitPerBar.toFixed(2)),
        profitMargin: Number(((profitPerBar / sellingPrice) * 100).toFixed(1)),
      },
      mode: 'smart',
      createdAt: new Date().toISOString(),
    };
  };

  // Generate recipes
  const generateRecipes = () => {
    if (categorizedIngredients.oils.length === 0) {
      alert('No oils found in your inventory! Add some oils first.');
      return;
    }
    
    setGenerating(true);
    const recipes = [];
    
    for (let i = 0; i < count; i++) {
      const recipe = mode === 'smart' ? generateSmartRecipe(i) : generateRandomRecipe(i);
      if (recipe) recipes.push(recipe);
    }
    
    setGeneratedRecipes(recipes);
    setGenerating(false);
  };

  // Save recipe
  const saveRecipe = async (recipe) => {
    try {
      await addUserDoc('recipes', {
        ...recipe,
        savedAt: new Date().toISOString(),
        source: 'generator',
      });
      alert('✅ Recipe saved!');
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save recipe');
    }
  };

  // Open in calculator
  const openInCalculator = (recipe) => {
    sessionStorage.setItem('editRecipe', JSON.stringify(recipe));
    navigate('/lab');
  };

  return (
    <div>
      <LabNavbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: '1.5em' }}>🎲 Recipe Generator</h1>
        <p style={{ margin: '4px 0 0', color: '#666', fontSize: '0.9em' }}>
          Creates recipes using ONLY ingredients from your inventory
        </p>
      </div>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button
          onClick={() => setMode('random')}
          style={{
            padding: '14px 24px', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '1em',
            background: mode === 'random' ? '#1976d2' : '#e0e0e0',
            color: mode === 'random' ? '#fff' : '#333',
          }}
        >
          🎲 Random Mode
        </button>
        <button
          onClick={() => setMode('smart')}
          style={{
            padding: '14px 24px', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '1em',
            background: mode === 'smart' ? '#9c27b0' : '#e0e0e0',
            color: mode === 'smart' ? '#fff' : '#333',
          }}
        >
          🧠 Smart Mode
        </button>
      </div>

      {/* Mode Description */}
      <div style={{ padding: 16, background: mode === 'smart' ? '#f3e5f5' : '#e3f2fd', borderRadius: 10, marginBottom: 20 }}>
        {mode === 'random' ? (
          <div>
            <strong>🎲 Random Mode:</strong> Generates completely random combinations from your oils and additives. 
            Great for experimentation and discovering new blends!
          </div>
        ) : (
          <div>
            <strong>🧠 Smart Mode:</strong> Selects oils optimized for your goal. Simple and focused.
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['balanced', 'moisturizing', 'cleansing'].map(goal => (
                <button
                  key={goal}
                  onClick={() => setSmartGoal(goal)}
                  style={{
                    padding: '10px 18px', border: 'none', borderRadius: 20, cursor: 'pointer',
                    background: smartGoal === goal ? '#9c27b0' : '#fff',
                    color: smartGoal === goal ? '#fff' : '#333',
                    fontWeight: smartGoal === goal ? 600 : 400,
                  }}
                >
                  {goal === 'balanced' ? '⚖️ Balanced' : goal === 'moisturizing' ? '💧 Moisturizing' : '🧼 Cleansing'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 16, background: '#fafafa', borderRadius: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontWeight: 500 }}>Generate:</label>
          <select value={count} onChange={e => setCount(Number(e.target.value))} style={{ padding: 10, border: '1px solid #ccc', borderRadius: 6 }}>
            <option value={1}>1 recipe</option>
            <option value={3}>3 recipes</option>
            <option value={5}>5 recipes</option>
          </select>
        </div>
        
        <button
          onClick={generateRecipes}
          disabled={generating || categorizedIngredients.oils.length === 0}
          style={{
            padding: '12px 28px', background: generating ? '#ccc' : (mode === 'smart' ? '#9c27b0' : '#1976d2'), color: '#fff',
            border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '1em', cursor: generating ? 'not-allowed' : 'pointer',
          }}
        >
          {generating ? '⏳ Generating...' : `${mode === 'smart' ? '🧠' : '🎲'} Generate`}
        </button>
        
        {generatedRecipes.length > 0 && (
          <button onClick={() => setGeneratedRecipes([])} style={{ padding: '12px 20px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            🗑️ Clear
          </button>
        )}
        
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', cursor: 'pointer' }}>
          <input type="checkbox" checked={showHindi} onChange={e => setShowHindi(e.target.checked)} />
          Show Hindi
        </label>
        
        <span style={{ fontSize: '0.85em', color: '#666' }}>
          {categorizedIngredients.oils.length} oils, {categorizedIngredients.additives.length} additives
        </span>
      </div>

      {/* Warning if no ingredients */}
      {categorizedIngredients.oils.length === 0 && (
        <div style={{ padding: 20, background: '#fff3e0', borderRadius: 8, marginBottom: 20, color: '#e65100' }}>
          ⚠️ No oils in your inventory. <Link to="/lab/inventory" style={{ color: '#e65100', fontWeight: 600 }}>Add oils first</Link>
        </div>
      )}

      {/* Results */}
      {generatedRecipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#f5f5f5', borderRadius: 12, color: '#666' }}>
          <div style={{ fontSize: '4em', marginBottom: 16 }}>🧪</div>
          <div style={{ fontSize: '1.2em', fontWeight: 500 }}>Ready to Generate</div>
          <div style={{ fontSize: '0.9em', marginTop: 8 }}>Click Generate to create recipes from your ingredients</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {generatedRecipes.map((r, idx) => (
            <div key={idx} style={{ border: '1px solid #e0e0e0', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ padding: '16px 20px', background: r.mode === 'smart' ? '#f3e5f5' : '#e3f2fd', borderBottom: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2em' }}>{r.name}</h3>
                    {r.description && <p style={{ margin: '4px 0 0', fontSize: '0.85em', color: '#666' }}>{r.description}</p>}
                  </div>
                  {r.goal && <span style={{ padding: '4px 12px', background: '#9c27b0', color: '#fff', borderRadius: 12, fontSize: '0.8em' }}>{r.goal}</span>}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: 20 }}>
                {/* Batch Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 20 }}>
                  <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7em', color: '#666', textTransform: 'uppercase' }}>Total Batch</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1em' }}>{r.batchMass?.toFixed(0)}g</div>
                  </div>
                  <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7em', color: '#666', textTransform: 'uppercase' }}>Bars</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1em' }}>{r.bars} × {r.barWeight}g</div>
                  </div>
                  <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7em', color: '#666', textTransform: 'uppercase' }}>NaOH</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1em' }}>{r.lyeRequired?.toFixed(1)}g</div>
                  </div>
                  <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7em', color: '#666', textTransform: 'uppercase' }}>Water</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1em' }}>{r.waterWeight?.toFixed(1)}g</div>
                  </div>
                  <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7em', color: '#666', textTransform: 'uppercase' }}>Superfat</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1em' }}>{r.superfat?.toFixed(1)}%</div>
                  </div>
                  <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7em', color: '#666', textTransform: 'uppercase' }}>Lye Conc.</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1em' }}>{(r.lyeConcentration * 100).toFixed(0)}%</div>
                  </div>
                </div>

                {/* Oils Table */}
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.95em', color: '#333' }}>🫒 Oils ({r.oils?.length})</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85em' }}>
                    <thead>
                      <tr style={{ background: '#f9f9f9' }}>
                        <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Oil</th>
                        <th style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>%</th>
                        <th style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>Grams</th>
                        <th style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>SAP</th>
                        <th style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>NaOH</th>
                        <th style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(r.oils || []).map((oil, i) => (
                        <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
                          <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                            <strong>{oil.name}</strong>
                            {showHindi && oil.hindiName && <span style={{ color: '#666', marginLeft: 6 }}>({oil.hindiName})</span>}
                          </td>
                          <td style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>{oil.pct?.toFixed(1)}%</td>
                          <td style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>{oil.grams?.toFixed(1)}g</td>
                          <td style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #f0f0f0', color: '#666' }}>{oil.sap?.toFixed(4)}</td>
                          <td style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>{oil.lyeContribution?.toFixed(2)}g</td>
                          <td style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>₹{oil.lineCost?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Additives */}
                {r.additives?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: '0.95em', color: '#333' }}>✨ Additives ({r.additives.length})</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {r.additives.map((add, i) => (
                        <div key={i} style={{ padding: '10px 14px', background: '#fff3e0', borderRadius: 8, fontSize: '0.85em' }}>
                          <strong>{add.name}</strong>
                          {showHindi && add.hindiName && <span style={{ color: '#666', marginLeft: 4 }}>({add.hindiName})</span>}
                          <div style={{ color: '#666', marginTop: 2 }}>
                            {add.amount} {add.unit} • {add.type}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Costs & Pricing */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                  {/* Costs */}
                  <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 10 }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: '0.9em' }}>💰 Costs</h4>
                    <div style={{ fontSize: '0.85em', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Oils:</span><span>₹{r.costs?.oils?.toFixed(2)}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Additives:</span><span>₹{r.costs?.additives?.toFixed(2)}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Lye:</span><span>₹{r.costs?.lye?.toFixed(2)}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Packaging:</span><span>₹{r.costs?.packaging?.toFixed(2)}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Labor:</span><span>₹{r.costs?.labor?.toFixed(2)}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid #ddd', paddingTop: 4, marginTop: 4 }}>
                        <span>Total:</span><span>₹{r.costs?.total?.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#1976d2' }}>
                        <span>Per Bar:</span><span>₹{r.costs?.perBar?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div style={{ padding: 16, background: '#e8f5e9', borderRadius: 10 }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: '0.9em' }}>📈 Pricing</h4>
                    <div style={{ fontSize: '0.85em', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Markup:</span><span>{r.pricing?.markup}%</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1em', color: '#2e7d32' }}>
                        <span>Sell Price:</span><span>₹{r.pricing?.sellingPrice?.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Profit/Bar:</span><span>₹{r.pricing?.profitPerBar?.toFixed(2)}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Margin:</span><span>{r.pricing?.profitMargin}%</span></div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={() => saveRecipe(r)} style={{ flex: 1, minWidth: 140, padding: '12px 16px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                    💾 Save Recipe
                  </button>
                  <button onClick={() => openInCalculator(r)} style={{ flex: 1, minWidth: 140, padding: '12px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                    ✏️ Edit in Calculator
                  </button>
                  <Link to={`/lab/labels`} style={{ flex: 1, minWidth: 140, padding: '12px 16px', background: '#e91e63', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', textAlign: 'center' }}>
                    🏷️ Create Label
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

export default GeneratorPage;

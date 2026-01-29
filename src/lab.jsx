import React, { useState, useEffect, useCallback, useMemo } from "react";
import { db } from "./utils/firebase-config";
import { collection, onSnapshot, addDoc } from "firebase/firestore";

import CreateRecipe from "./labcomponents/CreateRecipe";
import LabNavbar from "./labcomponents/LabNavbar";

// Import centralized utilities
import { SAP_VALUES, getSapValue } from "./labcomponents/utils/sapValues";
import { validateRules, OIL_GROUPS, LATHER_TYPES, TRACE_SPEEDS, isOil } from "./labcomponents/utils/validationRules";
import { 
  num, 
  computeMaterialCost, 
  buildTotals, 
  computePricing, 
  sanitizeTotals, 
  ensureTotals 
} from "./labcomponents/utils/costCalculations";

// Compute oil weights from percentages
const computeOilWeights = (items = [], totalOilWeight = 0) => {
  const oils = items.map((it) => {
    const pct = num(it.pct ?? it.percent, 0);
    return { ...it, pct, weight: (pct / 100) * num(totalOilWeight, 0) };
  });
  const totalPct = oils.reduce((s, it) => s + num(it.pct, 0), 0);
  return { oils, totalPct };
};

// Calculate NaOH required (using centralized SAP values)
const calcNaoh = (oils = [], superfat = 6, inventory = []) => {
  const sf = Math.min(Math.max(superfat, 0), 20) / 100;
  const base = oils.reduce((sum, it) => {
    const sap = getSapValue(it, inventory);
    return sum + it.weight * sap;
  }, 0);
  return base * (1 - sf);
};

// Calculate water weight based on lye concentration
// Formula: lyeConcentration = NaOH / (NaOH + Water)
// Solving for Water: Water = (NaOH / lyeConcentration) - NaOH
const calcWater = (naoh, lyeConcentration = 0.3) => {
  const c = lyeConcentration > 0 && lyeConcentration < 1 ? lyeConcentration : 0.3;
  return (naoh / c) - naoh;
};

// Create a safe numeric object that guarantees toFixed works
const createSafeNumericObject = (obj) => {
  const result = {};
  for (const key in obj) {
    const val = obj[key];
    const numVal = Number(num(val, 0));
    result[key] = numVal;
  }
  return result;
};

const sampleRecipe = { items: [] }; 

function Lab() {
  // ----------------------------------------------------
  // 1. Define ALL Hooks at the very top level
  // ----------------------------------------------------
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState({
    items: [],
    // Batch & use context
    totalOilWeight: 1000,      // grams
    batchSize: 1000,           // grams (total batch target)
    barWeight: 100,            // grams per bar
    use: ["body"],             // ["face","body"]
    skinType: ["all"],
    goal: "balanced",
    // Safety params
    superfat: 6,               // %
    lyeConcentration: 0.30,    // NaOH concentration
    // Derived
    lyeRequired: 0,            // grams
    waterWeight: 0,            // grams
    oils: { oils: [], totalPct: 0 },
    additives: [],
    essential_oils: {},
    alkali: {
      name: "",
      quantity: 0, // grams
      cost: 0,
    },
    water: {
      quantity: 0, // grams
    },
    // Costing & pricing
    cost: {
      material: 0,
      working: 0,
      packaging: 0,
      // mirror fields Pricing may expect
      baseCost: 0,
      workingCost: 0,
      packagingCost: 0,
      totalCost: 0,
      perBar: 0,
      bars: Math.max(1, Math.round(1000 / 100)), // from initial batchSize/barWeight
    },
    // Add numeric defaults so Pricing can safely call toFixed()
    totals: sanitizeTotals({
      baseCost: 0,
      workingCost: 0,
      packagingCost: 0,
      totalCost: 0,
      perBar: 0,
      bars: Math.max(1, Math.round(1000 / 100)), // from initial batchSize/barWeight
    }),
    pricingOptions: { multiplier: 2.5 }, // can be set by UI
    pricing: { sellingPrice: 0, profit: 0, margin: 0 },
    // Validation
    validation: [],
  });

  // Fetch ingredients from Firebase on mount (no auth required)
  useEffect(() => {
    const ingredientsRef = collection(db, "ingredients");
    
    const unsubscribe = onSnapshot(
      ingredientsRef,
      (snapshot) => {
        const loadedIngredients = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          firebaseId: docSnap.id,
        }));
        setIngredients(loadedIngredients);
        console.log("Loaded ingredients:", loadedIngredients);
      },
      (error) => {
        console.error("Error fetching ingredients:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // ----------------------------------------------------
  // 2. Helper Logic (Non-hooks)
  // ----------------------------------------------------
  const handleRecipeUpdate = useCallback((partial) => {
    setRecipe((prev) => {
      const next = { ...prev, ...partial };
      const { oils, totalPct } = computeOilWeights(next.items, num(next.totalOilWeight, 0));
      const naoh = calcNaoh(oils, num(next.superfat, 6));
      const water = calcWater(naoh, num(next.lyeConcentration, 0.3));
      // Additives mass handling
      const totalAdditivesWeight = (next.additives || []).reduce((s, a) => s + num(a.amount, 0), 0);
      const liquidsTotal = (next.additives || []).filter(a => a.appliesTo === 'lye').reduce((s, a) => s + num(a.amount, 0), 0);
      const nonLyeAdditivesWeight = Math.max(0, totalAdditivesWeight - liquidsTotal);
      const computedBatchMass = num(next.totalOilWeight, 0) + naoh + water + nonLyeAdditivesWeight;
      // Updated: pass ingredients to validation
      const issues = validateRules({ ...next, oils: { oils, totalPct } }, ingredients);

      const material = computeMaterialCost(ingredients, oils, naoh, water, next.additives || []);
      const working = num(next.cost?.working, 0);
      const packagingPerBar = num(next.cost?.packagingPerBar, 0);
      // determine bars from computed batch mass (includes non-lye additives)
      const bars = Math.max(1, Math.round(computedBatchMass / Math.max(1, num(next.barWeight, 100))));
      const packagingTotal = packagingPerBar * bars;
      const totalsRaw = buildTotals({ material, working, packaging: packagingTotal }, bars);
      const totals = sanitizeTotals(totalsRaw);
      const pricing = computePricing(totals.perBar, next.pricingOptions || {});

      return {
        ...next,
        oils: { oils, totalPct },
        lyeRequired: naoh,
        waterWeight: water,
        computedBatchMass,
        // Keep legacy fields and mirror totals for Pricing
        cost: {
          ...next.cost,
          material,
          working,
          packaging: packagingTotal,
          packagingPerBar,
          baseCost: totals.baseCost,
          workingCost: totals.workingCost,
          packagingCost: totals.packagingCost,
          totalCost: totals.totalCost,
          perBar: Math.round(totals.perBar),
          bars,
        },
        totals,
        pricing: { ...next.pricing, ...pricing },
        validation: issues,
      };
    });
  }, [ingredients]); // Dependency on ingredients is crucial

  // ----------------------------------------------------
  // 3. Effect Hooks
  // ----------------------------------------------------
  // Keep costing/pricing in sync when inventory changes
  useEffect(() => {
    setRecipe((prev) => {
      const { oils, totalPct } = computeOilWeights(prev.items, num(prev.totalOilWeight, 0));
      const naoh = calcNaoh(oils, num(prev.superfat, 6));
      const water = calcWater(naoh, num(prev.lyeConcentration, 0.3));
      // Updated: pass ingredients to validation
      const issues = validateRules({ ...prev, oils: { oils, totalPct } }, ingredients);

      // Additive weight handling
      const totalAdditivesWeight = (prev.additives || []).reduce((s, a) => s + num(a.amount, 0), 0);
      const liquidsTotal = (prev.additives || []).filter(a => a.appliesTo === 'lye').reduce((s, a) => s + num(a.amount, 0), 0);
      const nonLyeAdditivesWeight = Math.max(0, totalAdditivesWeight - liquidsTotal);
      const computedBatchMass = num(prev.totalOilWeight, 0) + naoh + water + nonLyeAdditivesWeight;

      const material = computeMaterialCost(ingredients, oils, naoh, water, prev.additives || []);
      const working = num(prev.cost?.working, 0);
      const packagingPerBar = num(prev.cost?.packagingPerBar, 0);
      const bars = Math.max(1, Math.round(computedBatchMass / Math.max(1, num(prev.barWeight, 100))));
      const packagingTotal = packagingPerBar * bars;
      const totalsRaw = buildTotals({ material, working, packaging: packagingTotal }, bars);
      const totals = sanitizeTotals(totalsRaw);
      const pricing = computePricing(totals.perBar, prev.pricingOptions || {});

      return {
        ...prev,
        oils: { oils, totalPct },
        lyeRequired: naoh,
        waterWeight: water,
        computedBatchMass,
        cost: {
          ...prev.cost,
          material,
          working,
          packaging: packagingTotal,
          baseCost: totals.baseCost,
          workingCost: totals.workingCost,
          packagingCost: totals.packagingCost,
          totalCost: totals.totalCost,
          perBar: Math.round(totals.perBar),
          bars,
        },
        totals,
        pricing: { ...prev.pricing, ...pricing },
        validation: issues,
      };
    });
  }, [ingredients]);

  // ----------------------------------------------------
  // 4. Memo Hooks
  // ----------------------------------------------------
  // Construct a safe recipe object for rendering child components.
  const safeRecipe = useMemo(() => {
    const safeTotals = createSafeNumericObject(sanitizeTotals(recipe.totals ?? ensureTotals(recipe)));
    return {
      ...recipe,
      totals: safeTotals,
      cost: createSafeNumericObject({
        ...recipe.cost,
        baseCost: safeTotals.baseCost,
        workingCost: safeTotals.workingCost,
        packagingCost: safeTotals.packagingCost,
        totalCost: safeTotals.totalCost,
        perBar: safeTotals.perBar,
        bars: safeTotals.bars,
        material: num(recipe.cost?.material, 0),
        working: num(recipe.cost?.working, 0),
        packaging: num(recipe.cost?.packaging, 0),
      }),
    };
  }, [recipe]);

  // ----------------------------------------------------
  // 5. Event Handlers
  // ----------------------------------------------------
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [generatedRecipes, setGeneratedRecipes] = useState([]);

  // quick access to alkali ingredients for generator and selection
  const alkaliIngredients = ingredients.filter((ing) => (ing.category || '').toLowerCase() === 'alkali');

  const handleSelectRecipe = useCallback((recipe) => {
    // Convert recipe format to CreateRecipe format
    const items = recipe.oils?.map((oil) => ({
      ...oil,
      pct: oil.pct,
      percent: oil.pct,
    })) || [];

    const essentialOils = {};
    recipe.fragrances?.forEach((frag, idx) => {
      essentialOils[`frag_${idx}`] = { pct: frag.pct, name: frag.name };
    });

    const normalizedUse = Array.isArray(recipe.use) ? recipe.use : (recipe.use ? [recipe.use] : ["body"]);
    const normalizedSkin = Array.isArray(recipe.skinType) ? recipe.skinType : (recipe.skinType ? [recipe.skinType] : ["all"]);

    const updatedRecipe = {
      ...recipe,
      name: recipe.name || recipe.title || "",
      items,
      additives: recipe.additives || [],
      essential_oils: essentialOils,
      use: normalizedUse,
      skinType: normalizedSkin,
      goal: recipe.goal || "balanced",
      superfat: recipe.superfat || 6,
      lyeConcentration: recipe.lyeConcentration || 0.3,
      totalOilWeight: recipe.totalOilWeight || 1000,
      batchSize: recipe.batchSize || 1000,
      barWeight: recipe.barWeight || 100,
      cost: {
        material: num(recipe.cost?.material, 0),
        working: num(recipe.cost?.working, 0),
        packaging: num(recipe.cost?.packagingTotal ?? recipe.cost?.packaging, 0),
        packagingPerBar: num(recipe.cost?.packagingPerBar, 0),
      },
      pricingOptions: {
        ...(recipe.pricingOptions || {}),
      },
      alkali: recipe.alkali || { name: "", key: "" },
      lyeRequired: recipe.lyeRequired || 0,
      waterWeight: recipe.waterWeight || 0,
    };

    setSelectedRecipe(recipe);
    handleRecipeUpdate(updatedRecipe);
  }, [handleRecipeUpdate]);

  // Check for recipe to edit from sessionStorage (from /lab/recipes or /lab/generator)
  useEffect(() => {
    const storedRecipe = sessionStorage.getItem('editRecipe');
    if (storedRecipe) {
      try {
        const parsed = JSON.parse(storedRecipe);
        handleSelectRecipe(parsed);
        sessionStorage.removeItem('editRecipe'); // Clear after loading
      } catch (e) {
        console.error('Failed to parse editRecipe from sessionStorage:', e);
        sessionStorage.removeItem('editRecipe');
      }
    }
  }, [handleSelectRecipe]);

  // ----------------------
  // Recipe generator
  // ----------------------
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

  const generateSingleRecipe = (seedIdx = 0) => {
    const oilPool = ingredients.filter((ing) => (ing.type || ing.category || '').toLowerCase().includes('oil'));
    if (oilPool.length === 0) return null;

    const useOptions = ['face', 'body', 'both', 'hand'];
    const use = [useOptions[randomInt(0, useOptions.length - 1)]];

    // choose number of oils
    const k = Math.max(2, Math.min(6, randomInt(3, 5)));
    const chosen = pickRandom(oilPool, k);

    // random weights then normalize, respecting absoluteMaxPct if present
    let weights = chosen.map(() => Math.random() + 0.1);
    const normalizeWithMax = (weightsArr, chosenArr) => {
      let sum = weightsArr.reduce((s, v) => s + v, 0);
      let pct = weightsArr.map((w) => (w / sum) * 100);
      // clamp to absoluteMaxPct and redistribute iteratively
      for (let iter = 0; iter < 5; iter++) {
        let changed = false;
        let over = 0;
        pct = pct.map((p, i) => {
          const absMax = Number(chosenArr[i].absoluteMaxPct ?? 100);
          if (p > absMax) {
            changed = true;
            over += p - absMax;
            return absMax;
          }
          return p;
        });
        if (!changed) break;
        // redistribute over to items not at max
        const freeIdx = pct.map((p, i) => ({ p, i })).filter(x => x.p < (Number(chosenArr[x.i]?.absoluteMaxPct ?? 100))).map(x => x.i);
        if (freeIdx.length === 0) break;
        let freeSum = freeIdx.reduce((s, idx) => s + pct[idx], 0);
        freeIdx.forEach((idx) => {
          const add = (pct[idx] / freeSum) * over;
          pct[idx] += add;
        });
      }
      // final adjust to sum 100
      const finalSum = pct.reduce((s, v) => s + v, 0);
      return pct.map((p) => (p / finalSum) * 100);
    };

    const pctArr = normalizeWithMax(weights, chosen);

    const items = chosen.map((o, i) => ({ name: o.name, key: o.key || o.firebaseId || o.name, pct: Number(pctArr[i].toFixed(4)) }));

    // additives: random 0-3
    const additivePool = ingredients.filter((ing) => {
      const cat = ((ing.category||ing.type)||'').toLowerCase();
      return ['additive','clay','herb','scrub','liquid','functional','fragrance','essential','colour','color'].some(k => cat.includes(k));
    });
    const addCount = randomInt(0, 3);
    const chosenAdditives = pickRandom(additivePool, addCount).map((a) => {
      const cat = ((a.category||a.type)||'').toLowerCase();
      const isLiquid = cat.includes('liquid') || cat.includes('milk') || cat.includes('water') || cat.includes('essential') || cat.includes('fragrance');
      return { key: a.key || a.firebaseId || a.name, name: a.name, type: a.category || a.type || 'additive', amount: Number((Math.random() * 20 + 1).toFixed(2)), unit: 'g', appliesTo: isLiquid ? 'lye' : 'post', whenAdded: isLiquid ? 'pre-lye' : 'post-trace' };
    });

    const totalOilWeight = 1000;
    const sf = (use.includes('face') ? (7 + Math.random()) : (6 + Math.random() * 2));
    const lyeConcentration = Number((0.25 + Math.random() * 0.1).toFixed(3));

    // compute oils weights and naoh (using centralized SAP values)
    const oilsComputed = items.map((it) => ({ ...it, weight: (it.pct / 100) * totalOilWeight }));
    const naohBase = oilsComputed.reduce((s, it) => {
      const sapFor = getSapValue(it, ingredients);
      return s + (sapFor || 0) * it.weight;
    }, 0);
    const adjustedNaoh = naohBase * (1 - Math.min(Math.max(sf, 0), 20) / 100);
    const liquidsTotal = chosenAdditives.filter(a => a.appliesTo === 'lye').reduce((s,a) => s + num(a.amount,0), 0);
    const computedWater = adjustedNaoh > 0 ? (adjustedNaoh / Math.max(0.00001, lyeConcentration)) - adjustedNaoh : 0;
    const totalWater = computedWater + liquidsTotal;
    const totalAdditivesWeight = chosenAdditives.reduce((s,a) => s + num(a.amount,0), 0);
    const nonLyeAdditivesWeight = totalAdditivesWeight - liquidsTotal;
    const computedBatchMass = totalOilWeight + adjustedNaoh + totalWater + nonLyeAdditivesWeight;
    const bars = Math.max(1, Math.round(computedBatchMass / 100));

    const materialCost = computeMaterialCost(ingredients, oilsComputed, adjustedNaoh, totalWater, chosenAdditives);
    const working = 0;
    const packagingPerBar = 0;
    const packagingTotal = packagingPerBar * bars;
    const totals = buildTotals({ material: materialCost, working, packaging: packagingTotal }, bars);
    const pricing = computePricing(totals.perBar, { markup: 50 });

    const perOilDetails = oilsComputed.map((it) => {
      const sap = getSapValue(it, ingredients);
      const preNaoh = sap * it.weight;
      const adjNaoh = preNaoh * (1 - Math.min(Math.max(sf, 0), 20) / 100);
      return { name: it.name, key: it.key, pct: it.pct, weight: Number(it.weight.toFixed(4)), sap: Number(sap), preNaoh: Number(preNaoh.toFixed(4)), adjustedNaoh: Number(adjNaoh.toFixed(4)) };
    });

    const recipeObj = {
      name: `Gen Recipe ${new Date().toLocaleTimeString()} #${seedIdx + 1}`,
      items,
      oils: items,
      perOilDetails,
      totalOilWeight,
      batchSize: computedBatchMass,
      computedBatchMass,
      bars,
      barWeight: 100,
      superfat: Number(sf.toFixed(2)),
      lyeConcentration,
      baseTotalNaoh: Number(naohBase.toFixed(4)),
      adjustedTotalNaoh: Number(adjustedNaoh.toFixed(4)),
      waterWeight: Number(totalWater.toFixed(4)),
      additives: chosenAdditives,
      totalAdditivesWeight,
      cost: { material: Number(materialCost.toFixed(2)), working, packaging: packagingTotal, packagingPerBar },
      totals: sanitizeTotals(totals),
      pricingOptions: { markup: 50, computedSellingPerBar: pricing.sellingPrice },
      pricing: pricing,
      use,
      skinType: ['all'],
      goal: 'generated',
      alkali: alkaliIngredients.length > 0 ? { name: alkaliIngredients[0].name, key: alkaliIngredients[0].key || alkaliIngredients[0].firebaseId } : { name: '', key: '' },
    };

    // ensure recipe follows validation rules; if not, caller may retry
    const issues = validateRules({ ...recipeObj, oils: { oils: items, totalPct: items.reduce((s,i)=>s+num(i.pct,0),0) } }, ingredients);
    return { recipeObj, issues };
  };

  const generateRecipes = (count = 3) => {
    const out = [];
    let attempts = 0;
    for (let i = 0; i < count; i++) {
      let found = null;
      while (!found && attempts < 200) {
        attempts++;
        const cand = generateSingleRecipe(i);
        if (!cand) break;
        // require no validation issues
        if (!cand.issues || cand.issues.length === 0) {
          found = cand.recipeObj;
        }
      }
      // allow imperfect recipe if couldn't find perfect
      if (!found) {
        const fallback = generateSingleRecipe(i);
        found = fallback ? fallback.recipeObj : null;
      }
      if (found) out.push(found);
    }
    setGeneratedRecipes(out);
  };

  const saveGeneratedRecipe = async (r) => {
    try {
      const toSave = { ...r, createdAt: new Date().toISOString(), notes: 'Generated recipe' };
      await addDoc(collection(db, 'recipes'), toSave);
      alert('Generated recipe saved');
    } catch (err) {
      console.error('Save generated failed', err);
      alert('Failed to save generated recipe');
    }
  };

  // ----------------------------------------------------
  // 6. Render
  // ----------------------------------------------------

  // No need to check auth - render normally
  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', color: '#333' }}>
      {/* Navigation bar */}
      <LabNavbar />

      {/* Recipe Editor */}
      <CreateRecipe
        ingredients={ingredients}
        onRecipeUpdate={handleRecipeUpdate}
        selectedRecipe={selectedRecipe}
        currentRecipe={safeRecipe}
      />
    </div>
  );
}

export default Lab;

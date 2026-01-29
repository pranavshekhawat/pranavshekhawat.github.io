import React, { useState, useEffect } from "react";
import { db } from "../utils/firebase-config";
import { collection, addDoc, onSnapshot, query, orderBy, limit } from "firebase/firestore";

// Import centralized utilities
import { SAP_VALUES, getSapValue } from "./utils/sapValues";
import { getRecommendedSuperfatRange, getEOLimits } from "./utils/validationRules";
import { num } from "./utils/costCalculations";

// Import new components
import OilPropertyPreview from "./OilPropertyPreview";
import RecipePresetsPanel from "./RecipePresetsPanel";

// Color palette for visual oil ratio bar
const OIL_COLORS = [
  '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63',
  '#00BCD4', '#FF5722', '#795548', '#607D8B', '#3F51B5'
];

export default function CreateRecipe({ ingredients, onRecipeUpdate, selectedRecipe, currentRecipe }) {
  const [recipe, setRecipe] = useState({
    name: "",
    notes: "",
    items: [],
    additives: [],
    use: ["body"],
    skinType: ["all"],
    goal: "balanced",
    superfat: 6,
    lyeConcentration: 0.3,
    totalOilWeight: 1000,
    batchSize: 1000,
    barWeight: 100,
    cost: { material: 0, working: 0, packaging: 0 },
    alkali: { name: "", key: "" },
    lyeRequired: 0,
    waterWeight: 0,
  });

  const [saving, setSaving] = useState(false);
  const [lockComputed, setLockComputed] = useState(false);
  const [userSetUse, setUserSetUse] = useState(false);
  const [useValue, setUseValue] = useState((recipe.use && recipe.use[0]) || 'body');
  const [selFragrance, setSelFragrance] = useState("");
  const [selFragranceAmt, setSelFragranceAmt] = useState(2);
  const [selColour, setSelColour] = useState("");
  const [selColourAmt, setSelColourAmt] = useState(1);
  const [selAdditive, setSelAdditive] = useState("");
  const [selAdditiveAmt, setSelAdditiveAmt] = useState(5);
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [sidebarTab, setSidebarTab] = useState('summary'); // 'summary' | 'properties' | 'presets' | 'pricing'

  const alkaliIngredients = ingredients?.filter((ing) => ing.category?.toLowerCase() === "alkali") || [];
  const oilOptions = ingredients?.filter((ing) => (ing.category || ing.type || "").toLowerCase().includes("oil")) || [];
  const fragranceOptions = ingredients?.filter((ing) => (((ing.category||ing.type)||"").toLowerCase().includes("frag") || ((ing.category||ing.type)||"").toLowerCase().includes("essential"))) || [];
  const colourOptions = ingredients?.filter((ing) => (((ing.category||"")||"").toLowerCase().includes("colour") || ((ing.category||"")||"").toLowerCase().includes("color"))) || [];
  const additiveOptions = ingredients?.filter((ing) => {
    const cat = ((ing.category||ing.type)||"").toLowerCase();
    return ['additive','clay','herb','scrub','liquid','functional'].some(k => cat.includes(k));
  }) || [];

  // Fetch recent recipes for quick access
  useEffect(() => {
    const q = query(collection(db, "recipes"), orderBy("createdAt", "desc"), limit(5));
    const unsub = onSnapshot(q, (snap) => {
      setRecentRecipes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // First priority: Load selectedRecipe (when user clicks "Load & Edit")
  useEffect(() => {
    if (selectedRecipe) {
      const items = selectedRecipe.oils?.map((oil) => ({
        ...oil,
        pct: oil.pct,
        percent: oil.pct,
      })) || [];

      const updatedRecipe = {
        ...recipe,
        name: selectedRecipe.name || recipe.name || "",
        additives: selectedRecipe.additives || recipe.additives || [],
        items,
        use: userSetUse ? (recipe.use || ["body"]) : (selectedRecipe.use || recipe.use || ["body"]),
        skinType: selectedRecipe.skinType || ["all"],
        goal: selectedRecipe.goal || "balanced",
        superfat: selectedRecipe.superfat || 6,
        lyeConcentration: selectedRecipe.lyeConcentration || 0.3,
        totalOilWeight: selectedRecipe.totalOilWeight || 1000,
        batchSize: selectedRecipe.batchSize || 1000,
        barWeight: selectedRecipe.barWeight || 100,
        alkali: selectedRecipe.alkali || { name: "", key: "" },
        lyeRequired: selectedRecipe.lyeRequired || 0,
        waterWeight: selectedRecipe.waterWeight || 0,
        cost: {
          ...(recipe.cost || {}),
          material: num(selectedRecipe.cost?.material ?? recipe.cost?.material, 0),
          working: num(selectedRecipe.cost?.working ?? recipe.cost?.working, 0),
          packagingPerBar: num(selectedRecipe.cost?.packagingPerBar ?? recipe.cost?.packagingPerBar ?? recipe.cost?.packagingPerBar, 0),
          packaging: num(selectedRecipe.cost?.packagingTotal ?? selectedRecipe.cost?.packaging ?? recipe.cost?.packaging, 0),
        },
        pricingOptions: {
          ...(recipe.pricingOptions || {}),
          ...(selectedRecipe.pricingOptions || {}),
        },
      };

      setRecipe(updatedRecipe);
      onRecipeUpdate(updatedRecipe);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecipe]);

  // Keep `useValue` in sync when a selected recipe loads or when the parent recipe changes
  useEffect(() => {
    if (!userSetUse) {
      const src = selectedRecipe || {};
      const u = (src.use && src.use[0]) || (recipe.use && recipe.use[0]) || 'body';
      setUseValue(u);
    }
  }, [selectedRecipe, recipe.use, userSetUse]);

  // Auto-select first NaOH if no alkali is selected
  useEffect(() => {
    if (alkaliIngredients.length > 0 && !recipe.alkali?.name) {
      const naoh = alkaliIngredients.find((a) => (a.name || '').toLowerCase().includes('naoh') || (a.name || '').toLowerCase().includes('sodium hydroxide'));
      const defaultAlkali = naoh || alkaliIngredients[0];
      if (defaultAlkali) {
        const updatedRecipe = {
          ...recipe,
          alkali: {
            name: defaultAlkali.name,
            key: defaultAlkali.key || defaultAlkali.firebaseId,
            costPerUnit: defaultAlkali.costPerUnit,
            unit: defaultAlkali.unit,
          },
        };
        setRecipe(updatedRecipe);
        onRecipeUpdate(updatedRecipe);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alkaliIngredients]);

  // Sync calculated values from parent
  useEffect(() => {
    if (currentRecipe && currentRecipe.lyeRequired > 0) {
      setRecipe((prev) => ({
        ...prev,
        lyeRequired: num(currentRecipe.lyeRequired, 0),
        waterWeight: num(currentRecipe.waterWeight, 0),
        lyeConcentration: num(currentRecipe.lyeConcentration, 0.3),
      }));
    }
  }, [currentRecipe?.lyeRequired, currentRecipe?.waterWeight, currentRecipe?.lyeConcentration]);

  const handleInputChange = (field, value) => {
    const updatedRecipe = { ...recipe, [field]: value };
    setRecipe(updatedRecipe);
    onRecipeUpdate(updatedRecipe);
  };

  const handleCostChange = (key, value) => {
    const updated = { ...recipe, cost: { ...(recipe.cost || {}), [key]: value } };
    setRecipe(updated);
    onRecipeUpdate(updated);
  };

  const handleOilChange = (index, field, value) => {
    const updatedItems = [...recipe.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value, percent: value, pct: value };
    const updatedRecipe = { ...recipe, items: updatedItems };
    setRecipe(updatedRecipe);
    onRecipeUpdate(updatedRecipe);
  };

  const handleAddOil = () => {
    const newOil = { name: "", pct: 0, percent: 0, key: "" };
    const updatedRecipe = { ...recipe, items: [...recipe.items, newOil] };
    setRecipe(updatedRecipe);
  };

  const handleRemoveOil = (index) => {
    const updatedItems = recipe.items.filter((_, i) => i !== index);
    const updatedRecipe = { ...recipe, items: updatedItems };
    setRecipe(updatedRecipe);
    onRecipeUpdate(updatedRecipe);
  };

  const handleAlkaliChange = (selectedKey) => {
    const selectedAlkali = alkaliIngredients.find((ing) => ing.key === selectedKey || ing.firebaseId === selectedKey);
    if (selectedAlkali) {
      const updatedRecipe = {
        ...recipe,
        alkali: {
          name: selectedAlkali.name,
          key: selectedAlkali.key || selectedAlkali.firebaseId,
          costPerUnit: selectedAlkali.costPerUnit,
          unit: selectedAlkali.unit,
        },
      };
      setRecipe(updatedRecipe);
      onRecipeUpdate(updatedRecipe);
    }
  };

  const handleLoadRecent = (r) => {
    const items = r.oils?.map((oil) => ({ ...oil, pct: oil.pct, percent: oil.pct })) || [];
    const loaded = {
      ...recipe,
      name: r.name || "",
      additives: r.additives || [],
      items,
      use: r.use || ["body"],
      skinType: r.skinType || ["all"],
      goal: r.goal || "balanced",
      superfat: r.superfat || 6,
      lyeConcentration: r.lyeConcentration || 0.3,
      totalOilWeight: r.totalOilWeight || 1000,
      batchSize: r.batchSize || 1000,
      barWeight: r.barWeight || 100,
      alkali: r.alkali || { name: "", key: "" },
      lyeRequired: r.lyeRequired || 0,
      waterWeight: r.waterWeight || 0,
      cost: r.cost || {},
      pricingOptions: r.pricingOptions || {},
    };
    setRecipe(loaded);
    onRecipeUpdate(loaded);
  };

  // Apply a preset recipe template
  const handleApplyPreset = (preset) => {
    // Map preset oils to recipe items
    const items = preset.oils?.map((oil) => ({
      name: oil.name,
      key: oil.key,
      pct: oil.pct,
      percent: oil.pct,
    })) || [];
    
    const loaded = {
      ...recipe,
      name: preset.presetName ? `${preset.presetName.replace(/[^\w\s]/g, '')} - Custom` : recipe.name,
      items,
      use: preset.use ? [preset.use] : recipe.use,
      goal: preset.goal || recipe.goal,
      superfat: preset.superfat || recipe.superfat,
      notes: preset.notes ? `Based on ${preset.presetName || 'preset'}. ${preset.notes}` : recipe.notes,
    };
    setRecipe(loaded);
    onRecipeUpdate(loaded);
    setSidebarTab('summary'); // Switch to summary tab after applying preset
  };

  // Add suggested oil from OilPropertyPreview
  const handleAddSuggestedOil = (suggestedOil) => {
    const newItem = {
      name: suggestedOil.name,
      key: suggestedOil.key,
      pct: suggestedOil.pct,
      percent: suggestedOil.pct,
    };
    const updated = {
      ...recipe,
      items: [...recipe.items, newItem],
    };
    setRecipe(updated);
    onRecipeUpdate(updated);
  };

  // Compute per-oil and total NaOH values (using centralized SAP values)
  const perOilInfo = recipe.items.map((oil) => {
    const pct = num(oil.pct, 0);
    const total = num(recipe.totalOilWeight, 0) || 0;
    const weight = (pct / 100) * total;
    const sapVal = getSapValue(oil, ingredients);
    const preNaoh = Number(sapVal) * Number(weight || 0);
    return { sapVal, weight, preNaoh };
  });

  const baseTotalNaoh = perOilInfo.reduce((s, p) => s + (p.preNaoh || 0), 0);
  const sf = Math.min(Math.max(num(recipe.superfat, 6), 0), 20) / 100;
  const adjustedTotalNaoh = baseTotalNaoh * (1 - sf);

  const totalAdditivesWeight = (recipe.additives || []).reduce((s, a) => s + num(a.amount, 0), 0);
  const liquidsTotal = (recipe.additives || []).filter(a => a.appliesTo === 'lye').reduce((s, a) => s + num(a.amount, 0), 0);
  const nonLyeAdditivesWeight = totalAdditivesWeight - liquidsTotal;

  // Computed values
  const computedWater = adjustedTotalNaoh > 0 ? (adjustedTotalNaoh / Math.max(0.00001, num(recipe.lyeConcentration, 0.3))) - adjustedTotalNaoh : 0;
  const totalWater = computedWater + liquidsTotal;
  const computedBatchMass = num(recipe.totalOilWeight, 0) + adjustedTotalNaoh + totalWater + nonLyeAdditivesWeight;
  const computedBars = Math.max(1, Math.round(computedBatchMass / Math.max(1, num(recipe.barWeight, 100))));
  const bars = num(recipe.bars, computedBars);

  // Sync computed NaOH and water
  useEffect(() => {
    const c = num(recipe.lyeConcentration, 0.3);
    const conc = c > 0 && c < 1 ? c : 0.3;
    const cWater = adjustedTotalNaoh > 0 ? (adjustedTotalNaoh / conc) - adjustedTotalNaoh : 0;
    const tWater = cWater + liquidsTotal;
    const round = (v) => Math.round((v + Number.EPSILON) * 100) / 100;
    const needUpdate =
      round(num(recipe.lyeRequired, 0)) !== round(adjustedTotalNaoh) ||
      round(num(recipe.waterWeight, 0)) !== round(tWater);
    if (needUpdate && !lockComputed) {
      const updated = { ...recipe, lyeRequired: adjustedTotalNaoh, waterWeight: tWater };
      setRecipe(updated);
      onRecipeUpdate(updated);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adjustedTotalNaoh, recipe.lyeConcentration, liquidsTotal, lockComputed]);

  const totalPct = recipe.items.reduce((sum, oil) => sum + num(oil.pct, 0), 0);

  // Essential oil / fragrance total
  const totalEOg = (recipe.additives || []).filter(a => a.type === 'fragrance' || (a.type||'').toLowerCase().includes('essential')).reduce((s,a) => s + num(a.amount,0), 0);
  const eoPct = num(recipe.totalOilWeight,0) > 0 ? (totalEOg / num(recipe.totalOilWeight,0)) * 100 : 0;

  // Validation (using centralized rules)
  const recommendedSfRange = getRecommendedSuperfatRange(recipe.use || []);
  const eoLimits = getEOLimits(recipe.use || []);

  const sfOutOfRange = num(recipe.superfat,0) < recommendedSfRange.min || num(recipe.superfat,0) > recommendedSfRange.max;
  const eoOutOfRange = eoPct > eoLimits.maxPct;

  // Completion status
  const isOilsComplete = totalPct === 100;
  const isAlkaliSelected = !!recipe.alkali?.name;
  const hasWarnings = sfOutOfRange || eoOutOfRange || (currentRecipe?.validation?.length > 0);

  const handleSaveRecipe = async () => {
    setSaving(true);
    try {
      if (!recipe.alkali?.name) {
        alert("Please select an alkali (NaOH) before saving the recipe");
        setSaving(false);
        return;
      }

      const perOilDetails = recipe.items.map((oil) => {
        const pct = num(oil.pct, 0);
        const total = num(recipe.totalOilWeight, 0) || 0;
        const weight = (pct / 100) * total;
        const sapVal = getSapValue(oil, ingredients);
        const preNaoh = Number(sapVal) * Number(weight || 0);
        const adjustedNaoh = preNaoh * (1 - sf);
        const pctOfTotal = adjustedTotalNaoh ? (adjustedNaoh / adjustedTotalNaoh) * 100 : 0;
        return {
          name: oil.name || oil.key || null,
          key: oil.key || null,
          pct,
          weight: Number(weight.toFixed(4)),
          sap: Number(sapVal),
          preNaoh: Number(preNaoh.toFixed(4)),
          adjustedNaoh: Number(adjustedNaoh.toFixed(4)),
          pctOfTotal: Number(pctOfTotal.toFixed(4)),
        };
      });

      const sapSnapshot = {};
      perOilDetails.forEach((d) => { sapSnapshot[d.key || d.name] = d.sap; });

      const packagingPerBar = num(recipe.cost?.packagingPerBar, 0);
      const packagingTotal = Number((packagingPerBar * bars).toFixed(4));
      const workingCost = num(recipe.cost?.working, 0);
      const markup = num(recipe.pricingOptions?.markup ?? 0, 0);
      const perBarCostApprox = Number((num(recipe.totals?.perBar, 0) || num(currentRecipe?.totals?.perBar, 0) || 0));
      const computedSellingPerBar = Number((perBarCostApprox * (1 + markup / 100)) || 0);

      const recipeToSave = {
        ...recipe,
        oils: recipe.items,
        perOilDetails,
        sapSnapshot,
        baseTotalNaoh: Number(baseTotalNaoh.toFixed(4)),
        adjustedTotalNaoh: Number(adjustedTotalNaoh.toFixed(4)),
        waterWeight: Number(totalWater.toFixed(4)),
        totalAdditivesWeight: Number(totalAdditivesWeight.toFixed(4)),
        computedBatchMass: Number(computedBatchMass.toFixed(4)),
        additives: recipe.additives || [],
        cost: {
          ...(recipe.cost || {}),
          working: Number(workingCost),
          packagingPerBar: Number(packagingPerBar),
          packagingTotal: Number(packagingTotal),
        },
        pricingOptions: {
          ...(recipe.pricingOptions || {}),
          markup: Number(markup),
          computedSellingPerBar: Number(computedSellingPerBar.toFixed(2)),
        },
        name: recipe.name && String(recipe.name).trim() !== "" ? recipe.name : `Recipe - ${new Date().toLocaleString()}`,
        createdAt: new Date().toISOString(),
        notes: recipe.notes || "",
      };

      await addDoc(collection(db, "recipes"), recipeToSave);
      alert("Recipe saved successfully!");
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Failed to save recipe");
    }
    setSaving(false);
  };

  // Compact input style
  const inputStyle = { padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: '0.9em' };
  const selectStyle = { ...inputStyle, width: '100%' };
  const labelStyle = { fontSize: '0.8em', color: '#666', marginBottom: 2, display: 'block' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginTop: 16 }}>
      {/* ===== LEFT COLUMN: Recipe Form ===== */}
      <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 12 }}>
        {/* Sticky mini-header */}
        <div style={{ 
          position: 'sticky', top: 0, zIndex: 10, 
          background: totalPct === 100 ? '#e8f5e9' : '#fff3e0', 
          padding: '8px 12px', marginBottom: 12, borderRadius: 6,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          border: `1px solid ${totalPct === 100 ? '#a5d6a7' : '#ffcc80'}`
        }}>
          <div style={{ display: 'flex', gap: 16, fontSize: '0.85em' }}>
            <span style={{ color: totalPct === 100 ? '#2e7d32' : '#e65100' }}>
              <strong>Oils:</strong> {totalPct}%
              {isOilsComplete && <span style={{ marginLeft: 4 }}>✓</span>}
            </span>
            <span><strong>NaOH:</strong> {adjustedTotalNaoh.toFixed(1)}g</span>
            <span><strong>Water:</strong> {totalWater.toFixed(1)}g</span>
            <span style={{ color: isAlkaliSelected ? '#2e7d32' : '#e65100' }}>
              <strong>Alkali:</strong> {isAlkaliSelected ? '✓' : '✗'}
            </span>
          </div>
          <button
            onClick={handleSaveRecipe}
            disabled={saving || totalPct !== 100 || !recipe.alkali?.name}
            style={{
              padding: '6px 14px', fontSize: '0.85em', fontWeight: 'bold',
              background: totalPct === 100 && recipe.alkali?.name ? '#4CAF50' : '#ccc',
              color: '#fff', border: 'none', borderRadius: 4,
              cursor: totalPct === 100 && recipe.alkali?.name ? 'pointer' : 'not-allowed'
            }}
          >
            {saving ? '...' : '💾 Save'}
          </button>
        </div>

        {/* Recipe Name + Settings Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
          <div>
            <label style={labelStyle}>Recipe Name</label>
            <input type="text" value={recipe.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Optional name" style={{ ...inputStyle, width: '100%' }} />
          </div>
          <div>
            <label style={labelStyle}>Use Type</label>
            <select value={useValue} onChange={(e) => {
              const v = e.target.value;
              let newUse = v === 'both' ? ['face', 'body'] : [v];
              setUserSetUse(true);
              setUseValue(v);
              let recommendedSf = num(recipe.superfat, 6);
              if (newUse.includes('face')) recommendedSf = 7;
              else if (newUse.includes('body')) recommendedSf = 6;
              handleInputChange('use', newUse);
              handleInputChange('superfat', recommendedSf);
            }} style={selectStyle}>
              <option value="face">Face</option>
              <option value="body">Body</option>
              <option value="both">Both</option>
              <option value="hand">Hand</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Skin Type</label>
            <select value={recipe.skinType?.[0] || "all"} onChange={(e) => handleInputChange("skinType", [e.target.value])} style={selectStyle}>
              <option value="all">All</option>
              <option value="dry">Dry</option>
              <option value="sensitive">Sensitive</option>
              <option value="acne-prone">Acne-prone</option>
              <option value="oily">Oily</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Goal</label>
            <select value={recipe.goal || "balanced"} onChange={(e) => handleInputChange("goal", e.target.value)} style={selectStyle}>
              <option value="balanced">Balanced</option>
              <option value="moisturising">Moisturising</option>
              <option value="leather rich">Leather Rich</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Alkali *</label>
            <select value={recipe.alkali?.key || ""} onChange={(e) => handleAlkaliChange(e.target.value)} style={{ ...selectStyle, borderColor: !recipe.alkali?.name ? '#f44336' : '#ddd' }}>
              <option value="">Select...</option>
              {alkaliIngredients.map((a) => (
                <option key={a.firebaseId || a.key} value={a.key || a.firebaseId}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Batch Settings Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>🛢️ Oil Weight (g)</label>
            <input type="number" value={recipe.totalOilWeight} onChange={(e) => handleInputChange("totalOilWeight", num(e.target.value))} style={{ ...inputStyle, width: '100%' }} />
          </div>
          <div>
            <label style={labelStyle}>📦 Batch Size (g)</label>
            <input type="number" value={recipe.batchSize} onChange={(e) => handleInputChange("batchSize", num(e.target.value))} style={{ ...inputStyle, width: '100%' }} />
          </div>
          <div>
            <label style={labelStyle}>⚖️ Bar Weight (g)</label>
            <input type="number" value={recipe.barWeight} onChange={(e) => handleInputChange("barWeight", num(e.target.value))} style={{ ...inputStyle, width: '100%' }} />
          </div>
          <div>
            <label style={labelStyle}>✨ Superfat (%)</label>
            <input type="number" value={recipe.superfat} onChange={(e) => handleInputChange("superfat", num(e.target.value))} style={{ ...inputStyle, width: '100%', borderColor: sfOutOfRange ? '#ff9800' : '#ddd' }} />
          </div>
        </div>

        {/* Visual Oil Ratio Bar */}
        {recipe.items.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', height: 24, borderRadius: 4, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
              {recipe.items.map((oil, idx) => {
                const pct = num(oil.pct, 0);
                if (pct <= 0) return null;
                return (
                  <div key={idx} style={{
                    width: `${pct}%`,
                    background: OIL_COLORS[idx % OIL_COLORS.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7em', color: '#fff', fontWeight: 'bold',
                    minWidth: pct > 5 ? 'auto' : 0,
                    overflow: 'hidden'
                  }} title={`${oil.name || 'Oil'}: ${pct}%`}>
                    {pct >= 10 ? `${pct}%` : ''}
                  </div>
                );
              })}
              {totalPct < 100 && (
                <div style={{ width: `${100 - totalPct}%`, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7em', color: '#999' }}>
                  {100 - totalPct}% remaining
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {recipe.items.map((oil, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75em' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: OIL_COLORS[idx % OIL_COLORS.length] }} />
                  <span>{oil.name || `Oil ${idx + 1}`}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Oils Section */}
        <div style={{ marginBottom: 12, padding: 10, background: '#fafafa', borderRadius: 6, border: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.9em' }}>🛢️ Oils ({recipe.items.length})</span>
            <button onClick={handleAddOil} style={{ padding: '4px 10px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: 4, fontSize: '0.8em' }}>+ Add</button>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {recipe.items.map((oil, idx) => {
              const info = perOilInfo[idx] || { sapVal: 0, weight: 0, preNaoh: 0 };
              const adjustedNaoh = info.preNaoh * (1 - sf);
              return (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 70px 1fr auto', gap: 6, alignItems: 'center', background: '#fff', padding: 6, borderRadius: 4, border: '1px solid #eee' }}>
                  <select value={oil.key || oil.name || ""} onChange={(e) => {
                    const val = e.target.value;
                    const selected = oilOptions.find((o) => (o.key || o.firebaseId || o.name) === val);
                    const updatedItems = [...recipe.items];
                    if (selected) {
                      updatedItems[idx] = { ...updatedItems[idx], name: selected.name || selected.key || "", key: selected.key || selected.firebaseId || selected.name || "" };
                    } else {
                      updatedItems[idx] = { ...updatedItems[idx], name: val, key: val };
                    }
                    setRecipe({ ...recipe, items: updatedItems });
                    onRecipeUpdate({ ...recipe, items: updatedItems });
                  }} style={{ ...inputStyle, padding: '4px 6px' }}>
                    <option value="">Select oil...</option>
                    {oilOptions.map((opt) => (
                      <option key={opt.firebaseId || opt.key || opt.name} value={opt.key || opt.firebaseId || opt.name}>{opt.name}</option>
                    ))}
                  </select>
                  <input type="number" placeholder="%" value={oil.pct || 0} onChange={(e) => handleOilChange(idx, "pct", num(e.target.value))} style={{ ...inputStyle, padding: '4px 6px', textAlign: 'center' }} />
                  <div style={{ fontSize: '0.75em', color: '#666', display: 'flex', gap: 8 }}>
                    <span title="Weight">{info.weight.toFixed(0)}g</span>
                    <span title="NaOH needed">NaOH: {adjustedNaoh.toFixed(1)}g</span>
                  </div>
                  <button onClick={() => handleRemoveOil(idx)} style={{ padding: '2px 8px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, fontSize: '0.75em' }}>✕</button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additives Section */}
        <div style={{ padding: 10, background: '#f0f7ff', borderRadius: 6, border: '1px solid #bbdefb' }}>
          <div style={{ fontWeight: 'bold', fontSize: '0.9em', marginBottom: 8 }}>🧴 Additives / Fragrances / Colours</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
            {/* Fragrance */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <select value={selFragrance} onChange={(e) => setSelFragrance(e.target.value)} style={{ ...inputStyle, flex: 1, padding: '4px' }}>
                <option value="">Fragrance...</option>
                {fragranceOptions.map((f) => (<option key={f.firebaseId || f.key || f.name} value={f.key || f.firebaseId || f.name}>{f.name}</option>))}
              </select>
              <input type="number" value={selFragranceAmt} onChange={(e) => setSelFragranceAmt(num(e.target.value, 2))} style={{ ...inputStyle, width: 50, padding: '4px' }} />
              <button onClick={() => {
                if (!selFragrance) return;
                const inv = fragranceOptions.find(i => (i.key||i.firebaseId||i.name) === selFragrance);
                const entry = { key: inv?.key || inv?.firebaseId || inv?.name, name: inv?.name || selFragrance, type: 'fragrance', amount: Number(selFragranceAmt), unit: 'g', appliesTo: 'post', whenAdded: 'post-trace' };
                const updated = { ...recipe, additives: [...(recipe.additives||[]), entry] };
                setRecipe(updated); onRecipeUpdate(updated);
                setSelFragrance(''); setSelFragranceAmt(2);
              }} style={{ padding: '4px 8px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, fontSize: '0.8em' }}>+</button>
            </div>
            {/* Colour */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <select value={selColour} onChange={(e) => setSelColour(e.target.value)} style={{ ...inputStyle, flex: 1, padding: '4px' }}>
                <option value="">Colour...</option>
                {colourOptions.map((f) => (<option key={f.firebaseId || f.key || f.name} value={f.key || f.firebaseId || f.name}>{f.name}</option>))}
              </select>
              <input type="number" value={selColourAmt} onChange={(e) => setSelColourAmt(num(e.target.value, 1))} style={{ ...inputStyle, width: 50, padding: '4px' }} />
              <button onClick={() => {
                if (!selColour) return;
                const inv = colourOptions.find(i => (i.key||i.firebaseId||i.name) === selColour);
                const entry = { key: inv?.key || inv?.firebaseId || inv?.name, name: inv?.name || selColour, type: 'colour', amount: Number(selColourAmt), unit: 'g', appliesTo: 'post', whenAdded: 'post-trace' };
                const updated = { ...recipe, additives: [...(recipe.additives||[]), entry] };
                setRecipe(updated); onRecipeUpdate(updated);
                setSelColour(''); setSelColourAmt(1);
              }} style={{ padding: '4px 8px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, fontSize: '0.8em' }}>+</button>
            </div>
            {/* Additive */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <select value={selAdditive} onChange={(e) => setSelAdditive(e.target.value)} style={{ ...inputStyle, flex: 1, padding: '4px' }}>
                <option value="">Additive...</option>
                {additiveOptions.map((f) => (<option key={f.firebaseId || f.key || f.name} value={f.key || f.firebaseId || f.name}>{f.name}</option>))}
              </select>
              <input type="number" value={selAdditiveAmt} onChange={(e) => setSelAdditiveAmt(num(e.target.value, 5))} style={{ ...inputStyle, width: 50, padding: '4px' }} />
              <button onClick={() => {
                if (!selAdditive) return;
                const inv = additiveOptions.find(i => (i.key||i.firebaseId||i.name) === selAdditive);
                const cat = ((inv?.category||inv?.type)||'').toLowerCase();
                const isLiquid = cat.includes('liquid') || cat.includes('milk') || cat.includes('water');
                const appliesTo = isLiquid ? 'lye' : 'post';
                const whenAdded = isLiquid ? 'pre-lye' : 'post-trace';
                const entry = { key: inv?.key || inv?.firebaseId || inv?.name, name: inv?.name || selAdditive, type: inv?.category || 'additive', amount: Number(selAdditiveAmt), unit: 'g', appliesTo, whenAdded };
                const updated = { ...recipe, additives: [...(recipe.additives||[]), entry] };
                setRecipe(updated); onRecipeUpdate(updated);
                setSelAdditive(''); setSelAdditiveAmt(5);
              }} style={{ padding: '4px 8px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, fontSize: '0.8em' }}>+</button>
            </div>
          </div>

          {/* Current additives list */}
          {(recipe.additives || []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(recipe.additives || []).map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: '0.8em', border: '1px solid #ddd' }}>
                  <span style={{ fontWeight: 500 }}>{a.name}</span>
                  <input type="number" value={a.amount} onChange={(e) => {
                    const updated = { ...recipe, additives: recipe.additives.map((x, idx) => idx === i ? { ...x, amount: Number(e.target.value) } : x) };
                    setRecipe(updated); onRecipeUpdate(updated);
                  }} style={{ width: 40, padding: 2, border: '1px solid #ddd', borderRadius: 2, textAlign: 'center' }} />
                  <span style={{ color: '#888' }}>g</span>
                  <button onClick={() => { const updated = { ...recipe, additives: recipe.additives.filter((_, idx) => idx !== i) }; setRecipe(updated); onRecipeUpdate(updated); }} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', padding: 0 }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== RIGHT COLUMN - TABBED SIDEBAR ===== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 'calc(100vh - 100px)', position: 'sticky', top: 80 }}>
        {/* Warnings Banner (always visible if any) */}
        {(hasWarnings || (currentRecipe?.validation?.length > 0)) && (
          <div style={{ padding: 8, background: '#fff8e1', border: '1px solid #ffcc80', borderRadius: 6, fontSize: '0.8em' }}>
            <div style={{ fontWeight: 'bold', color: '#e65100', marginBottom: 4 }}>⚠️ Warnings</div>
            {(currentRecipe?.validation || []).slice(0, 2).map((v, i) => (<div key={i} style={{ color: '#a64a00' }}>• {v}</div>))}
            {sfOutOfRange && (<div style={{ color: '#a64a00' }}>• Superfat outside range</div>)}
            {eoOutOfRange && (<div style={{ color: '#a64a00' }}>• EO exceeds limit</div>)}
          </div>
        )}

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: 4, background: '#f5f5f5', padding: 4, borderRadius: 8 }}>
          {[
            { id: 'summary', icon: '📊', label: 'Summary' },
            { id: 'properties', icon: '🧪', label: 'Props' },
            { id: 'presets', icon: '🎨', label: 'Presets' },
            { id: 'pricing', icon: '💰', label: 'Price' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSidebarTab(tab.id)}
              style={{
                flex: 1,
                padding: '6px 4px',
                background: sidebarTab === tab.id ? '#1565c0' : 'transparent',
                color: sidebarTab === tab.id ? '#fff' : '#666',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: '0.75em',
                fontWeight: sidebarTab === tab.id ? 600 : 400,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <span style={{ fontSize: '1.1em' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {/* Summary Tab */}
          {sidebarTab === 'summary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Live Batch Summary */}
              <div style={{ padding: 10, background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 6 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.85em' }}>
                  <div><span style={{ color: '#666' }}>Batch:</span> <strong>{computedBatchMass.toFixed(0)}g</strong></div>
                  <div><span style={{ color: '#666' }}>Bars:</span> <strong>{bars}</strong></div>
                  <div><span style={{ color: '#666' }}>NaOH:</span> <strong>{adjustedTotalNaoh.toFixed(1)}g</strong></div>
                  <div><span style={{ color: '#666' }}>Water:</span> <strong>{totalWater.toFixed(1)}g</strong></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, paddingTop: 8, borderTop: '1px solid #bbdefb', fontSize: '0.8em' }}>
                  <span style={{ color: '#666' }}>Lye:</span>
                  <input type="number" min={10} max={90} value={Number((num(recipe.lyeConcentration, 0.3) * 100).toFixed(0))} onChange={(e) => {
                    const pct = num(e.target.value, 30);
                    const dec = Math.max(0.01, Math.min(0.99, pct / 100));
                    handleInputChange('lyeConcentration', dec);
                  }} style={{ width: 45, padding: 3, border: '1px solid #ddd', borderRadius: 4, textAlign: 'center', fontSize: '0.9em' }} />
                  <span>%</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3, marginLeft: 'auto', fontSize: '0.75em', color: '#666' }}>
                    <input type="checkbox" checked={lockComputed} onChange={(e) => setLockComputed(e.target.checked)} /> Lock
                  </label>
                </div>
              </div>

              {/* Recent Recipes */}
              <div style={{ padding: 10, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 6, fontSize: '0.85em' }}>🕐 Recent</div>
                {recentRecipes.length === 0 ? (
                  <div style={{ color: '#999', fontSize: '0.8em' }}>No saved recipes</div>
                ) : (
                  <div style={{ display: 'grid', gap: 4, maxHeight: 150, overflow: 'auto' }}>
                    {recentRecipes.slice(0, 4).map((r) => (
                      <div key={r.id} onClick={() => handleLoadRecent(r)} style={{ padding: 6, background: '#fafafa', borderRadius: 4, cursor: 'pointer', border: '1px solid #eee', fontSize: '0.8em' }}>
                        <div style={{ fontWeight: 500 }}>{r.name || 'Unnamed'}</div>
                        <div style={{ color: '#666', fontSize: '0.75em' }}>{(r.oils || []).length} oils • {r.superfat || 6}% SF</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Properties Tab */}
          {sidebarTab === 'properties' && (
            <OilPropertyPreview
              oils={recipe.items.map(item => ({
                name: item.name,
                key: item.key,
                pct: num(item.pct, 0),
              }))}
              totalOilPct={totalPct}
              onAddSuggestedOil={handleAddSuggestedOil}
            />
          )}

          {/* Presets Tab */}
          {sidebarTab === 'presets' && (
            <RecipePresetsPanel
              onSelectPreset={handleApplyPreset}
              currentGoal={recipe.goal}
              currentUse={recipe.use?.[0]}
            />
          )}

          {/* Pricing Tab */}
          {sidebarTab === 'pricing' && (
            <div style={{ padding: 10, background: '#fff8f0', border: '1px solid #ffcc80', borderRadius: 6 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.85em' }}>
                <div>
                  <label style={labelStyle}>Working Cost</label>
                  <input type="number" value={recipe.cost?.working || 0} onChange={(e) => handleCostChange('working', num(e.target.value))} style={{ ...inputStyle, width: '100%' }} />
                </div>
                <div>
                  <label style={labelStyle}>Pkg/bar</label>
                  <input type="number" value={recipe.cost?.packagingPerBar || 0} onChange={(e) => handleCostChange('packagingPerBar', num(e.target.value))} style={{ ...inputStyle, width: '100%' }} />
                </div>
                <div>
                  <label style={labelStyle}>Markup %</label>
                  <input type="number" value={(recipe.pricingOptions?.markup ?? 0)} onChange={(e) => { const v = num(e.target.value); handleInputChange('pricingOptions', { ...(recipe.pricingOptions||{}), markup: v }); }} style={{ ...inputStyle, width: '100%' }} />
                </div>
                <div>
                  <label style={labelStyle}>Material</label>
                  <div style={{ padding: '6px 8px', background: '#fff', borderRadius: 4, border: '1px solid #ddd' }}>{Number(currentRecipe?.cost?.material || 0).toFixed(0)} ₹</div>
                </div>
              </div>
              {(() => {
                const perBar = Number(currentRecipe?.totals?.perBar ?? recipe.totals?.perBar ?? 0);
                const markup = Number((recipe.pricingOptions?.markup ?? 0));
                let sp = perBar * (1 + markup / 100);
                let rounded = Math.max(0, Math.round(sp / 10) * 10 - 1);
                return (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #ffe0b2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.9em' }}>
                      <span style={{ color: '#666' }}>Cost/bar:</span> <strong>{perBar.toFixed(0)} ₹</strong>
                    </div>
                    <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#1976d2' }}>
                      Sell: {rounded} ₹
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

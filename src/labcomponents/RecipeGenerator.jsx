import React, { useState, useCallback, useMemo } from "react";
import { db } from "../utils/firebase-config";
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";

const SKIN_TYPES = ["All", "Dry", "Sensitive", "Acne-prone", "Oily"];
const CREATIVE_DIRECTIONS = ["Moisturising", "Leather Rich", "Balanced"];
const USE_TYPES = ["face", "body"];

const num = (v, def = 0) => {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : def;
};

export default function RecipeGenerator({ ingredients, onSelectRecipe }) {
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [likedRecipeIds, setLikedRecipeIds] = useState(new Set());

  const oils = useMemo(() => ingredients.filter((ing) => ing.category?.toLowerCase() === "oil"), [ingredients]);
  const additives = useMemo(() => ingredients.filter((ing) => ing.category?.toLowerCase() === "additive"), [ingredients]);
  const fragrances = useMemo(() => ingredients.filter((ing) => ing.category?.toLowerCase() === "fragrance"), [ingredients]);
  const colours = useMemo(() => ingredients.filter((ing) => ing.category?.toLowerCase() === "colour"), [ingredients]);
  const alkaliIngredients = useMemo(() => ingredients.filter((ing) => ing.category?.toLowerCase() === "alkali"), [ingredients]);

  const selectRandomItems = (arr, min = 1, max = 3) => {
    if (arr.length === 0) return [];
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, arr.length));
  };

  const generateValidOilMix = (useType = "body") => {
    const selectedOils = selectRandomItems(oils, 1, 4);
    if (selectedOils.length === 0) return null;

    let percentages = selectedOils.map(() => Math.random());
    const sum = percentages.reduce((a, b) => a + b, 0);
    percentages = percentages.map((p) => Math.round((p / sum) * 100));

    const currentSum = percentages.slice(0, -1).reduce((a, b) => a + b, 0);
    percentages[percentages.length - 1] = 100 - currentSum;

    const oilMix = selectedOils.map((oil, idx) => ({
      ...oil,
      pct: percentages[idx],
    }));

    const coconutPct = oilMix.find((o) => o.name?.toLowerCase().includes("coconut"))?.pct || 0;
    const castorPct = oilMix.find((o) => o.name?.toLowerCase().includes("castor"))?.pct || 0;

    if (useType === "face" && coconutPct > 20) return null;
    if (useType === "body" && coconutPct > 30) return null;
    if (castorPct > 10) return null;

    return oilMix;
  };

  const generateRecipe = () => {
    const useType = USE_TYPES[Math.floor(Math.random() * USE_TYPES.length)];
    const skinType = SKIN_TYPES[Math.floor(Math.random() * SKIN_TYPES.length)];
    const direction = CREATIVE_DIRECTIONS[Math.floor(Math.random() * CREATIVE_DIRECTIONS.length)];

    let oilMix = null;
    for (let i = 0; i < 10; i++) {
      oilMix = generateValidOilMix(useType);
      if (oilMix) break;
    }

    if (!oilMix) return null;

    const superfat = useType === "face" ? 7 + Math.random() : 5 + Math.random() * 3;
    const selectedAdditives = selectRandomItems(additives, 0, 2);
    const selectedFragrances = selectRandomItems(fragrances, 0, 1);
    const maxEO = useType === "face" ? 1 : 2;
    const eoPercentage = selectedFragrances.length > 0 ? Math.min(Math.random() * maxEO, maxEO) : 0;
    const selectedColours = selectRandomItems(colours, 1, 2);
    
    // Auto-select first available alkali (mandatory)
    const selectedAlkali = alkaliIngredients.length > 0 ? alkaliIngredients[0] : null;

    // Calculate NaOH and Water (from lab.jsx calculations)
    const SAP = {
      olive: 0.134,
      coconut: 0.183,
      shea: 0.128,
      castor: 0.128,
      riceBran: 0.128,
      almond: 0.136,
      sesame: 0.134,
    };

    const num = (v, def = 0) => {
      const n = typeof v === "number" ? v : parseFloat(v);
      return Number.isFinite(n) ? n : def;
    };

    // Calculate oil weights
    const oilWeights = oilMix.map((oil) => ({
      ...oil,
      weight: (oil.pct / 100) * 1000, // Assuming 1000g default batch
    }));

    // Calculate NaOH required
    const sf = Math.min(Math.max(superfat, 0), 20) / 100;
    const sapFor = (it) =>
      it.sap ??
      SAP[it.key] ??
      (it.name ? SAP[it.name.toLowerCase()] : undefined) ??
      0;
    const base = oilWeights.reduce((sum, it) => sum + it.weight * sapFor(it), 0);
    const lyeRequired = base * (1 - sf);

    // Calculate water required
    const lyeConcentration = 0.3;
    const waterWeight = (lyeRequired / lyeConcentration) - lyeRequired;

    return {
      id: Date.now() + Math.random(),
      name: `Recipe ${Date.now()}`,
      use: [useType],
      skinType: [skinType],
      goal: direction,
      oils: oilMix.map((o) => ({
        key: o.key,
        name: o.name,
        pct: o.pct,
      })),
      superfat: Math.round(superfat * 10) / 10,
      additives: selectedAdditives.map((a) => ({ key: a.key, name: a.name })),
      fragrances: selectedFragrances.map((f) => ({ key: f.key, name: f.name, pct: eoPercentage / selectedFragrances.length })),
      colours: selectedColours.map((c) => ({ key: c.key, name: c.name })),
      alkali: selectedAlkali ? {
        name: selectedAlkali.name,
        key: selectedAlkali.key || selectedAlkali.firebaseId,
        costPerUnit: selectedAlkali.costPerUnit,
        unit: selectedAlkali.unit,
      } : { name: "", key: "" },
      lyeRequired: Math.round(lyeRequired * 100) / 100,
      waterWeight: Math.round(waterWeight * 100) / 100,
      lyeConcentration: 0.3,
      totalOilWeight: 1000,
      batchSize: 1000,
      barWeight: 100,
      cost: { material: 0, working: 0, packaging: 0 },
      createdAt: new Date().toISOString(),
    };
  };

  const handleGenerateRecipes = useCallback(() => {
    if (oils.length === 0) {
      alert("No oils available. Please add oils first.");
      return;
    }
    if (alkaliIngredients.length === 0) {
      alert("No alkali (NaOH) available. Please add an alkali ingredient first.");
      return;
    }

    setLoading(true);
    const recipes = [];
    for (let i = 0; i < 4; i++) {
      const recipe = generateRecipe();
      if (recipe) recipes.push(recipe);
    }
    setGeneratedRecipes(recipes);
    setLikedRecipeIds(new Set());
    setLoading(false);
  }, [oils, additives, fragrances, colours, alkaliIngredients]);

  const handleLikeRecipe = async (recipeId) => {
    const recipe = generatedRecipes.find((r) => r.id === recipeId);
    if (!recipe) return;

    try {
      const recipeToSave = {
        ...recipe,
        liked: true,
        likedAt: new Date().toISOString(),
      };
      await addDoc(collection(db, "recipes"), recipeToSave);
      setLikedRecipeIds((prev) => new Set([...prev, recipeId]));
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Failed to save recipe");
    }
  };

  return (
    <div style={{ marginTop: 24, padding: 16, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2em", color: "#333" }}>🧪 Recipe Generator</h3>

      <button
        onClick={handleGenerateRecipes}
        disabled={loading}
        style={{ padding: "10px 20px", background: "#FF6B6B", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: "1em", fontWeight: "bold" }}
      >
        {loading ? "Generating..." : "Generate 4 Recipes"}
      </button>

      {generatedRecipes.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h4 style={{ color: "#666", marginBottom: 12 }}>Generated Recipes</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {generatedRecipes.map((recipe) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                onLike={() => handleLikeRecipe(recipe.id)} 
                liked={likedRecipeIds.has(recipe.id)}
                onSelect={() => onSelectRecipe(recipe)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecipeCard({ recipe, onLike, liked, onSelect }) {
  return (
    <div 
      onClick={onSelect}
      style={{ 
        border: "1px solid #e3e3e3", 
        borderRadius: 8, 
        padding: 12, 
        background: "#fff", 
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "1.1em", marginBottom: 8 }}>
        {recipe.use?.[0]?.toUpperCase()} | {recipe.goal || "Balanced"}
      </div>
      <div style={{ fontSize: "0.9em", color: "#666", marginBottom: 12 }}>
        <div><strong>Skin Type:</strong> {recipe.skinType?.[0]}</div>
        <div><strong>Superfat:</strong> {recipe.superfat}%</div>
        {recipe.colours?.length > 0 && <div><strong>Colours:</strong> {recipe.colours.map((c) => c.name).join(", ")}</div>}
      </div>
      <div style={{ fontSize: "0.85em", marginBottom: 12 }}>
        <strong>Oil Mix:</strong>
        {recipe.oils?.map((o) => (
          <div key={o.key}>{o.name}: {o.pct}%</div>
        ))}
      </div>
      {recipe.additives?.length > 0 && (
        <div style={{ fontSize: "0.85em", marginBottom: 12 }}>
          <strong>Additives:</strong> {recipe.additives.map((a) => a.name).join(", ")}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          disabled={liked}
          style={{ flex: 1, padding: "8px", background: liked ? "#ccc" : "#4CAF50", color: "#fff", border: "none", borderRadius: 4, cursor: liked ? "default" : "pointer", fontSize: "0.9em" }}
        >
          {liked ? "❤️ Saved" : "🤍 Like"}
        </button>
      </div>
    </div>
  );
}

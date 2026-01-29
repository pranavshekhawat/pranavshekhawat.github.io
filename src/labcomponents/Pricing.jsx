import React, { useState, useEffect } from "react";

const num = (v, def = 0) => {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : def;
};

export default function Pricing({ recipe, onRecipeUpdate, ingredients }) {
  const [packagingPerBar, setPackagingPerBar] = useState(0);
  const [markupPct, setMarkupPct] = useState(null);
  const [workingCost, setWorkingCost] = useState(0);

  useEffect(() => {
    setWorkingCost(num(recipe?.cost?.working, 0));
    const bars = num(recipe?.totals?.bars, Math.max(1, Math.round(num(recipe.batchSize || 1000) / num(recipe.barWeight || 100))));
    // sync packagingPerBar from stored packaging (assume stored packaging is total packaging cost)
    setPackagingPerBar(bars ? num(recipe?.cost?.packaging, 0) / bars : 0);
    // sync markup from pricingOptions if provided
    if (recipe?.pricingOptions?.margin != null) setMarkupPct(num(recipe.pricingOptions.margin, 0));
  }, [recipe]);

  const handleWorkingCostChange = (value) => {
    const newValue = num(value, 0);
    setWorkingCost(newValue);
    if (onRecipeUpdate) {
      onRecipeUpdate({ cost: { ...recipe.cost, working: newValue } });
    }
  };

  const handlePackagingChange = (val) => {
    const perBar = num(val, 0);
    setPackagingPerBar(perBar);
    const bars = num(recipe?.totals?.bars, Math.max(1, Math.round(num(recipe.batchSize || 1000) / num(recipe.barWeight || 100))));
    const totalPackaging = perBar * bars;
    if (onRecipeUpdate) onRecipeUpdate({ cost: { ...recipe.cost, packaging: totalPackaging } });
  };

  const handleMarkupChange = (val) => {
    const pct = num(val, 0);
    setMarkupPct(pct);
    if (onRecipeUpdate) onRecipeUpdate({ pricingOptions: { ...recipe.pricingOptions, margin: pct } });
  };

  // Get NaOH details
  const naohIngredient = ingredients?.find((ing) => (ing.category || "").toLowerCase() === "alkali");
  const naohCostPerUnit = num(naohIngredient?.costPerUnit, 0);
  const naohUnit = naohIngredient?.unit || "kg";

  const naohRequired = num(recipe?.lyeRequired, 0);
  const naohCostPerGram = naohUnit.toLowerCase() === "kg" ? naohCostPerUnit / 1000 : naohCostPerUnit;
  const naohTotalCost = naohRequired * naohCostPerGram;

  const totalCost = num(recipe?.totals?.totalCost, 0);
  const materialCost = num(recipe?.cost?.material, 0);
  const bars = num(recipe?.totals?.bars, Math.max(1, Math.round(num(recipe.batchSize || 1000) / num(recipe.barWeight || 100))));

  // Use centralized pricing if available
  const enginePricing = recipe?.pricing || {};

  // Compute displayed values including packaging/markup entered in UI.
  // NOTE: `totalCost` from engine already includes material (including NaOH), working, and packaging
  // so we must not add `naohTotalCost` (would double-count) or re-add packaging here.
  const packagingTotal = packagingPerBar * bars;
  const totalWithPackaging = totalCost; // authoritative total from engine
  const costPerBarWithPackaging = bars ? totalWithPackaging / bars : totalWithPackaging;

  // If markupPct is set from UI use it, otherwise prefer engine margin-based sellingPrice
  let sellingPrice = enginePricing.sellingPrice ?? 0;
  let profitPerBar = enginePricing.profit ?? Math.max(0, sellingPrice - costPerBarWithPackaging);
  if (markupPct != null) {
    sellingPrice = costPerBarWithPackaging * (1 + markupPct / 100);
    profitPerBar = sellingPrice - costPerBarWithPackaging;
  }

  return (
    <div style={{ marginTop: 24, padding: 16, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2em", color: "#333" }}>💰 Pricing Calculator</h3>

      {/* Inputs Section */}
      <div style={{ padding: 12, background: "#f5f5f5", borderRadius: 4, marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 12px 0" }}>⚙️ Configuration</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <label>
            <strong>Packaging Cost/Bar (₹):</strong>
            <input
              type="number"
              value={packagingPerBar}
              onChange={(e) => handlePackagingChange(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4, border: "1px solid #ddd", borderRadius: 4 }}
            />
          </label>
          <label>
            <strong>Markup % (optional):</strong>
            <input
              type="number"
              value={markupPct ?? ""}
              onChange={(e) => handleMarkupChange(e.target.value)}
              placeholder={enginePricing.margin != null ? String(enginePricing.margin) : ""
              }
              style={{ width: "100%", padding: 8, marginTop: 4, border: "1px solid #ddd", borderRadius: 4 }}
            />
          </label>
          <label>
            <strong>Working Cost (₹):</strong>
            <input
              type="number"
              value={workingCost}
              onChange={(e) => handleWorkingCostChange(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4, border: "1px solid #ddd", borderRadius: 4 }}
            />
          </label>
        </div>
      </div>

      {/* Results Section */}
      <div style={{ padding: 16, background: "#e3f2fd", borderRadius: 4, border: "2px solid #2196F3" }}>
        <h4 style={{ margin: "0 0 12px 0", color: "#1976D2" }}>📊 Results</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <div>
            <div style={{ fontSize: "0.9em", color: "#666" }}>Batch Weight</div>
            <div style={{ fontSize: "1.2em", fontWeight: "bold", color: "#1976D2" }}>{num(recipe.batchSize || 1000)} g</div>
          </div>
          <div>
            <div style={{ fontSize: "0.9em", color: "#666" }}>Oil Cost</div>
            <div style={{ fontSize: "1.2em", fontWeight: "bold", color: "#1976D2" }}>₹{materialCost.toFixed(2)}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.9em", color: "#666" }}>NaOH Cost</div>
            <div style={{ fontSize: "1.2em", fontWeight: "bold", color: "#1976D2" }}>₹{naohTotalCost.toFixed(2)}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.9em", color: "#666" }}>Total Material Cost</div>
            <div style={{ fontSize: "1.2em", fontWeight: "bold", color: "#1976D2" }}>₹{(materialCost + naohTotalCost).toFixed(2)}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.9em", color: "#666" }}>Estimated Bars</div>
            <div style={{ fontSize: "1.2em", fontWeight: "bold", color: "#1976D2" }}>{bars}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.9em", color: "#666" }}>Cost per Bar</div>
            <div style={{ fontSize: "1.2em", fontWeight: "bold", color: "#1976D2" }}>₹{costPerBarWithPackaging.toFixed(2)}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.9em", color: "#666" }}>Selling Price</div>
            <div style={{ fontSize: "1.4em", fontWeight: "bold", color: "#4CAF50" }}>₹{sellingPrice.toFixed(2)}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.9em", color: "#666" }}>Profit per Bar</div>
            <div style={{ fontSize: "1.4em", fontWeight: "bold", color: "#4CAF50" }}>₹{profitPerBar.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

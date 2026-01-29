import React, { useState, useEffect } from "react";
import { db } from "../utils/firebase-config";
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default function SavedRecipesList({ onSelectRecipe }) {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recipesRef = collection(db, "recipes");
    const unsubscribe = onSnapshot(
      recipesRef,
      (snapshot) => {
        const recipes = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          firebaseId: docSnap.id,
        }));
        setSavedRecipes(recipes);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching recipes:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDeleteRecipe = async (firebaseId) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      try {
        await deleteDoc(doc(db, "recipes", firebaseId));
      } catch (error) {
        console.error("Error deleting recipe:", error);
        alert("Failed to delete recipe");
      }
    }
  };

  return (
    <div style={{ marginTop: 32, padding: 16, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2em", color: "#333" }}>
        📚 All Saved Recipes ({savedRecipes.length})
      </h3>

      {loading && <div style={{ color: "#666", textAlign: "center", padding: 20 }}>Loading recipes...</div>}

      {!loading && savedRecipes.length === 0 && (
        <div style={{ color: "#666", fontStyle: "italic", padding: 20, textAlign: "center" }}>
          No saved recipes yet. Create and save a recipe to see it here!
        </div>
      )}

      {!loading && savedRecipes.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {savedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.firebaseId}
              recipe={recipe}
              onSelect={() => onSelectRecipe(recipe)}
              onDelete={() => handleDeleteRecipe(recipe.firebaseId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RecipeCard({ recipe, onSelect, onDelete }) {
  const [expanded, setExpanded] = React.useState(false);
  const createdDate = recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : "Unknown";
  const totalOilPct = (recipe.perOilDetails && recipe.perOilDetails.length > 0)
    ? recipe.perOilDetails.reduce((s, oil) => s + (oil.pct || 0), 0)
    : (recipe.oils?.reduce((sum, oil) => sum + (oil.pct || 0), 0) || 0);

  return (
    <div
      style={{
        border: "2px solid #2196F3",
        borderRadius: 8,
        padding: 16,
        background: "#fff",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)";
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: "bold", fontSize: "1.15em", color: "#1976D2", marginBottom: 4 }}>
          {recipe.name && String(recipe.name).trim() !== "" ? recipe.name : `${recipe.use?.[0]?.toUpperCase() || "Recipe"} | ${recipe.goal || "Balanced"}`}
        </div>
        <div style={{ fontSize: "0.9em", color: "#666", marginBottom: 6 }}>
          {Array.isArray(recipe.use) ? recipe.use.join(" / ") : recipe.use || ""} {recipe.goal ? ` | ${recipe.goal}` : ""}
        </div>
        <div style={{ fontSize: "0.85em", color: "#666" }}>
          📅 Saved: {createdDate}
        </div>
      </div>

      {/* Compact Batch Summary */}
      <div style={{ marginBottom: 12, padding: 10, background: '#fafafa', borderRadius: 6, border: '1px solid #eee' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 600 }}>Batch Summary</div>
          <div style={{ color: '#1976D2' }}>{recipe.computedBatchMass ? `${Number(recipe.computedBatchMass).toFixed(0)} g` : (recipe.batchSize ? `${Number(recipe.batchSize).toFixed(0)} g` : '—')}</div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, color: '#444' }}>
          <div>Bars: {recipe.bars || (recipe.barWeight ? Math.max(1, Math.round((recipe.computedBatchMass || recipe.batchSize || 0) / recipe.barWeight)) : '—')}</div>
          <div>Per-bar: {recipe.barWeight ? `${Number(recipe.barWeight).toFixed(0)} g` : '—'}</div>
          <div>NaOH: {recipe.adjustedTotalNaoh ? `${Number(recipe.adjustedTotalNaoh).toFixed(1)} g` : (recipe.lyeRequired ? `${Number(recipe.lyeRequired).toFixed(1)} g` : '—')}</div>
          <div>Water: {recipe.waterWeight ? `${Number(recipe.waterWeight).toFixed(1)} g` : '—'}</div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, color: '#444', fontSize: '0.9em' }}>
          <div>Working: {recipe.cost?.working != null ? `${Number(recipe.cost.working).toFixed(2)} ₹` : '—'}</div>
          <div>Pack/bar: {recipe.cost?.packagingPerBar != null ? `${Number(recipe.cost.packagingPerBar).toFixed(2)} ₹` : '—'}</div>
          <div>Markup: {recipe.pricingOptions?.markup != null ? `${Number(recipe.pricingOptions.markup).toFixed(1)}%` : '—'}</div>
          <div>Sell/bar: { (recipe.pricingOptions?.computedSellingPerBar != null) ? `${Number(recipe.pricingOptions.computedSellingPerBar).toFixed(2)} ₹` : (recipe.pricing?.sellingPrice != null ? `${Number(recipe.pricing.sellingPrice).toFixed(2)} ₹` : '—') }</div>
        </div>
      </div>

      {/* Preview (first oil / additive) */}
      <div style={{ marginBottom: 12, color: '#666' }}>
        {(recipe.perOilDetails || recipe.oils || []).slice(0,1).map((oil, i) => (
          <div key={i}>• {oil.name || oil.key} — {oil.pct}% {oil.weight ? `(${Number(oil.weight).toFixed(0)} g)` : ''}</div>
        ))}
        {(recipe.additives || []).slice(0,1).map((a, i) => (
          <div key={i}>• {a.name} — {Number(a.amount || 0).toFixed(2)} {a.unit || 'g'}</div>
        ))}
      </div>

      {/* Details (expandable) */}
      {expanded && (
        <div style={{ fontSize: "0.9em", color: "#555", marginBottom: 12, display: "grid", gap: 6 }}>
          <div><strong>Skin Type:</strong> {recipe.skinType?.[0] || "All"}</div>
          <div><strong>Superfat:</strong> {recipe.superfat || 0}%</div>
          <div><strong>Oil Mix:</strong> {totalOilPct}% ✓</div>
          {recipe.notes && (
            <div><strong>Notes:</strong> {recipe.notes}</div>
          )}
          {recipe.colours?.length > 0 && (
            <div><strong>Colours:</strong> {recipe.colours.map((c) => c.name).join(", ")}</div>
          )}
          {recipe.additives?.length > 0 && (
            <div>
              <strong>Additives:</strong>
              <div style={{ marginTop: 6, display: 'grid', gap: 6 }}>
                {(recipe.additives || []).map((a, i) => (
                  <div key={i} style={{ color: '#666' }}>
                    • {a.name} — {Number(a.amount || 0).toFixed(2)} {a.unit || 'g'}{a.appliesTo ? ` — ${a.appliesTo}` : ''}{a.whenAdded ? ` (${a.whenAdded})` : ''}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

        <div style={{ fontSize: "0.85em", marginBottom: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
        <strong>Oils:</strong>
        <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
          {(recipe.perOilDetails || recipe.oils || []).slice(0, 3).map((oil, idx) => (
            <div key={idx} style={{ color: "#666" }}>
              • {oil.name || oil?.key}: {oil.pct}%
              {oil.weight != null && (<span> — {Number(oil.weight || 0).toFixed(2)} g</span>)}
            </div>
          ))}
          {(recipe.perOilDetails || recipe.oils || []).length > 3 && (
            <div style={{ color: "#666", fontStyle: "italic" }}>
              + {(recipe.perOilDetails || recipe.oils).length - 3} more oils
            </div>
          )}

        </div>
        {(recipe.adjustedTotalNaoh || recipe.lyeRequired || recipe.waterWeight) && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #f0f0f0" }}>
            <strong>Chemicals:</strong>
            { (recipe.adjustedTotalNaoh != null) && (
              <div style={{ marginTop: 4, color: "#666" }}>
                • NaOH (adjusted): {Number(recipe.adjustedTotalNaoh).toFixed(2)} g
              </div>
            ) }
            { (recipe.baseTotalNaoh != null) && (
              <div style={{ color: "#666" }}>
                • NaOH (base): {Number(recipe.baseTotalNaoh).toFixed(2)} g
              </div>
            ) }
            { (recipe.waterWeight != null) && (
              <div style={{ color: "#666" }}>
                • Water: {Number(recipe.waterWeight).toFixed(2)} g
              </div>
            ) }
            {recipe.alkali?.name && (
              <div style={{ fontSize: "0.8em", color: "#666", marginTop: 2 }}>
                Using: {recipe.alkali.name}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => onSelect && onSelect()}
          style={{
            flex: 1,
            padding: "10px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: "0.9em",
            fontWeight: "bold",
          }}
        >
          ✏️ Duplicate & Edit
        </button>
        <button
          onClick={() => setExpanded((s) => !s)}
          style={{
            padding: "10px",
            background: "#e0e0e0",
            color: "#333",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: "0.9em",
          }}
        >
          {expanded ? 'Hide Details' : 'View Details'}
        </button>
        <button
          onClick={onDelete}
          style={{
            padding: "10px",
            background: "#f44336",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: "0.9em",
            fontWeight: "bold",
          }}
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
}

import React, { useState } from "react";

// Import centralized utilities
import { SAP_PRESETS } from "./utils/sapValues";
import { OIL_GROUPS, LATHER_TYPES, TRACE_SPEEDS } from "./utils/validationRules";

const CATEGORIES = ["Oil", "Additive", "Fragrance", "Colour", "Alkali"];
const ADDITIVE_TYPES = ["Clay", "Herb", "Scrub", "Liquid", "Functional"];
const SUITABILITY_OPTIONS = ["All", "Dry", "Sensitive", "Acne-prone", "Oily"];
const SCALE_OPTIONS = ["Low", "Medium", "High"];

export default function AddIngredient({ onAdd }) {
  const [category, setCategory] = useState("Oil");
  const [form, setForm] = useState({
    name: "",
    cost: "",
    unit: "kg",
    stock: "",
    sap: "",
    lather: "Medium",
    hardness: "Medium",
    faceSafe: true,
    type: "oil",
    recommendedMaxPct: 70,
    faceMaxPct: 100,
    absoluteMaxPct: 100,
    oilGroup: "conditioning",
    latherType: "creamy",
    traceSpeed: "medium",
    subType: "Clay",
    colour: "",
    maxFacePct: "",
    maxBodyPct: "",
    skinSuitability: [],
    expiryDate: "", // New: track ingredient expiry
    purchaseDate: "", // New: track purchase date
    supplier: "", // New: track supplier
  });

  function getInitialForm(cat) {
    return {
      name: "",
      cost: "",
      unit: "kg",
      stock: "",
      sap: "",
      lather: "Medium",
      hardness: "Medium",
      faceSafe: true,
      expiryDate: "",
      purchaseDate: "",
      supplier: "",
      recommendedMaxPct: 70,
      faceMaxPct: 100,
      absoluteMaxPct: 100,
      oilGroup: "conditioning",
      latherType: "creamy",
      traceSpeed: "medium",
      subType: "Clay",
      colour: "",
      maxFacePct: "",
      maxBodyPct: "",
      skinSuitability: [],
    };
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSuitability = (type) => {
    setForm((prev) => {
      const current = prev.skinSuitability || [];
      if (current.includes(type)) {
        return { ...prev, skinSuitability: current.filter((t) => t !== type) };
      }
      return { ...prev, skinSuitability: [...current, type] };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;

    const base = {
      category: category.toLowerCase(),
      key: form.name.toLowerCase().replace(/\s+/g, "_"),
      name: form.name,
      costPerUnit: Number(form.cost) || 0,
      unit: form.unit,
      stock: Number(form.stock) || 0,
      // New: expiry and purchase tracking
      expiryDate: form.expiryDate || null,
      purchaseDate: form.purchaseDate || null,
      supplier: form.supplier || null,
    };

    let result = { ...base };

    if (category === "Oil") {
      result = {
        ...result,
        sap: Number(form.sap) || 0,
        properties: {
          lather: form.lather,
          hardness: form.hardness,
        },
        faceSafe: form.faceSafe,
        recommendedMaxPct: Number(form.recommendedMaxPct) || 70,
        faceMaxPct: Number(form.faceMaxPct) || 100,
        absoluteMaxPct: Number(form.absoluteMaxPct) || 100,
        oilGroup: form.oilGroup,
        latherType: form.latherType,
        traceSpeed: form.traceSpeed,
      };
    } else if (category === "Additive") {
      result = {
        ...result,
        type: form.subType,
        skin: form.skinSuitability.length ? form.skinSuitability : ["All"],
        colour: form.colour,
        faceSafe: form.faceSafe,
      };
    } else if (category === "Fragrance") {
      result = {
        ...result,
        maxFacePct: Number(form.maxFacePct) || 0,
        maxBodyPct: Number(form.maxBodyPct) || 0,
        skin: form.skinSuitability.length ? form.skinSuitability : ["All"],
      };
    } else if (category === "Colour") {
      result = {
        ...result,
        sources: [form.name],
        faceSafe: form.faceSafe,
      };
    } else if (category === "Alkali") {
      result = {
        ...result,
        maxFacePct: Number(form.maxFacePct) || 0,
        maxBodyPct: Number(form.maxBodyPct) || 0,
        skin: form.skinSuitability.length ? form.skinSuitability : ["All"],
      };
    }

    onAdd(result);
    setForm(getInitialForm(category));
  };

  return (
    <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8, background: "#fff" }}>
      <h3 style={{ marginTop: 0 }}>Add New Component</h3>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: "bold", marginRight: 8 }}>Type:</label>
        <select 
          value={category} 
          onChange={(e) => {
            setCategory(e.target.value);
            setForm(getInitialForm(e.target.value));
          }}
          style={{ padding: 6, borderRadius: 4 }}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8 }}>
          <label>
            <div style={{ fontSize: "0.85em", color: "#666" }}>Name</div>
            <input 
              style={{ width: "100%", padding: 6 }} 
              placeholder="e.g. Olive Oil"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </label>
          <label>
            <div style={{ fontSize: "0.85em", color: "#666" }}>Cost</div>
            <input 
              type="number" 
              style={{ width: "100%", padding: 6 }} 
              placeholder="0.00"
              value={form.cost}
              onChange={(e) => handleChange("cost", e.target.value)}
            />
          </label>
          <div>
            <label>
              <div style={{ fontSize: "0.85em", color: "#666" }}>Unit</div>
              <select 
                style={{ width: "100%", padding: 6 }}
                value={form.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="l">l</option>
                <option value="ml">ml</option>
              </select>
            </label>
            <div style={{ fontSize: "0.75em", color: "#666", marginTop: 4 }}>
              (per unit of {form.unit})
            </div>
          </div>
        </div>

        <div style={{ padding: 12, background: "#f8f9fa", borderRadius: 6, border: "1px solid #eee" }}>
          <div style={{ marginBottom: 8, fontWeight: "bold", fontSize: "0.9em", color: "#555" }}>
            {category} Properties
          </div>
          
          {category === "Oil" && (
            <div style={{ display: "grid", gap: 12 }}>
              {/* SAP Preset Selector */}
              <div style={{ padding: 10, background: '#e3f2fd', borderRadius: 6, border: '1px solid #90caf9' }}>
                <div style={{ fontSize: "0.85em", fontWeight: 500, color: "#1565c0", marginBottom: 8 }}>
                  📋 Quick Select from Standard Oils/Butters
                </div>
                <select 
                  style={{ width: "100%", padding: 8, borderRadius: 4, border: '1px solid #90caf9', background: '#fff' }}
                  value=""
                  onChange={(e) => {
                    const preset = SAP_PRESETS.find(p => p.name === e.target.value);
                    if (preset) {
                      setForm(prev => ({
                        ...prev,
                        name: preset.name,
                        sap: preset.sap,
                        oilGroup: preset.oilGroup,
                        latherType: preset.latherType,
                        traceSpeed: preset.traceSpeed,
                        hardness: preset.hardness,
                        recommendedMaxPct: preset.recommendedMaxPct,
                        absoluteMaxPct: preset.absoluteMaxPct,
                        faceMaxPct: preset.absoluteMaxPct,
                      }));
                    }
                  }}
                >
                  <option value="">-- Select a standard oil/butter --</option>
                  <optgroup label="🫒 Common Oils">
                    {SAP_PRESETS.filter(p => p.oilGroup !== 'butter').map(p => (
                      <option key={p.name} value={p.name}>{p.name} (SAP: {p.sap})</option>
                    ))}
                  </optgroup>
                  <optgroup label="🧈 Butters">
                    {SAP_PRESETS.filter(p => p.oilGroup === 'butter').map(p => (
                      <option key={p.name} value={p.name}>{p.name} (SAP: {p.sap})</option>
                    ))}
                  </optgroup>
                </select>
                <div style={{ fontSize: "0.75em", color: "#666", marginTop: 4 }}>
                  Select to auto-fill name, SAP, and recommended properties
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <label>
                  <div style={{ fontSize: "0.8em" }}>SAP Value (NaOH)</div>
                  <input type="number" step="0.001" style={{ width: "100%" }} value={form.sap} onChange={e => handleChange("sap", e.target.value)} required placeholder="0.134" />
                </label>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <label>
                  <div style={{ fontSize: "0.8em" }}>Recommended Max %</div>
                  <input type="number" style={{ width: "100%" }} value={form.recommendedMaxPct} onChange={e => handleChange("recommendedMaxPct", e.target.value)} placeholder="70" />
                </label>
                <label>
                  <div style={{ fontSize: "0.8em" }}>Face Max %</div>
                  <input type="number" style={{ width: "100%" }} value={form.faceMaxPct} onChange={e => handleChange("faceMaxPct", e.target.value)} placeholder="100" />
                </label>
                <label>
                  <div style={{ fontSize: "0.8em" }}>Absolute Max %</div>
                  <input type="number" style={{ width: "100%" }} value={form.absoluteMaxPct} onChange={e => handleChange("absoluteMaxPct", e.target.value)} placeholder="100" />
                </label>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                <label>
                  <div style={{ fontSize: "0.8em" }}>Hardness</div>
                  <select style={{ width: "100%" }} value={form.hardness} onChange={e => handleChange("hardness", e.target.value)}>
                    {SCALE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>
                <label>
                  <div style={{ fontSize: "0.8em" }}>Oil Group</div>
                  <select style={{ width: "100%" }} value={form.oilGroup} onChange={e => handleChange("oilGroup", e.target.value)}>
                    {OIL_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </label>
                <label>
                  <div style={{ fontSize: "0.8em" }}>Lather Type</div>
                  <select style={{ width: "100%" }} value={form.latherType} onChange={e => handleChange("latherType", e.target.value)}>
                    {LATHER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label>
                  <div style={{ fontSize: "0.8em" }}>Trace Speed</div>
                  <select style={{ width: "100%" }} value={form.traceSpeed} onChange={e => handleChange("traceSpeed", e.target.value)}>
                    {TRACE_SPEEDS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9em" }}>
                <input type="checkbox" checked={form.faceSafe} onChange={e => handleChange("faceSafe", e.target.checked)} />
                Safe for Face Use?
              </label>
            </div>
          )}

          {category === "Additive" && (
            <div style={{ display: "grid", gap: 8 }}>
               <label>
                  <div style={{ fontSize: "0.8em" }}>Additive Type</div>
                  <select style={{ width: "100%", padding: 6 }} value={form.subType} onChange={e => handleChange("subType", e.target.value)}>
                    {ADDITIVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
               </label>
               <label>
                  <div style={{ fontSize: "0.8em" }}>Imparts Colour? (Optional)</div>
                  <input type="text" style={{ width: "100%", padding: 6 }} placeholder="e.g. Pink" value={form.colour} onChange={e => handleChange("colour", e.target.value)} />
               </label>
               <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9em" }}>
                <input type="checkbox" checked={form.faceSafe} onChange={e => handleChange("faceSafe", e.target.checked)} />
                Safe for Face Use?
              </label>
            </div>
          )}

          {category === "Fragrance" && (
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <label>
                  <div style={{ fontSize: "0.8em" }}>Max Face %</div>
                  <input type="number" step="0.1" style={{ width: "100%" }} value={form.maxFacePct} onChange={e => handleChange("maxFacePct", e.target.value)} />
                </label>
                <label>
                  <div style={{ fontSize: "0.8em" }}>Max Body %</div>
                  <input type="number" step="0.1" style={{ width: "100%" }} value={form.maxBodyPct} onChange={e => handleChange("maxBodyPct", e.target.value)} />
                </label>
             </div>
          )}

          {(category === "Additive" || category === "Fragrance") && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: "0.8em", marginBottom: 4 }}>Skin Suitability:</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SUITABILITY_OPTIONS.map(opt => (
                  <label key={opt} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.85em", background: "#fff", padding: "2px 6px", border: "1px solid #ccc", borderRadius: 12 }}>
                    <input 
                      type="checkbox" 
                      checked={(form.skinSuitability || []).includes(opt)}
                      onChange={() => toggleSuitability(opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          )}

          {category === "Colour" && (
            <div style={{ display: "grid", gap: 8 }}>
               <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9em" }}>
                <input type="checkbox" checked={form.faceSafe} onChange={e => handleChange("faceSafe", e.target.checked)} />
                Safe for Face Use?
              </label>
            </div>
          )}
        </div>

        {/* Stock, Expiry, Purchase & Supplier Section */}
        <div style={{ padding: 12, background: "#fff3e0", borderRadius: 6, border: "1px solid #ffcc80" }}>
          <div style={{ marginBottom: 8, fontWeight: "bold", fontSize: "0.9em", color: "#e65100" }}>
            📦 Stock & Tracking
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            <label>
              <div style={{ fontSize: "0.8em", color: "#666" }}>Stock Available</div>
              <input 
                type="number"
                style={{ width: "100%", padding: 6 }}
                placeholder="0"
                value={form.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
              />
            </label>
            <label>
              <div style={{ fontSize: "0.8em", color: "#666" }}>Purchase Date</div>
              <input 
                type="date"
                style={{ width: "100%", padding: 6 }}
                value={form.purchaseDate}
                onChange={(e) => handleChange("purchaseDate", e.target.value)}
              />
            </label>
            <label>
              <div style={{ fontSize: "0.8em", color: "#666" }}>Expiry Date</div>
              <input 
                type="date"
                style={{ width: "100%", padding: 6 }}
                value={form.expiryDate}
                onChange={(e) => handleChange("expiryDate", e.target.value)}
              />
            </label>
            <label>
              <div style={{ fontSize: "0.8em", color: "#666" }}>Supplier</div>
              <input 
                type="text"
                style={{ width: "100%", padding: 6 }}
                placeholder="Supplier name"
                value={form.supplier}
                onChange={(e) => handleChange("supplier", e.target.value)}
              />
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          style={{ 
            padding: 10, 
            background: "#2196F3", 
            color: "white", 
            border: "none", 
            borderRadius: 6, 
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1em"
          }}
        >
          Add {category} To Inventory
        </button>
      </form>
    </div>
  );
}

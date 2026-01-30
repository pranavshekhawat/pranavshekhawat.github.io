import React, { useState, useEffect, useMemo } from "react";
import { 
  subscribeToUserCollection, 
  addUserDoc, 
  updateUserDoc, 
  deleteUserDoc 
} from "../utils/userDataHelper";
import AddIngredient from "./AddIngredient";
import LabNavbar from "./LabNavbar";

// enums and helpers for oil metadata
const OIL_GROUPS = ["conditioning", "cleansing", "butter", "lather_booster"];
const LATHER_TYPES = ["low", "creamy", "bubbly"];
const TRACE_SPEEDS = ["slow", "medium", "fast"];
const isOil = (ing = {}) => {
  const t = (ing.type || ing.category || "").toLowerCase();
  return t.includes("oil");
};

const num = (v, def = 0) => {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : def;
};

const PLACEHOLDER_IMG = "https://via.placeholder.com/400x260?text=Ingredient";
const getIngredientImage = (name = "ingredient") =>
  `https://dummyimage.com/400x260/eeeeee/333333&text=${encodeURIComponent(name)}`;

export default function Inventory() {
  const [ingredients, setIngredients] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [ingredientImages, setIngredientImages] = useState({});

  // Fetch ingredients from user's collection on mount
  useEffect(() => {
    let unsubscribe = () => {};
    
    try {
      unsubscribe = subscribeToUserCollection(
        'ingredients',
        (loadedIngredients) => {
          // Map 'id' to 'firebaseId' for compatibility
          const mappedIngredients = loadedIngredients.map(ing => ({
            ...ing,
            firebaseId: ing.id,
          }));
          setIngredients(mappedIngredients);
        }
      );
    } catch (error) {
      console.error("Error setting up ingredients subscription:", error);
    }
    
    return () => unsubscribe();
  }, []);

  // Fetch Wikipedia images for ingredients
  useEffect(() => {
    const namesToFetch = ingredients
      .map((i) => i.name || i.key)
      .filter(Boolean)
      .filter((n) => !ingredientImages[n]);

    if (namesToFetch.length === 0) return;

    const fetchFor = async (name) => {
      try {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(name)}&origin=*`;
        const sres = await fetch(searchUrl).then((r) => r.json());
        const first = sres?.query?.search?.[0];
        if (!first) return null;
        const title = first.title;

        const thumbUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(title)}&pithumbsize=400&origin=*`;
        const pres = await fetch(thumbUrl).then((r) => r.json());
        const pages = pres?.query?.pages || {};
        const page = Object.values(pages)[0];
        return page?.thumbnail?.source || null;
      } catch {
        return null;
      }
    };

    let mounted = true;
    (async () => {
      const updates = {};
      for (const n of namesToFetch) {
        const url = await fetchFor(n);
        if (url && mounted) updates[n] = url;
      }
      if (mounted && Object.keys(updates).length) {
        setIngredientImages((prev) => ({ ...prev, ...updates }));
      }
    })();
    return () => { mounted = false; };
  }, [ingredients, ingredientImages]);

  const groupedIngredients = useMemo(() => {
    const groups = {};
    ingredients.forEach((ing) => {
      const cat = (ing.category || ing.type || "other").toLowerCase();
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(ing);
    });
    return groups;
  }, [ingredients]);

  const handleAddIngredient = async (ing) => {
    const normalized = { ...ing };
    if (isOil(normalized)) {
      normalized.recommendedMaxPct = num(normalized.recommendedMaxPct, 70);
      normalized.faceMaxPct = num(normalized.faceMaxPct, 100);
      normalized.absoluteMaxPct = num(normalized.absoluteMaxPct, 100);
      const og = String(normalized.oilGroup || "").toLowerCase();
      normalized.oilGroup = OIL_GROUPS.includes(og) ? og : "conditioning";
      const lt = String(normalized.latherType || "").toLowerCase();
      normalized.latherType = LATHER_TYPES.includes(lt) ? lt : "creamy";
      const ts = String(normalized.traceSpeed || "").toLowerCase();
      normalized.traceSpeed = TRACE_SPEEDS.includes(ts) ? ts : "medium";
    }
    try {
      await addUserDoc('ingredients', normalized);
    } catch (error) {
      console.error('Error adding ingredient:', error);
      alert('Failed to save ingredient');
    }
  };

  const handleEdit = (idx) => {
    setEditingIdx(idx);
    setEditForm({ ...ingredients[idx] });
  };

  const handleSaveEdit = async (idx) => {
    try {
      const ingredient = ingredients[idx];
      if (ingredient.firebaseId) {
        await updateUserDoc('ingredients', ingredient.firebaseId, editForm);
      }
      setEditingIdx(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating ingredient:', error);
      alert('Failed to update ingredient');
    }
  };

  const handleCancelEdit = () => {
    setEditingIdx(null);
    setEditForm({});
  };

  const handleDelete = async (idx) => {
    if (window.confirm('Delete this ingredient?')) {
      try {
        const ingredient = ingredients[idx];
        if (ingredient.firebaseId) {
          await deleteUserDoc('ingredients', ingredient.firebaseId);
        }
      } catch (error) {
        console.error('Error deleting ingredient:', error);
        alert('Failed to delete ingredient');
      }
    }
  };

  return (
    <div>
      <LabNavbar />
      <div style={{ padding: 16 }}>
      {/* Page Title */}
      <h2 style={{ margin: '0 0 16px' }}>📦 Inventory & Add Ingredient</h2>

      {/* Expiry Alerts */}
      {(() => {
        const today = new Date();
        const warningDays = 30; // Warn 30 days before expiry
        const expiringSoon = ingredients.filter(ing => {
          if (!ing.expiryDate) return false;
          const expiry = new Date(ing.expiryDate);
          const daysUntil = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
          return daysUntil <= warningDays && daysUntil > 0;
        });
        const expired = ingredients.filter(ing => {
          if (!ing.expiryDate) return false;
          const expiry = new Date(ing.expiryDate);
          return expiry < today;
        });
        
        if (expired.length === 0 && expiringSoon.length === 0) return null;
        
        return (
          <div style={{ marginBottom: 16 }}>
            {expired.length > 0 && (
              <div style={{ padding: 12, background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ fontWeight: 600, color: '#c62828', marginBottom: 8 }}>⚠️ Expired Ingredients ({expired.length})</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {expired.map(ing => (
                    <span key={ing.firebaseId || ing.key} style={{ padding: '4px 10px', background: '#f44336', color: '#fff', borderRadius: 12, fontSize: '0.85em' }}>
                      {ing.name} - Expired {new Date(ing.expiryDate).toLocaleDateString()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {expiringSoon.length > 0 && (
              <div style={{ padding: 12, background: '#fff8e1', border: '1px solid #ffcc80', borderRadius: 8 }}>
                <div style={{ fontWeight: 600, color: '#e65100', marginBottom: 8 }}>⏰ Expiring Soon ({expiringSoon.length})</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {expiringSoon.map(ing => {
                    const daysUntil = Math.ceil((new Date(ing.expiryDate) - today) / (1000 * 60 * 60 * 24));
                    return (
                      <span key={ing.firebaseId || ing.key} style={{ padding: '4px 10px', background: '#ff9800', color: '#fff', borderRadius: 12, fontSize: '0.85em' }}>
                        {ing.name} - {daysUntil} days left
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      <AddIngredient onAdd={handleAddIngredient} />

      {/* Inventory display */}
      <div style={{ marginTop: 24, padding: 12, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1em', color: '#333' }}>
          📦 Inventory ({ingredients.length} items)
        </h3>

        {ingredients.length === 0 ? (
          <div style={{ color: '#666', fontStyle: 'italic', padding: 8 }}>
            No ingredients added yet. Use the form above to add some.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {Object.entries(groupedIngredients).map(([cat, list]) => {
              const title = cat.charAt(0).toUpperCase() + cat.slice(1);
              return (
                <div key={cat} style={{ border: '1px solid #eee', borderRadius: 8, padding: 10, background: '#fafafa' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{title}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {list.map((ing) => {
                      if (!ing) return null;
                      const globalIdx = ingredients.findIndex((g) =>
                        g.firebaseId ? g.firebaseId === ing.firebaseId : g.key === ing.key && g.name === ing.name
                      );
                      const isEditing = editingIdx === globalIdx;
                      const data = isEditing ? editForm : ing;
                      return (
                        <div key={ing.firebaseId || ing.key || ing.name} style={{
                          border: '1px solid #e3e3e3',
                          borderRadius: 8,
                          background: isEditing ? '#fff8e1' : '#fff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <div style={{ width: '100%', height: 140, background: '#f3f3f3' }}>
                            <img
                              src={ingredientImages[ing.name || ing.key || ''] || getIngredientImage(ing.name || ing.key || 'ingredient')}
                              data-fallback={PLACEHOLDER_IMG}
                              alt={ing.name || ing.key || 'ingredient'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                const fallback = e.currentTarget.getAttribute('data-fallback');
                                if (fallback && e.currentTarget.src !== fallback) {
                                  e.currentTarget.src = fallback;
                                } else {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = PLACEHOLDER_IMG;
                                }
                              }}
                            />
                          </div>
                          <div style={{ padding: 10, display: 'grid', gap: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontWeight: 'bold', fontSize: '1.05em' }}>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editForm.name || ''}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    style={{ fontSize: '1em', fontWeight: 'bold', padding: 4, border: '1px solid #ccc', borderRadius: 4 }}
                                  />
                                ) : (
                                  ing.name || ing.key || 'Unnamed'
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: 6 }}>
                                {isEditing ? (
                                  <>
                                    <button onClick={() => handleSaveEdit(globalIdx)} style={{ padding: '4px 10px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.85em' }}>✓ Save</button>
                                    <button onClick={handleCancelEdit} style={{ padding: '4px 10px', background: '#757575', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.85em' }}>✕ Cancel</button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => handleEdit(globalIdx)} style={{ padding: '4px 10px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.85em' }}>✎ Edit</button>
                                    <button onClick={() => handleDelete(globalIdx)} style={{ padding: '4px 10px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.85em' }}>🗑 Delete</button>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {/* Edit Form - Show all relevant fields */}
                            {isEditing ? (
                              <div style={{ fontSize: '0.9em', color: '#555', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px 12px', padding: '8px', background: '#fffde7', borderRadius: 6 }}>
                                {/* Common fields for all categories */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <strong>Stock:</strong>
                                  <input
                                    type="number"
                                    value={editForm.stock ?? ''}
                                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value === '' ? '' : Number(e.target.value) })}
                                    style={{ flex: 1, padding: 4, border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9em', maxWidth: '80px' }}
                                  />
                                  <select
                                    value={editForm.unit || 'kg'}
                                    onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                                    style={{ padding: 4, border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9em' }}
                                  >
                                    <option value="kg">kg</option>
                                    <option value="g">g</option>
                                    <option value="L">L</option>
                                    <option value="ml">ml</option>
                                    <option value="pcs">pcs</option>
                                  </select>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <strong>Cost:</strong>
                                  <input
                                    type="number"
                                    value={editForm.costPerUnit ?? ''}
                                    onChange={(e) => setEditForm({ ...editForm, costPerUnit: e.target.value === '' ? '' : Number(e.target.value) })}
                                    style={{ flex: 1, padding: 4, border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9em', maxWidth: '80px' }}
                                  />
                                  <span>per {editForm.unit || 'kg'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <strong>Expiry:</strong>
                                  <input
                                    type="date"
                                    value={editForm.expiryDate || ''}
                                    onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                                    style={{ flex: 1, padding: 4, border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9em' }}
                                  />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <strong>Purchased:</strong>
                                  <input
                                    type="date"
                                    value={editForm.purchaseDate || ''}
                                    onChange={(e) => setEditForm({ ...editForm, purchaseDate: e.target.value })}
                                    style={{ flex: 1, padding: 4, border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9em' }}
                                  />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <strong>Supplier:</strong>
                                  <input
                                    type="text"
                                    value={editForm.supplier || ''}
                                    onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })}
                                    style={{ flex: 1, padding: 4, border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9em' }}
                                  />
                                </div>

                                {/* Oil-specific fields */}
                                {(editForm.category === 'oil' || editForm.type === 'oil') && (
                                  <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <strong>SAP:</strong>
                                      <input
                                        type="number"
                                        step="0.001"
                                        value={editForm.sap ?? ''}
                                        onChange={(e) => setEditForm({ ...editForm, sap: e.target.value === '' ? '' : Number(e.target.value) })}
                                        style={{ flex: 1, padding: 4, border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9em', maxWidth: '80px' }}
                                      />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <strong>Max %:</strong>
                                      <input
                                        type="number"
                                        value={editForm.recommendedMaxPct ?? ''}
                                        onChange={(e) => setEditForm({ ...editForm, recommendedMaxPct: e.target.value === '' ? '' : Number(e.target.value) })}
                                        style={{ flex: 1, padding: 4, border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9em', maxWidth: '60px' }}
                                      />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <strong>Hardness:</strong>
                                      <select
                                        value={editForm.hardness || 'Medium'}
                                        onChange={(e) => setEditForm({ ...editForm, hardness: e.target.value })}
                                        style={{ flex: 1, padding: 4, border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9em' }}
                                      >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                      </select>
                                    </div>
                                  </>
                                )}

                                {/* Fragrance-specific fields */}
                                {(editForm.category === 'fragrance') && (
                                  <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <strong>Max Face %:</strong>
                                      <input
                                        type="number"
                                        value={editForm.maxFacePct ?? ''}
                                        onChange={(e) => setEditForm({ ...editForm, maxFacePct: e.target.value === '' ? '' : Number(e.target.value) })}
                                        style={{ flex: 1, padding: 4, border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9em', maxWidth: '60px' }}
                                      />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <strong>Max Body %:</strong>
                                      <input
                                        type="number"
                                        value={editForm.maxBodyPct ?? ''}
                                        onChange={(e) => setEditForm({ ...editForm, maxBodyPct: e.target.value === '' ? '' : Number(e.target.value) })}
                                        style={{ flex: 1, padding: 4, border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9em', maxWidth: '60px' }}
                                      />
                                    </div>
                                  </>
                                )}

                                {/* Colour-specific fields */}
                                {(editForm.category === 'colour') && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <strong>Color:</strong>
                                    <input
                                      type="text"
                                      value={editForm.colour || ''}
                                      onChange={(e) => setEditForm({ ...editForm, colour: e.target.value })}
                                      style={{ flex: 1, padding: 4, border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9em' }}
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              // Display mode - show summary
                              <div style={{ fontSize: '0.85em', color: '#555', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {ing.stock !== undefined && <span>📦 {ing.stock} {ing.unit}</span>}
                                {ing.costPerUnit !== undefined && <span>💰 ₹{ing.costPerUnit}/{ing.unit}</span>}
                                {ing.sap && <span>🧪 SAP: {ing.sap}</span>}
                                {ing.expiryDate && <span>📅 Exp: {new Date(ing.expiryDate).toLocaleDateString()}</span>}
                                {ing.supplier && <span>🏪 {ing.supplier}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

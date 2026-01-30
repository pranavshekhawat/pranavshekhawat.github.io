import React, { useState, useEffect } from 'react';
import { 
  subscribeToUserCollection, 
  deleteUserDoc, 
  updateUserDoc, 
  addUserDoc,
  orderBy 
} from '../utils/userDataHelper';
import { useNavigate } from 'react-router-dom';
import LabNavbar from './LabNavbar';

// Import centralized utilities
import { num } from './utils/costCalculations';

/**
 * RecipesPage - Browse and manage all saved soap recipes
 * Route: /lab/recipes
 * 
 * Features: Tags, Favorites, Versioning, Scaling, Rating, Notes
 */

// Updated tag system: Standard, Favorites, Try, plus descriptive tags
const RECIPE_COLLECTIONS = [
  { id: 'standard', label: '✓ Standard', color: '#4caf50', description: 'Production recipes - selling well' },
  { id: 'favorites', label: '❤️ Favorites', color: '#e91e63', description: 'Testing - not yet standard' },
  { id: 'try', label: '🔬 To Try', color: '#ff9800', description: 'Want to try these recipes' },
];

const RECIPE_TAGS = [
  { id: 'bestseller', label: '⭐ Bestseller', color: '#ffc107' },
  { id: 'seasonal', label: '🍂 Seasonal', color: '#ff5722' },
  { id: 'experimental', label: '🧪 Experimental', color: '#9c27b0' },
  { id: 'gentle', label: '🌸 Gentle', color: '#e91e63' },
  { id: 'luxury', label: '💎 Luxury', color: '#3f51b5' },
  { id: 'beginner', label: '📚 Beginner', color: '#00bcd4' },
];

const RecipeCard = ({ recipe, onDuplicateEdit, onDelete, onToggleFavorite, onUpdateTags, onScale, onUpdateCollection, onUpdateRating, onUpdateNotes }) => {
  const [expanded, setExpanded] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showScaleModal, setShowScaleModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [scaleMultiplier, setScaleMultiplier] = useState(2);
  const [editNotes, setEditNotes] = useState(recipe.notes || '');
  
  const oils = recipe.oils || recipe.items || [];
  const batchMass = recipe.computedBatchMass || recipe.batchSize || 0;
  const bars = recipe.bars || 1;
  const naoh = recipe.adjustedTotalNaoh || 0;
  const water = recipe.waterWeight || 0;
  const perBar = recipe.totals?.perBar || recipe.cost?.material / bars || 0;
  const currentCollection = RECIPE_COLLECTIONS.find(c => c.id === recipe.collection);

  return (
    <div style={{
      border: recipe.collection === 'standard' ? '2px solid #4caf50' : recipe.collection === 'favorites' ? '2px solid #e91e63' : '1px solid #e0e0e0',
      borderRadius: 8,
      background: '#fff',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
      position: 'relative',
    }}>
      {/* Collection badge */}
      {currentCollection && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          background: currentCollection.color,
          color: '#fff',
          padding: '2px 10px',
          fontSize: '0.7em',
          fontWeight: 600,
          borderBottomRightRadius: 6,
        }}>
          {currentCollection.label}
        </div>
      )}

      {/* Rating stars */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        display: 'flex',
        gap: 2,
      }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={(e) => { e.stopPropagation(); onUpdateRating(recipe, star); }}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1em',
              cursor: 'pointer',
              padding: 0,
              color: (recipe.rating || 0) >= star ? '#ffc107' : '#ddd',
            }}
          >
            ★
          </button>
        ))}
      </div>

      {/* Header - always visible */}
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '12px 16px',
          paddingTop: currentCollection ? 28 : 12,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: expanded ? '#f5f5f5' : '#fff',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: '1.05em' }}>{recipe.name || 'Unnamed Recipe'}</span>
            {recipe.version && (
              <span style={{ padding: '2px 6px', background: '#e0e0e0', borderRadius: 4, fontSize: '0.7em' }}>
                v{recipe.version}
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.85em', color: '#666' }}>
            {batchMass.toFixed(0)}g batch • {bars} bars • ₹{perBar.toFixed(2)}/bar
          </div>
          {/* Tags */}
          {recipe.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
              {recipe.tags.map(tagId => {
                const tag = RECIPE_TAGS.find(t => t.id === tagId);
                return tag ? (
                  <span key={tagId} style={{ padding: '2px 8px', background: tag.color, color: '#fff', borderRadius: 10, fontSize: '0.7em' }}>
                    {tag.label}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: '0.8em', color: '#666' }}>
            {recipe.use?.join(', ') || 'General'}
          </div>
          <span style={{ fontSize: '1.2em', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #e8e8e8', background: '#fafafa' }}>
          {/* Batch Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16, padding: 12, background: '#fff', borderRadius: 6, border: '1px solid #e8e8e8' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75em', color: '#666', marginBottom: 2 }}>Batch Mass</div>
              <div style={{ fontWeight: 600 }}>{batchMass.toFixed(0)}g</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75em', color: '#666', marginBottom: 2 }}>NaOH</div>
              <div style={{ fontWeight: 600 }}>{naoh.toFixed(1)}g</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75em', color: '#666', marginBottom: 2 }}>Water</div>
              <div style={{ fontWeight: 600 }}>{water.toFixed(1)}g</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75em', color: '#666', marginBottom: 2 }}>Superfat</div>
              <div style={{ fontWeight: 600 }}>{recipe.superfat || 6}%</div>
            </div>
          </div>

          {/* Oils */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9em', marginBottom: 6 }}>Oils ({oils.length})</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {oils.slice(0, 6).map((oil, i) => (
                <span key={i} style={{ padding: '4px 8px', background: '#e3f2fd', borderRadius: 4, fontSize: '0.8em' }}>
                  {oil.name}: {oil.pct?.toFixed(1)}%
                </span>
              ))}
              {oils.length > 6 && <span style={{ padding: '4px 8px', background: '#e0e0e0', borderRadius: 4, fontSize: '0.8em' }}>+{oils.length - 6} more</span>}
            </div>
          </div>

          {/* Additives */}
          {recipe.additives?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9em', marginBottom: 6 }}>Additives ({recipe.additives.length})</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {recipe.additives.map((add, i) => (
                  <span key={i} style={{ padding: '4px 8px', background: '#fff3e0', borderRadius: 4, fontSize: '0.8em' }}>
                    {add.name}: {add.amount}{add.unit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          {recipe.totals && (
            <div style={{ marginBottom: 12, padding: 10, background: '#e8f5e9', borderRadius: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85em' }}>
                <span>Material: ₹{(recipe.cost?.material || 0).toFixed(2)}</span>
                <span>Per Bar: ₹{perBar.toFixed(2)}</span>
                <span>Selling: ₹{(recipe.pricingOptions?.computedSellingPerBar || recipe.pricing?.sellingPrice || 0).toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          {recipe.notes && (
            <div style={{ marginBottom: 12, padding: 8, background: '#fff', borderRadius: 4, fontSize: '0.85em', color: '#555', border: '1px solid #e0e0e0' }}>
              <strong>Notes:</strong> {recipe.notes}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <button 
              onClick={() => onDuplicateEdit(recipe)}
              style={{ padding: '10px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}
            >
              📝 Edit
            </button>
            <button 
              onClick={() => setShowScaleModal(true)}
              style={{ padding: '10px 12px', background: '#9c27b0', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}
            >
              📐 Scale
            </button>
            <button 
              onClick={() => setShowTagMenu(!showTagMenu)}
              style={{ padding: '10px 12px', background: '#ff9800', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}
            >
              🏷️ Tags
            </button>
            <button 
              onClick={() => setShowNotesModal(true)}
              style={{ padding: '10px 12px', background: '#00bcd4', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}
            >
              📝 Notes
            </button>
            <a 
              href="/lab/print"
              onClick={() => sessionStorage.setItem('printRecipe', JSON.stringify(recipe))}
              style={{ padding: '10px 12px', background: '#607d8b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500, textDecoration: 'none' }}
            >
              🖨️ Print
            </a>
            <button 
              onClick={() => { if (window.confirm('Delete this recipe?')) onDelete(recipe); }}
              style={{ padding: '10px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
            >
              🗑️
            </button>
          </div>

          {/* Collection Selector */}
          <div style={{ marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.9em' }}>Move to Collection:</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {RECIPE_COLLECTIONS.map(col => (
                <button
                  key={col.id}
                  onClick={() => onUpdateCollection(recipe, col.id)}
                  style={{
                    padding: '8px 16px',
                    background: recipe.collection === col.id ? col.color : '#fff',
                    color: recipe.collection === col.id ? '#fff' : '#333',
                    border: `2px solid ${col.color}`,
                    borderRadius: 20,
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '0.85em',
                  }}
                >
                  {col.label}
                </button>
              ))}
              {recipe.collection && (
                <button
                  onClick={() => onUpdateCollection(recipe, null)}
                  style={{
                    padding: '8px 16px',
                    background: '#fff',
                    color: '#666',
                    border: '2px solid #ccc',
                    borderRadius: 20,
                    cursor: 'pointer',
                    fontSize: '0.85em',
                  }}
                >
                  ✕ Remove
                </button>
              )}
            </div>
          </div>

          {/* Tag Menu */}
          {showTagMenu && (
            <div style={{ marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Select Tags:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {RECIPE_TAGS.map(tag => {
                  const isSelected = recipe.tags?.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => {
                        const currentTags = recipe.tags || [];
                        const newTags = isSelected 
                          ? currentTags.filter(t => t !== tag.id)
                          : [...currentTags, tag.id];
                        onUpdateTags(recipe, newTags);
                      }}
                      style={{
                        padding: '6px 12px',
                        background: isSelected ? tag.color : '#fff',
                        color: isSelected ? '#fff' : '#333',
                        border: `2px solid ${tag.color}`,
                        borderRadius: 16,
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '0.85em',
                      }}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scale Modal */}
          {showScaleModal && (
            <div style={{ marginTop: 12, padding: 16, background: '#e8f5e9', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>📐 Scale Recipe</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                <span>Multiply by:</span>
                {[0.5, 1.5, 2, 3, 5].map(mult => (
                  <button
                    key={mult}
                    onClick={() => setScaleMultiplier(mult)}
                    style={{
                      padding: '8px 14px',
                      background: scaleMultiplier === mult ? '#4caf50' : '#fff',
                      color: scaleMultiplier === mult ? '#fff' : '#333',
                      border: '1px solid #4caf50',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    {mult}x
                  </button>
                ))}
                <input
                  type="number"
                  value={scaleMultiplier}
                  onChange={(e) => setScaleMultiplier(Number(e.target.value))}
                  step="0.5"
                  min="0.1"
                  style={{ width: 70, padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
                />
              </div>
              <div style={{ marginBottom: 12, fontSize: '0.9em', color: '#666' }}>
                <div>New batch: {(batchMass * scaleMultiplier).toFixed(0)}g</div>
                <div>New bars: ~{Math.round(bars * scaleMultiplier)}</div>
                <div>Oil weight: {num(recipe.totalOilWeight, 1000) * scaleMultiplier}g</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { onScale(recipe, scaleMultiplier); setShowScaleModal(false); }}
                  style={{ padding: '10px 16px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
                >
                  Create Scaled Copy
                </button>
                <button
                  onClick={() => setShowScaleModal(false)}
                  style={{ padding: '10px 16px', background: '#666', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Notes Modal */}
          {showNotesModal && (
            <div style={{ marginTop: 12, padding: 16, background: '#e3f2fd', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>📝 Recipe Notes</div>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add your notes, observations, improvements..."
                style={{
                  width: '100%',
                  minHeight: 100,
                  padding: 12,
                  border: '1px solid #90caf9',
                  borderRadius: 6,
                  fontSize: '0.95em',
                  resize: 'vertical',
                  marginBottom: 12,
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { onUpdateNotes(recipe, editNotes); setShowNotesModal(false); }}
                  style={{ padding: '10px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
                >
                  Save Notes
                </button>
                <button
                  onClick={() => { setEditNotes(recipe.notes || ''); setShowNotesModal(false); }}
                  style={{ padding: '10px 16px', background: '#666', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Created date & version */}
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: '0.75em', color: '#666' }}>
            <span>Created: {recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : 'N/A'}</span>
            {recipe.version && <span>Version: {recipe.version}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUse, setFilterUse] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [filterCollection, setFilterCollection] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    let unsub = () => {};
    try {
      unsub = subscribeToUserCollection('recipes', (data) => {
        // Sort by createdAt descending
        const sorted = data.sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return bDate - aDate;
        });
        setRecipes(sorted);
        setLoading(false);
      });
    } catch (err) {
      console.error('Failed to load recipes:', err);
      setLoading(false);
    }
    return () => unsub();
  }, []);

  const handleDelete = async (recipe) => {
    try {
      await deleteUserDoc('recipes', recipe.id);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete recipe');
    }
  };

  const handleDuplicateEdit = (recipe) => {
    sessionStorage.setItem('editRecipe', JSON.stringify(recipe));
    navigate('/lab');
  };

  const handleToggleFavorite = async (recipe) => {
    try {
      await updateUserDoc('recipes', recipe.id, { favorite: !recipe.favorite });
    } catch (err) {
      console.error('Toggle favorite failed:', err);
    }
  };

  const handleUpdateTags = async (recipe, newTags) => {
    try {
      await updateUserDoc('recipes', recipe.id, { tags: newTags });
    } catch (err) {
      console.error('Update tags failed:', err);
    }
  };

  const handleScale = async (recipe, multiplier) => {
    try {
      const scaledRecipe = {
        ...recipe,
        name: `${recipe.name} (${multiplier}x)`,
        totalOilWeight: num(recipe.totalOilWeight, 1000) * multiplier,
        batchSize: num(recipe.batchSize || recipe.computedBatchMass, 1000) * multiplier,
        computedBatchMass: num(recipe.computedBatchMass, 1000) * multiplier,
        bars: Math.round(num(recipe.bars, 10) * multiplier),
        adjustedTotalNaoh: num(recipe.adjustedTotalNaoh, 0) * multiplier,
        waterWeight: num(recipe.waterWeight, 0) * multiplier,
        perOilDetails: (recipe.perOilDetails || []).map(o => ({
          ...o,
          weight: num(o.weight, 0) * multiplier,
        })),
        additives: (recipe.additives || []).map(a => ({
          ...a,
          amount: num(a.amount, 0) * multiplier,
        })),
        cost: {
          ...recipe.cost,
          material: num(recipe.cost?.material, 0) * multiplier,
          packaging: num(recipe.cost?.packaging, 0) * multiplier,
        },
        totals: {
          ...recipe.totals,
          totalCost: num(recipe.totals?.totalCost, 0) * multiplier,
          baseCost: num(recipe.totals?.baseCost, 0) * multiplier,
        },
        version: 1,
        parentRecipeId: recipe.id,
        createdAt: new Date().toISOString(),
      };
      delete scaledRecipe.id;
      await addUserDoc('recipes', scaledRecipe);
      alert(`Scaled recipe "${scaledRecipe.name}" created!`);
    } catch (err) {
      console.error('Scale recipe failed:', err);
      alert('Failed to create scaled recipe');
    }
  };

  const handleUpdateCollection = async (recipe, collectionId) => {
    try {
      await updateUserDoc('recipes', recipe.id, { collection: collectionId });
    } catch (err) {
      console.error('Update collection failed:', err);
    }
  };

  const handleUpdateRating = async (recipe, rating) => {
    try {
      // Toggle off if clicking same rating
      const newRating = recipe.rating === rating ? 0 : rating;
      await updateUserDoc('recipes', recipe.id, { rating: newRating });
    } catch (err) {
      console.error('Update rating failed:', err);
    }
  };

  const handleUpdateNotes = async (recipe, notes) => {
    try {
      await updateUserDoc('recipes', recipe.id, { notes: notes });
    } catch (err) {
      console.error('Update notes failed:', err);
    }
  };

  // Filter recipes
  const filteredRecipes = recipes.filter(r => {
    const matchSearch = !searchTerm || 
      (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchUse = filterUse === 'all' || (r.use || []).includes(filterUse);
    const matchTag = filterTag === 'all' || (r.tags || []).includes(filterTag);
    const matchCollection = filterCollection === 'all' || r.collection === filterCollection;
    return matchSearch && matchUse && matchTag && matchCollection;
  });

  // Sort: standard first, then favorites, then try, then by rating
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    // Collection priority: standard > favorites > try > none
    const collOrder = { standard: 0, favorites: 1, try: 2 };
    const aOrder = collOrder[a.collection] ?? 3;
    const bOrder = collOrder[b.collection] ?? 3;
    if (aOrder !== bOrder) return aOrder - bOrder;
    // Then by rating
    if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  // Get unique uses for filter
  const allUses = [...new Set(recipes.flatMap(r => r.use || []))];

  return (
    <div>
      <LabNavbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      {/* Page Title */}
      <h2 style={{ margin: '0 0 16px', fontSize: '1.3em' }}>📚 Saved Recipes</h2>

      {/* Collection Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #e8e8e8' }}>
        <button
          onClick={() => setFilterCollection('all')}
          style={{
            padding: '10px 20px',
            background: filterCollection === 'all' ? '#333' : '#f5f5f5',
            color: filterCollection === 'all' ? '#fff' : '#333',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          All ({recipes.length})
        </button>
        {RECIPE_COLLECTIONS.map(col => {
          const count = recipes.filter(r => r.collection === col.id).length;
          return (
            <button
              key={col.id}
              onClick={() => setFilterCollection(col.id)}
              style={{
                padding: '10px 20px',
                background: filterCollection === col.id ? col.color : '#f5f5f5',
                color: filterCollection === col.id ? '#fff' : '#333',
                border: `2px solid ${col.color}`,
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {col.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '10px 14px', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.95em' }}
        />
        <select
          value={filterUse}
          onChange={(e) => setFilterUse(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.95em' }}
        >
          <option value="all">All Uses</option>
          {allUses.map(use => (
            <option key={use} value={use}>{use}</option>
          ))}
        </select>
        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.95em' }}
        >
          <option value="all">All Tags</option>
          {RECIPE_TAGS.map(tag => (
            <option key={tag.id} value={tag.id}>{tag.label}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 8, display: 'flex', gap: 24 }}>
        <div><strong>{recipes.length}</strong> total recipes</div>
        <div><strong>{sortedRecipes.length}</strong> shown</div>
        <div><strong>{recipes.filter(r => r.collection === 'standard').length}</strong> standard</div>
        <div><strong>{recipes.filter(r => r.rating >= 4).length}</strong> highly rated</div>
      </div>

      {/* Recipe List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Loading recipes...</div>
      ) : sortedRecipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666', background: '#f9f9f9', borderRadius: 8 }}>
          {recipes.length === 0 ? (
            <div>
              <p>No recipes saved yet.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
                <a href="/lab" style={{ padding: '12px 20px', background: '#1976d2', color: '#fff', borderRadius: 6, textDecoration: 'none', fontWeight: 500 }}>✏️ Create Recipe</a>
                <a href="/lab/templates" style={{ padding: '12px 20px', background: '#795548', color: '#fff', borderRadius: 6, textDecoration: 'none', fontWeight: 500 }}>📜 Use Template</a>
              </div>
            </div>
          ) : 'No recipes match your filters.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sortedRecipes.map(recipe => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              onDuplicateEdit={handleDuplicateEdit}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              onUpdateTags={handleUpdateTags}
              onScale={handleScale}
              onUpdateCollection={handleUpdateCollection}
              onUpdateRating={handleUpdateRating}
              onUpdateNotes={handleUpdateNotes}
            />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

export default RecipesPage;

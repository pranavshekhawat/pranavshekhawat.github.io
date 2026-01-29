import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../utils/firebase-config';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import LabNavbar from './LabNavbar';
import { num } from './utils/costCalculations';
import { getSapValue } from './utils/sapValues';

/**
 * QuickBatch - Create a batch directly from a recipe in one click
 * Route: /lab/quick-batch
 * 
 * Features:
 * - Select recipe and create batch instantly
 * - Auto-calculate bar counts
 * - Set batch date and notes
 * - Optional multiplier for scaling
 */

function QuickBatch() {
  const navigate = useNavigate();
  const location = useLocation();
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  // Pre-selected recipe from navigation state
  const preSelectedRecipeId = location.state?.recipeId || null;
  
  const [selectedRecipeId, setSelectedRecipeId] = useState(preSelectedRecipeId || '');
  const [multiplier, setMultiplier] = useState(1);
  const [batchName, setBatchName] = useState('');
  const [madeDate, setMadeDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [moldType, setMoldType] = useState('loaf');
  const [autoDeductStock, setAutoDeductStock] = useState(true);

  // Load data
  useEffect(() => {
    const unsubs = [];
    
    unsubs.push(onSnapshot(collection(db, 'recipes'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRecipes(data);
      setLoading(false);
    }));
    
    unsubs.push(onSnapshot(collection(db, 'ingredients'), (snap) => {
      setIngredients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }));

    return () => unsubs.forEach(u => u());
  }, []);

  // Selected recipe
  const selectedRecipe = useMemo(() => {
    return recipes.find(r => r.id === selectedRecipeId) || null;
  }, [recipes, selectedRecipeId]);

  // Scaled values
  const scaledValues = useMemo(() => {
    if (!selectedRecipe) return null;
    
    const m = Math.max(0.1, multiplier);
    const oils = selectedRecipe.oils || selectedRecipe.items || [];
    const totalOilWeight = num(selectedRecipe.totalOilWeight, 1000) * m;
    const naoh = num(selectedRecipe.adjustedTotalNaoh || selectedRecipe.lyeRequired, 0) * m;
    const water = num(selectedRecipe.waterWeight, 0) * m;
    const batchMass = num(selectedRecipe.computedBatchMass || selectedRecipe.batchSize, 0) * m;
    const barWeight = num(selectedRecipe.barWeight, 100);
    const bars = Math.round(batchMass / barWeight);
    const costPerBar = num(selectedRecipe.totals?.perBar, 0);
    const totalCost = costPerBar * bars;
    
    // Scale oils
    const scaledOils = oils.map(oil => ({
      ...oil,
      scaledWeight: (num(oil.pct, 0) / 100) * totalOilWeight,
    }));
    
    // Scale additives
    const scaledAdditives = (selectedRecipe.additives || []).map(add => ({
      ...add,
      scaledAmount: num(add.amount, 0) * m,
    }));
    
    // Calculate ready date (6 weeks from made date)
    const made = new Date(madeDate);
    const ready = new Date(made);
    ready.setDate(ready.getDate() + 42);
    
    // Calculate expiry (1 year from made date)
    const expiry = new Date(made);
    expiry.setFullYear(expiry.getFullYear() + 1);
    
    return {
      totalOilWeight,
      naoh,
      water,
      batchMass,
      bars,
      costPerBar,
      totalCost,
      scaledOils,
      scaledAdditives,
      readyDate: ready.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
    };
  }, [selectedRecipe, multiplier, madeDate]);

  // Create batch
  const handleCreateBatch = async () => {
    if (!selectedRecipe || !scaledValues) {
      alert('Please select a recipe first');
      return;
    }
    
    setCreating(true);
    
    try {
      const batch = {
        recipeId: selectedRecipe.id,
        recipeName: selectedRecipe.name,
        name: batchName || `${selectedRecipe.name} - ${madeDate}`,
        status: 'curing',
        madeDate: madeDate,
        readyDate: scaledValues.readyDate,
        soapExpiryDate: scaledValues.expiryDate,
        multiplier: multiplier,
        bars: scaledValues.bars,
        batchMass: scaledValues.batchMass,
        costPerBar: scaledValues.costPerBar,
        totalCost: scaledValues.totalCost,
        moldType: moldType,
        notes: notes,
        // Recipe snapshot
        oils: scaledValues.scaledOils,
        additives: scaledValues.scaledAdditives,
        naoh: scaledValues.naoh,
        water: scaledValues.water,
        totalOilWeight: scaledValues.totalOilWeight,
        superfat: selectedRecipe.superfat,
        lyeConcentration: selectedRecipe.lyeConcentration,
        // Tracking
        createdAt: new Date().toISOString(),
        qc: null,
        journal: [],
      };
      
      await addDoc(collection(db, 'batches'), batch);
      
      // TODO: Deduct stock if autoDeductStock is enabled
      // This would require updating ingredient quantities
      
      alert(`Batch created successfully! ${scaledValues.bars} bars, ready on ${new Date(scaledValues.readyDate).toLocaleDateString()}`);
      navigate('/lab/batches');
    } catch (error) {
      console.error('Error creating batch:', error);
      alert('Failed to create batch: ' + error.message);
    }
    
    setCreating(false);
  };

  if (loading) {
    return (
      <div>
        <LabNavbar />
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: '2em', marginBottom: 16 }}>⏳</div>
          <div>Loading recipes...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <LabNavbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: '1.8em' }}>⚡ Quick Batch Creator</h1>
          <p style={{ margin: '8px 0 0', color: '#666' }}>Create a production batch from a recipe in one click</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Left Column - Configuration */}
          <div>
            {/* Recipe Selection */}
            <div style={{ marginBottom: 20, padding: 20, background: '#fff', borderRadius: 10, border: '1px solid #e0e0e0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.1em' }}>📚 Select Recipe</h3>
              <select
                value={selectedRecipeId}
                onChange={(e) => setSelectedRecipeId(e.target.value)}
                style={{
                  width: '100%',
                  padding: 14,
                  border: '2px solid #1976d2',
                  borderRadius: 8,
                  fontSize: '1em',
                  background: '#fff',
                }}
              >
                <option value="">— Select a recipe —</option>
                {recipes.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name || 'Untitled'} ({(r.oils || r.items || []).length} oils, {r.superfat}% SF)
                  </option>
                ))}
              </select>
              
              {selectedRecipe && (
                <div style={{ marginTop: 12, padding: 12, background: '#e3f2fd', borderRadius: 6, fontSize: '0.9em' }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>{selectedRecipe.name}</div>
                  <div style={{ color: '#666', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span>Use: {(selectedRecipe.use || ['body']).join(', ')}</span>
                    <span>SF: {selectedRecipe.superfat}%</span>
                    <span>Cost: ₹{num(selectedRecipe.totals?.perBar, 0).toFixed(0)}/bar</span>
                  </div>
                </div>
              )}
            </div>

            {/* Batch Settings */}
            <div style={{ marginBottom: 20, padding: 20, background: '#fff', borderRadius: 10, border: '1px solid #e0e0e0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.1em' }}>⚙️ Batch Settings</h3>
              
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Batch Name (optional)</label>
                  <input
                    type="text"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder={selectedRecipe ? `${selectedRecipe.name} - ${madeDate}` : 'Auto-generated'}
                    style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6, fontSize: '1em' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Made Date</label>
                    <input
                      type="date"
                      value={madeDate}
                      onChange={(e) => setMadeDate(e.target.value)}
                      style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6, fontSize: '1em' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Batch Multiplier</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="number"
                        min={0.1}
                        max={10}
                        step={0.5}
                        value={multiplier}
                        onChange={(e) => setMultiplier(num(e.target.value, 1))}
                        style={{ flex: 1, padding: 12, border: '1px solid #ddd', borderRadius: 6, fontSize: '1em', textAlign: 'center' }}
                      />
                      <span style={{ color: '#666' }}>×</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Mold Type</label>
                  <select
                    value={moldType}
                    onChange={(e) => setMoldType(e.target.value)}
                    style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6, fontSize: '1em' }}
                  >
                    <option value="loaf">Loaf Mold</option>
                    <option value="silicone">Silicone Mold</option>
                    <option value="individual">Individual Cavities</option>
                    <option value="slab">Slab Mold</option>
                    <option value="column">Column Mold</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special notes for this batch..."
                    rows={3}
                    style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6, fontSize: '1em', resize: 'vertical' }}
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={autoDeductStock}
                    onChange={(e) => setAutoDeductStock(e.target.checked)}
                  />
                  <span>Auto-deduct from inventory stock</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div>
            {/* Batch Preview */}
            <div style={{ 
              padding: 20, 
              background: selectedRecipe ? '#e8f5e9' : '#f5f5f5', 
              borderRadius: 10, 
              border: selectedRecipe ? '2px solid #4caf50' : '1px solid #e0e0e0',
              position: 'sticky',
              top: 20,
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.1em', color: selectedRecipe ? '#2e7d32' : '#666' }}>
                {selectedRecipe ? '✅ Batch Preview' : '👆 Select a recipe to preview'}
              </h3>

              {selectedRecipe && scaledValues ? (
                <div>
                  {/* Key Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                    <div style={{ padding: 14, background: '#fff', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.8em', color: '#666' }}>Bars</div>
                      <div style={{ fontSize: '1.8em', fontWeight: 700, color: '#1976d2' }}>{scaledValues.bars}</div>
                    </div>
                    <div style={{ padding: 14, background: '#fff', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.8em', color: '#666' }}>Batch Mass</div>
                      <div style={{ fontSize: '1.4em', fontWeight: 600 }}>{scaledValues.batchMass.toFixed(0)}g</div>
                    </div>
                    <div style={{ padding: 14, background: '#fff', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.8em', color: '#666' }}>Total Cost</div>
                      <div style={{ fontSize: '1.4em', fontWeight: 600, color: '#e65100' }}>₹{scaledValues.totalCost.toFixed(0)}</div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div style={{ padding: 14, background: '#fff', borderRadius: 8, marginBottom: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.9em' }}>
                      <div>
                        <div style={{ color: '#666', marginBottom: 4 }}>📅 Made Date</div>
                        <div style={{ fontWeight: 600 }}>{new Date(madeDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div style={{ color: '#666', marginBottom: 4 }}>✅ Ready Date</div>
                        <div style={{ fontWeight: 600, color: '#4caf50' }}>{new Date(scaledValues.readyDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Ingredients Summary */}
                  <div style={{ padding: 14, background: '#fff', borderRadius: 8, marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 10 }}>📦 Materials Needed:</div>
                    <div style={{ fontSize: '0.85em', display: 'grid', gap: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #eee' }}>
                        <span>NaOH (Lye)</span>
                        <strong>{scaledValues.naoh.toFixed(1)}g</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #eee' }}>
                        <span>Water</span>
                        <strong>{scaledValues.water.toFixed(1)}g</strong>
                      </div>
                      {scaledValues.scaledOils.slice(0, 5).map((oil, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #eee' }}>
                          <span>{oil.name}</span>
                          <strong>{oil.scaledWeight.toFixed(0)}g</strong>
                        </div>
                      ))}
                      {scaledValues.scaledOils.length > 5 && (
                        <div style={{ color: '#666', textAlign: 'center' }}>
                          +{scaledValues.scaledOils.length - 5} more oils...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Create Button */}
                  <button
                    onClick={handleCreateBatch}
                    disabled={creating}
                    style={{
                      width: '100%',
                      padding: '16px 24px',
                      background: creating ? '#ccc' : '#4caf50',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: '1.1em',
                      fontWeight: 700,
                      cursor: creating ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                    }}
                  >
                    {creating ? (
                      <>⏳ Creating Batch...</>
                    ) : (
                      <>⚡ Create {scaledValues.bars} Bar Batch</>
                    )}
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  <div style={{ fontSize: '3em', marginBottom: 16 }}>📦</div>
                  <div>Select a recipe to see batch preview</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Multiplier Buttons */}
        {selectedRecipe && (
          <div style={{ marginTop: 24, padding: 16, background: '#fff', borderRadius: 8, border: '1px solid #e0e0e0' }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Quick Scale:</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[0.5, 1, 1.5, 2, 3, 5].map(m => (
                <button
                  key={m}
                  onClick={() => setMultiplier(m)}
                  style={{
                    padding: '10px 20px',
                    background: multiplier === m ? '#1976d2' : '#f5f5f5',
                    color: multiplier === m ? '#fff' : '#333',
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: multiplier === m ? 600 : 400,
                  }}
                >
                  {m}× ({Math.round((num(selectedRecipe.computedBatchMass, 1000) * m) / num(selectedRecipe.barWeight, 100))} bars)
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuickBatch;

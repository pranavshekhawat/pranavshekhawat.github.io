import React, { useState, useEffect } from 'react';
import { subscribeToUserCollection } from '../utils/userDataHelper';
import LabNavbar from './LabNavbar';

/**
 * PrintCenter - Central hub for all printable documents
 * Route: /lab/print
 */

const num = (v, def = 0) => {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : def;
};

// ==========================================
// 1. RECIPE PRINT SHEET
// ==========================================
const RecipePrintSheet = ({ recipe, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const oils = recipe.oils || recipe.items || [];
  const batchMass = num(recipe.computedBatchMass || recipe.batchSize, 0);
  const bars = num(recipe.bars, 1);
  const naoh = num(recipe.adjustedTotalNaoh || recipe.lyeRequired, 0);
  const water = num(recipe.waterWeight, 0);
  const superfat = num(recipe.superfat, 6);
  const lyeConc = num(recipe.lyeConcentration, 0.3);

  return (
    <div className="print-overlay">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-sheet, .print-sheet * { visibility: visible; }
          .print-sheet { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
        .print-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          overflow: auto; padding: 20px;
        }
        .print-sheet {
          background: white; width: 210mm; min-height: 297mm;
          padding: 20mm; box-shadow: 0 0 20px rgba(0,0,0,0.3);
          font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt;
        }
        .print-header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
        .print-title { font-size: 18pt; font-weight: bold; margin: 0; }
        .print-subtitle { color: #666; margin: 5px 0 0 0; }
        .print-section { margin-bottom: 15px; }
        .print-section-title { font-size: 12pt; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
        .print-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .print-table { width: 100%; border-collapse: collapse; }
        .print-table th, .print-table td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
        .print-table th { background: #f5f5f5; font-weight: 600; }
        .print-summary-box { background: #f9f9f9; padding: 12px; border-radius: 4px; }
        .print-summary-row { display: flex; justify-content: space-between; margin: 4px 0; }
        .print-footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 9pt; color: #888; }
      `}</style>
      
      <div className="print-sheet">
        {/* Header */}
        <div className="print-header">
          <h1 className="print-title">🧪 {recipe.name || 'Untitled Recipe'}</h1>
          <p className="print-subtitle">
            Use: {(recipe.use || ['body']).join(', ')} | Skin Type: {(recipe.skinType || ['all']).join(', ')} | Goal: {recipe.goal || 'balanced'}
          </p>
          <p className="print-subtitle">Printed: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="print-grid">
          {/* Batch Summary */}
          <div className="print-section">
            <div className="print-section-title">📊 Batch Summary</div>
            <div className="print-summary-box">
              <div className="print-summary-row"><span>Total Batch Mass:</span><strong>{batchMass.toFixed(0)} g</strong></div>
              <div className="print-summary-row"><span>Number of Bars:</span><strong>{bars}</strong></div>
              <div className="print-summary-row"><span>Bar Weight:</span><strong>{num(recipe.barWeight, 100)} g</strong></div>
              <div className="print-summary-row"><span>Superfat:</span><strong>{superfat}%</strong></div>
              <div className="print-summary-row"><span>Lye Concentration:</span><strong>{(lyeConc * 100).toFixed(0)}%</strong></div>
            </div>
          </div>

          {/* Lye & Water */}
          <div className="print-section">
            <div className="print-section-title">⚗️ Lye Solution</div>
            <div className="print-summary-box">
              <div className="print-summary-row"><span>NaOH Required:</span><strong>{naoh.toFixed(2)} g</strong></div>
              <div className="print-summary-row"><span>Water Required:</span><strong>{water.toFixed(2)} g</strong></div>
              <div className="print-summary-row"><span>Total Lye Solution:</span><strong>{(naoh + water).toFixed(2)} g</strong></div>
              <div className="print-summary-row"><span>Alkali:</span><strong>{recipe.alkali?.name || 'NaOH'}</strong></div>
            </div>
          </div>
        </div>

        {/* Oils Table */}
        <div className="print-section">
          <div className="print-section-title">🫒 Oils ({oils.length})</div>
          <table className="print-table">
            <thead>
              <tr>
                <th>Oil</th>
                <th>Percentage</th>
                <th>Weight (g)</th>
                <th>SAP</th>
                <th>NaOH (g)</th>
              </tr>
            </thead>
            <tbody>
              {(recipe.perOilDetails || oils).map((oil, i) => (
                <tr key={i}>
                  <td>{oil.name}</td>
                  <td>{num(oil.pct, 0).toFixed(1)}%</td>
                  <td>{num(oil.weight, (oil.pct / 100) * num(recipe.totalOilWeight, 1000)).toFixed(1)}</td>
                  <td>{num(oil.sap, 0).toFixed(3)}</td>
                  <td>{num(oil.adjustedNaoh, 0).toFixed(2)}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 'bold', background: '#f0f0f0' }}>
                <td>TOTAL</td>
                <td>{oils.reduce((s, o) => s + num(o.pct, 0), 0).toFixed(1)}%</td>
                <td>{num(recipe.totalOilWeight, 1000).toFixed(0)}</td>
                <td>—</td>
                <td>{naoh.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Additives */}
        {recipe.additives?.length > 0 && (
          <div className="print-section">
            <div className="print-section-title">✨ Additives ({recipe.additives.length})</div>
            <table className="print-table">
              <thead>
                <tr>
                  <th>Additive</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>When Added</th>
                </tr>
              </thead>
              <tbody>
                {recipe.additives.map((add, i) => (
                  <tr key={i}>
                    <td>{add.name}</td>
                    <td>{add.type || '—'}</td>
                    <td>{add.amount}{add.unit}</td>
                    <td>{add.whenAdded || add.appliesTo || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Cost & Pricing */}
        <div className="print-section">
          <div className="print-section-title">💰 Cost & Pricing</div>
          <div className="print-grid">
            <div className="print-summary-box">
              <div className="print-summary-row"><span>Material Cost:</span><strong>₹{num(recipe.cost?.material, 0).toFixed(2)}</strong></div>
              <div className="print-summary-row"><span>Working Cost:</span><strong>₹{num(recipe.cost?.working, 0).toFixed(2)}</strong></div>
              <div className="print-summary-row"><span>Packaging:</span><strong>₹{num(recipe.cost?.packaging, 0).toFixed(2)}</strong></div>
              <div className="print-summary-row" style={{ borderTop: '1px solid #ccc', paddingTop: '5px', marginTop: '5px' }}>
                <span>Total Cost:</span><strong>₹{num(recipe.totals?.totalCost, 0).toFixed(2)}</strong>
              </div>
            </div>
            <div className="print-summary-box">
              <div className="print-summary-row"><span>Cost per Bar:</span><strong>₹{num(recipe.totals?.perBar, 0).toFixed(2)}</strong></div>
              <div className="print-summary-row"><span>Markup:</span><strong>{num(recipe.pricingOptions?.markup, 50)}%</strong></div>
              <div className="print-summary-row" style={{ borderTop: '1px solid #ccc', paddingTop: '5px', marginTop: '5px' }}>
                <span>Selling Price:</span><strong>₹{num(recipe.pricingOptions?.computedSellingPerBar || recipe.pricing?.sellingPrice, 0).toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {recipe.notes && (
          <div className="print-section">
            <div className="print-section-title">📝 Notes</div>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{recipe.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="print-footer">
          <p>Recipe ID: {recipe.id || 'Not saved'} | Created: {recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>

        {/* Print buttons - hidden when printing */}
        <div className="no-print" style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button onClick={handlePrint} style={{ padding: '12px 24px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
            🖨️ Print Recipe
          </button>
          <button onClick={onClose} style={{ padding: '12px 24px', background: '#666', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}>
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. PRODUCTION BATCH SHEET
// ==========================================
const ProductionBatchSheet = ({ recipe, onClose }) => {
  const handlePrint = () => window.print();
  
  const oils = recipe.oils || recipe.items || [];
  const naoh = num(recipe.adjustedTotalNaoh || recipe.lyeRequired, 0);
  const water = num(recipe.waterWeight, 0);

  return (
    <div className="print-overlay">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-sheet, .print-sheet * { visibility: visible; }
          .print-sheet { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
        .checkbox-item { display: flex; align-items: flex-start; gap: 10px; margin: 8px 0; }
        .checkbox-box { width: 18px; height: 18px; border: 2px solid #333; flex-shrink: 0; margin-top: 2px; }
        .step-section { margin: 15px 0; padding: 12px; background: #f9f9f9; border-radius: 6px; }
        .step-title { font-weight: bold; margin-bottom: 10px; font-size: 11pt; }
        .warning-box { background: #fff3e0; border-left: 4px solid #ff9800; padding: 10px; margin: 10px 0; }
        .danger-box { background: #ffebee; border-left: 4px solid #f44336; padding: 10px; margin: 10px 0; }
      `}</style>
      
      <div className="print-sheet">
        <div className="print-header">
          <h1 className="print-title">📋 Production Batch Sheet</h1>
          <p className="print-subtitle">{recipe.name || 'Untitled Recipe'} — {new Date().toLocaleDateString()}</p>
        </div>

        {/* Safety Warning */}
        <div className="danger-box">
          <strong>⚠️ SAFETY FIRST:</strong> Wear safety goggles, rubber gloves, and long sleeves when handling lye. Work in a well-ventilated area. Keep vinegar nearby for spills.
        </div>

        {/* Step 1: Preparation */}
        <div className="step-section">
          <div className="step-title">Step 1: Preparation</div>
          <div className="checkbox-item"><div className="checkbox-box"></div><span>Gather all equipment (scale, thermometer, stick blender, molds)</span></div>
          <div className="checkbox-item"><div className="checkbox-box"></div><span>Put on safety gear (goggles, gloves, long sleeves)</span></div>
          <div className="checkbox-item"><div className="checkbox-box"></div><span>Prepare workspace with newspaper/plastic sheet</span></div>
          <div className="checkbox-item"><div className="checkbox-box"></div><span>Have vinegar ready for lye spills</span></div>
        </div>

        {/* Step 2: Measure Oils */}
        <div className="step-section">
          <div className="step-title">Step 2: Measure Oils (Total: {num(recipe.totalOilWeight, 1000).toFixed(0)}g)</div>
          {(recipe.perOilDetails || oils).map((oil, i) => (
            <div key={i} className="checkbox-item">
              <div className="checkbox-box"></div>
              <span><strong>{oil.name}</strong>: {num(oil.weight, (oil.pct / 100) * num(recipe.totalOilWeight, 1000)).toFixed(1)}g ({num(oil.pct, 0).toFixed(1)}%)</span>
            </div>
          ))}
          <div className="checkbox-item"><div className="checkbox-box"></div><span>Melt solid oils if needed, then combine all oils</span></div>
        </div>

        {/* Step 3: Prepare Lye Solution */}
        <div className="step-section">
          <div className="step-title">Step 3: Prepare Lye Solution</div>
          <div className="warning-box">
            <strong>⚡ Always add lye TO water, never water to lye!</strong>
          </div>
          <div className="checkbox-item"><div className="checkbox-box"></div><span>Measure <strong>{water.toFixed(1)}g water</strong> into heat-safe container</span></div>
          <div className="checkbox-item"><div className="checkbox-box"></div><span>Measure <strong>{naoh.toFixed(1)}g NaOH</strong> (lye)</span></div>
          <div className="checkbox-item"><div className="checkbox-box"></div><span>Slowly add lye to water while stirring</span></div>
          <div className="checkbox-item"><div className="checkbox-box"></div><span>Allow to cool (target: 100-110°F / 38-43°C)</span></div>
        </div>

        {/* Step 4: Additives Pre-Lye */}
        {recipe.additives?.filter(a => a.appliesTo === 'lye' || a.whenAdded === 'pre-lye').length > 0 && (
          <div className="step-section">
            <div className="step-title">Step 4a: Pre-Lye Additives</div>
            {recipe.additives.filter(a => a.appliesTo === 'lye' || a.whenAdded === 'pre-lye').map((add, i) => (
              <div key={i} className="checkbox-item">
                <div className="checkbox-box"></div>
                <span>Add <strong>{add.name}</strong>: {add.amount}{add.unit} to lye solution</span>
              </div>
            ))}
          </div>
        )}

        {/* Step 5: Combine */}
        <div className="step-section">
          <div className="step-title">Step 4: Combine Oils & Lye</div>
          <div className="checkbox-item"><div className="checkbox-box"></div><span>Check temperatures: Oils ___°F  Lye ___°F (both should be 100-110°F)</span></div>
          <div className="checkbox-item"><div className="checkbox-box"></div><span>Slowly pour lye solution into oils</span></div>
          <div className="checkbox-item"><div className="checkbox-box"></div><span>Blend with stick blender until light trace</span></div>
        </div>

        {/* Step 6: Post-trace Additives */}
        {recipe.additives?.filter(a => a.appliesTo === 'post' || a.whenAdded === 'post-trace').length > 0 && (
          <div className="step-section">
            <div className="step-title">Step 5: Post-Trace Additives</div>
            {recipe.additives.filter(a => a.appliesTo === 'post' || a.whenAdded === 'post-trace').map((add, i) => (
              <div key={i} className="checkbox-item">
                <div className="checkbox-box"></div>
                <span>Add <strong>{add.name}</strong>: {add.amount}{add.unit}</span>
              </div>
            ))}
            <div className="checkbox-item"><div className="checkbox-box"></div><span>Blend briefly to incorporate</span></div>
          </div>
        )}

        {/* Step 7: Mold */}
        <div className="step-section">
          <div className="step-title">Step 6: Pour & Mold</div>
          <div className="checkbox-item"><div className="checkbox-box"></div><span>Pour into prepared mold(s)</span></div>
          <div className="checkbox-item"><div className="checkbox-box"></div><span>Tap mold to release air bubbles</span></div>
          <div className="checkbox-item"><div className="checkbox-box"></div><span>Cover with plastic wrap or cardboard</span></div>
          <div className="checkbox-item"><div className="checkbox-box"></div><span>Insulate with towels if desired</span></div>
        </div>

        {/* Step 8: Unmold & Cure */}
        <div className="step-section">
          <div className="step-title">Step 7: Unmold & Cure</div>
          <div className="checkbox-item"><div className="checkbox-box"></div><span>Wait 24-48 hours before unmolding</span></div>
          <div className="checkbox-item"><div className="checkbox-box"></div><span>Cut into {num(recipe.bars, 10)} bars (~{num(recipe.barWeight, 100)}g each)</span></div>
          <div className="checkbox-item"><div className="checkbox-box"></div><span>Cure for 4-6 weeks in dry, ventilated area</span></div>
        </div>

        {/* Notes */}
        <div className="step-section">
          <div className="step-title">📝 Batch Notes</div>
          <div style={{ border: '1px solid #ccc', minHeight: 80, padding: 10 }}>
            <p style={{ margin: 0, color: '#666' }}>Date made: ____________  Time: ____________</p>
            <p style={{ margin: '10px 0 0 0', color: '#666' }}>Observations: </p>
          </div>
        </div>

        <div className="no-print" style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button onClick={handlePrint} style={{ padding: '12px 24px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
            🖨️ Print Production Sheet
          </button>
          <button onClick={onClose} style={{ padding: '12px 24px', background: '#666', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}>
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. CURING TRACKER SHEET
// ==========================================
const CuringTrackerSheet = ({ batches = [], onClose }) => {
  const handlePrint = () => window.print();

  return (
    <div className="print-overlay">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-sheet, .print-sheet * { visibility: visible; }
          .print-sheet { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
        .cure-table { width: 100%; border-collapse: collapse; font-size: 9pt; }
        .cure-table th, .cure-table td { border: 1px solid #ccc; padding: 6px; text-align: center; }
        .cure-table th { background: #f5f5f5; }
        .week-cell { min-width: 50px; }
      `}</style>
      
      <div className="print-sheet">
        <div className="print-header">
          <h1 className="print-title">📅 Curing Tracker</h1>
          <p className="print-subtitle">Track weight loss and pH during 4-6 week cure period</p>
        </div>

        <table className="cure-table">
          <thead>
            <tr>
              <th>Batch Name</th>
              <th>Date Made</th>
              <th>Ready Date</th>
              <th className="week-cell">Week 1</th>
              <th className="week-cell">Week 2</th>
              <th className="week-cell">Week 3</th>
              <th className="week-cell">Week 4</th>
              <th className="week-cell">Week 5</th>
              <th className="week-cell">Week 6</th>
              <th>pH Test</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {batches.length > 0 ? batches.map((batch, i) => {
              const madeDate = batch.madeDate ? new Date(batch.madeDate) : new Date();
              const readyDate = new Date(madeDate);
              readyDate.setDate(readyDate.getDate() + 42); // 6 weeks
              return (
                <tr key={i}>
                  <td>{batch.name || batch.recipeName || `Batch ${i + 1}`}</td>
                  <td>{madeDate.toLocaleDateString()}</td>
                  <td>{readyDate.toLocaleDateString()}</td>
                  <td></td><td></td><td></td><td></td><td></td><td></td>
                  <td></td>
                  <td></td>
                </tr>
              );
            }) : (
              // Empty rows for manual entry
              Array(10).fill(0).map((_, i) => (
                <tr key={i}>
                  <td style={{ minWidth: 120 }}></td>
                  <td></td><td></td>
                  <td></td><td></td><td></td><td></td><td></td><td></td>
                  <td></td>
                  <td style={{ minWidth: 100 }}></td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={{ marginTop: 20, fontSize: '9pt' }}>
          <strong>Weight Tracking:</strong> Record bar weight each week. Expect 10-15% weight loss during cure.
          <br/><strong>pH Testing:</strong> Test after 4 weeks. Target pH: 8-10. If higher, continue curing.
        </div>

        <div className="no-print" style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button onClick={handlePrint} style={{ padding: '12px 24px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
            🖨️ Print Curing Tracker
          </button>
          <button onClick={onClose} style={{ padding: '12px 24px', background: '#666', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}>
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. SOAP LABELS GENERATOR
// ==========================================
const SoapLabelsSheet = ({ recipe, onClose }) => {
  const [labelsPerPage, setLabelsPerPage] = useState(8);
  const handlePrint = () => window.print();

  const oils = recipe.oils || recipe.items || [];
  const oilNames = oils.map(o => o.name).join(', ');

  const labelStyle = {
    width: labelsPerPage === 8 ? '90mm' : '63mm',
    height: labelsPerPage === 8 ? '60mm' : '38mm',
    border: '1px dashed #ccc',
    padding: '8px',
    margin: '2mm',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    fontSize: labelsPerPage === 8 ? '8pt' : '6pt',
    pageBreakInside: 'avoid',
  };

  return (
    <div className="print-overlay">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-sheet, .print-sheet * { visibility: visible; }
          .print-sheet { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .label-grid { page-break-inside: avoid; }
        }
      `}</style>
      
      <div className="print-sheet" style={{ padding: '10mm' }}>
        <div className="no-print" style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
          <label>Labels per page:</label>
          <select value={labelsPerPage} onChange={e => setLabelsPerPage(Number(e.target.value))} style={{ padding: 8, borderRadius: 4 }}>
            <option value={8}>8 (Large - 90x60mm)</option>
            <option value={21}>21 (Small - 63x38mm)</option>
          </select>
        </div>

        <div className="label-grid" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
          {Array(labelsPerPage).fill(0).map((_, i) => (
            <div key={i} style={labelStyle}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2em', marginBottom: 4 }}>{recipe.name || 'Handmade Soap'}</div>
                <div style={{ color: '#666', marginBottom: 4 }}>{(recipe.use || ['Body']).join(' & ')} Soap</div>
              </div>
              <div style={{ fontSize: '0.9em', color: '#444' }}>
                <strong>Ingredients:</strong> {oilNames}, Water, Sodium Hydroxide
                {recipe.additives?.length > 0 && `, ${recipe.additives.map(a => a.name).join(', ')}`}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 4, borderTop: '1px solid #eee', fontSize: '0.85em' }}>
                <span>Net Wt: {num(recipe.barWeight, 100)}g</span>
                <span>Batch: ______</span>
              </div>
            </div>
          ))}
        </div>

        <div className="no-print" style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button onClick={handlePrint} style={{ padding: '12px 24px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
            🖨️ Print Labels
          </button>
          <button onClick={onClose} style={{ padding: '12px 24px', background: '#666', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}>
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. SHOPPING / REORDER LIST
// ==========================================
const ShoppingListSheet = ({ ingredients = [], recipes = [], onClose }) => {
  const handlePrint = () => window.print();

  // Find low stock items
  const lowStock = ingredients.filter(ing => {
    const stock = num(ing.stock || ing.quantity, 0);
    const minStock = num(ing.minStock || ing.reorderLevel, 100);
    return stock < minStock;
  });

  return (
    <div className="print-overlay">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-sheet, .print-sheet * { visibility: visible; }
          .print-sheet { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
      
      <div className="print-sheet">
        <div className="print-header">
          <h1 className="print-title">🛒 Shopping / Reorder List</h1>
          <p className="print-subtitle">Generated: {new Date().toLocaleDateString()}</p>
        </div>

        {lowStock.length > 0 ? (
          <div className="print-section">
            <div className="print-section-title">⚠️ Low Stock Items ({lowStock.length})</div>
            <table className="print-table">
              <thead>
                <tr>
                  <th>☐</th>
                  <th>Ingredient</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Min. Stock</th>
                  <th>Reorder Qty</th>
                  <th>Est. Cost</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((ing, i) => {
                  const stock = num(ing.stock || ing.quantity, 0);
                  const minStock = num(ing.minStock || ing.reorderLevel, 100);
                  const reorderQty = Math.max(minStock * 2 - stock, minStock);
                  const price = num(ing.price, 0);
                  return (
                    <tr key={i}>
                      <td style={{ width: 30 }}>☐</td>
                      <td>{ing.name}</td>
                      <td>{ing.category || ing.type || '—'}</td>
                      <td style={{ color: '#d32f2f' }}>{stock}g</td>
                      <td>{minStock}g</td>
                      <td>{reorderQty}g</td>
                      <td>₹{((reorderQty / 1000) * price).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: 20, background: '#e8f5e9', borderRadius: 8, marginBottom: 20 }}>
            ✅ All ingredients are well-stocked!
          </div>
        )}

        <div className="print-section">
          <div className="print-section-title">📝 Additional Items</div>
          <table className="print-table">
            <thead>
              <tr>
                <th>☐</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {Array(8).fill(0).map((_, i) => (
                <tr key={i}>
                  <td style={{ width: 30 }}>☐</td>
                  <td style={{ minWidth: 200 }}></td>
                  <td style={{ minWidth: 80 }}></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="no-print" style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button onClick={handlePrint} style={{ padding: '12px 24px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
            🖨️ Print Shopping List
          </button>
          <button onClick={onClose} style={{ padding: '12px 24px', background: '#666', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}>
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. SAFETY DATA SHEET
// ==========================================
const SafetyDataSheet = ({ onClose }) => {
  const handlePrint = () => window.print();

  return (
    <div className="print-overlay">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-sheet, .print-sheet * { visibility: visible; }
          .print-sheet { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
        .safety-box { padding: 12px; margin: 10px 0; border-radius: 6px; }
        .danger { background: #ffebee; border-left: 4px solid #d32f2f; }
        .warning { background: #fff3e0; border-left: 4px solid #ff9800; }
        .info { background: #e3f2fd; border-left: 4px solid #2196f3; }
        .success { background: #e8f5e9; border-left: 4px solid #4caf50; }
      `}</style>
      
      <div className="print-sheet">
        <div className="print-header" style={{ background: '#d32f2f', color: 'white', margin: '-20mm -20mm 20px', padding: '20mm 20mm 15px' }}>
          <h1 className="print-title" style={{ color: 'white' }}>⚠️ SAFETY DATA SHEET</h1>
          <p className="print-subtitle" style={{ color: 'rgba(255,255,255,0.9)' }}>Sodium Hydroxide (NaOH / Lye) - Cold Process Soap Making</p>
        </div>

        <div className="safety-box danger">
          <h3 style={{ margin: '0 0 10px', color: '#d32f2f' }}>🚨 HAZARD IDENTIFICATION</h3>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li><strong>Corrosive:</strong> Causes severe skin burns and eye damage</li>
            <li><strong>Reactive:</strong> Generates heat when mixed with water</li>
            <li><strong>Toxic fumes:</strong> Can release harmful vapors</li>
          </ul>
        </div>

        <div className="print-section">
          <h3>👔 REQUIRED PERSONAL PROTECTIVE EQUIPMENT</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="safety-box info">☐ Safety goggles (chemical splash proof)</div>
            <div className="safety-box info">☐ Rubber/nitrile gloves (chemical resistant)</div>
            <div className="safety-box info">☐ Long-sleeved shirt</div>
            <div className="safety-box info">☐ Long pants and closed-toe shoes</div>
            <div className="safety-box info">☐ Apron (optional but recommended)</div>
            <div className="safety-box info">☐ Face shield (for large batches)</div>
          </div>
        </div>

        <div className="print-section">
          <h3>✅ SAFE HANDLING PROCEDURES</h3>
          <div className="safety-box success">
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              <li><strong>ALWAYS add lye TO water</strong> — never water to lye</li>
              <li>Work in a well-ventilated area or outdoors</li>
              <li>Use heat-resistant containers (HDPE, stainless steel, Pyrex)</li>
              <li>Never use aluminum containers (causes reaction)</li>
              <li>Mix away from face — avoid inhaling fumes</li>
              <li>Keep children and pets away from workspace</li>
              <li>Label all containers clearly</li>
              <li>Store lye in airtight container away from moisture</li>
            </ol>
          </div>
        </div>

        <div className="print-section">
          <h3>🆘 FIRST AID MEASURES</h3>
          <div className="safety-box warning">
            <p style={{ margin: '0 0 10px' }}><strong>SKIN CONTACT:</strong></p>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              <li>Immediately flush with plenty of cool water for at least 15-20 minutes</li>
              <li>Remove contaminated clothing while rinsing</li>
              <li>Do NOT use vinegar (causes additional burns)</li>
              <li>Seek medical attention for serious burns</li>
            </ol>
          </div>
          <div className="safety-box warning">
            <p style={{ margin: '0 0 10px' }}><strong>EYE CONTACT:</strong></p>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              <li>Immediately flush eyes with water for 15-20 minutes</li>
              <li>Hold eyelids open while rinsing</li>
              <li>Seek immediate medical attention</li>
            </ol>
          </div>
          <div className="safety-box warning">
            <p style={{ margin: '0 0 10px' }}><strong>INHALATION:</strong></p>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              <li>Move to fresh air immediately</li>
              <li>If breathing is difficult, seek medical attention</li>
            </ol>
          </div>
        </div>

        <div className="print-section">
          <h3>🧹 SPILL CLEANUP</h3>
          <div className="safety-box info">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Wear full PPE before cleanup</li>
              <li>For small spills: absorb with paper towels and dispose</li>
              <li>For large spills: neutralize with citric acid or baking soda, then clean</li>
              <li>Rinse area thoroughly with water</li>
              <li>Dispose of cleanup materials properly</li>
            </ul>
          </div>
        </div>

        <div className="print-section">
          <h3>📞 EMERGENCY CONTACTS</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="safety-box danger">
              <strong>Poison Control:</strong><br/>
              India: 1800-11-6117<br/>
              US: 1-800-222-1222
            </div>
            <div className="safety-box danger">
              <strong>Emergency Services:</strong><br/>
              India: 112<br/>
              US: 911
            </div>
          </div>
        </div>

        <div className="print-footer">
          <p>Keep this sheet posted near your soap-making workspace. Review before each session.</p>
        </div>

        <div className="no-print" style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button onClick={handlePrint} style={{ padding: '12px 24px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
            🖨️ Print Safety Sheet
          </button>
          <button onClick={onClose} style={{ padding: '12px 24px', background: '#666', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}>
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 7. QUALITY CONTROL LOG
// ==========================================
const QualityControlSheet = ({ batches = [], onClose }) => {
  const handlePrint = () => window.print();

  return (
    <div className="print-overlay">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-sheet, .print-sheet * { visibility: visible; }
          .print-sheet { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
        .qc-table { width: 100%; border-collapse: collapse; font-size: 9pt; }
        .qc-table th, .qc-table td { border: 1px solid #ccc; padding: 8px; text-align: center; }
        .qc-table th { background: #f5f5f5; }
        .rating-cell { display: flex; gap: 4px; justify-content: center; }
        .rating-box { width: 16px; height: 16px; border: 1px solid #999; }
      `}</style>
      
      <div className="print-sheet">
        <div className="print-header">
          <h1 className="print-title">✅ Quality Control Log</h1>
          <p className="print-subtitle">Post-cure testing checklist for finished soap batches</p>
        </div>

        <div className="print-section">
          <p><strong>Testing Instructions:</strong> Test each batch after minimum 4 weeks cure time. Rate each quality 1-5 (1=poor, 5=excellent).</p>
        </div>

        <table className="qc-table">
          <thead>
            <tr>
              <th rowSpan={2}>Batch Name</th>
              <th rowSpan={2}>Test Date</th>
              <th rowSpan={2}>pH</th>
              <th colSpan={5}>Quality Ratings (1-5)</th>
              <th rowSpan={2}>Pass?</th>
              <th rowSpan={2}>Notes</th>
            </tr>
            <tr>
              <th>Hardness</th>
              <th>Lather</th>
              <th>Scent</th>
              <th>Color</th>
              <th>Texture</th>
            </tr>
          </thead>
          <tbody>
            {batches.length > 0 ? batches.map((batch, i) => (
              <tr key={i}>
                <td>{batch.name || `Batch ${i + 1}`}</td>
                <td></td>
                <td></td>
                <td></td><td></td><td></td><td></td><td></td>
                <td>☐ Y ☐ N</td>
                <td style={{ minWidth: 100 }}></td>
              </tr>
            )) : (
              Array(12).fill(0).map((_, i) => (
                <tr key={i}>
                  <td style={{ minWidth: 120 }}></td>
                  <td></td>
                  <td></td>
                  <td></td><td></td><td></td><td></td><td></td>
                  <td>☐ Y ☐ N</td>
                  <td style={{ minWidth: 100 }}></td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="print-section" style={{ marginTop: 20 }}>
          <h4>Quality Guidelines:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, fontSize: '9pt' }}>
            <div>
              <strong>pH Test:</strong> Target 8-10. Use pH strips or meter.<br/>
              • Below 8: May not be fully saponified<br/>
              • Above 10: May be lye heavy, continue curing
            </div>
            <div>
              <strong>Zap Test:</strong> Touch soap to tip of tongue.<br/>
              • No zap = safe to use<br/>
              • Zap (like battery) = not ready, cure longer
            </div>
            <div>
              <strong>Hardness:</strong> Press with thumb.<br/>
              • Should feel firm, not soft or mushy
            </div>
            <div>
              <strong>Lather:</strong> Rub between wet hands.<br/>
              • Good lather = creamy, abundant bubbles
            </div>
          </div>
        </div>

        <div className="no-print" style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button onClick={handlePrint} style={{ padding: '12px 24px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
            🖨️ Print QC Log
          </button>
          <button onClick={onClose} style={{ padding: '12px 24px', background: '#666', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}>
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN PRINT CENTER COMPONENT
// ==========================================
function PrintCenter() {
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);

  // Load data
  useEffect(() => {
    const unsubs = [];
    try {
      unsubs.push(subscribeToUserCollection('recipes', (data) => {
        // Sort by createdAt descending
        const sorted = [...data].sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setRecipes(sorted);
      }));
      unsubs.push(subscribeToUserCollection('ingredients', (data) => {
        setIngredients(data);
      }));
      unsubs.push(subscribeToUserCollection('batches', (data) => {
        setBatches(data);
      }));
    } catch (error) {
      console.error('Error loading data:', error);
    }
    return () => unsubs.forEach(u => u());
  }, []);

  const printOptions = [
    { id: 'recipe', name: '📄 Recipe Print Sheet', desc: 'Full recipe details on A4', needsRecipe: true, color: '#1976d2' },
    { id: 'production', name: '📋 Production Batch Sheet', desc: 'Step-by-step checklist', needsRecipe: true, color: '#4CAF50' },
    { id: 'curing', name: '📅 Curing Tracker', desc: 'Track batches during cure', needsRecipe: false, color: '#ff9800' },
    { id: 'labels', name: '🏷️ Soap Labels', desc: 'Print labels for bars', needsRecipe: true, color: '#9c27b0' },
    { id: 'shopping', name: '🛒 Shopping List', desc: 'Reorder low-stock items', needsRecipe: false, color: '#00796b' },
    { id: 'safety', name: '⚠️ Safety Data Sheet', desc: 'Lye handling safety info', needsRecipe: false, color: '#d32f2f' },
    { id: 'qc', name: '✅ Quality Control Log', desc: 'Post-cure testing checklist', needsRecipe: false, color: '#795548' },
  ];

  const openSheet = (sheetId) => {
    const option = printOptions.find(o => o.id === sheetId);
    if (option?.needsRecipe && !selectedRecipe) {
      alert('Please select a recipe first');
      return;
    }
    setActiveSheet(sheetId);
  };

  return (
    <div>
      <LabNavbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      {/* Page Title */}
      <h2 style={{ margin: '0 0 16px', fontSize: '1.3em' }}>🖨️ Print Center</h2>

      {/* Recipe Selector */}
      <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
        <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Select Recipe (for recipe-specific prints):</label>
        <select 
          value={selectedRecipe?.id || ''} 
          onChange={(e) => setSelectedRecipe(recipes.find(r => r.id === e.target.value) || null)}
          style={{ width: '100%', padding: 12, border: '1px solid #ccc', borderRadius: 6, fontSize: '1em' }}
        >
          <option value="">— Select a recipe —</option>
          {recipes.map(r => (
            <option key={r.id} value={r.id}>{r.name || 'Untitled'} — {r.bars || '?'} bars</option>
          ))}
        </select>
        {selectedRecipe && (
          <div style={{ marginTop: 10, padding: 10, background: '#fff', borderRadius: 6, fontSize: '0.9em' }}>
            <strong>{selectedRecipe.name}</strong> — {(selectedRecipe.oils || selectedRecipe.items || []).length} oils, {selectedRecipe.bars} bars, ₹{num(selectedRecipe.totals?.perBar, 0).toFixed(2)}/bar
          </div>
        )}
      </div>

      {/* Print Options Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {printOptions.map(option => (
          <div 
            key={option.id}
            onClick={() => openSheet(option.id)}
            style={{
              padding: 20,
              background: '#fff',
              border: `2px solid ${option.color}`,
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ fontSize: '1.3em', marginBottom: 8 }}>{option.name}</div>
            <div style={{ color: '#666', fontSize: '0.9em', marginBottom: 12 }}>{option.desc}</div>
            {option.needsRecipe && (
              <div style={{ fontSize: '0.8em', color: option.color, fontWeight: 500 }}>
                {selectedRecipe ? '✓ Recipe selected' : '⚠ Select recipe first'}
              </div>
            )}
            <button 
              style={{ 
                marginTop: 10, width: '100%', padding: '10px 16px', 
                background: option.color, color: '#fff', border: 'none', 
                borderRadius: 6, fontWeight: 600, cursor: 'pointer' 
              }}
            >
              Open & Print
            </button>
          </div>
        ))}
      </div>

      {/* Print Sheet Modals */}
      {activeSheet === 'recipe' && selectedRecipe && (
        <RecipePrintSheet recipe={selectedRecipe} onClose={() => setActiveSheet(null)} />
      )}
      {activeSheet === 'production' && selectedRecipe && (
        <ProductionBatchSheet recipe={selectedRecipe} onClose={() => setActiveSheet(null)} />
      )}
      {activeSheet === 'curing' && (
        <CuringTrackerSheet batches={batches} onClose={() => setActiveSheet(null)} />
      )}
      {activeSheet === 'labels' && selectedRecipe && (
        <SoapLabelsSheet recipe={selectedRecipe} onClose={() => setActiveSheet(null)} />
      )}
      {activeSheet === 'shopping' && (
        <ShoppingListSheet ingredients={ingredients} recipes={recipes} onClose={() => setActiveSheet(null)} />
      )}
      {activeSheet === 'safety' && (
        <SafetyDataSheet onClose={() => setActiveSheet(null)} />
      )}
      {activeSheet === 'qc' && (
        <QualityControlSheet batches={batches} onClose={() => setActiveSheet(null)} />
      )}
    </div>
    </div>
  );
}

export default PrintCenter;

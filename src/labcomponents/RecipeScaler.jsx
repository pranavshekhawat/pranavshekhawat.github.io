/**
 * RecipeScaler Component
 * 
 * Allows scaling recipes by different factors:
 * - By number of bars
 * - By total batch weight
 * - By multiplier
 * - By mold dimensions
 */

import React, { useState, useMemo } from 'react';
import './labcss/recipescaler.css';

const RecipeScaler = ({ 
  recipe, 
  onApplyScale, 
  isOpen, 
  onClose 
}) => {
  const [scaleMode, setScaleMode] = useState('bars');
  const [targetBars, setTargetBars] = useState(recipe?.bars || 6);
  const [targetWeight, setTargetWeight] = useState(recipe?.batchSize || 1000);
  const [multiplier, setMultiplier] = useState(1);
  const [moldLength, setMoldLength] = useState(20);
  const [moldWidth, setMoldWidth] = useState(8);
  const [moldHeight, setMoldHeight] = useState(7);
  const [barWeight, setBarWeight] = useState(recipe?.barWeight || 100);

  // Original values
  const originalOils = recipe?.oils || recipe?.items || [];
  const originalBatchMass = recipe?.computedBatchMass || recipe?.batchSize || 0;
  const originalBars = recipe?.bars || 1;
  const originalBarWeight = recipe?.barWeight || 100;

  // Calculate scale factor based on mode
  const scaleFactor = useMemo(() => {
    switch (scaleMode) {
      case 'bars':
        return originalBars > 0 ? targetBars / originalBars : 1;
      case 'weight':
        return originalBatchMass > 0 ? targetWeight / originalBatchMass : 1;
      case 'multiplier':
        return multiplier;
      case 'mold':
        // Calculate mold volume in cm³, then estimate batch mass
        // Soap density ~1.0-1.1 g/cm³
        const moldVolume = moldLength * moldWidth * moldHeight;
        const estimatedMass = moldVolume * 1.05; // 1.05 g/cm³
        return originalBatchMass > 0 ? estimatedMass / originalBatchMass : 1;
      default:
        return 1;
    }
  }, [scaleMode, targetBars, targetWeight, multiplier, moldLength, moldWidth, moldHeight, originalBatchMass, originalBars]);

  // Calculate scaled values
  const scaled = useMemo(() => {
    const newBatchMass = originalBatchMass * scaleFactor;
    const newBars = Math.round(newBatchMass / barWeight);
    
    const scaledOils = originalOils.map(oil => ({
      ...oil,
      weight: (oil.weight || oil.grams || 0) * scaleFactor,
    }));
    
    const scaledNaOH = (recipe?.adjustedTotalNaoh || 0) * scaleFactor;
    const scaledWater = (recipe?.waterWeight || 0) * scaleFactor;
    const scaledAdditives = (recipe?.additives || []).map(add => ({
      ...add,
      amount: (add.amount || add.weight || 0) * scaleFactor,
    }));
    const scaledEO = recipe?.essentialOil ? {
      ...recipe.essentialOil,
      weight: (recipe.essentialOil.weight || 0) * scaleFactor,
    } : null;

    return {
      batchMass: newBatchMass,
      bars: newBars,
      oils: scaledOils,
      naoh: scaledNaOH,
      water: scaledWater,
      additives: scaledAdditives,
      essentialOil: scaledEO,
      scaleFactor,
    };
  }, [scaleFactor, originalOils, originalBatchMass, recipe, barWeight]);

  const handleApply = () => {
    if (onApplyScale) {
      onApplyScale(scaled);
    }
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="scaler-overlay">
      <div className="scaler-modal">
        <div className="scaler-header">
          <h3>📐 Scale Recipe: {recipe?.name || 'Untitled'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Scale Mode Tabs */}
        <div className="scale-modes">
          <button 
            className={`mode-btn ${scaleMode === 'bars' ? 'active' : ''}`}
            onClick={() => setScaleMode('bars')}
          >
            🧼 By Bars
          </button>
          <button 
            className={`mode-btn ${scaleMode === 'weight' ? 'active' : ''}`}
            onClick={() => setScaleMode('weight')}
          >
            ⚖️ By Weight
          </button>
          <button 
            className={`mode-btn ${scaleMode === 'multiplier' ? 'active' : ''}`}
            onClick={() => setScaleMode('multiplier')}
          >
            ✖️ Multiplier
          </button>
          <button 
            className={`mode-btn ${scaleMode === 'mold' ? 'active' : ''}`}
            onClick={() => setScaleMode('mold')}
          >
            📦 Mold Size
          </button>
        </div>

        {/* Input Section */}
        <div className="scale-inputs">
          {scaleMode === 'bars' && (
            <div className="input-group">
              <label>Target Number of Bars</label>
              <input
                type="number"
                value={targetBars}
                onChange={(e) => setTargetBars(parseInt(e.target.value) || 1)}
                min="1"
              />
              <span className="hint">Original: {originalBars} bars</span>
            </div>
          )}

          {scaleMode === 'weight' && (
            <div className="input-group">
              <label>Target Batch Weight (g)</label>
              <input
                type="number"
                value={targetWeight}
                onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
                min="100"
                step="100"
              />
              <span className="hint">Original: {originalBatchMass.toFixed(0)} g</span>
            </div>
          )}

          {scaleMode === 'multiplier' && (
            <div className="input-group">
              <label>Scale Factor</label>
              <input
                type="number"
                value={multiplier}
                onChange={(e) => setMultiplier(parseFloat(e.target.value) || 1)}
                min="0.1"
                max="10"
                step="0.1"
              />
              <div className="quick-multipliers">
                {[0.5, 1, 1.5, 2, 3].map(m => (
                  <button key={m} onClick={() => setMultiplier(m)}>{m}x</button>
                ))}
              </div>
            </div>
          )}

          {scaleMode === 'mold' && (
            <div className="mold-inputs">
              <div className="input-row">
                <div className="input-group">
                  <label>Length (cm)</label>
                  <input
                    type="number"
                    value={moldLength}
                    onChange={(e) => setMoldLength(parseFloat(e.target.value) || 0)}
                    min="1"
                  />
                </div>
                <div className="input-group">
                  <label>Width (cm)</label>
                  <input
                    type="number"
                    value={moldWidth}
                    onChange={(e) => setMoldWidth(parseFloat(e.target.value) || 0)}
                    min="1"
                  />
                </div>
                <div className="input-group">
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    value={moldHeight}
                    onChange={(e) => setMoldHeight(parseFloat(e.target.value) || 0)}
                    min="1"
                  />
                </div>
              </div>
              <div className="mold-volume">
                Volume: {(moldLength * moldWidth * moldHeight).toFixed(0)} cm³ ≈ {(moldLength * moldWidth * moldHeight * 1.05).toFixed(0)} g
              </div>
            </div>
          )}

          <div className="input-group bar-weight-input">
            <label>Bar Weight (g)</label>
            <input
              type="number"
              value={barWeight}
              onChange={(e) => setBarWeight(parseFloat(e.target.value) || 100)}
              min="50"
              step="10"
            />
          </div>
        </div>

        {/* Scale Factor Display */}
        <div className="scale-factor-display">
          <span className="label">Scale Factor:</span>
          <span className={`factor ${scaleFactor > 1 ? 'increase' : scaleFactor < 1 ? 'decrease' : ''}`}>
            {scaleFactor.toFixed(2)}x
          </span>
        </div>

        {/* Preview */}
        <div className="scale-preview">
          <h4>📋 Scaled Recipe Preview</h4>
          
          <div className="preview-summary">
            <div className="summary-item">
              <span>Batch Mass</span>
              <span>{scaled.batchMass.toFixed(0)} g</span>
            </div>
            <div className="summary-item">
              <span>Bars</span>
              <span>~{scaled.bars}</span>
            </div>
            <div className="summary-item">
              <span>NaOH</span>
              <span>{scaled.naoh.toFixed(1)} g</span>
            </div>
            <div className="summary-item">
              <span>Water</span>
              <span>{scaled.water.toFixed(1)} g</span>
            </div>
          </div>

          <div className="oils-preview">
            <h5>Oils</h5>
            <div className="oils-list">
              {scaled.oils.map((oil, idx) => (
                <div key={idx} className="oil-row">
                  <span className="oil-name">{oil.name || oil.oil}</span>
                  <span className="oil-weight">{oil.weight.toFixed(1)} g</span>
                </div>
              ))}
            </div>
          </div>

          {scaled.additives.length > 0 && (
            <div className="additives-preview">
              <h5>Additives</h5>
              <div className="additives-list">
                {scaled.additives.map((add, idx) => (
                  <div key={idx} className="additive-row">
                    <span>{add.name}</span>
                    <span>{add.amount.toFixed(2)} g</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="scaler-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="apply-btn" onClick={handleApply}>
            ✅ Apply Scale
          </button>
          <button className="print-btn" onClick={() => window.print()}>
            🖨️ Print Scaled
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeScaler;

/**
 * OilPropertyPreview Component
 * 
 * Shows real-time soap property calculations based on selected oils.
 * Displays cleansing, conditioning, hardness, lather etc with visual indicators.
 */

import React, { useMemo } from 'react';
import {
  calculateSoapProperties,
  getPropertyRating,
  getBalanceSuggestions,
  suggestBalancingOils,
  PROPERTY_RANGES,
} from './utils/recipePresets';
import './labcss/oilproperty.css';

const OilPropertyPreview = ({ oils = [], onAddSuggestedOil, totalOilPct = 0 }) => {
  // Calculate properties
  const properties = useMemo(() => calculateSoapProperties(oils), [oils]);
  
  // Get suggestions
  const suggestions = useMemo(() => getBalanceSuggestions(properties), [properties]);
  
  // Get balancing oil suggestions
  const remainingPct = 100 - totalOilPct;
  const balancingOils = useMemo(
    () => suggestBalancingOils(oils, remainingPct),
    [oils, remainingPct]
  );

  // Property bar component
  const PropertyBar = ({ name, value, range }) => {
    const rating = getPropertyRating(name, value);
    const percentage = Math.min(100, (value / (range.max * 1.5)) * 100);
    
    // Calculate marker positions
    const minMarker = (range.min / (range.max * 1.5)) * 100;
    const maxMarker = (range.max / (range.max * 1.5)) * 100;
    const idealMarker = (range.ideal / (range.max * 1.5)) * 100;

    return (
      <div className="property-row">
        <div className="property-label">
          <span className="property-name">{range.label}</span>
          <span className="property-value" style={{ color: rating.color }}>
            {Math.round(value)} <span className="rating-label">({rating.label})</span>
          </span>
        </div>
        <div className="property-bar-container">
          {/* Background zones */}
          <div 
            className="property-zone low" 
            style={{ width: `${minMarker}%` }}
          />
          <div 
            className="property-zone good" 
            style={{ left: `${minMarker}%`, width: `${maxMarker - minMarker}%` }}
          />
          <div 
            className="property-zone high" 
            style={{ left: `${maxMarker}%`, width: `${100 - maxMarker}%` }}
          />
          
          {/* Ideal marker */}
          <div 
            className="ideal-marker" 
            style={{ left: `${idealMarker}%` }}
            title={`Ideal: ${range.ideal}`}
          />
          
          {/* Value indicator */}
          <div 
            className="property-value-indicator" 
            style={{ 
              width: `${percentage}%`,
              backgroundColor: rating.color,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="oil-property-preview">
      <div className="preview-header">
        <h4>📊 Soap Properties Preview</h4>
        <div className="legend">
          <span className="legend-item low">Low</span>
          <span className="legend-item good">Ideal Range</span>
          <span className="legend-item high">High</span>
        </div>
      </div>

      {oils.length === 0 ? (
        <div className="no-oils-message">
          Add oils to see property calculations
        </div>
      ) : (
        <>
          <div className="properties-grid">
            {Object.keys(PROPERTY_RANGES).map(prop => (
              <PropertyBar
                key={prop}
                name={prop}
                value={properties[prop]}
                range={PROPERTY_RANGES[prop]}
              />
            ))}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="suggestions-section">
              <h5>💡 Suggestions</h5>
              <ul className="suggestions-list">
                {suggestions.map((s, i) => (
                  <li key={i} className={`suggestion ${s.priority}`}>
                    <span className={`icon ${s.type}`}>
                      {s.type === 'add' ? '➕' : s.type === 'reduce' ? '➖' : 'ℹ️'}
                    </span>
                    {s.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Balancing suggestions */}
          {remainingPct > 0 && balancingOils.length > 0 && (
            <div className="balancing-section">
              <h5>⚖️ To reach 100% ({remainingPct}% remaining)</h5>
              <div className="balancing-suggestions">
                {balancingOils.map((oil, i) => (
                  <button
                    key={i}
                    className="balancing-btn"
                    onClick={() => onAddSuggestedOil && onAddSuggestedOil(oil)}
                    title={oil.reason}
                  >
                    <span className="oil-name">{oil.name}</span>
                    <span className="oil-pct">+{oil.pct}%</span>
                    <span className="oil-reason">{oil.reason}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick stats */}
          <div className="quick-stats">
            <div className="stat">
              <span className="stat-label">Oil Total</span>
              <span className={`stat-value ${totalOilPct === 100 ? 'complete' : totalOilPct > 100 ? 'over' : ''}`}>
                {totalOilPct}%
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">INS Value</span>
              <span className="stat-value">{Math.round(properties.ins)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Overall</span>
              <span className={`stat-value ${suggestions.length === 0 ? 'good' : suggestions.length > 2 ? 'needs-work' : 'fair'}`}>
                {suggestions.length === 0 ? '✅ Balanced' : suggestions.length > 2 ? '⚠️ Needs Work' : '👍 Fair'}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OilPropertyPreview;

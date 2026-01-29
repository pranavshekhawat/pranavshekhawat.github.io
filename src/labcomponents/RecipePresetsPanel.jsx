/**
 * RecipePresetsPanel Component
 * 
 * Allows users to quickly load pre-made recipe templates
 * to jumpstart their soap making.
 */

import React, { useState } from 'react';
import { RECIPE_PRESETS } from './utils/recipePresets';
import './labcss/recipepresets.css';

const RecipePresetsPanel = ({ onSelectPreset, currentGoal, currentUse }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedPreset, setExpandedPreset] = useState(null);

  // Filter presets
  const filteredPresets = RECIPE_PRESETS.filter(preset => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'beginner') return preset.id.includes('basic') || preset.id.includes('castile');
    if (selectedCategory === 'face') return preset.use?.includes('face');
    if (selectedCategory === 'body') return preset.use?.includes('body') && !preset.use?.includes('face');
    if (selectedCategory === 'special') return preset.id.includes('shampoo') || preset.id.includes('sensitive');
    return true;
  });

  const handlePresetClick = (preset) => {
    if (expandedPreset === preset.id) {
      setExpandedPreset(null);
    } else {
      setExpandedPreset(preset.id);
    }
  };

  const handleUsePreset = (preset) => {
    if (onSelectPreset) {
      onSelectPreset({
        oils: preset.oils,
        superfat: preset.superfat,
        use: preset.use?.[0] || 'body',
        goal: preset.goal || 'balanced',
        notes: preset.notes,
        presetName: preset.name,
      });
    }
  };

  return (
    <div className="recipe-presets-panel">
      <div className="presets-header">
        <h4>🎨 Recipe Templates</h4>
        <p className="subtitle">Quick-start with proven recipes</p>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <button 
          className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${selectedCategory === 'beginner' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('beginner')}
        >
          Beginner
        </button>
        <button 
          className={`filter-btn ${selectedCategory === 'face' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('face')}
        >
          Face
        </button>
        <button 
          className={`filter-btn ${selectedCategory === 'body' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('body')}
        >
          Body
        </button>
        <button 
          className={`filter-btn ${selectedCategory === 'special' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('special')}
        >
          Special
        </button>
      </div>

      {/* Presets List */}
      <div className="presets-list">
        {filteredPresets.map(preset => (
          <div 
            key={preset.id} 
            className={`preset-card ${expandedPreset === preset.id ? 'expanded' : ''}`}
          >
            <div 
              className="preset-header" 
              onClick={() => handlePresetClick(preset)}
            >
              <div className="preset-title">
                <span className="preset-name">{preset.name}</span>
                <span className="preset-desc">{preset.description}</span>
              </div>
              <div className="preset-meta">
                <span className="oil-count">{preset.oils.length} oils</span>
                <span className="superfat">SF {preset.superfat}%</span>
              </div>
            </div>

            {expandedPreset === preset.id && (
              <div className="preset-details">
                <div className="oils-list">
                  <h5>Oil Blend:</h5>
                  {preset.oils.map((oil, i) => (
                    <div key={i} className="oil-item">
                      <span className="oil-name">{oil.name}</span>
                      <span className="oil-pct">{oil.pct}%</span>
                    </div>
                  ))}
                </div>

                <div className="preset-info">
                  <div className="info-row">
                    <span className="label">Use:</span>
                    <span className="value">{preset.use?.join(', ') || 'General'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Goal:</span>
                    <span className="value">{preset.goal || 'Balanced'}</span>
                  </div>
                  {preset.skinType && (
                    <div className="info-row">
                      <span className="label">Skin Type:</span>
                      <span className="value">{preset.skinType.join(', ')}</span>
                    </div>
                  )}
                </div>

                {preset.notes && (
                  <div className="preset-notes">
                    <span className="note-icon">📝</span>
                    {preset.notes}
                  </div>
                )}

                <div className="preset-actions">
                  <button 
                    className="use-preset-btn"
                    onClick={() => handleUsePreset(preset)}
                  >
                    ✨ Use This Recipe
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredPresets.length === 0 && (
        <div className="no-presets">
          No presets found for this category.
        </div>
      )}
    </div>
  );
};

export default RecipePresetsPanel;

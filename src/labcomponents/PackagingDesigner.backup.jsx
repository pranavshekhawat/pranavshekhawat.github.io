import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../utils/firebase-config';
import { collection, onSnapshot, addDoc, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import LabNavbar from './LabNavbar';

/**
 * PackagingDesigner - Mini Illustrator for Soap Packaging
 * 
 * Features:
 * - Select packaging templates (box, wrap, label, sleeve)
 * - Add text with variables like {recipe_name}, {batch_number}
 * - Change fonts, colors, sizes
 * - Add shapes (rectangles, circles, lines)
 * - Drag & drop elements
 * - Export to SVG/PDF
 * - Save & load designs
 */

// Packaging templates with dimensions in mm
const PACKAGING_TEMPLATES = {
  soap_wrap: { name: 'Soap Wrap Band', width: 200, height: 50, description: '200×50mm wrap band' },
  box_front: { name: 'Box Front', width: 80, height: 100, description: '80×100mm box face' },
  label_square: { name: 'Square Label', width: 60, height: 60, description: '60×60mm square label' },
  label_round: { name: 'Round Label', width: 60, height: 60, description: '60mm diameter circle' },
  sleeve: { name: 'Soap Sleeve', width: 180, height: 40, description: '180×40mm sleeve' },
  hang_tag: { name: 'Hang Tag', width: 50, height: 80, description: '50×80mm tag' },
};

// Available fonts
const FONTS = [
  'Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Courier New',
  'Trebuchet MS', 'Impact', 'Comic Sans MS', 'Palatino', 'Garamond',
];

// Variable placeholders
const VARIABLES = [
  { key: '{recipe_name}', label: 'Recipe Name', example: 'Lavender Dreams' },
  { key: '{batch_number}', label: 'Batch Number', example: 'B-2024-001' },
  { key: '{made_date}', label: 'Made Date', example: '15 Jan 2024' },
  { key: '{weight}', label: 'Weight', example: '100g' },
  { key: '{ingredients}', label: 'Ingredients', example: 'Olive Oil, Coconut Oil...' },
  { key: '{brand_name}', label: 'Brand Name', example: 'Your Brand' },
  { key: '{tagline}', label: 'Tagline', example: 'Handcrafted with love' },
  { key: '{price}', label: 'Price', example: '₹150' },
];

function PackagingDesigner() {
  // Canvas state
  const [template, setTemplate] = useState('soap_wrap');
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [zoom, setZoom] = useState(2); // 2x zoom for better editing
  
  // Recipes for variable replacement
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  // Saved designs
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [designName, setDesignName] = useState('My Design');
  
  // Drag state
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef(null);
  const svgRef = useRef(null);

  // Load recipes
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'recipes'), (snap) => {
      setRecipes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Load saved designs
  useEffect(() => {
    const loadDesigns = async () => {
      const snap = await getDocs(collection(db, 'packagingDesigns'));
      setSavedDesigns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    loadDesigns();
  }, []);

  const templateConfig = PACKAGING_TEMPLATES[template];
  const canvasWidth = templateConfig.width * zoom;
  const canvasHeight = templateConfig.height * zoom;

  // Generate unique ID
  const generateId = () => `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add text element
  const addText = (text = 'New Text') => {
    const newElement = {
      id: generateId(),
      type: 'text',
      x: 10,
      y: 30,
      text,
      fontSize: 14,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fill: '#333333',
      textAlign: 'left',
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  // Add shape
  const addShape = (shapeType) => {
    const newElement = {
      id: generateId(),
      type: shapeType,
      x: 20,
      y: 20,
      width: shapeType === 'line' ? 50 : 40,
      height: shapeType === 'line' ? 2 : 40,
      fill: shapeType === 'line' ? 'none' : '#e0e0e0',
      stroke: '#333333',
      strokeWidth: shapeType === 'line' ? 2 : 1,
      rx: shapeType === 'rect' ? 0 : undefined, // Border radius for rect
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  // Update element
  const updateElement = useCallback((id, updates) => {
    setElements(els => els.map(el => el.id === id ? { ...el, ...updates } : el));
  }, []);

  // Delete element
  const deleteElement = (id) => {
    setElements(els => els.filter(el => el.id !== id));
    if (selectedElement === id) setSelectedElement(null);
  };

  // Duplicate element
  const duplicateElement = (id) => {
    const el = elements.find(e => e.id === id);
    if (el) {
      const newEl = { ...el, id: generateId(), x: el.x + 10, y: el.y + 10 };
      setElements([...elements, newEl]);
      setSelectedElement(newEl.id);
    }
  };

  // Move element layer
  const moveLayer = (id, direction) => {
    const idx = elements.findIndex(e => e.id === id);
    if (idx === -1) return;
    
    const newElements = [...elements];
    if (direction === 'up' && idx < elements.length - 1) {
      [newElements[idx], newElements[idx + 1]] = [newElements[idx + 1], newElements[idx]];
    } else if (direction === 'down' && idx > 0) {
      [newElements[idx], newElements[idx - 1]] = [newElements[idx - 1], newElements[idx]];
    }
    setElements(newElements);
  };

  // Replace variables in text
  const replaceVariables = (text) => {
    if (!selectedRecipe) return text;
    
    return text
      .replace(/{recipe_name}/g, selectedRecipe.name || 'Recipe Name')
      .replace(/{batch_number}/g, selectedRecipe.batchNumber || 'B-001')
      .replace(/{made_date}/g, selectedRecipe.madeDate || new Date().toLocaleDateString())
      .replace(/{weight}/g, `${selectedRecipe.barWeight || 100}g`)
      .replace(/{ingredients}/g, (selectedRecipe.oils || []).map(o => o.name).join(', ') || 'Ingredients')
      .replace(/{brand_name}/g, selectedRecipe.brandName || 'Your Brand')
      .replace(/{tagline}/g, selectedRecipe.tagline || 'Handcrafted with love')
      .replace(/{price}/g, `₹${selectedRecipe.pricing?.sellingPrice || 150}`);
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e, elementId) => {
    e.stopPropagation();
    const el = elements.find(e => e.id === elementId);
    if (!el) return;
    
    setSelectedElement(elementId);
    setDragging(elementId);
    
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: (e.clientX - rect.left) / zoom - el.x,
      y: (e.clientY - rect.top) / zoom - el.y,
    });
  };

  // Handle mouse move
  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(templateConfig.width - 20, (e.clientX - rect.left) / zoom - dragOffset.x));
    const y = Math.max(0, Math.min(templateConfig.height - 10, (e.clientY - rect.top) / zoom - dragOffset.y));
    
    updateElement(dragging, { x: Math.round(x), y: Math.round(y) });
  }, [dragging, dragOffset, zoom, templateConfig, updateElement]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  // Add mouse event listeners
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  // Render SVG element
  const renderElement = (el, forExport = false) => {
    const isSelected = !forExport && selectedElement === el.id;
    const scale = forExport ? 1 : zoom;
    
    const commonProps = {
      key: el.id,
      onMouseDown: forExport ? undefined : (e) => handleMouseDown(e, el.id),
      style: { cursor: forExport ? 'default' : 'move' },
    };

    if (el.type === 'text') {
      const displayText = forExport ? replaceVariables(el.text) : el.text;
      return (
        <g {...commonProps}>
          <text
            x={el.x * scale}
            y={el.y * scale}
            fontSize={el.fontSize * scale}
            fontFamily={el.fontFamily}
            fontWeight={el.fontWeight}
            fontStyle={el.fontStyle}
            fill={el.fill}
            textAnchor={el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start'}
          >
            {displayText}
          </text>
          {isSelected && (
            <rect
              x={el.x * scale - 2}
              y={el.y * scale - el.fontSize * scale}
              width={displayText.length * el.fontSize * 0.6 * scale + 4}
              height={el.fontSize * scale + 4}
              fill="none"
              stroke="#1976d2"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          )}
        </g>
      );
    }

    if (el.type === 'rect') {
      return (
        <g {...commonProps}>
          <rect
            x={el.x * scale}
            y={el.y * scale}
            width={el.width * scale}
            height={el.height * scale}
            fill={el.fill}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
            rx={el.rx * scale || 0}
          />
          {isSelected && (
            <rect
              x={el.x * scale - 2}
              y={el.y * scale - 2}
              width={el.width * scale + 4}
              height={el.height * scale + 4}
              fill="none"
              stroke="#1976d2"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          )}
        </g>
      );
    }

    if (el.type === 'circle') {
      const r = Math.min(el.width, el.height) / 2;
      return (
        <g {...commonProps}>
          <circle
            cx={(el.x + r) * scale}
            cy={(el.y + r) * scale}
            r={r * scale}
            fill={el.fill}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
          />
          {isSelected && (
            <circle
              cx={(el.x + r) * scale}
              cy={(el.y + r) * scale}
              r={(r + 2) * scale}
              fill="none"
              stroke="#1976d2"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          )}
        </g>
      );
    }

    if (el.type === 'line') {
      return (
        <g {...commonProps}>
          <line
            x1={el.x * scale}
            y1={el.y * scale}
            x2={(el.x + el.width) * scale}
            y2={(el.y + el.height) * scale}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth * scale}
          />
          {isSelected && (
            <rect
              x={Math.min(el.x, el.x + el.width) * scale - 4}
              y={Math.min(el.y, el.y + el.height) * scale - 4}
              width={Math.abs(el.width) * scale + 8}
              height={Math.abs(el.height) * scale + 8}
              fill="none"
              stroke="#1976d2"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          )}
        </g>
      );
    }

    return null;
  };

  // Export SVG
  const exportSVG = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${templateConfig.width}mm" height="${templateConfig.height}mm" viewBox="0 0 ${templateConfig.width} ${templateConfig.height}">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  ${elements.map(el => {
    if (el.type === 'text') {
      const displayText = replaceVariables(el.text);
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" font-family="${el.fontFamily}" font-weight="${el.fontWeight}" font-style="${el.fontStyle}" fill="${el.fill}">${displayText}</text>`;
    }
    if (el.type === 'rect') {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" rx="${el.rx || 0}"/>`;
    }
    if (el.type === 'circle') {
      const r = Math.min(el.width, el.height) / 2;
      return `<circle cx="${el.x + r}" cy="${el.y + r}" r="${r}" fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}"/>`;
    }
    if (el.type === 'line') {
      return `<line x1="${el.x}" y1="${el.y}" x2="${el.x + el.width}" y2="${el.y + el.height}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}"/>`;
    }
    return '';
  }).join('\n  ')}
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${designName.replace(/\s+/g, '_')}_${template}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save design to Firebase
  const saveDesign = async () => {
    try {
      await addDoc(collection(db, 'packagingDesigns'), {
        name: designName,
        template,
        elements,
        bgColor,
        createdAt: new Date().toISOString(),
      });
      alert('✅ Design saved!');
      // Reload designs
      const snap = await getDocs(collection(db, 'packagingDesigns'));
      setSavedDesigns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save design');
    }
  };

  // Load a saved design
  const loadDesign = (design) => {
    setDesignName(design.name);
    setTemplate(design.template);
    setElements(design.elements || []);
    setBgColor(design.bgColor || '#ffffff');
    setSelectedElement(null);
  };

  // Get selected element
  const selected = elements.find(e => e.id === selectedElement);

  return (
    <div>
      <LabNavbar />
      <div style={{ display: 'flex', height: 'calc(100vh - 120px)', background: '#f5f5f5' }}>
      {/* Left Sidebar - Tools */}
      <div style={{ width: 260, background: '#fff', borderRight: '1px solid #e0e0e0', padding: 16, overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '1.2em' }}>📦 Packaging Designer</h2>
        
        {/* Template Selection */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600, fontSize: '0.85em', display: 'block', marginBottom: 8 }}>Template</label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
          >
            {Object.entries(PACKAGING_TEMPLATES).map(([key, t]) => (
              <option key={key} value={key}>{t.name} ({t.description})</option>
            ))}
          </select>
        </div>

        {/* Recipe Selection */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600, fontSize: '0.85em', display: 'block', marginBottom: 8 }}>Apply Recipe Data</label>
          <select
            value={selectedRecipe?.id || ''}
            onChange={(e) => setSelectedRecipe(recipes.find(r => r.id === e.target.value) || null)}
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
          >
            <option value="">None (use placeholders)</option>
            {recipes.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Add Elements */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600, fontSize: '0.85em', display: 'block', marginBottom: 8 }}>Add Elements</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={() => addText('Text')} style={{ padding: '10px 12px', background: '#e3f2fd', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85em' }}>
              📝 Text
            </button>
            <button onClick={() => addShape('rect')} style={{ padding: '10px 12px', background: '#fff3e0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85em' }}>
              ⬜ Rectangle
            </button>
            <button onClick={() => addShape('circle')} style={{ padding: '10px 12px', background: '#f3e5f5', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85em' }}>
              ⚪ Circle
            </button>
            <button onClick={() => addShape('line')} style={{ padding: '10px 12px', background: '#e8f5e9', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85em' }}>
              ➖ Line
            </button>
          </div>
        </div>

        {/* Variables */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600, fontSize: '0.85em', display: 'block', marginBottom: 8 }}>Variables (click to add)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {VARIABLES.map(v => (
              <button
                key={v.key}
                onClick={() => addText(v.key)}
                style={{ padding: '4px 8px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: '0.75em' }}
                title={v.example}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Background Color */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600, fontSize: '0.85em', display: 'block', marginBottom: 8 }}>Background</label>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            style={{ width: '100%', height: 40, border: 'none', borderRadius: 6, cursor: 'pointer' }}
          />
        </div>

        {/* Zoom */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600, fontSize: '0.85em', display: 'block', marginBottom: 8 }}>Zoom: {zoom}x</label>
          <input
            type="range"
            min="1"
            max="4"
            step="0.5"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Save/Load */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600, fontSize: '0.85em', display: 'block', marginBottom: 8 }}>Design Name</label>
          <input
            type="text"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, marginBottom: 8 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={saveDesign} style={{ flex: 1, padding: 10, background: '#4caf50', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
              💾 Save
            </button>
            <button onClick={exportSVG} style={{ flex: 1, padding: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
              📥 Export SVG
            </button>
          </div>
        </div>

        {/* Saved Designs */}
        {savedDesigns.length > 0 && (
          <div>
            <label style={{ fontWeight: 600, fontSize: '0.85em', display: 'block', marginBottom: 8 }}>Saved Designs</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {savedDesigns.map(d => (
                <button
                  key={d.id}
                  onClick={() => loadDesign(d)}
                  style={{ padding: 8, background: '#fafafa', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: '0.8em', textAlign: 'left' }}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Center - Canvas */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: 40 }}>
        <div
          ref={canvasRef}
          onClick={() => setSelectedElement(null)}
          style={{
            width: canvasWidth,
            height: canvasHeight,
            background: bgColor,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            position: 'relative',
          }}
        >
          <svg
            ref={svgRef}
            width={canvasWidth}
            height={canvasHeight}
            style={{ display: 'block' }}
          >
            {/* Render elements */}
            {elements.map(el => renderElement(el))}
          </svg>
          
          {/* Template outline for round labels */}
          {template === 'label_round' && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: canvasWidth,
              height: canvasHeight,
              borderRadius: '50%',
              border: '2px dashed #ccc',
              pointerEvents: 'none',
              boxSizing: 'border-box',
            }} />
          )}
        </div>
      </div>

      {/* Right Sidebar - Properties */}
      <div style={{ width: 280, background: '#fff', borderLeft: '1px solid #e0e0e0', padding: 16, overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1.1em' }}>🎨 Properties</h3>
        
        {selected ? (
          <div>
            {/* Element Type */}
            <div style={{ marginBottom: 16, padding: 10, background: '#f5f5f5', borderRadius: 8 }}>
              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{selected.type}</span>
              <span style={{ color: '#666', marginLeft: 8 }}>at ({selected.x}, {selected.y})</span>
            </div>

            {/* Text Properties */}
            {selected.type === 'text' && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: '0.8em', color: '#666', display: 'block', marginBottom: 4 }}>Text Content</label>
                  <textarea
                    value={selected.text}
                    onChange={(e) => updateElement(selected.id, { text: e.target.value })}
                    style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6, resize: 'vertical', minHeight: 60 }}
                  />
                </div>
                
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: '0.8em', color: '#666', display: 'block', marginBottom: 4 }}>Font Family</label>
                  <select
                    value={selected.fontFamily}
                    onChange={(e) => updateElement(selected.id, { fontFamily: e.target.value })}
                    style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
                  >
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.8em', color: '#666', display: 'block', marginBottom: 4 }}>Size</label>
                    <input
                      type="number"
                      value={selected.fontSize}
                      onChange={(e) => updateElement(selected.id, { fontSize: Number(e.target.value) })}
                      style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8em', color: '#666', display: 'block', marginBottom: 4 }}>Color</label>
                    <input
                      type="color"
                      value={selected.fill}
                      onChange={(e) => updateElement(selected.id, { fill: e.target.value })}
                      style={{ width: '100%', height: 36, border: 'none', borderRadius: 6 }}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  <button
                    onClick={() => updateElement(selected.id, { fontWeight: selected.fontWeight === 'bold' ? 'normal' : 'bold' })}
                    style={{ flex: 1, padding: 8, background: selected.fontWeight === 'bold' ? '#1976d2' : '#f5f5f5', color: selected.fontWeight === 'bold' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    B
                  </button>
                  <button
                    onClick={() => updateElement(selected.id, { fontStyle: selected.fontStyle === 'italic' ? 'normal' : 'italic' })}
                    style={{ flex: 1, padding: 8, background: selected.fontStyle === 'italic' ? '#1976d2' : '#f5f5f5', color: selected.fontStyle === 'italic' ? '#fff' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer', fontStyle: 'italic' }}
                  >
                    I
                  </button>
                </div>
              </>
            )}

            {/* Shape Properties */}
            {(selected.type === 'rect' || selected.type === 'circle') && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.8em', color: '#666', display: 'block', marginBottom: 4 }}>Width</label>
                    <input
                      type="number"
                      value={selected.width}
                      onChange={(e) => updateElement(selected.id, { width: Number(e.target.value) })}
                      style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8em', color: '#666', display: 'block', marginBottom: 4 }}>Height</label>
                    <input
                      type="number"
                      value={selected.height}
                      onChange={(e) => updateElement(selected.id, { height: Number(e.target.value) })}
                      style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.8em', color: '#666', display: 'block', marginBottom: 4 }}>Fill</label>
                    <input
                      type="color"
                      value={selected.fill === 'none' ? '#ffffff' : selected.fill}
                      onChange={(e) => updateElement(selected.id, { fill: e.target.value })}
                      style={{ width: '100%', height: 36, border: 'none', borderRadius: 6 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8em', color: '#666', display: 'block', marginBottom: 4 }}>Stroke</label>
                    <input
                      type="color"
                      value={selected.stroke}
                      onChange={(e) => updateElement(selected.id, { stroke: e.target.value })}
                      style={{ width: '100%', height: 36, border: 'none', borderRadius: 6 }}
                    />
                  </div>
                </div>
                
                {selected.type === 'rect' && (
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: '0.8em', color: '#666', display: 'block', marginBottom: 4 }}>Corner Radius</label>
                    <input
                      type="number"
                      value={selected.rx || 0}
                      onChange={(e) => updateElement(selected.id, { rx: Number(e.target.value) })}
                      style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
                    />
                  </div>
                )}
              </>
            )}

            {/* Line Properties */}
            {selected.type === 'line' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.8em', color: '#666', display: 'block', marginBottom: 4 }}>Length X</label>
                    <input
                      type="number"
                      value={selected.width}
                      onChange={(e) => updateElement(selected.id, { width: Number(e.target.value) })}
                      style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8em', color: '#666', display: 'block', marginBottom: 4 }}>Length Y</label>
                    <input
                      type="number"
                      value={selected.height}
                      onChange={(e) => updateElement(selected.id, { height: Number(e.target.value) })}
                      style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.8em', color: '#666', display: 'block', marginBottom: 4 }}>Color</label>
                    <input
                      type="color"
                      value={selected.stroke}
                      onChange={(e) => updateElement(selected.id, { stroke: e.target.value })}
                      style={{ width: '100%', height: 36, border: 'none', borderRadius: 6 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8em', color: '#666', display: 'block', marginBottom: 4 }}>Thickness</label>
                    <input
                      type="number"
                      value={selected.strokeWidth}
                      onChange={(e) => updateElement(selected.id, { strokeWidth: Number(e.target.value) })}
                      style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Position */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: '0.8em', color: '#666', display: 'block', marginBottom: 4 }}>X</label>
                <input
                  type="number"
                  value={selected.x}
                  onChange={(e) => updateElement(selected.id, { x: Number(e.target.value) })}
                  style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8em', color: '#666', display: 'block', marginBottom: 4 }}>Y</label>
                <input
                  type="number"
                  value={selected.y}
                  onChange={(e) => updateElement(selected.id, { y: Number(e.target.value) })}
                  style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => moveLayer(selected.id, 'up')} style={{ flex: 1, padding: 8, background: '#f5f5f5', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                  ⬆️ Up
                </button>
                <button onClick={() => moveLayer(selected.id, 'down')} style={{ flex: 1, padding: 8, background: '#f5f5f5', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                  ⬇️ Down
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => duplicateElement(selected.id)} style={{ flex: 1, padding: 8, background: '#e3f2fd', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                  📋 Duplicate
                </button>
                <button onClick={() => deleteElement(selected.id)} style={{ flex: 1, padding: 8, background: '#ffebee', color: '#c62828', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <div style={{ fontSize: '2em', marginBottom: 8 }}>👆</div>
            <div>Select an element to edit its properties</div>
          </div>
        )}

        {/* Elements List */}
        {elements.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.9em', color: '#666' }}>Layers ({elements.length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[...elements].reverse().map(el => (
                <div
                  key={el.id}
                  onClick={() => setSelectedElement(el.id)}
                  style={{
                    padding: 8,
                    background: selectedElement === el.id ? '#e3f2fd' : '#fafafa',
                    border: selectedElement === el.id ? '1px solid #1976d2' : '1px solid transparent',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: '0.85em',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>
                    {el.type === 'text' ? '📝' : el.type === 'rect' ? '⬜' : el.type === 'circle' ? '⚪' : '➖'}
                    {' '}
                    {el.type === 'text' ? (el.text.length > 15 ? el.text.slice(0, 15) + '...' : el.text) : el.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

export default PackagingDesigner;

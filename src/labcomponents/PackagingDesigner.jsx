import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../utils/firebase-config';
import { collection, onSnapshot, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import LabNavbar from './LabNavbar';

/**
 * PackagingDesigner v2.0 - Enhanced Mini Illustrator for Soap Packaging
 * 
 * New Features:
 * - Image upload support 🖼️
 * - Undo/Redo history ↩️
 * - Keyboard shortcuts ⌨️
 * - Grid & snap-to-grid 📐
 * - Template guides 📏
 * - Alignment tools ↔️
 * - Rotation & opacity controls 🎨
 * - PNG export (in addition to SVG) 📥
 * - Preview mode with variable replacement 👁️
 * - Color palettes 🎨
 * - Text presets (Title, Subtitle, etc.)
 * - Copy/Paste clipboard 📋
 * - More templates 📦
 */

// Packaging templates with dimensions in mm and guides
const PACKAGING_TEMPLATES = {
  soap_wrap: { 
    name: 'Soap Wrap Band', 
    width: 200, 
    height: 50, 
    description: '200×50mm wrap band',
    guides: [{ type: 'v', pos: 100 }]
  },
  box_front: { 
    name: 'Box Front', 
    width: 80, 
    height: 100, 
    description: '80×100mm box face',
    guides: [{ type: 'v', pos: 40 }, { type: 'h', pos: 50 }]
  },
  label_square: { 
    name: 'Square Label', 
    width: 60, 
    height: 60, 
    description: '60×60mm square label',
    guides: [{ type: 'v', pos: 30 }, { type: 'h', pos: 30 }]
  },
  label_round: { 
    name: 'Round Label', 
    width: 60, 
    height: 60, 
    description: '60mm diameter circle',
    isRound: true,
    guides: [{ type: 'v', pos: 30 }, { type: 'h', pos: 30 }]
  },
  sleeve: { 
    name: 'Soap Sleeve', 
    width: 180, 
    height: 40, 
    description: '180×40mm sleeve',
    guides: [{ type: 'v', pos: 90 }]
  },
  hang_tag: { 
    name: 'Hang Tag', 
    width: 50, 
    height: 80, 
    description: '50×80mm tag',
    hasHole: true,
    guides: [{ type: 'v', pos: 25 }, { type: 'h', pos: 10 }]
  },
  cigar_band: { 
    name: 'Cigar Band', 
    width: 160, 
    height: 30, 
    description: '160×30mm thin band',
    guides: [{ type: 'v', pos: 80 }]
  },
  belly_band: { 
    name: 'Belly Band', 
    width: 220, 
    height: 60, 
    description: '220×60mm wide wrap',
    guides: [{ type: 'v', pos: 110 }]
  },
};

// Available fonts including some common choices
const FONTS = [
  'Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Courier New',
  'Trebuchet MS', 'Palatino', 'Garamond', 'Brush Script MT',
  'Playfair Display', 'Montserrat', 'Open Sans', 'Lato', 'Roboto',
];

// Variable placeholders
const VARIABLES = [
  { key: '{recipe_name}', label: 'Recipe Name', example: 'Lavender Dreams' },
  { key: '{batch_number}', label: 'Batch #', example: 'B-2024-001' },
  { key: '{made_date}', label: 'Made Date', example: '15 Jan 2024' },
  { key: '{cure_date}', label: 'Cure Date', example: '15 Feb 2024' },
  { key: '{weight}', label: 'Weight', example: '100g' },
  { key: '{ingredients}', label: 'Ingredients', example: 'Olive Oil, Coconut Oil...' },
  { key: '{brand_name}', label: 'Brand', example: 'Your Brand' },
  { key: '{tagline}', label: 'Tagline', example: 'Handcrafted with love' },
  { key: '{price}', label: 'Price', example: '₹150' },
  { key: '{scent}', label: 'Scent', example: 'Lavender & Rosemary' },
];

// Preset color palettes
const COLOR_PALETTES = {
  natural: ['#8B4513', '#D2691E', '#F5DEB3', '#228B22', '#2F4F4F', '#fff8dc'],
  modern: ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#ffffff', '#f5f5f5'],
  pastel: ['#ffc8dd', '#ffafcc', '#bde0fe', '#a2d2ff', '#cdb4db', '#fff1e6'],
  earth: ['#606c38', '#283618', '#fefae0', '#dda15e', '#bc6c25', '#ffffff'],
  luxe: ['#0d1b2a', '#1b263b', '#415a77', '#778da9', '#e0e1dd', '#c9a227'],
  minimal: ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff'],
};

// Text presets for quick adding
const TEXT_PRESETS = [
  { label: 'Title', fontSize: 18, fontWeight: 'bold', fontFamily: 'Georgia' },
  { label: 'Subtitle', fontSize: 12, fontWeight: 'normal', fontFamily: 'Georgia' },
  { label: 'Body', fontSize: 9, fontWeight: 'normal', fontFamily: 'Arial' },
  { label: 'Caption', fontSize: 7, fontWeight: 'normal', fontFamily: 'Arial' },
  { label: 'Price Tag', fontSize: 14, fontWeight: 'bold', fontFamily: 'Arial' },
];

function PackagingDesigner() {
  // Canvas state
  const [template, setTemplate] = useState('soap_wrap');
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [zoom, setZoom] = useState(2.5);
  
  // Grid & Guides
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize] = useState(5); // 5mm grid
  const [showGuides, setShowGuides] = useState(true);
  
  // History for undo/redo
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Recipes for variable replacement
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  // Saved designs
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [designName, setDesignName] = useState('My Design');
  
  // View modes
  const [previewMode, setPreviewMode] = useState(false);
  const [currentPalette, setCurrentPalette] = useState('natural');
  
  // Drag state
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Clipboard
  const [clipboard, setClipboard] = useState(null);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

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
      try {
        const snap = await getDocs(collection(db, 'packagingDesigns'));
        setSavedDesigns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Failed to load designs:', err);
      }
    };
    loadDesigns();
  }, []);

  const templateConfig = PACKAGING_TEMPLATES[template];
  const canvasWidth = templateConfig.width * zoom;
  const canvasHeight = templateConfig.height * zoom;

  // Generate unique ID
  const generateId = () => `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Snap to grid helper
  const snapValue = useCallback((value) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  // Add to history for undo/redo
  const addToHistory = useCallback((newElements) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push([...newElements]);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setElements(history[historyIndex - 1] || []);
    }
  }, [historyIndex, history]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setElements(history[historyIndex + 1] || []);
    }
  }, [historyIndex, history]);

  // Update element
  const updateElement = useCallback((id, updates) => {
    setElements(els => els.map(el => el.id === id ? { ...el, ...updates } : el));
  }, []);

  // Delete element
  const deleteElement = useCallback((id) => {
    const newElements = elements.filter(el => el.id !== id);
    addToHistory(newElements);
    setElements(newElements);
    if (selectedElement === id) setSelectedElement(null);
  }, [elements, selectedElement, addToHistory]);

  // Duplicate element
  const duplicateElement = useCallback((id) => {
    const el = elements.find(e => e.id === id);
    if (el) {
      const newEl = { ...el, id: generateId(), x: el.x + 5, y: el.y + 5 };
      const newElements = [...elements, newEl];
      addToHistory(newElements);
      setElements(newElements);
      setSelectedElement(newEl.id);
    }
  }, [elements, addToHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const selected = elements.find(el => el.id === selectedElement);
      
      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
        e.preventDefault();
        deleteElement(selected.id);
      }
      
      // Duplicate (Ctrl+D)
      if (e.key === 'd' && (e.ctrlKey || e.metaKey) && selected) {
        e.preventDefault();
        duplicateElement(selected.id);
      }
      
      // Copy (Ctrl+C)
      if (e.key === 'c' && (e.ctrlKey || e.metaKey) && selected) {
        e.preventDefault();
        setClipboard({ ...selected });
      }
      
      // Paste (Ctrl+V)
      if (e.key === 'v' && (e.ctrlKey || e.metaKey) && clipboard) {
        e.preventDefault();
        const newEl = { ...clipboard, id: generateId(), x: clipboard.x + 5, y: clipboard.y + 5 };
        addToHistory([...elements, newEl]);
        setElements(prev => [...prev, newEl]);
        setSelectedElement(newEl.id);
      }
      
      // Undo (Ctrl+Z)
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      
      // Redo (Ctrl+Shift+Z)
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      
      // Arrow keys for nudging
      if (selected && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const updates = {
          ArrowUp: { y: selected.y - step },
          ArrowDown: { y: selected.y + step },
          ArrowLeft: { x: selected.x - step },
          ArrowRight: { x: selected.x + step },
        };
        updateElement(selected.id, updates[e.key]);
      }
      
      // Escape to deselect
      if (e.key === 'Escape') {
        setSelectedElement(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, elements, clipboard, undo, redo, deleteElement, duplicateElement, addToHistory, updateElement]);

  // Add text element
  const addText = (text = 'New Text', preset = null) => {
    const config = preset || TEXT_PRESETS[0];
    const newElement = {
      id: generateId(),
      type: 'text',
      x: snapValue(templateConfig.width / 2 - 20),
      y: snapValue(templateConfig.height / 2),
      text,
      fontSize: config.fontSize || 14,
      fontFamily: config.fontFamily || 'Arial',
      fontWeight: config.fontWeight || 'normal',
      fontStyle: 'normal',
      fill: '#333333',
      textAlign: 'left',
      rotation: 0,
      opacity: 1,
    };
    const newElements = [...elements, newElement];
    addToHistory(newElements);
    setElements(newElements);
    setSelectedElement(newElement.id);
  };

  // Add shape
  const addShape = (shapeType) => {
    const newElement = {
      id: generateId(),
      type: shapeType,
      x: snapValue(templateConfig.width / 2 - 20),
      y: snapValue(templateConfig.height / 2 - 20),
      width: shapeType === 'line' ? 50 : 40,
      height: shapeType === 'line' ? 0 : 40,
      fill: shapeType === 'line' ? 'none' : '#e0e0e0',
      stroke: '#333333',
      strokeWidth: shapeType === 'line' ? 2 : 1,
      rx: 0,
      rotation: 0,
      opacity: 1,
    };
    const newElements = [...elements, newElement];
    addToHistory(newElements);
    setElements(newElements);
    setSelectedElement(newElement.id);
  };

  // Add image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Scale image to fit template
        const maxWidth = templateConfig.width * 0.8;
        const maxHeight = templateConfig.height * 0.8;
        let width = img.width / 4; // Assume 4px per mm for imported images
        let height = img.height / 4;
        
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (maxHeight / height) * width;
          height = maxHeight;
        }
        
        const newElement = {
          id: generateId(),
          type: 'image',
          x: snapValue((templateConfig.width - width) / 2),
          y: snapValue((templateConfig.height - height) / 2),
          width,
          height,
          src: event.target.result,
          rotation: 0,
          opacity: 1,
        };
        const newElements = [...elements, newElement];
        addToHistory(newElements);
        setElements(newElements);
        setSelectedElement(newElement.id);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
    } else if (direction === 'top') {
      const [removed] = newElements.splice(idx, 1);
      newElements.push(removed);
    } else if (direction === 'bottom') {
      const [removed] = newElements.splice(idx, 1);
      newElements.unshift(removed);
    }
    setElements(newElements);
  };

  // Alignment functions
  const alignElements = (alignment) => {
    const selected = elements.find(e => e.id === selectedElement);
    if (!selected) return;
    
    let updates = {};
    const elWidth = selected.width || (selected.text?.length * selected.fontSize * 0.5) || 0;
    const elHeight = selected.height || selected.fontSize || 0;
    
    switch(alignment) {
      case 'left':
        updates = { x: 0 };
        break;
      case 'center':
        updates = { x: (templateConfig.width - elWidth) / 2 };
        break;
      case 'right':
        updates = { x: templateConfig.width - elWidth };
        break;
      case 'top':
        updates = { y: selected.type === 'text' ? selected.fontSize : 0 };
        break;
      case 'middle':
        updates = { y: (templateConfig.height - elHeight) / 2 + (selected.type === 'text' ? selected.fontSize / 2 : 0) };
        break;
      case 'bottom':
        updates = { y: templateConfig.height - (selected.type === 'text' ? 0 : elHeight) };
        break;
      default:
        break;
    }
    updateElement(selected.id, updates);
  };

  // Replace variables in text
  const replaceVariables = useCallback((text) => {
    if (!selectedRecipe) return text;
    
    return text
      .replace(/{recipe_name}/g, selectedRecipe.name || 'Recipe Name')
      .replace(/{batch_number}/g, selectedRecipe.batchNumber || 'B-001')
      .replace(/{made_date}/g, selectedRecipe.madeDate || new Date().toLocaleDateString())
      .replace(/{cure_date}/g, selectedRecipe.cureDate || 'TBD')
      .replace(/{weight}/g, `${selectedRecipe.barWeight || 100}g`)
      .replace(/{ingredients}/g, (selectedRecipe.oils || []).map(o => o.name).join(', ') || 'Ingredients')
      .replace(/{brand_name}/g, selectedRecipe.brandName || 'Your Brand')
      .replace(/{tagline}/g, selectedRecipe.tagline || 'Handcrafted with love')
      .replace(/{price}/g, `₹${selectedRecipe.pricing?.sellingPrice || 150}`)
      .replace(/{scent}/g, selectedRecipe.scent || selectedRecipe.fragranceName || 'Unscented');
  }, [selectedRecipe]);

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
    let x = (e.clientX - rect.left) / zoom - dragOffset.x;
    let y = (e.clientY - rect.top) / zoom - dragOffset.y;
    
    x = Math.max(0, Math.min(templateConfig.width - 5, snapValue(x)));
    y = Math.max(0, Math.min(templateConfig.height - 5, snapValue(y)));
    
    updateElement(dragging, { x: Math.round(x), y: Math.round(y) });
  }, [dragging, dragOffset, zoom, templateConfig, updateElement, snapValue]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (dragging) {
      addToHistory(elements);
    }
    setDragging(null);
  }, [dragging, elements, addToHistory]);

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
    const isSelected = !forExport && !previewMode && selectedElement === el.id;
    const scale = forExport ? 1 : zoom;
    
    const commonProps = {
      key: el.id,
      onMouseDown: (forExport || previewMode) ? undefined : (e) => handleMouseDown(e, el.id),
      style: { cursor: (forExport || previewMode) ? 'default' : 'move', opacity: el.opacity || 1 },
    };

    const transform = el.rotation ? `rotate(${el.rotation} ${el.x * scale + (el.width || 0) * scale / 2} ${el.y * scale + (el.height || 0) * scale / 2})` : undefined;

    if (el.type === 'text') {
      const displayText = (forExport || previewMode) ? replaceVariables(el.text) : el.text;
      return (
        <g {...commonProps} transform={transform}>
          <text
            x={el.x * scale}
            y={el.y * scale}
            fontSize={el.fontSize * scale}
            fontFamily={el.fontFamily}
            fontWeight={el.fontWeight}
            fontStyle={el.fontStyle}
            fill={el.fill}
            textAnchor={el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start'}
            opacity={el.opacity || 1}
          >
            {displayText}
          </text>
          {isSelected && (
            <rect
              x={el.x * scale - 3}
              y={el.y * scale - el.fontSize * scale}
              width={Math.max(displayText.length * el.fontSize * 0.55 * scale + 6, 30)}
              height={el.fontSize * scale + 6}
              fill="none"
              stroke="#1976d2"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
          )}
        </g>
      );
    }

    if (el.type === 'rect') {
      return (
        <g {...commonProps} transform={transform}>
          <rect
            x={el.x * scale}
            y={el.y * scale}
            width={el.width * scale}
            height={el.height * scale}
            fill={el.fill}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
            rx={(el.rx || 0) * scale}
            opacity={el.opacity || 1}
          />
          {isSelected && (
            <rect
              x={el.x * scale - 3}
              y={el.y * scale - 3}
              width={el.width * scale + 6}
              height={el.height * scale + 6}
              fill="none"
              stroke="#1976d2"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
          )}
        </g>
      );
    }

    if (el.type === 'circle') {
      const r = Math.min(el.width, el.height) / 2;
      return (
        <g {...commonProps} transform={transform}>
          <circle
            cx={(el.x + r) * scale}
            cy={(el.y + r) * scale}
            r={r * scale}
            fill={el.fill}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
            opacity={el.opacity || 1}
          />
          {isSelected && (
            <circle
              cx={(el.x + r) * scale}
              cy={(el.y + r) * scale}
              r={(r + 3) * scale}
              fill="none"
              stroke="#1976d2"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
          )}
        </g>
      );
    }

    if (el.type === 'line') {
      return (
        <g {...commonProps} transform={transform}>
          <line
            x1={el.x * scale}
            y1={el.y * scale}
            x2={(el.x + el.width) * scale}
            y2={(el.y + el.height) * scale}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth * scale}
            opacity={el.opacity || 1}
          />
          {isSelected && (
            <rect
              x={Math.min(el.x, el.x + el.width) * scale - 5}
              y={Math.min(el.y, el.y + el.height) * scale - 5}
              width={Math.abs(el.width) * scale + 10}
              height={Math.max(Math.abs(el.height) * scale + 10, 10)}
              fill="none"
              stroke="#1976d2"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
          )}
        </g>
      );
    }

    if (el.type === 'image') {
      return (
        <g {...commonProps} transform={transform}>
          <image
            href={el.src}
            x={el.x * scale}
            y={el.y * scale}
            width={el.width * scale}
            height={el.height * scale}
            preserveAspectRatio="xMidYMid meet"
            opacity={el.opacity || 1}
          />
          {isSelected && (
            <rect
              x={el.x * scale - 3}
              y={el.y * scale - 3}
              width={el.width * scale + 6}
              height={el.height * scale + 6}
              fill="none"
              stroke="#1976d2"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
          )}
        </g>
      );
    }

    return null;
  };

  // Render grid
  const renderGrid = () => {
    if (!showGrid || previewMode) return null;
    
    const lines = [];
    const gridPx = gridSize * zoom;
    
    for (let x = 0; x <= canvasWidth; x += gridPx) {
      lines.push(
        <line key={`v${x}`} x1={x} y1={0} x2={x} y2={canvasHeight} stroke="#e0e0e0" strokeWidth="0.5" />
      );
    }
    for (let y = 0; y <= canvasHeight; y += gridPx) {
      lines.push(
        <line key={`h${y}`} x1={0} y1={y} x2={canvasWidth} y2={y} stroke="#e0e0e0" strokeWidth="0.5" />
      );
    }
    return lines;
  };

  // Render guides
  const renderGuides = () => {
    if (!showGuides || previewMode || !templateConfig.guides) return null;
    
    return templateConfig.guides.map((guide, i) => {
      if (guide.type === 'v') {
        return (
          <line key={`guide-v-${i}`} x1={guide.pos * zoom} y1={0} x2={guide.pos * zoom} y2={canvasHeight} stroke="#1976d2" strokeWidth="1" strokeDasharray="5,5" opacity="0.5" />
        );
      } else {
        return (
          <line key={`guide-h-${i}`} x1={0} y1={guide.pos * zoom} x2={canvasWidth} y2={guide.pos * zoom} stroke="#1976d2" strokeWidth="1" strokeDasharray="5,5" opacity="0.5" />
        );
      }
    });
  };

  // Export SVG
  const exportSVG = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${templateConfig.width}mm" height="${templateConfig.height}mm" viewBox="0 0 ${templateConfig.width} ${templateConfig.height}">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  ${elements.map(el => {
    const transform = el.rotation ? ` transform="rotate(${el.rotation} ${el.x + (el.width || 0) / 2} ${el.y + (el.height || 0) / 2})"` : '';
    const opacity = el.opacity !== undefined && el.opacity !== 1 ? ` opacity="${el.opacity}"` : '';
    
    if (el.type === 'text') {
      const displayText = replaceVariables(el.text);
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" font-family="${el.fontFamily}" font-weight="${el.fontWeight}" font-style="${el.fontStyle}" fill="${el.fill}"${opacity}${transform}>${displayText}</text>`;
    }
    if (el.type === 'rect') {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" rx="${el.rx || 0}"${opacity}${transform}/>`;
    }
    if (el.type === 'circle') {
      const r = Math.min(el.width, el.height) / 2;
      return `<circle cx="${el.x + r}" cy="${el.y + r}" r="${r}" fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}"${opacity}${transform}/>`;
    }
    if (el.type === 'line') {
      return `<line x1="${el.x}" y1="${el.y}" x2="${el.x + el.width}" y2="${el.y + el.height}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}"${opacity}${transform}/>`;
    }
    if (el.type === 'image') {
      return `<image xlink:href="${el.src}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"${opacity}${transform}/>`;
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

  // Export PNG
  const exportPNG = () => {
    const scale = 4; // 4x resolution for high quality
    const canvas = document.createElement('canvas');
    canvas.width = templateConfig.width * scale;
    canvas.height = templateConfig.height * scale;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create SVG for rendering
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${templateConfig.width} ${templateConfig.height}">
      ${elements.map(el => {
        if (el.type === 'text') {
          return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" font-family="${el.fontFamily}" font-weight="${el.fontWeight}" fill="${el.fill}" opacity="${el.opacity || 1}">${replaceVariables(el.text)}</text>`;
        }
        if (el.type === 'rect') {
          return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" rx="${el.rx || 0}" opacity="${el.opacity || 1}"/>`;
        }
        if (el.type === 'circle') {
          const r = Math.min(el.width, el.height) / 2;
          return `<circle cx="${el.x + r}" cy="${el.y + r}" r="${r}" fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" opacity="${el.opacity || 1}"/>`;
        }
        if (el.type === 'line') {
          return `<line x1="${el.x}" y1="${el.y}" x2="${el.x + el.width}" y2="${el.y + el.height}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" opacity="${el.opacity || 1}"/>`;
        }
        if (el.type === 'image') {
          return `<image xlink:href="${el.src}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" opacity="${el.opacity || 1}"/>`;
        }
        return '';
      }).join('\n')}
    </svg>`;
    
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${designName.replace(/\s+/g, '_')}_${template}.png`;
      a.click();
    };
    img.src = url;
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
      const snap = await getDocs(collection(db, 'packagingDesigns'));
      setSavedDesigns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save design');
    }
  };

  // Delete design
  const handleDeleteDesign = async (designId) => {
    if (!window.confirm('Delete this design?')) return;
    try {
      await deleteDoc(doc(db, 'packagingDesigns', designId));
      setSavedDesigns(prev => prev.filter(d => d.id !== designId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Load a saved design
  const loadDesign = (design) => {
    setDesignName(design.name);
    setTemplate(design.template);
    setElements(design.elements || []);
    setBgColor(design.bgColor || '#ffffff');
    setSelectedElement(null);
    setHistory([[...(design.elements || [])]]);
    setHistoryIndex(0);
  };

  // Clear all elements
  const clearCanvas = () => {
    if (!window.confirm('Clear all elements?')) return;
    addToHistory([]);
    setElements([]);
    setSelectedElement(null);
  };

  // Get selected element
  const selected = elements.find(e => e.id === selectedElement);

  // Styles
  const buttonStyle = { padding: '8px 12px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: '0.8em' };
  const activeButtonStyle = { ...buttonStyle, background: '#1976d2', color: '#fff', border: '1px solid #1976d2' };

  return (
    <div>
      <LabNavbar />
      
      {/* Top Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: '#fff', borderBottom: '1px solid #e0e0e0', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600 }}>📦 Packaging Designer</span>
        
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={undo} disabled={historyIndex <= 0} style={{ ...buttonStyle, opacity: historyIndex <= 0 ? 0.5 : 1 }} title="Undo (Ctrl+Z)">↩️</button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} style={{ ...buttonStyle, opacity: historyIndex >= history.length - 1 ? 0.5 : 1 }} title="Redo (Ctrl+Shift+Z)">↪️</button>
        </div>
        
        <div style={{ height: 20, width: 1, background: '#ddd' }} />
        
        <button onClick={() => addText('Text', TEXT_PRESETS[0])} style={buttonStyle}>📝 Text</button>
        <button onClick={() => addShape('rect')} style={buttonStyle}>⬜ Rect</button>
        <button onClick={() => addShape('circle')} style={buttonStyle}>⚪ Circle</button>
        <button onClick={() => addShape('line')} style={buttonStyle}>➖ Line</button>
        <button onClick={() => fileInputRef.current?.click()} style={buttonStyle}>🖼️ Image</button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
        
        <div style={{ height: 20, width: 1, background: '#ddd' }} />
        
        {selected && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => alignElements('left')} style={buttonStyle} title="Align Left">⬅</button>
            <button onClick={() => alignElements('center')} style={buttonStyle} title="Center Horizontal">↔</button>
            <button onClick={() => alignElements('right')} style={buttonStyle} title="Align Right">➡</button>
            <button onClick={() => alignElements('top')} style={buttonStyle} title="Align Top">⬆</button>
            <button onClick={() => alignElements('middle')} style={buttonStyle} title="Center Vertical">↕</button>
            <button onClick={() => alignElements('bottom')} style={buttonStyle} title="Align Bottom">⬇</button>
          </div>
        )}
        
        <div style={{ flex: 1 }} />
        
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85em' }}>
          <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
          Grid
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85em' }}>
          <input type="checkbox" checked={snapToGrid} onChange={(e) => setSnapToGrid(e.target.checked)} />
          Snap
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85em' }}>
          <input type="checkbox" checked={showGuides} onChange={(e) => setShowGuides(e.target.checked)} />
          Guides
        </label>
        
        <button onClick={() => setPreviewMode(!previewMode)} style={previewMode ? activeButtonStyle : buttonStyle}>
          {previewMode ? '✏️ Edit' : '👁️ Preview'}
        </button>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 170px)', background: '#f0f0f0' }}>
        {/* Left Sidebar */}
        <div style={{ width: 260, background: '#fff', borderRight: '1px solid #e0e0e0', padding: 12, overflowY: 'auto' }}>
          
          {/* Template Selection */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, fontSize: '0.8em', display: 'block', marginBottom: 6 }}>Template</label>
            <select
              value={template}
              onChange={(e) => { setTemplate(e.target.value); setElements([]); setHistory([[]]); setHistoryIndex(0); }}
              style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6, fontSize: '0.85em' }}
            >
              {Object.entries(PACKAGING_TEMPLATES).map(([key, t]) => (
                <option key={key} value={key}>{t.name} ({t.description})</option>
              ))}
            </select>
          </div>

          {/* Recipe Selection */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, fontSize: '0.8em', display: 'block', marginBottom: 6 }}>Apply Recipe</label>
            <select
              value={selectedRecipe?.id || ''}
              onChange={(e) => setSelectedRecipe(recipes.find(r => r.id === e.target.value) || null)}
              style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6, fontSize: '0.85em' }}
            >
              <option value="">None (placeholders)</option>
              {recipes.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Text Presets */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, fontSize: '0.8em', display: 'block', marginBottom: 6 }}>Quick Add Text</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {TEXT_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => addText(preset.label, preset)}
                  style={{ ...buttonStyle, padding: '4px 8px', fontSize: '0.75em' }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Variables */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, fontSize: '0.8em', display: 'block', marginBottom: 6 }}>Variables</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {VARIABLES.map(v => (
                <button
                  key={v.key}
                  onClick={() => addText(v.key)}
                  style={{ padding: '3px 6px', background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 4, cursor: 'pointer', fontSize: '0.7em' }}
                  title={v.example}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, fontSize: '0.8em', display: 'block', marginBottom: 6 }}>Color Palette</label>
            <select
              value={currentPalette}
              onChange={(e) => setCurrentPalette(e.target.value)}
              style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 6, fontSize: '0.8em', marginBottom: 8 }}
            >
              {Object.keys(COLOR_PALETTES).map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 4 }}>
              {COLOR_PALETTES[currentPalette].map((color, i) => (
                <div
                  key={i}
                  onClick={() => {
                    if (selected) {
                      updateElement(selected.id, selected.type === 'text' ? { fill: color } : { fill: color });
                    } else {
                      setBgColor(color);
                    }
                  }}
                  style={{
                    width: 28,
                    height: 28,
                    background: color,
                    borderRadius: 4,
                    border: '1px solid #ccc',
                    cursor: 'pointer',
                  }}
                  title={selected ? 'Apply to selected' : 'Set as background'}
                />
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, fontSize: '0.8em', display: 'block', marginBottom: 6 }}>Background</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={{ width: 50, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer' }}
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={{ flex: 1, padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: '0.8em' }}
              />
            </div>
          </div>

          {/* Zoom */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, fontSize: '0.8em', display: 'block', marginBottom: 6 }}>Zoom: {zoom}x</label>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Save/Load/Export */}
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              placeholder="Design name"
              style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6, marginBottom: 8, fontSize: '0.85em', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <button onClick={saveDesign} style={{ padding: 8, background: '#4caf50', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.8em' }}>
                💾 Save
              </button>
              <button onClick={clearCanvas} style={{ padding: 8, background: '#ff9800', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.8em' }}>
                🗑️ Clear
              </button>
              <button onClick={exportSVG} style={{ padding: 8, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.8em' }}>
                📥 SVG
              </button>
              <button onClick={exportPNG} style={{ padding: 8, background: '#9c27b0', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.8em' }}>
                📥 PNG
              </button>
            </div>
          </div>

          {/* Saved Designs */}
          {savedDesigns.length > 0 && (
            <div>
              <label style={{ fontWeight: 600, fontSize: '0.8em', display: 'block', marginBottom: 6 }}>Saved Designs</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {savedDesigns.slice(0, 10).map(d => (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      onClick={() => loadDesign(d)}
                      style={{ flex: 1, padding: 6, background: '#fafafa', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: '0.75em', textAlign: 'left' }}
                    >
                      {d.name}
                    </button>
                    <button
                      onClick={() => handleDeleteDesign(d.id)}
                      style={{ padding: '4px 6px', background: '#ffebee', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.7em' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center - Canvas */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: 30 }}>
          <div style={{ position: 'relative' }}>
            {/* Size indicator */}
            <div style={{ position: 'absolute', top: -20, left: 0, fontSize: '0.75em', color: '#666' }}>
              {templateConfig.width} × {templateConfig.height} mm
            </div>
            
            <div
              ref={canvasRef}
              onClick={() => !previewMode && setSelectedElement(null)}
              style={{
                width: canvasWidth,
                height: canvasHeight,
                background: bgColor,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                position: 'relative',
                borderRadius: templateConfig.isRound ? '50%' : 0,
                overflow: templateConfig.isRound ? 'hidden' : 'visible',
              }}
            >
              <svg width={canvasWidth} height={canvasHeight} style={{ display: 'block' }}>
                {renderGrid()}
                {renderGuides()}
                {elements.map(el => renderElement(el))}
              </svg>
              
              {/* Hang tag hole indicator */}
              {templateConfig.hasHole && !previewMode && (
                <div style={{
                  position: 'absolute',
                  top: 10 * zoom,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 8 * zoom,
                  height: 8 * zoom,
                  borderRadius: '50%',
                  border: '2px dashed #999',
                  pointerEvents: 'none',
                }} />
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div style={{ width: 260, background: '#fff', borderLeft: '1px solid #e0e0e0', padding: 12, overflowY: 'auto' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '1em' }}>🎨 Properties</h3>
          
          {selected ? (
            <div>
              {/* Element Info */}
              <div style={{ marginBottom: 12, padding: 8, background: '#f5f5f5', borderRadius: 6 }}>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{selected.type}</span>
                <span style={{ color: '#666', fontSize: '0.8em', marginLeft: 8 }}>({selected.x}, {selected.y})</span>
              </div>

              {/* Text Properties */}
              {selected.type === 'text' && (
                <>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: '0.75em', color: '#666', display: 'block', marginBottom: 4 }}>Text</label>
                    <textarea
                      value={selected.text}
                      onChange={(e) => updateElement(selected.id, { text: e.target.value })}
                      style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4, resize: 'vertical', minHeight: 50, fontSize: '0.85em', boxSizing: 'border-box' }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: '0.75em', color: '#666', display: 'block', marginBottom: 4 }}>Font</label>
                    <select
                      value={selected.fontFamily}
                      onChange={(e) => updateElement(selected.id, { fontFamily: e.target.value })}
                      style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: '0.85em' }}
                    >
                      {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.75em', color: '#666', display: 'block', marginBottom: 4 }}>Size</label>
                      <input
                        type="number"
                        value={selected.fontSize}
                        onChange={(e) => updateElement(selected.id, { fontSize: Number(e.target.value) })}
                        style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: '0.85em', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75em', color: '#666', display: 'block', marginBottom: 4 }}>Color</label>
                      <input
                        type="color"
                        value={selected.fill}
                        onChange={(e) => updateElement(selected.id, { fill: e.target.value })}
                        style={{ width: '100%', height: 32, border: 'none', borderRadius: 4 }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                    <button
                      onClick={() => updateElement(selected.id, { fontWeight: selected.fontWeight === 'bold' ? 'normal' : 'bold' })}
                      style={{ flex: 1, padding: 6, background: selected.fontWeight === 'bold' ? '#1976d2' : '#f5f5f5', color: selected.fontWeight === 'bold' ? '#fff' : '#333', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      B
                    </button>
                    <button
                      onClick={() => updateElement(selected.id, { fontStyle: selected.fontStyle === 'italic' ? 'normal' : 'italic' })}
                      style={{ flex: 1, padding: 6, background: selected.fontStyle === 'italic' ? '#1976d2' : '#f5f5f5', color: selected.fontStyle === 'italic' ? '#fff' : '#333', border: 'none', borderRadius: 4, cursor: 'pointer', fontStyle: 'italic' }}
                    >
                      I
                    </button>
                    <button
                      onClick={() => updateElement(selected.id, { textAlign: 'left' })}
                      style={{ flex: 1, padding: 6, background: selected.textAlign === 'left' ? '#1976d2' : '#f5f5f5', color: selected.textAlign === 'left' ? '#fff' : '#333', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                    >
                      ←
                    </button>
                    <button
                      onClick={() => updateElement(selected.id, { textAlign: 'center' })}
                      style={{ flex: 1, padding: 6, background: selected.textAlign === 'center' ? '#1976d2' : '#f5f5f5', color: selected.textAlign === 'center' ? '#fff' : '#333', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                    >
                      ↔
                    </button>
                    <button
                      onClick={() => updateElement(selected.id, { textAlign: 'right' })}
                      style={{ flex: 1, padding: 6, background: selected.textAlign === 'right' ? '#1976d2' : '#f5f5f5', color: selected.textAlign === 'right' ? '#fff' : '#333', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                    >
                      →
                    </button>
                  </div>
                </>
              )}

              {/* Shape Properties */}
              {(selected.type === 'rect' || selected.type === 'circle' || selected.type === 'image') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div>
                    <label style={{ fontSize: '0.75em', color: '#666', display: 'block', marginBottom: 4 }}>Width</label>
                    <input
                      type="number"
                      value={Math.round(selected.width)}
                      onChange={(e) => updateElement(selected.id, { width: Number(e.target.value) })}
                      style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: '0.85em', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75em', color: '#666', display: 'block', marginBottom: 4 }}>Height</label>
                    <input
                      type="number"
                      value={Math.round(selected.height)}
                      onChange={(e) => updateElement(selected.id, { height: Number(e.target.value) })}
                      style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: '0.85em', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              {(selected.type === 'rect' || selected.type === 'circle') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div>
                    <label style={{ fontSize: '0.75em', color: '#666', display: 'block', marginBottom: 4 }}>Fill</label>
                    <input
                      type="color"
                      value={selected.fill === 'none' ? '#ffffff' : selected.fill}
                      onChange={(e) => updateElement(selected.id, { fill: e.target.value })}
                      style={{ width: '100%', height: 32, border: 'none', borderRadius: 4 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75em', color: '#666', display: 'block', marginBottom: 4 }}>Stroke</label>
                    <input
                      type="color"
                      value={selected.stroke}
                      onChange={(e) => updateElement(selected.id, { stroke: e.target.value })}
                      style={{ width: '100%', height: 32, border: 'none', borderRadius: 4 }}
                    />
                  </div>
                </div>
              )}

              {selected.type === 'rect' && (
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: '0.75em', color: '#666', display: 'block', marginBottom: 4 }}>Corner Radius: {selected.rx || 0}</label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={selected.rx || 0}
                    onChange={(e) => updateElement(selected.id, { rx: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
              )}

              {selected.type === 'line' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.75em', color: '#666', display: 'block', marginBottom: 4 }}>Length X</label>
                      <input
                        type="number"
                        value={selected.width}
                        onChange={(e) => updateElement(selected.id, { width: Number(e.target.value) })}
                        style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: '0.85em', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75em', color: '#666', display: 'block', marginBottom: 4 }}>Length Y</label>
                      <input
                        type="number"
                        value={selected.height}
                        onChange={(e) => updateElement(selected.id, { height: Number(e.target.value) })}
                        style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: '0.85em', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.75em', color: '#666', display: 'block', marginBottom: 4 }}>Color</label>
                      <input
                        type="color"
                        value={selected.stroke}
                        onChange={(e) => updateElement(selected.id, { stroke: e.target.value })}
                        style={{ width: '100%', height: 32, border: 'none', borderRadius: 4 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75em', color: '#666', display: 'block', marginBottom: 4 }}>Thickness</label>
                      <input
                        type="number"
                        value={selected.strokeWidth}
                        onChange={(e) => updateElement(selected.id, { strokeWidth: Number(e.target.value) })}
                        style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: '0.85em', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Common: Position, Rotation, Opacity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: '0.75em', color: '#666', display: 'block', marginBottom: 4 }}>X</label>
                  <input
                    type="number"
                    value={selected.x}
                    onChange={(e) => updateElement(selected.id, { x: Number(e.target.value) })}
                    style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: '0.85em', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75em', color: '#666', display: 'block', marginBottom: 4 }}>Y</label>
                  <input
                    type="number"
                    value={selected.y}
                    onChange={(e) => updateElement(selected.id, { y: Number(e.target.value) })}
                    style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 4, fontSize: '0.85em', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: '0.75em', color: '#666', display: 'block', marginBottom: 4 }}>Rotation: {selected.rotation || 0}°</label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={selected.rotation || 0}
                  onChange={(e) => updateElement(selected.id, { rotation: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: '0.75em', color: '#666', display: 'block', marginBottom: 4 }}>Opacity: {Math.round((selected.opacity || 1) * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selected.opacity || 1}
                  onChange={(e) => updateElement(selected.id, { opacity: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <button onClick={() => moveLayer(selected.id, 'top')} style={buttonStyle}>⤴ Top</button>
                <button onClick={() => moveLayer(selected.id, 'bottom')} style={buttonStyle}>⤵ Bottom</button>
                <button onClick={() => duplicateElement(selected.id)} style={{ ...buttonStyle, background: '#e3f2fd' }}>📋 Copy</button>
                <button onClick={() => deleteElement(selected.id)} style={{ ...buttonStyle, background: '#ffebee', color: '#c62828' }}>🗑️ Delete</button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 30, color: '#666' }}>
              <div style={{ fontSize: '2em', marginBottom: 8 }}>👆</div>
              <div style={{ fontSize: '0.9em' }}>Select an element to edit</div>
              <div style={{ fontSize: '0.75em', marginTop: 12, color: '#666', lineHeight: 1.5 }}>
                <strong>Shortcuts:</strong><br/>
                Delete • Ctrl+D (duplicate)<br/>
                Ctrl+C/V • Ctrl+Z (undo)<br/>
                Arrow keys (nudge)
              </div>
            </div>
          )}

          {/* Layers */}
          {elements.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '0.85em', color: '#666' }}>Layers ({elements.length})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[...elements].reverse().map(el => (
                  <div
                    key={el.id}
                    onClick={() => setSelectedElement(el.id)}
                    style={{
                      padding: 6,
                      background: selectedElement === el.id ? '#e3f2fd' : '#fafafa',
                      border: selectedElement === el.id ? '1px solid #1976d2' : '1px solid transparent',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: '0.8em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>{el.type === 'text' ? '📝' : el.type === 'rect' ? '⬜' : el.type === 'circle' ? '⚪' : el.type === 'image' ? '🖼️' : '➖'}</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {el.type === 'text' ? (el.text.length > 12 ? el.text.slice(0, 12) + '...' : el.text) : el.type}
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

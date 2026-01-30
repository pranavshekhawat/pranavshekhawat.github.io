import React, { useState, useEffect, useRef } from 'react';
import { subscribeToUserCollection } from '../utils/userDataHelper';
import { getHindiName, RECIPE_NAME_SUGGESTIONS } from './utils/hindiNames';
import LabNavbar from './LabNavbar';

/**
 * LabelGenerator - Create product labels with QR codes
 * Route: /lab/labels
 * 
 * Features:
 * - Professional label templates
 * - QR code generation (linking to batch/recipe info)
 * - Hindi name support
 * - INCI ingredient list
 * - Print-ready output
 * - Multiple label sizes
 */

// Generate simple QR code as SVG (basic implementation)
const generateQRCode = (data, size = 100) => {
  // This creates a simple placeholder - in production, use a library like qrcode
  // For now, we'll create a visual representation
  const encoded = btoa(data).slice(0, 25);
  const cells = [];
  const gridSize = 5;
  const cellSize = size / gridSize;
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const charCode = encoded.charCodeAt((row * gridSize + col) % encoded.length) || 0;
      const isFilled = charCode % 2 === 0;
      cells.push(
        <rect
          key={`${row}-${col}`}
          x={col * cellSize}
          y={row * cellSize}
          width={cellSize - 1}
          height={cellSize - 1}
          fill={isFilled ? '#000' : '#fff'}
        />
      );
    }
  }
  
  // Add finder patterns (corners)
  const finderSize = cellSize * 1.5;
  const finderPatterns = [
    { x: 0, y: 0 },
    { x: size - finderSize - 2, y: 0 },
    { x: 0, y: size - finderSize - 2 },
  ];
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ border: '1px solid #ddd' }}>
      <rect width={size} height={size} fill="#fff" />
      {cells}
      {finderPatterns.map((fp, i) => (
        <g key={i}>
          <rect x={fp.x} y={fp.y} width={finderSize} height={finderSize} fill="#000" />
          <rect x={fp.x + 3} y={fp.y + 3} width={finderSize - 6} height={finderSize - 6} fill="#fff" />
          <rect x={fp.x + 6} y={fp.y + 6} width={finderSize - 12} height={finderSize - 12} fill="#000" />
        </g>
      ))}
    </svg>
  );
};

// Format ingredients as INCI list
const formatINCI = (oils = [], additives = []) => {
  const inciMap = {
    olive_oil: 'Olea Europaea (Olive) Fruit Oil',
    coconut_oil: 'Cocos Nucifera (Coconut) Oil',
    palm_oil: 'Elaeis Guineensis (Palm) Oil',
    castor_oil: 'Ricinus Communis (Castor) Seed Oil',
    shea_butter: 'Butyrospermum Parkii (Shea) Butter',
    cocoa_butter: 'Theobroma Cacao (Cocoa) Seed Butter',
    rice_bran_oil: 'Oryza Sativa (Rice) Bran Oil',
    sunflower_oil: 'Helianthus Annuus (Sunflower) Seed Oil',
    almond_oil: 'Prunus Amygdalus Dulcis (Sweet Almond) Oil',
    sweet_almond_oil: 'Prunus Amygdalus Dulcis (Sweet Almond) Oil',
    sesame_oil: 'Sesamum Indicum (Sesame) Seed Oil',
    neem_oil: 'Azadirachta Indica (Neem) Seed Oil',
    jojoba_oil: 'Simmondsia Chinensis (Jojoba) Seed Oil',
    avocado_oil: 'Persea Gratissima (Avocado) Oil',
    turmeric: 'Curcuma Longa (Turmeric) Root Extract',
    honey: 'Mel (Honey)',
    aloe_vera: 'Aloe Barbadensis Leaf Juice',
    activated_charcoal: 'Charcoal Powder',
    kaolin_clay: 'Kaolin',
    lavender: 'Lavandula Angustifolia (Lavender) Oil',
    tea_tree: 'Melaleuca Alternifolia (Tea Tree) Leaf Oil',
    peppermint: 'Mentha Piperita (Peppermint) Oil',
    sandalwood: 'Santalum Album (Sandalwood) Oil',
    rose: 'Rosa Damascena Flower Oil',
  };

  const ingredients = ['Sodium Hydroxide', 'Aqua']; // Base soap ingredients
  
  oils.forEach(oil => {
    const key = (oil.key || oil.name || '').toLowerCase().replace(/\s+/g, '_');
    const inci = inciMap[key] || oil.name;
    if (!ingredients.includes(inci)) ingredients.push(inci);
  });
  
  additives.forEach(add => {
    const key = (add.key || add.name || '').toLowerCase().replace(/\s+/g, '_');
    const inci = inciMap[key] || add.name;
    if (!ingredients.includes(inci)) ingredients.push(inci);
  });
  
  return ingredients.join(', ');
};

// Label Template Component
const LabelTemplate = ({ 
  recipe, 
  batch, 
  brandName, 
  labelSize, 
  showQR, 
  showHindi, 
  showINCI,
  customTagline,
  batchNumber,
  weight,
  mfgDate,
  expDate,
}) => {
  const recipeName = recipe?.name || 'Artisan Soap';
  const hindiName = recipe?.hindiName || getHindiName(recipe?.name?.toLowerCase().replace(/\s+/g, '_'))?.romanized || '';
  const hindiScript = recipe?.hindiScript || getHindiName(recipe?.name?.toLowerCase().replace(/\s+/g, '_'))?.hindi || '';
  
  const oils = recipe?.oils || recipe?.items || recipe?.perOilDetails || [];
  const additives = recipe?.additives || [];
  const inciList = formatINCI(oils, additives);
  
  const qrData = JSON.stringify({
    product: recipeName,
    batch: batchNumber || batch?.name,
    mfg: mfgDate,
    exp: expDate,
  });

  // Size configurations (in pixels for screen, will scale for print)
  const sizes = {
    small: { width: 200, height: 150, fontSize: 0.7 },
    medium: { width: 280, height: 200, fontSize: 0.85 },
    large: { width: 350, height: 250, fontSize: 1 },
    square: { width: 250, height: 250, fontSize: 0.9 },
  };
  
  const size = sizes[labelSize] || sizes.medium;

  return (
    <div 
      className="label-template"
      style={{
        width: size.width,
        height: size.height,
        border: '2px solid #333',
        borderRadius: 8,
        padding: 16,
        background: '#fff',
        fontFamily: 'Georgia, serif',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Brand Name */}
      <div style={{ 
        fontSize: `${1.2 * size.fontSize}em`, 
        fontWeight: 700, 
        textAlign: 'center',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: 4,
      }}>
        {brandName || 'ARTISAN SOAPS'}
      </div>

      {/* Product Name */}
      <div style={{ 
        fontSize: `${1.4 * size.fontSize}em`, 
        fontWeight: 600, 
        textAlign: 'center',
        marginBottom: showHindi ? 2 : 8,
        color: '#333',
      }}>
        {recipeName}
      </div>

      {/* Hindi Name */}
      {showHindi && (hindiScript || hindiName) && (
        <div style={{ 
          fontSize: `${0.85 * size.fontSize}em`, 
          textAlign: 'center',
          marginBottom: 8,
          color: '#666',
        }}>
          {hindiScript && <span style={{ fontFamily: 'sans-serif' }}>{hindiScript}</span>}
          {hindiScript && hindiName && ' • '}
          {hindiName && <span style={{ fontStyle: 'italic' }}>{hindiName}</span>}
        </div>
      )}

      {/* Tagline */}
      {customTagline && (
        <div style={{ 
          fontSize: `${0.7 * size.fontSize}em`, 
          textAlign: 'center',
          fontStyle: 'italic',
          color: '#666',
          marginBottom: 8,
        }}>
          {customTagline}
        </div>
      )}

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', gap: 10 }}>
        {/* Left side - Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Weight */}
          <div style={{ 
            fontSize: `${1 * size.fontSize}em`, 
            fontWeight: 600,
            textAlign: 'center',
            marginBottom: 6,
          }}>
            {weight || '100'}g
          </div>

          {/* Properties/Benefits */}
          {recipe?.benefits && recipe.benefits.length > 0 && (
            <div style={{ 
              fontSize: `${0.6 * size.fontSize}em`, 
              textAlign: 'center',
              color: '#666',
              marginBottom: 6,
            }}>
              {recipe.benefits.slice(0, 2).join(' • ')}
            </div>
          )}
        </div>

        {/* Right side - QR */}
        {showQR && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {generateQRCode(qrData, labelSize === 'small' ? 50 : 70)}
          </div>
        )}
      </div>

      {/* INCI Ingredients */}
      {showINCI && (
        <div style={{ 
          fontSize: `${0.5 * size.fontSize}em`, 
          color: '#666',
          borderTop: '1px solid #e0e0e0',
          paddingTop: 6,
          marginTop: 6,
          lineHeight: 1.3,
        }}>
          <strong>Ingredients:</strong> {inciList.length > 150 ? inciList.slice(0, 150) + '...' : inciList}
        </div>
      )}

      {/* Footer - Dates & Batch */}
      <div style={{ 
        fontSize: `${0.55 * size.fontSize}em`, 
        color: '#666',
        display: 'flex',
        justifyContent: 'space-between',
        borderTop: '1px solid #e0e0e0',
        paddingTop: 6,
        marginTop: 6,
      }}>
        <span>Batch: {batchNumber || batch?.name || 'N/A'}</span>
        <span>Mfg: {mfgDate || 'N/A'}</span>
        <span>Exp: {expDate || 'N/A'}</span>
      </div>
    </div>
  );
};

// Main Label Generator Page
function LabelGenerator() {
  const [recipes, setRecipes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  
  // Label options
  const [brandName, setBrandName] = useState('');
  const [customTagline, setCustomTagline] = useState('Handcrafted with Love');
  const [labelSize, setLabelSize] = useState('medium');
  const [showQR, setShowQR] = useState(true);
  const [showHindi, setShowHindi] = useState(true);
  const [showINCI, setShowINCI] = useState(true);
  const [batchNumber, setBatchNumber] = useState('');
  const [weight, setWeight] = useState('100');
  const [mfgDate, setMfgDate] = useState(new Date().toISOString().split('T')[0]);
  const [expDate, setExpDate] = useState('');
  const [printCount, setPrintCount] = useState(8);
  
  const printRef = useRef(null);

  // Load data
  useEffect(() => {
    const unsubs = [];
    try {
      unsubs.push(subscribeToUserCollection('recipes', (data) => {
        setRecipes(data);
      }));
      unsubs.push(subscribeToUserCollection('batches', (data) => {
        setBatches(data);
      }));
    } catch (error) {
      console.error('Error loading data:', error);
    }
    return () => unsubs.forEach(u => u());
  }, []);

  // Auto-fill from batch
  useEffect(() => {
    if (selectedBatch) {
      const batch = batches.find(b => b.id === selectedBatch);
      if (batch) {
        setBatchNumber(batch.name || selectedBatch.slice(-6));
        if (batch.recipeId) {
          setSelectedRecipe(batch.recipeId);
        }
        if (batch.madeDate) {
          setMfgDate(batch.madeDate);
        }
        if (batch.soapExpiryDate) {
          setExpDate(batch.soapExpiryDate);
        }
      }
    }
  }, [selectedBatch, batches]);

  // Auto-calculate expiry (12 months from mfg)
  useEffect(() => {
    if (mfgDate && !expDate) {
      const exp = new Date(mfgDate);
      exp.setMonth(exp.getMonth() + 12);
      setExpDate(exp.toISOString().split('T')[0]);
    }
  }, [mfgDate]);

  const recipe = recipes.find(r => r.id === selectedRecipe);
  const batch = batches.find(b => b.id === selectedBatch);

  // Print function
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Labels</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { margin: 0; font-family: Georgia, serif; }
            .print-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10mm;
              padding: 5mm;
            }
            .label-template {
              page-break-inside: avoid;
              border: 2px solid #333 !important;
              border-radius: 8px;
              padding: 12px;
              background: #fff;
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          <div class="print-grid">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <LabNavbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: '1.4em' }}>🏷️ Label Generator</h2>
        <p style={{ margin: '4px 0 0', fontSize: '0.9em', color: '#666' }}>Create professional product labels with QR codes</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left - Options */}
        <div>
          <div style={{ background: '#f5f5f5', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1em' }}>🎨 Label Settings</h3>

            {/* Recipe & Batch Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: '0.9em' }}>Recipe</label>
                <select
                  value={selectedRecipe || ''}
                  onChange={(e) => setSelectedRecipe(e.target.value)}
                  style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
                >
                  <option value="">— Select recipe —</option>
                  {recipes.map(r => (
                    <option key={r.id} value={r.id}>{r.name || 'Untitled'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: '0.9em' }}>Batch</label>
                <select
                  value={selectedBatch || ''}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
                >
                  <option value="">— Select batch —</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name || 'Unnamed'}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Brand & Product Info */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: '0.9em' }}>Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Your Brand Name"
                style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: '0.9em' }}>Tagline</label>
              <input
                type="text"
                value={customTagline}
                onChange={(e) => setCustomTagline(e.target.value)}
                placeholder="Handcrafted with Love"
                style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: '0.9em' }}>Weight (g)</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: '0.9em' }}>Batch Number</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g., LAV-2025-001"
                  style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: '0.9em' }}>Mfg Date</label>
                <input
                  type="date"
                  value={mfgDate}
                  onChange={(e) => setMfgDate(e.target.value)}
                  style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: '0.9em' }}>Exp Date</label>
                <input
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Label Size */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: '0.9em' }}>Label Size</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['small', 'medium', 'large', 'square'].map(size => (
                  <button
                    key={size}
                    onClick={() => setLabelSize(size)}
                    style={{
                      padding: '8px 16px',
                      border: labelSize === size ? '2px solid #1976d2' : '1px solid #ccc',
                      borderRadius: 6,
                      background: labelSize === size ? '#e3f2fd' : '#fff',
                      cursor: 'pointer',
                      fontWeight: labelSize === size ? 600 : 400,
                      textTransform: 'capitalize',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={showQR} onChange={(e) => setShowQR(e.target.checked)} style={{ width: 18, height: 18 }} />
                <span>Show QR Code</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={showHindi} onChange={(e) => setShowHindi(e.target.checked)} style={{ width: 18, height: 18 }} />
                <span>Show Hindi Name</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={showINCI} onChange={(e) => setShowINCI(e.target.checked)} style={{ width: 18, height: 18 }} />
                <span>Show INCI Ingredients</span>
              </label>
            </div>
          </div>

          {/* Print Options */}
          <div style={{ background: '#e3f2fd', borderRadius: 12, padding: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1em' }}>🖨️ Print Options</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: '0.9em' }}>Labels per Page</label>
              <select
                value={printCount}
                onChange={(e) => setPrintCount(Number(e.target.value))}
                style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
              >
                <option value={4}>4 labels</option>
                <option value={6}>6 labels</option>
                <option value={8}>8 labels</option>
                <option value={10}>10 labels</option>
                <option value={12}>12 labels</option>
              </select>
            </div>
            <button
              onClick={handlePrint}
              disabled={!recipe}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: recipe ? '#1976d2' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '1em',
                cursor: recipe ? 'pointer' : 'not-allowed',
              }}
            >
              🖨️ Print Labels
            </button>
          </div>
        </div>

        {/* Right - Preview */}
        <div>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1em' }}>👁️ Preview</h3>
          
          {!recipe ? (
            <div style={{ textAlign: 'center', padding: 60, background: '#f9f9f9', borderRadius: 12 }}>
              <div style={{ fontSize: '3em', marginBottom: 12 }}>🏷️</div>
              <div style={{ color: '#666' }}>Select a recipe to preview label</div>
            </div>
          ) : (
            <div>
              {/* Single Preview */}
              <div style={{ marginBottom: 20 }}>
                <LabelTemplate
                  recipe={recipe}
                  batch={batch}
                  brandName={brandName}
                  labelSize={labelSize}
                  showQR={showQR}
                  showHindi={showHindi}
                  showINCI={showINCI}
                  customTagline={customTagline}
                  batchNumber={batchNumber}
                  weight={weight}
                  mfgDate={mfgDate}
                  expDate={expDate}
                />
              </div>

              {/* Print Grid (hidden, for printing) */}
              <div ref={printRef} style={{ display: 'none' }}>
                {Array.from({ length: printCount }).map((_, i) => (
                  <LabelTemplate
                    key={i}
                    recipe={recipe}
                    batch={batch}
                    brandName={brandName}
                    labelSize={labelSize}
                    showQR={showQR}
                    showHindi={showHindi}
                    showINCI={showINCI}
                    customTagline={customTagline}
                    batchNumber={batchNumber}
                    weight={weight}
                    mfgDate={mfgDate}
                    expDate={expDate}
                  />
                ))}
              </div>

              {/* Recipe Info */}
              <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 16 }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '1em' }}>Recipe Details</h4>
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  <div><strong>Oils:</strong> {(recipe.oils || recipe.items || []).map(o => o.name).join(', ')}</div>
                  {recipe.additives?.length > 0 && (
                    <div style={{ marginTop: 4 }}><strong>Additives:</strong> {recipe.additives.map(a => a.name).join(', ')}</div>
                  )}
                  {recipe.superfat && (
                    <div style={{ marginTop: 4 }}><strong>Superfat:</strong> {recipe.superfat}%</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

export default LabelGenerator;

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../utils/firebase-config';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { num } from './utils/costCalculations';
import LabNavbar from './LabNavbar';

/**
 * SalesDashboard - Track sales, revenue, and business metrics
 * Route: /lab/sales
 * 
 * Features:
 * - Sales recording
 * - Revenue tracking
 * - Profit margins
 * - Best sellers
 * - Customer tracking
 * - Monthly/yearly reports
 */

// Sale Card Component
const SaleCard = ({ sale, recipes, batches, onDelete }) => {
  const recipe = recipes.find(r => r.id === sale.recipeId);
  const batch = batches.find(b => b.id === sale.batchId);
  
  const profit = (num(sale.pricePerUnit, 0) - num(sale.costPerUnit, 0)) * num(sale.quantity, 1);
  const profitMargin = sale.pricePerUnit > 0 ? ((sale.pricePerUnit - sale.costPerUnit) / sale.pricePerUnit * 100) : 0;

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: 10,
      background: '#fff',
      padding: 16,
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '1.05em' }}>{sale.productName || recipe?.name || 'Unknown Product'}</div>
          <div style={{ fontSize: '0.85em', color: '#666', marginTop: 4 }}>
            {sale.customerName && <span>👤 {sale.customerName} • </span>}
            {new Date(sale.date).toLocaleDateString()}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, fontSize: '1.2em', color: '#2e7d32' }}>
            ₹{num(sale.totalAmount, 0).toFixed(2)}
          </div>
          <div style={{ fontSize: '0.8em', color: profitMargin > 40 ? '#4caf50' : profitMargin > 20 ? '#ff9800' : '#f44336' }}>
            {profitMargin.toFixed(1)}% margin
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, fontSize: '0.85em' }}>
        <div style={{ padding: 8, background: '#f5f5f5', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ color: '#666', fontSize: '0.8em' }}>Qty</div>
          <div style={{ fontWeight: 600 }}>{sale.quantity}</div>
        </div>
        <div style={{ padding: 8, background: '#f5f5f5', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ color: '#666', fontSize: '0.8em' }}>Price</div>
          <div style={{ fontWeight: 600 }}>₹{num(sale.pricePerUnit, 0).toFixed(0)}</div>
        </div>
        <div style={{ padding: 8, background: '#f5f5f5', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ color: '#666', fontSize: '0.8em' }}>Cost</div>
          <div style={{ fontWeight: 600 }}>₹{num(sale.costPerUnit, 0).toFixed(0)}</div>
        </div>
        <div style={{ padding: 8, background: '#e8f5e9', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ color: '#666', fontSize: '0.8em' }}>Profit</div>
          <div style={{ fontWeight: 600, color: '#2e7d32' }}>₹{profit.toFixed(0)}</div>
        </div>
      </div>

      {sale.notes && (
        <div style={{ marginTop: 10, padding: 8, background: '#fff3e0', borderRadius: 6, fontSize: '0.85em' }}>
          📝 {sale.notes}
        </div>
      )}

      {sale.channel && (
        <div style={{ marginTop: 8 }}>
          <span style={{ padding: '3px 10px', background: sale.channel === 'online' ? '#e3f2fd' : '#f3e5f5', borderRadius: 10, fontSize: '0.75em' }}>
            {sale.channel === 'online' ? '🌐 Online' : sale.channel === 'retail' ? '🏪 Retail' : '👥 Direct'}
          </span>
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button
          onClick={() => onDelete(sale.id)}
          style={{ padding: '6px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8em' }}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

// Add Sale Modal
const AddSaleModal = ({ recipes, batches, onClose, onAdd }) => {
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [channel, setChannel] = useState('direct');
  const [notes, setNotes] = useState('');

  // Auto-fill when recipe selected
  useEffect(() => {
    if (selectedRecipe) {
      const recipe = recipes.find(r => r.id === selectedRecipe);
      if (recipe) {
        setProductName(recipe.name);
        setCostPerUnit(recipe.totals?.perBar || recipe.costs?.totals?.perBar || 0);
        setPricePerUnit(recipe.pricing?.sellingPrice || recipe.costs?.pricing?.sellingPrice || (costPerUnit * 1.5));
      }
    }
  }, [selectedRecipe, recipes]);

  // Auto-fill when batch selected
  useEffect(() => {
    if (selectedBatch) {
      const batch = batches.find(b => b.id === selectedBatch);
      if (batch) {
        if (batch.recipeId) setSelectedRecipe(batch.recipeId);
        setProductName(batch.recipeName || batch.name);
        setCostPerUnit(batch.costPerBar || 0);
      }
    }
  }, [selectedBatch, batches]);

  const totalAmount = num(quantity, 1) * num(pricePerUnit, 0);
  const totalProfit = num(quantity, 1) * (num(pricePerUnit, 0) - num(costPerUnit, 0));

  const handleSubmit = async () => {
    if (!productName || !quantity || !pricePerUnit) {
      alert('Please fill in product name, quantity, and price');
      return;
    }

    const sale = {
      recipeId: selectedRecipe || null,
      batchId: selectedBatch || null,
      productName,
      quantity: Number(quantity),
      pricePerUnit: Number(pricePerUnit),
      costPerUnit: Number(costPerUnit) || 0,
      totalAmount: totalAmount,
      profit: totalProfit,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      date,
      channel,
      notes: notes || null,
      createdAt: new Date().toISOString(),
    };

    await onAdd(sale);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 550, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 20px' }}>💰 Record Sale</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 6, fontSize: '0.9em' }}>Recipe (optional)</label>
            <select
              value={selectedRecipe}
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
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 6, fontSize: '0.9em' }}>Batch (optional)</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
            >
              <option value="">— Select batch —</option>
              {batches.filter(b => b.status === 'ready' || b.status === 'sold').map(b => (
                <option key={b.id} value={b.id}>{b.name || 'Unnamed'} ({b.bars} bars)</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, display: 'block', marginBottom: 6, fontSize: '0.9em' }}>Product Name *</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g., Lavender Soap Bar"
            style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 6, fontSize: '0.9em' }}>Quantity *</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 6, fontSize: '0.9em' }}>Selling Price (₹) *</label>
            <input
              type="number"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              placeholder="0"
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 6, fontSize: '0.9em' }}>Cost (₹)</label>
            <input
              type="number"
              value={costPerUnit}
              onChange={(e) => setCostPerUnit(e.target.value)}
              placeholder="0"
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Total Preview */}
        <div style={{ padding: 12, background: '#e8f5e9', borderRadius: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500 }}>Total Amount:</span>
            <span style={{ fontWeight: 700, fontSize: '1.3em', color: '#2e7d32' }}>₹{totalAmount.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, fontSize: '0.9em', color: '#666' }}>
            <span>Profit:</span>
            <span style={{ color: totalProfit > 0 ? '#4caf50' : '#f44336' }}>₹{totalProfit.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 6, fontSize: '0.9em' }}>Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Optional"
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 6, fontSize: '0.9em' }}>Phone</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Optional"
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 6, fontSize: '0.9em' }}>Sale Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 6, fontSize: '0.9em' }}>Sales Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
            >
              <option value="direct">👥 Direct Sale</option>
              <option value="online">🌐 Online</option>
              <option value="retail">🏪 Retail</option>
              <option value="wholesale">📦 Wholesale</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 500, display: 'block', marginBottom: 6, fontSize: '0.9em' }}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this sale..."
            rows={2}
            style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleSubmit}
            style={{ flex: 1, padding: '12px 20px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
          >
            💰 Record Sale
          </button>
          <button
            onClick={onClose}
            style={{ padding: '12px 20px', background: '#666', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Sales Dashboard
function SalesDashboard() {
  const [sales, setSales] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'year', 'all'
  const [filterChannel, setFilterChannel] = useState('all');

  // Load data
  useEffect(() => {
    const unsubSales = onSnapshot(query(collection(db, 'sales'), orderBy('date', 'desc')), (snap) => {
      setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));

    const unsubRecipes = onSnapshot(collection(db, 'recipes'), (snap) => {
      setRecipes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubBatches = onSnapshot(collection(db, 'batches'), (snap) => {
      setBatches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubSales();
      unsubRecipes();
      unsubBatches();
    };
  }, []);

  // Filter sales by date range
  const filteredSales = useMemo(() => {
    const now = new Date();
    let startDate = new Date(0); // Beginning of time

    if (dateRange === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (dateRange === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    return sales.filter(s => {
      const saleDate = new Date(s.date);
      const inDateRange = saleDate >= startDate;
      const inChannel = filterChannel === 'all' || s.channel === filterChannel;
      return inDateRange && inChannel;
    });
  }, [sales, dateRange, filterChannel]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + num(s.totalAmount, 0), 0);
    const totalProfit = filteredSales.reduce((sum, s) => sum + num(s.profit, 0), 0);
    const totalUnits = filteredSales.reduce((sum, s) => sum + num(s.quantity, 0), 0);
    const avgOrderValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Best sellers
    const productSales = {};
    filteredSales.forEach(s => {
      const name = s.productName || 'Unknown';
      if (!productSales[name]) productSales[name] = { name, quantity: 0, revenue: 0 };
      productSales[name].quantity += num(s.quantity, 0);
      productSales[name].revenue += num(s.totalAmount, 0);
    });
    const bestSellers = Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

    // Sales by channel
    const channelSales = {};
    filteredSales.forEach(s => {
      const ch = s.channel || 'direct';
      if (!channelSales[ch]) channelSales[ch] = { channel: ch, count: 0, revenue: 0 };
      channelSales[ch].count++;
      channelSales[ch].revenue += num(s.totalAmount, 0);
    });

    // Customer stats
    const uniqueCustomers = new Set(filteredSales.filter(s => s.customerName).map(s => s.customerName)).size;

    return {
      totalRevenue,
      totalProfit,
      totalUnits,
      avgOrderValue,
      profitMargin,
      bestSellers,
      channelSales: Object.values(channelSales),
      uniqueCustomers,
      totalOrders: filteredSales.length,
    };
  }, [filteredSales]);

  // Add sale
  const handleAddSale = async (sale) => {
    try {
      await addDoc(collection(db, 'sales'), sale);
    } catch (err) {
      console.error('Failed to add sale:', err);
      alert('Failed to record sale');
    }
  };

  // Delete sale
  const handleDeleteSale = async (id) => {
    if (!window.confirm('Delete this sale record?')) return;
    try {
      await deleteDoc(doc(db, 'sales', id));
    } catch (err) {
      console.error('Failed to delete sale:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: '2em', marginBottom: 16 }}>⏳</div>
        <div>Loading sales data...</div>
      </div>
    );
  }

  return (
    <div>
      <LabNavbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: '1.4em' }}>💰 Sales Dashboard</h2>
        <p style={{ margin: '4px 0 0', fontSize: '0.9em', color: '#666' }}>Track revenue, profits, and best sellers</p>
      </div>

      {/* Filters & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid #ccc', borderRadius: 6 }}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid #ccc', borderRadius: 6 }}
          >
            <option value="all">All Channels</option>
            <option value="direct">👥 Direct</option>
            <option value="online">🌐 Online</option>
            <option value="retail">🏪 Retail</option>
            <option value="wholesale">📦 Wholesale</option>
          </select>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ padding: '12px 24px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '1em' }}
        >
          💰 Record Sale
        </button>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ padding: 20, background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)', borderRadius: 12, color: '#fff' }}>
          <div style={{ fontSize: '0.85em', opacity: 0.9, marginBottom: 4 }}>Total Revenue</div>
          <div style={{ fontSize: '1.8em', fontWeight: 700 }}>₹{metrics.totalRevenue.toFixed(0)}</div>
        </div>
        <div style={{ padding: 20, background: 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)', borderRadius: 12, color: '#fff' }}>
          <div style={{ fontSize: '0.85em', opacity: 0.9, marginBottom: 4 }}>Total Profit</div>
          <div style={{ fontSize: '1.8em', fontWeight: 700 }}>₹{metrics.totalProfit.toFixed(0)}</div>
        </div>
        <div style={{ padding: 20, background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', borderRadius: 12, color: '#fff' }}>
          <div style={{ fontSize: '0.85em', opacity: 0.9, marginBottom: 4 }}>Units Sold</div>
          <div style={{ fontSize: '1.8em', fontWeight: 700 }}>{metrics.totalUnits}</div>
        </div>
        <div style={{ padding: 20, background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)', borderRadius: 12, color: '#fff' }}>
          <div style={{ fontSize: '0.85em', opacity: 0.9, marginBottom: 4 }}>Avg Order Value</div>
          <div style={{ fontSize: '1.8em', fontWeight: 700 }}>₹{metrics.avgOrderValue.toFixed(0)}</div>
        </div>
        <div style={{ padding: 20, background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)', borderRadius: 12, color: '#fff' }}>
          <div style={{ fontSize: '0.85em', opacity: 0.9, marginBottom: 4 }}>Profit Margin</div>
          <div style={{ fontSize: '1.8em', fontWeight: 700 }}>{metrics.profitMargin.toFixed(1)}%</div>
        </div>
        <div style={{ padding: 20, background: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)', borderRadius: 12, color: '#fff' }}>
          <div style={{ fontSize: '0.85em', opacity: 0.9, marginBottom: 4 }}>Customers</div>
          <div style={{ fontSize: '1.8em', fontWeight: 700 }}>{metrics.uniqueCustomers}</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
        {/* Sales List */}
        <div>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1em' }}>📋 Recent Sales ({filteredSales.length})</h3>
          
          {filteredSales.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, background: '#f9f9f9', borderRadius: 12 }}>
              <div style={{ fontSize: '3em', marginBottom: 12 }}>💰</div>
              <div style={{ color: '#666' }}>No sales recorded yet</div>
              <button
                onClick={() => setShowAddModal(true)}
                style={{ marginTop: 16, padding: '10px 20px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
              >
                Record Your First Sale
              </button>
            </div>
          ) : (
            <div>
              {filteredSales.map(sale => (
                <SaleCard
                  key={sale.id}
                  sale={sale}
                  recipes={recipes}
                  batches={batches}
                  onDelete={handleDeleteSale}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Best Sellers */}
          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1em' }}>🏆 Best Sellers</h3>
            {metrics.bestSellers.length === 0 ? (
              <div style={{ color: '#666', fontSize: '0.9em' }}>No data yet</div>
            ) : (
              metrics.bestSellers.map((p, i) => (
                <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < metrics.bestSellers.length - 1 ? '1px solid #eee' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75em', fontWeight: 600 }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: '0.9em' }}>{p.name}</span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.85em' }}>
                    <div style={{ fontWeight: 600 }}>{p.quantity} sold</div>
                    <div style={{ color: '#666' }}>₹{p.revenue.toFixed(0)}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sales by Channel */}
          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, padding: 16 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1em' }}>📊 Sales by Channel</h3>
            {metrics.channelSales.length === 0 ? (
              <div style={{ color: '#666', fontSize: '0.9em' }}>No data yet</div>
            ) : (
              metrics.channelSales.map(ch => {
                const icons = { direct: '👥', online: '🌐', retail: '🏪', wholesale: '📦' };
                const colors = { direct: '#e91e63', online: '#2196f3', retail: '#9c27b0', wholesale: '#ff9800' };
                const pct = metrics.totalRevenue > 0 ? (ch.revenue / metrics.totalRevenue) * 100 : 0;
                
                return (
                  <div key={ch.channel} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.9em' }}>
                      <span>{icons[ch.channel] || '📦'} {ch.channel.charAt(0).toUpperCase() + ch.channel.slice(1)}</span>
                      <span style={{ fontWeight: 600 }}>₹{ch.revenue.toFixed(0)} ({ch.count})</span>
                    </div>
                    <div style={{ height: 8, background: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: colors[ch.channel] || '#1976d2', borderRadius: 4 }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Sale Modal */}
      {showAddModal && (
        <AddSaleModal
          recipes={recipes}
          batches={batches}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddSale}
        />
      )}
    </div>
    </div>
  );
}

export default SalesDashboard;

import React, { useState, useEffect, useMemo } from 'react';
import { subscribeToUserCollection } from '../utils/userDataHelper';
import { Link } from 'react-router-dom';
import { num } from './utils/costCalculations';
import LabNavbar from './LabNavbar';
import './labcss/labtheme.css';

/**
 * LabDashboard - Main dashboard with quick stats and inventory alerts
 * Shows overview of recipes, batches, sales, and low stock warnings
 */

function LabDashboard() {
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all data
  useEffect(() => {
    const unsubs = [];
    
    try {
      unsubs.push(subscribeToUserCollection('ingredients', (data) => {
        setIngredients(data);
      }));
      
      unsubs.push(subscribeToUserCollection('recipes', (data) => {
        setRecipes(data);
      }));
      
      unsubs.push(subscribeToUserCollection('batches', (data) => {
        setBatches(data);
        setLoading(false);
      }));
      
      unsubs.push(subscribeToUserCollection('sales', (data) => {
        setSales(data);
      }));
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }

    return () => unsubs.forEach(u => u());
  }, []);

  // Calculate inventory alerts
  const inventoryAlerts = useMemo(() => {
    return ingredients.filter(ing => {
      const stock = num(ing.stockGrams || ing.stock, 0);
      const minStock = num(ing.minStockGrams || ing.minStock || 100, 100);
      return stock < minStock;
    }).map(ing => ({
      ...ing,
      currentStock: num(ing.stockGrams || ing.stock, 0),
      minStock: num(ing.minStockGrams || ing.minStock || 100, 100),
    }));
  }, [ingredients]);

  // Calculate batch alerts (ready or expiring soon)
  const batchAlerts = useMemo(() => {
    const today = new Date();
    const alerts = [];
    
    batches.forEach(batch => {
      // Check if curing is complete
      if (batch.status === 'curing' && batch.madeDate) {
        const madeDate = new Date(batch.madeDate);
        const readyDate = new Date(madeDate.getTime() + 42 * 24 * 60 * 60 * 1000); // 6 weeks
        const daysLeft = Math.ceil((readyDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysLeft <= 0) {
          alerts.push({ ...batch, alertType: 'ready', message: 'Ready for testing!' });
        } else if (daysLeft <= 7) {
          alerts.push({ ...batch, alertType: 'soon', message: `Ready in ${daysLeft} days` });
        }
      }
      
      // Check for expiring soaps
      if (batch.soapExpiryDate) {
        const expDate = new Date(batch.soapExpiryDate);
        const daysToExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysToExpiry <= 30 && daysToExpiry > 0) {
          alerts.push({ ...batch, alertType: 'expiring', message: `Expires in ${daysToExpiry} days` });
        } else if (daysToExpiry <= 0) {
          alerts.push({ ...batch, alertType: 'expired', message: 'Expired!' });
        }
      }
    });
    
    return alerts;
  }, [batches]);

  // Calculate sales metrics (this month)
  const salesMetrics = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisMonthSales = sales.filter(s => new Date(s.date) >= monthStart);
    
    return {
      totalRevenue: thisMonthSales.reduce((sum, s) => sum + num(s.totalAmount, 0), 0),
      totalProfit: thisMonthSales.reduce((sum, s) => sum + num(s.profit, 0), 0),
      totalOrders: thisMonthSales.length,
      unitsSold: thisMonthSales.reduce((sum, s) => sum + num(s.quantity, 0), 0),
    };
  }, [sales]);

  // Quick stats
  const stats = {
    recipes: recipes.length,
    ingredients: ingredients.length,
    curingBatches: batches.filter(b => b.status === 'curing').length,
    readyBatches: batches.filter(b => b.status === 'ready').length,
  };

  if (loading) {
    return (
      <div className="lab-loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading your lab...</p>
        <style>{`
          .lab-loading-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            gap: 16px;
          }
          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid var(--lab-border-light, #f0f0f0);
            border-top-color: var(--lab-primary, #5c6bc0);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="lab-container">
      <LabNavbar />
      <div className="dashboard-wrapper">
        {/* Hero Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">Welcome to your Soap Lab</h1>
            <p className="dashboard-subtitle">Your complete soap making management center</p>
          </div>
          <div className="header-quick-stats">
            <div className="mini-stat">
              <span className="mini-stat-value">{stats.recipes}</span>
              <span className="mini-stat-label">Recipes</span>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-value">{stats.curingBatches}</span>
              <span className="mini-stat-label">Curing</span>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-value">{stats.readyBatches}</span>
              <span className="mini-stat-label">Ready</span>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {(inventoryAlerts.length > 0 || batchAlerts.length > 0) && (
          <div className="alerts-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">⚠️</span>
                Alerts & Notifications
              </h2>
              <span className="alert-count">{inventoryAlerts.length + batchAlerts.length} items</span>
            </div>
            <div className="alerts-grid">
              {/* Inventory Alerts */}
              {inventoryAlerts.map(ing => (
                <div key={ing.id} className="alert-card alert-warning">
                  <div className="alert-icon">📦</div>
                  <div className="alert-content">
                    <div className="alert-title">Low Stock: {ing.name}</div>
                    <div className="alert-desc">
                      {ing.currentStock}g remaining (min: {ing.minStock}g)
                    </div>
                  </div>
                  <Link to="/lab/inventory" className="alert-action">
                    Restock
                  </Link>
                </div>
              ))}
              
              {/* Batch Alerts */}
              {batchAlerts.map((batch, i) => (
                <div 
                  key={`${batch.id}-${i}`} 
                  className={`alert-card ${
                    batch.alertType === 'ready' ? 'alert-success' : 
                    batch.alertType === 'expired' ? 'alert-error' : 'alert-warning'
                  }`}
                >
                  <div className="alert-icon">
                    {batch.alertType === 'ready' ? '✅' : batch.alertType === 'expired' ? '🚨' : '⏰'}
                  </div>
                  <div className="alert-content">
                    <div className="alert-title">{batch.name || 'Batch'}</div>
                    <div className="alert-desc">{batch.message}</div>
                  </div>
                  <Link to="/lab/batches" className="alert-action">View</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card stat-primary">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <span className="stat-value">{stats.recipes}</span>
                <span className="stat-label">Total Recipes</span>
              </div>
            </div>
            <div className="stat-card stat-teal">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <span className="stat-value">{stats.ingredients}</span>
                <span className="stat-label">Ingredients</span>
              </div>
            </div>
            <div className="stat-card stat-orange">
              <div className="stat-icon">🧪</div>
              <div className="stat-info">
                <span className="stat-value">{stats.curingBatches}</span>
                <span className="stat-label">Curing Now</span>
              </div>
            </div>
            <div className="stat-card stat-green">
              <div className="stat-icon">✨</div>
              <div className="stat-info">
                <span className="stat-value">{stats.readyBatches}</span>
                <span className="stat-label">Ready to Sell</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sales This Month */}
        <div className="sales-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">💰</span>
              This Month's Performance
            </h2>
          </div>
          <div className="sales-grid">
            <div className="sales-card">
              <div className="sales-visual revenue">
                <svg viewBox="0 0 36 36" className="progress-ring">
                  <path className="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  <path className="ring-fill" strokeDasharray={`${Math.min((salesMetrics.totalRevenue / 10000) * 100, 100)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                </svg>
                <span className="sales-icon">📈</span>
              </div>
              <div className="sales-info">
                <span className="sales-value">₹{salesMetrics.totalRevenue.toFixed(0)}</span>
                <span className="sales-label">Revenue</span>
              </div>
            </div>
            
            <div className="sales-card">
              <div className="sales-visual profit">
                <svg viewBox="0 0 36 36" className="progress-ring">
                  <path className="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  <path className="ring-fill" strokeDasharray={`${Math.min((salesMetrics.totalProfit / 5000) * 100, 100)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                </svg>
                <span className="sales-icon">💵</span>
              </div>
              <div className="sales-info">
                <span className="sales-value">₹{salesMetrics.totalProfit.toFixed(0)}</span>
                <span className="sales-label">Profit</span>
              </div>
            </div>
            
            <div className="sales-card">
              <div className="sales-visual orders">
                <span className="order-number">{salesMetrics.totalOrders}</span>
              </div>
              <div className="sales-info">
                <span className="sales-label">Orders Completed</span>
              </div>
            </div>
            
            <div className="sales-card">
              <div className="sales-visual units">
                <span className="order-number">{salesMetrics.unitsSold}</span>
              </div>
              <div className="sales-info">
                <span className="sales-label">Units Sold</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="actions-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">🚀</span>
              Quick Actions
            </h2>
          </div>
          <div className="actions-grid">
            <Link to="/lab" className="action-card action-primary">
              <div className="action-icon">🧮</div>
              <div className="action-content">
                <span className="action-title">Create Recipe</span>
                <span className="action-desc">Build a new soap formula</span>
              </div>
            </Link>
            
            <Link to="/lab/generator" className="action-card action-purple">
              <div className="action-icon">🧠</div>
              <div className="action-content">
                <span className="action-title">AI Generator</span>
                <span className="action-desc">Smart recipe suggestions</span>
              </div>
            </Link>
            
            <Link to="/lab/quickbatch" className="action-card action-yellow">
              <div className="action-icon">⚡</div>
              <div className="action-content">
                <span className="action-title">Quick Batch</span>
                <span className="action-desc">Start production fast</span>
              </div>
            </Link>
            
            <Link to="/lab/recipes" className="action-card action-orange">
              <div className="action-icon">📚</div>
              <div className="action-content">
                <span className="action-title">My Recipes</span>
                <span className="action-desc">{stats.recipes} saved recipes</span>
              </div>
            </Link>
            
            <Link to="/lab/batches" className="action-card action-blue">
              <div className="action-icon">📋</div>
              <div className="action-content">
                <span className="action-title">Batches</span>
                <span className="action-desc">{stats.curingBatches} currently curing</span>
              </div>
            </Link>
            
            <Link to="/lab/inventory" className="action-card action-teal">
              <div className="action-icon">📦</div>
              <div className="action-content">
                <span className="action-title">Inventory</span>
                <span className="action-desc">{inventoryAlerts.length > 0 ? `⚠️ ${inventoryAlerts.length} low stock` : 'All items stocked'}</span>
              </div>
            </Link>
            
            <Link to="/lab/sales" className="action-card action-green">
              <div className="action-icon">💰</div>
              <div className="action-content">
                <span className="action-title">Sales</span>
                <span className="action-desc">Track revenue & orders</span>
              </div>
            </Link>
            
            <Link to="/lab/print" className="action-card action-gray">
              <div className="action-icon">🖨️</div>
              <div className="action-content">
                <span className="action-title">Print Center</span>
                <span className="action-desc">Recipe sheets & labels</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-wrapper {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 20px 40px;
        }

        /* Header */
        .dashboard-header {
          background: linear-gradient(135deg, rgba(92,107,192,0.1) 0%, rgba(57,73,171,0.05) 100%);
          border-radius: 20px;
          padding: 32px;
          margin: 24px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .dashboard-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--lab-text, #212121);
          margin: 0;
          letter-spacing: -0.02em;
        }

        .dashboard-subtitle {
          color: var(--lab-text-secondary, #666);
          margin: 8px 0 0;
          font-size: 1rem;
        }

        .header-quick-stats {
          display: flex;
          gap: 24px;
        }

        .mini-stat {
          text-align: center;
          padding: 12px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: var(--lab-shadow-sm, 0 1px 3px rgba(0,0,0,0.08));
        }

        .mini-stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--lab-primary, #5c6bc0);
        }

        .mini-stat-label {
          display: block;
          font-size: 0.75rem;
          color: var(--lab-text-muted, #9e9e9e);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Section Headers */
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--lab-text, #212121);
          margin: 0;
        }

        .section-icon {
          font-size: 1.1em;
        }

        /* Alerts */
        .alerts-section {
          margin-bottom: 32px;
        }

        .alert-count {
          font-size: 0.85rem;
          color: var(--lab-warning, #ffa726);
          font-weight: 500;
        }

        .alerts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 12px;
        }

        .alert-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          background: white;
          border-radius: 14px;
          border-left: 4px solid;
          box-shadow: var(--lab-shadow-sm);
          transition: all 0.2s ease;
        }

        .alert-card:hover {
          transform: translateX(4px);
          box-shadow: var(--lab-shadow-md);
        }

        .alert-warning { border-color: var(--lab-warning, #ffa726); background: linear-gradient(135deg, #fff9f0 0%, white 100%); }
        .alert-success { border-color: var(--lab-success, #66bb6a); background: linear-gradient(135deg, #f0fff4 0%, white 100%); }
        .alert-error { border-color: var(--lab-error, #ef5350); background: linear-gradient(135deg, #fff5f5 0%, white 100%); }

        .alert-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .alert-content {
          flex: 1;
          min-width: 0;
        }

        .alert-title {
          font-weight: 600;
          color: var(--lab-text, #212121);
          margin-bottom: 2px;
        }

        .alert-desc {
          font-size: 0.85rem;
          color: var(--lab-text-secondary, #666);
        }

        .alert-action {
          padding: 8px 16px;
          background: var(--lab-primary, #5c6bc0);
          color: white;
          border-radius: 8px;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .alert-action:hover {
          background: var(--lab-primary-dark, #3949ab);
          transform: translateY(-1px);
        }

        /* Stats Cards */
        .stats-section {
          margin-bottom: 32px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
          border-radius: 16px;
          color: white;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: -30%;
          right: -30%;
          width: 100px;
          height: 100px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }

        .stat-primary { background: linear-gradient(135deg, #5c6bc0 0%, #3949ab 100%); }
        .stat-teal { background: linear-gradient(135deg, #26a69a 0%, #00897b 100%); }
        .stat-orange { background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%); }
        .stat-green { background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%); }

        .stat-icon {
          width: 48px;
          height: 48px;
          background: rgba(255,255,255,0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.85rem;
          opacity: 0.9;
          margin-top: 4px;
        }

        /* Sales Section */
        .sales-section {
          margin-bottom: 32px;
        }

        .sales-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .sales-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          box-shadow: var(--lab-shadow-sm);
          transition: all 0.2s ease;
        }

        .sales-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--lab-shadow-md);
        }

        .sales-visual {
          width: 80px;
          height: 80px;
          margin: 0 auto 16px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progress-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .ring-bg {
          fill: none;
          stroke: #e0e0e0;
          stroke-width: 3;
        }

        .ring-fill {
          fill: none;
          stroke-width: 3;
          stroke-linecap: round;
          transition: stroke-dasharray 0.5s ease;
        }

        .revenue .ring-fill { stroke: #66bb6a; }
        .profit .ring-fill { stroke: #42a5f5; }

        .sales-icon {
          font-size: 1.8rem;
          z-index: 1;
        }

        .order-number {
          font-size: 2rem;
          font-weight: 800;
          color: var(--lab-primary, #5c6bc0);
        }

        .sales-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sales-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--lab-text, #212121);
        }

        .sales-label {
          font-size: 0.85rem;
          color: var(--lab-text-secondary, #666);
        }

        /* Quick Actions */
        .actions-section {
          margin-bottom: 32px;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border-radius: 16px;
          text-decoration: none;
          border: 2px solid transparent;
          box-shadow: var(--lab-shadow-sm);
          transition: all 0.25s ease;
        }

        .action-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--lab-shadow-lg);
        }

        .action-primary:hover { border-color: #5c6bc0; background: linear-gradient(135deg, #f5f6ff 0%, white 100%); }
        .action-purple:hover { border-color: #9c27b0; background: linear-gradient(135deg, #fdf5ff 0%, white 100%); }
        .action-yellow:hover { border-color: #ffc107; background: linear-gradient(135deg, #fffdf5 0%, white 100%); }
        .action-orange:hover { border-color: #ff9800; background: linear-gradient(135deg, #fff9f0 0%, white 100%); }
        .action-blue:hover { border-color: #2196f3; background: linear-gradient(135deg, #f0f7ff 0%, white 100%); }
        .action-teal:hover { border-color: #009688; background: linear-gradient(135deg, #f0fffd 0%, white 100%); }
        .action-green:hover { border-color: #4caf50; background: linear-gradient(135deg, #f0fff4 0%, white 100%); }
        .action-gray:hover { border-color: #607d8b; background: linear-gradient(135deg, #f5f7f8 0%, white 100%); }

        .action-icon {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
          transition: all 0.25s ease;
        }

        .action-primary:hover .action-icon { background: linear-gradient(135deg, #5c6bc0 0%, #3949ab 100%); }
        .action-purple:hover .action-icon { background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%); }
        .action-yellow:hover .action-icon { background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%); }
        .action-orange:hover .action-icon { background: linear-gradient(135deg, #ff9800 0%, #fb8c00 100%); }
        .action-blue:hover .action-icon { background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); }
        .action-teal:hover .action-icon { background: linear-gradient(135deg, #009688 0%, #00796b 100%); }
        .action-green:hover .action-icon { background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%); }
        .action-gray:hover .action-icon { background: linear-gradient(135deg, #607d8b 0%, #455a64 100%); }

        .action-content {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .action-title {
          font-weight: 600;
          font-size: 1rem;
          color: var(--lab-text, #212121);
        }

        .action-desc {
          font-size: 0.8rem;
          color: var(--lab-text-secondary, #666);
          margin-top: 2px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .stats-grid,
          .sales-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .dashboard-header {
            padding: 24px;
            flex-direction: column;
            text-align: center;
          }

          .header-quick-stats {
            width: 100%;
            justify-content: center;
          }

          .dashboard-title {
            font-size: 1.5rem;
          }

          .stats-grid,
          .sales-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 20px;
          }

          .stat-value {
            font-size: 1.5rem;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default LabDashboard;

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../utils/firebase-config';
import { collection, onSnapshot } from 'firebase/firestore';
import { num } from './utils/costCalculations';
import LabNavbar from './LabNavbar';

/**
 * UsageReports - Track ingredient usage patterns and costs
 * Route: /lab/reports
 * 
 * Features:
 * - Most used ingredients
 * - Cost analysis by ingredient
 * - Usage trends over time
 * - Stock turnover rates
 * - Recipe complexity analysis
 */

function UsageReports() {
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('usage');
  const [timeRange, setTimeRange] = useState('all'); // all, month, quarter, year

  // Load all data
  useEffect(() => {
    const unsubs = [];

    unsubs.push(onSnapshot(collection(db, 'ingredients'), (snap) => {
      setIngredients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }));

    unsubs.push(onSnapshot(collection(db, 'recipes'), (snap) => {
      setRecipes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }));

    unsubs.push(onSnapshot(collection(db, 'batches'), (snap) => {
      setBatches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }));

    unsubs.push(onSnapshot(collection(db, 'sales'), (snap) => {
      setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }));

    return () => unsubs.forEach(u => u());
  }, []);

  // Filter data by time range
  const filterByTime = (items, dateField = 'createdAt') => {
    if (timeRange === 'all') return items;
    
    const now = new Date();
    let cutoff;
    switch (timeRange) {
      case 'month':
        cutoff = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarter':
        cutoff = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        cutoff = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        return items;
    }
    
    return items.filter(item => {
      const date = item[dateField] ? new Date(item[dateField]) : null;
      return date && date >= cutoff;
    });
  };

  // Calculate ingredient usage across recipes
  const ingredientUsage = useMemo(() => {
    const usage = {};
    
    // Initialize with all ingredients
    ingredients.forEach(ing => {
      usage[ing.name || ing.key] = {
        name: ing.name || ing.key,
        id: ing.id,
        category: ing.category || ing.type || 'unknown',
        recipeCount: 0,
        totalGrams: 0,
        avgPercentage: 0,
        percentages: [],
        recipes: [],
        costPerGram: num(ing.costPerUnit, 0) / Math.max(1, num(ing.unitSize, 1000)),
        totalCost: 0,
        currentStock: num(ing.stockGrams || ing.stock, 0),
      };
    });

    // Count usage in recipes
    const filteredRecipes = filterByTime(recipes, 'createdAt');
    filteredRecipes.forEach(recipe => {
      const oils = recipe.oils || recipe.items || [];
      const totalOilWeight = num(recipe.totalOilWeight, 1000);
      
      oils.forEach(oil => {
        const key = oil.name || oil.key;
        if (usage[key]) {
          usage[key].recipeCount++;
          const grams = (num(oil.pct, 0) / 100) * totalOilWeight;
          usage[key].totalGrams += grams;
          usage[key].percentages.push(num(oil.pct, 0));
          usage[key].recipes.push(recipe.name);
          usage[key].totalCost += grams * usage[key].costPerGram;
        }
      });

      // Count additives
      (recipe.additives || []).forEach(add => {
        const key = add.name;
        if (usage[key]) {
          usage[key].recipeCount++;
          const grams = num(add.amount, 0);
          usage[key].totalGrams += grams;
          usage[key].recipes.push(recipe.name);
          usage[key].totalCost += grams * usage[key].costPerGram;
        }
      });
    });

    // Calculate averages
    Object.values(usage).forEach(u => {
      if (u.percentages.length > 0) {
        u.avgPercentage = u.percentages.reduce((a, b) => a + b, 0) / u.percentages.length;
      }
    });

    return Object.values(usage).sort((a, b) => b.recipeCount - a.recipeCount);
  }, [ingredients, recipes, timeRange]);

  // Cost analysis
  const costAnalysis = useMemo(() => {
    const filteredBatches = filterByTime(batches, 'madeDate');
    const filteredSales = filterByTime(sales, 'date');
    
    const totalProductionCost = filteredBatches.reduce((sum, b) => 
      sum + num(b.totalCost || (b.costPerBar * b.bars), 0), 0);
    
    const totalRevenue = filteredSales.reduce((sum, s) => sum + num(s.totalAmount, 0), 0);
    const totalProfit = filteredSales.reduce((sum, s) => sum + num(s.profit, 0), 0);
    
    // Cost breakdown by category
    const categoryBreakdown = {};
    ingredientUsage.forEach(ing => {
      const cat = ing.category.toLowerCase();
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { name: cat, totalCost: 0, itemCount: 0 };
      }
      categoryBreakdown[cat].totalCost += ing.totalCost;
      categoryBreakdown[cat].itemCount++;
    });

    return {
      totalProductionCost,
      totalRevenue,
      totalProfit,
      profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0,
      categoryBreakdown: Object.values(categoryBreakdown).sort((a, b) => b.totalCost - a.totalCost),
      avgCostPerRecipe: recipes.length > 0 ? totalProductionCost / recipes.length : 0,
    };
  }, [batches, sales, ingredientUsage, recipes, timeRange]);

  // Recipe complexity analysis
  const recipeAnalysis = useMemo(() => {
    return recipes.map(recipe => {
      const oils = recipe.oils || recipe.items || [];
      const additives = recipe.additives || [];
      
      return {
        name: recipe.name,
        id: recipe.id,
        oilCount: oils.length,
        additiveCount: additives.length,
        totalIngredients: oils.length + additives.length,
        batchMass: num(recipe.computedBatchMass || recipe.batchSize, 0),
        costPerBar: num(recipe.totals?.perBar, 0),
        collection: recipe.collection || 'none',
        rating: recipe.rating || 0,
        createdAt: recipe.createdAt,
      };
    }).sort((a, b) => b.totalIngredients - a.totalIngredients);
  }, [recipes]);

  // Stock alerts
  const stockAlerts = useMemo(() => {
    return ingredientUsage
      .filter(ing => {
        const avgUsagePerBatch = ing.totalGrams / Math.max(1, batches.length);
        const batchesRemaining = ing.currentStock / Math.max(1, avgUsagePerBatch);
        return batchesRemaining < 5 && ing.recipeCount > 0;
      })
      .map(ing => ({
        ...ing,
        avgUsagePerBatch: ing.totalGrams / Math.max(1, batches.length),
        batchesRemaining: ing.currentStock / Math.max(1, ing.totalGrams / Math.max(1, batches.length)),
      }));
  }, [ingredientUsage, batches]);

  if (loading) {
    return (
      <div>
        <LabNavbar />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: '2em', marginBottom: 16 }}>⏳</div>
          <div>Analyzing data...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <LabNavbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8em' }}>📊 Usage Reports</h1>
            <p style={{ margin: '8px 0 0', color: '#666' }}>Ingredient usage patterns and cost analysis</p>
          </div>
          
          {/* Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              padding: '10px 16px',
              fontSize: '1em',
              border: '1px solid #ddd',
              borderRadius: 6,
              background: '#fff',
            }}
          >
            <option value="all">All Time</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #e0e0e0', paddingBottom: 4 }}>
          {[
            { id: 'usage', label: '📦 Ingredient Usage' },
            { id: 'cost', label: '💰 Cost Analysis' },
            { id: 'recipes', label: '📚 Recipe Analysis' },
            { id: 'alerts', label: '⚠️ Stock Alerts' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px',
                background: activeTab === tab.id ? '#1976d2' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#666',
                border: 'none',
                borderRadius: '6px 6px 0 0',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? 600 : 400,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'usage' && (
          <div>
            {/* Top Used Ingredients */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.1em' }}>🏆 Most Used Ingredients</h3>
              <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                      <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Ingredient</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>Category</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>Used In</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>Avg %</th>
                      <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>Total Grams</th>
                      <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredientUsage.slice(0, 15).map((ing, i) => (
                      <tr key={ing.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: 12, fontWeight: 500 }}>
                          {i < 3 && <span style={{ marginRight: 6 }}>{['🥇', '🥈', '🥉'][i]}</span>}
                          {ing.name}
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <span style={{ 
                            padding: '3px 10px', 
                            background: ing.category.includes('oil') ? '#e3f2fd' : '#fff3e0',
                            borderRadius: 10,
                            fontSize: '0.85em',
                          }}>
                            {ing.category}
                          </span>
                        </td>
                        <td style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>
                          {ing.recipeCount} recipes
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          {ing.avgPercentage > 0 ? `${ing.avgPercentage.toFixed(1)}%` : '—'}
                        </td>
                        <td style={{ padding: 12, textAlign: 'right' }}>
                          {ing.totalGrams.toFixed(0)}g
                        </td>
                        <td style={{ padding: 12, textAlign: 'right', color: '#2e7d32', fontWeight: 500 }}>
                          ₹{ing.totalCost.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Unused Ingredients */}
            {ingredientUsage.filter(i => i.recipeCount === 0).length > 0 && (
              <div style={{ padding: 16, background: '#fff3e0', borderRadius: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>⚠️ Unused Ingredients</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ingredientUsage.filter(i => i.recipeCount === 0).map(ing => (
                    <span key={ing.id} style={{ padding: '4px 10px', background: '#fff', borderRadius: 4, fontSize: '0.9em' }}>
                      {ing.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'cost' && (
          <div>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
              <div style={{ padding: 20, background: 'linear-gradient(135deg, #1976d2, #1565c0)', borderRadius: 12, color: '#fff' }}>
                <div style={{ fontSize: '0.85em', opacity: 0.9 }}>Total Production Cost</div>
                <div style={{ fontSize: '1.8em', fontWeight: 700 }}>₹{costAnalysis.totalProductionCost.toFixed(0)}</div>
              </div>
              <div style={{ padding: 20, background: 'linear-gradient(135deg, #4caf50, #388e3c)', borderRadius: 12, color: '#fff' }}>
                <div style={{ fontSize: '0.85em', opacity: 0.9 }}>Total Revenue</div>
                <div style={{ fontSize: '1.8em', fontWeight: 700 }}>₹{costAnalysis.totalRevenue.toFixed(0)}</div>
              </div>
              <div style={{ padding: 20, background: 'linear-gradient(135deg, #ff9800, #f57c00)', borderRadius: 12, color: '#fff' }}>
                <div style={{ fontSize: '0.85em', opacity: 0.9 }}>Total Profit</div>
                <div style={{ fontSize: '1.8em', fontWeight: 700 }}>₹{costAnalysis.totalProfit.toFixed(0)}</div>
              </div>
              <div style={{ padding: 20, background: 'linear-gradient(135deg, #9c27b0, #7b1fa2)', borderRadius: 12, color: '#fff' }}>
                <div style={{ fontSize: '0.85em', opacity: 0.9 }}>Profit Margin</div>
                <div style={{ fontSize: '1.8em', fontWeight: 700 }}>{costAnalysis.profitMargin.toFixed(1)}%</div>
              </div>
            </div>

            {/* Cost by Category */}
            <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e0e0e0', padding: 20, marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.1em' }}>💹 Cost by Ingredient Category</h3>
              {costAnalysis.categoryBreakdown.map((cat, i) => {
                const maxCost = costAnalysis.categoryBreakdown[0]?.totalCost || 1;
                const percentage = (cat.totalCost / maxCost) * 100;
                return (
                  <div key={cat.name} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ textTransform: 'capitalize' }}>{cat.name}</span>
                      <span style={{ fontWeight: 600 }}>₹{cat.totalCost.toFixed(2)}</span>
                    </div>
                    <div style={{ height: 8, background: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${percentage}%`, 
                        height: '100%', 
                        background: `hsl(${200 - i * 30}, 70%, 50%)`,
                        transition: 'width 0.3s',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Most Expensive Ingredients */}
            <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e0e0e0', padding: 20 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.1em' }}>💎 Highest Cost Ingredients</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                {[...ingredientUsage]
                  .sort((a, b) => b.totalCost - a.totalCost)
                  .slice(0, 10)
                  .map((ing, i) => (
                    <div key={ing.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: 10, 
                      background: i % 2 === 0 ? '#f5f5f5' : '#fff',
                      borderRadius: 4,
                    }}>
                      <span>{ing.name}</span>
                      <span style={{ fontWeight: 600, color: '#c62828' }}>₹{ing.totalCost.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recipes' && (
          <div>
            {/* Recipe Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
              <div style={{ padding: 16, background: '#e3f2fd', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: '0.85em', color: '#666' }}>Total Recipes</div>
                <div style={{ fontSize: '2em', fontWeight: 700, color: '#1976d2' }}>{recipes.length}</div>
              </div>
              <div style={{ padding: 16, background: '#e8f5e9', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: '0.85em', color: '#666' }}>Avg Ingredients</div>
                <div style={{ fontSize: '2em', fontWeight: 700, color: '#4caf50' }}>
                  {(recipeAnalysis.reduce((s, r) => s + r.totalIngredients, 0) / Math.max(1, recipeAnalysis.length)).toFixed(1)}
                </div>
              </div>
              <div style={{ padding: 16, background: '#fff3e0', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: '0.85em', color: '#666' }}>Avg Cost/Bar</div>
                <div style={{ fontSize: '2em', fontWeight: 700, color: '#ff9800' }}>
                  ₹{(recipeAnalysis.reduce((s, r) => s + r.costPerBar, 0) / Math.max(1, recipeAnalysis.length)).toFixed(0)}
                </div>
              </div>
            </div>

            {/* Recipe Table */}
            <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>Recipe</th>
                    <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>Oils</th>
                    <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>Additives</th>
                    <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>Total</th>
                    <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>Collection</th>
                    <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>Rating</th>
                    <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>Cost/Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {recipeAnalysis.map((recipe, i) => (
                    <tr key={recipe.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: 12, fontWeight: 500 }}>{recipe.name}</td>
                      <td style={{ padding: 12, textAlign: 'center' }}>{recipe.oilCount}</td>
                      <td style={{ padding: 12, textAlign: 'center' }}>{recipe.additiveCount}</td>
                      <td style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>{recipe.totalIngredients}</td>
                      <td style={{ padding: 12, textAlign: 'center' }}>
                        <span style={{ 
                          padding: '3px 10px', 
                          background: recipe.collection === 'standard' ? '#e8f5e9' : recipe.collection === 'favorites' ? '#fce4ec' : '#f5f5f5',
                          borderRadius: 10,
                          fontSize: '0.85em',
                        }}>
                          {recipe.collection || 'none'}
                        </span>
                      </td>
                      <td style={{ padding: 12, textAlign: 'center', color: '#ffc107' }}>
                        {'★'.repeat(recipe.rating)}{'☆'.repeat(5 - recipe.rating)}
                      </td>
                      <td style={{ padding: 12, textAlign: 'right', fontWeight: 500 }}>₹{recipe.costPerBar.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div>
            {stockAlerts.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', background: '#e8f5e9', borderRadius: 10 }}>
                <div style={{ fontSize: '3em', marginBottom: 16 }}>✅</div>
                <div style={{ fontSize: '1.2em', fontWeight: 600, color: '#2e7d32' }}>All stock levels are healthy!</div>
                <div style={{ color: '#666', marginTop: 8 }}>Based on your usage patterns, no ingredients need restocking soon.</div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 16, padding: 12, background: '#fff3e0', borderRadius: 8 }}>
                  <strong>⚠️ {stockAlerts.length} ingredient(s)</strong> may run out within the next 5 batches based on your usage patterns.
                </div>
                
                <div style={{ display: 'grid', gap: 12 }}>
                  {stockAlerts.map(ing => (
                    <div key={ing.id} style={{
                      padding: 16,
                      background: '#fff',
                      borderRadius: 8,
                      border: '1px solid #ffcc80',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{ing.name}</div>
                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                          Current: {ing.currentStock.toFixed(0)}g • 
                          Avg use: {ing.avgUsagePerBatch.toFixed(0)}g/batch
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: '1.2em', 
                          fontWeight: 700, 
                          color: ing.batchesRemaining < 2 ? '#c62828' : '#ff9800',
                        }}>
                          ~{ing.batchesRemaining.toFixed(1)} batches
                        </div>
                        <div style={{ fontSize: '0.85em', color: '#666' }}>remaining</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UsageReports;

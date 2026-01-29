import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebase-config';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import LabNavbar from './LabNavbar';

// Import centralized utilities
import { num } from './utils/costCalculations';

/**
 * BatchesPage - Track soap batches through production and curing
 * Route: /lab/batches
 * 
 * Features:
 * - Create batches from recipes
 * - Track curing progress (4-6 weeks)
 * - Add notes/journal entries
 * - Quality control logging
 * - Batch status management
 */

const BATCH_STATUSES = [
  { id: 'planned', label: '📋 Planned', color: '#9e9e9e' },
  { id: 'in_progress', label: '🔄 In Progress', color: '#2196f3' },
  { id: 'curing', label: '⏳ Curing', color: '#ff9800' },
  { id: 'testing', label: '🧪 Testing', color: '#9c27b0' },
  { id: 'ready', label: '✅ Ready', color: '#4caf50' },
  { id: 'sold', label: '💰 Sold', color: '#795548' },
];

// Single Batch Card Component
const BatchCard = ({ batch, recipes, onUpdate, onDelete, onAddNote }) => {
  const [expanded, setExpanded] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showQC, setShowQC] = useState(false);
  const [qcData, setQcData] = useState(batch.qc || {});

  const recipe = recipes.find(r => r.id === batch.recipeId);
  const status = BATCH_STATUSES.find(s => s.id === batch.status) || BATCH_STATUSES[0];
  
  const madeDate = batch.madeDate ? new Date(batch.madeDate) : null;
  const readyDate = madeDate ? new Date(madeDate.getTime() + (42 * 24 * 60 * 60 * 1000)) : null; // 6 weeks
  const today = new Date();
  const daysRemaining = readyDate ? Math.ceil((readyDate - today) / (1000 * 60 * 60 * 24)) : null;
  const cureProgress = madeDate ? Math.min(100, Math.max(0, ((today - madeDate) / (42 * 24 * 60 * 60 * 1000)) * 100)) : 0;

  const handleStatusChange = async (newStatus) => {
    await onUpdate(batch.id, { status: newStatus });
    setEditingStatus(false);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const notes = batch.notes || [];
    notes.push({
      text: newNote,
      date: new Date().toISOString(),
    });
    await onUpdate(batch.id, { notes });
    setNewNote('');
  };

  const handleQCSave = async () => {
    await onUpdate(batch.id, { qc: qcData, status: 'ready' });
    setShowQC(false);
  };

  return (
    <div style={{
      border: `2px solid ${status.color}`,
      borderRadius: 10,
      background: '#fff',
      marginBottom: 12,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '14px 16px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: expanded ? '#f9f9f9' : '#fff',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: '1.05em' }}>{batch.name || 'Unnamed Batch'}</span>
            <span style={{ 
              padding: '3px 10px', 
              background: status.color, 
              color: '#fff', 
              borderRadius: 12, 
              fontSize: '0.75em',
              fontWeight: 500,
            }}>
              {status.label}
            </span>
          </div>
          <div style={{ fontSize: '0.85em', color: '#666' }}>
            {recipe?.name || 'Unknown recipe'} • {batch.bars || '?'} bars
            {madeDate && ` • Made: ${madeDate.toLocaleDateString()}`}
          </div>
        </div>

        {/* Cure Progress (if curing) */}
        {batch.status === 'curing' && madeDate && (
          <div style={{ textAlign: 'right', marginRight: 16 }}>
            <div style={{ fontSize: '0.8em', color: '#666', marginBottom: 4 }}>
              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Ready to test!'}
            </div>
            <div style={{ width: 100, height: 6, background: '#e0e0e0', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${cureProgress}%`, height: '100%', background: status.color, transition: 'width 0.3s' }} />
            </div>
          </div>
        )}

        <span style={{ fontSize: '1.2em', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ padding: '16px', borderTop: '1px solid #e8e8e8' }}>
          {/* Status Change */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, fontSize: '0.9em', marginBottom: 8, display: 'block' }}>Status:</label>
            {editingStatus ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {BATCH_STATUSES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleStatusChange(s.id)}
                    style={{
                      padding: '8px 14px',
                      background: s.id === batch.status ? s.color : '#f5f5f5',
                      color: s.id === batch.status ? '#fff' : '#333',
                      border: `1px solid ${s.color}`,
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    {s.label}
                  </button>
                ))}
                <button onClick={() => setEditingStatus(false)} style={{ padding: '8px 14px', background: '#eee', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
              </div>
            ) : (
              <button 
                onClick={() => setEditingStatus(true)}
                style={{ padding: '8px 14px', background: status.color, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
              >
                {status.label} — Change
              </button>
            )}
          </div>

          {/* Batch Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
              <div style={{ fontSize: '0.75em', color: '#666' }}>Bars</div>
              <div style={{ fontWeight: 600 }}>{batch.bars || '—'}</div>
            </div>
            <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
              <div style={{ fontSize: '0.75em', color: '#666' }}>Batch Mass</div>
              <div style={{ fontWeight: 600 }}>{num(batch.batchMass, 0).toFixed(0)}g</div>
            </div>
            <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
              <div style={{ fontSize: '0.75em', color: '#666' }}>Cost/Bar</div>
              <div style={{ fontWeight: 600 }}>₹{num(batch.costPerBar, 0).toFixed(2)}</div>
            </div>
            <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
              <div style={{ fontSize: '0.75em', color: '#666' }}>Ready Date</div>
              <div style={{ fontWeight: 600 }}>{readyDate ? readyDate.toLocaleDateString() : '—'}</div>
            </div>
            <div style={{ padding: 12, background: batch.soapExpiryDate && new Date(batch.soapExpiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) ? '#fff3e0' : '#f5f5f5', borderRadius: 6 }}>
              <div style={{ fontSize: '0.75em', color: '#666' }}>Soap Expiry</div>
              <div style={{ fontWeight: 600, color: batch.soapExpiryDate && new Date(batch.soapExpiryDate) < today ? '#f44336' : 'inherit' }}>
                {batch.soapExpiryDate ? new Date(batch.soapExpiryDate).toLocaleDateString() : '—'}
              </div>
            </div>
          </div>

          {/* Curing Progress Bar (detailed) */}
          {batch.status === 'curing' && madeDate && (
            <div style={{ marginBottom: 16, padding: 12, background: '#fff3e0', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>⏳ Curing Progress</span>
                <span>{cureProgress.toFixed(0)}%</span>
              </div>
              <div style={{ height: 12, background: '#e0e0e0', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${cureProgress}%`, height: '100%', background: '#ff9800', transition: 'width 0.3s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.8em', color: '#666' }}>
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
                <span>Week 5</span>
                <span>Week 6</span>
              </div>
            </div>
          )}

          {/* Quality Control */}
          {(batch.status === 'testing' || batch.status === 'curing') && (
            <div style={{ marginBottom: 16 }}>
              <button 
                onClick={() => setShowQC(!showQC)}
                style={{ padding: '10px 16px', background: '#9c27b0', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}
              >
                🧪 {showQC ? 'Hide' : 'Run'} Quality Control Test
              </button>
              
              {showQC && (
                <div style={{ marginTop: 12, padding: 16, background: '#f3e5f5', borderRadius: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.85em', fontWeight: 500 }}>pH Level</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={qcData.ph || ''} 
                        onChange={e => setQcData({...qcData, ph: e.target.value})}
                        placeholder="8-10 ideal"
                        style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, marginTop: 4 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85em', fontWeight: 500 }}>Hardness (1-5)</label>
                      <input 
                        type="number" 
                        min="1" max="5"
                        value={qcData.hardness || ''} 
                        onChange={e => setQcData({...qcData, hardness: e.target.value})}
                        style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, marginTop: 4 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85em', fontWeight: 500 }}>Lather (1-5)</label>
                      <input 
                        type="number" 
                        min="1" max="5"
                        value={qcData.lather || ''} 
                        onChange={e => setQcData({...qcData, lather: e.target.value})}
                        style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, marginTop: 4 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85em', fontWeight: 500 }}>Scent (1-5)</label>
                      <input 
                        type="number" 
                        min="1" max="5"
                        value={qcData.scent || ''} 
                        onChange={e => setQcData({...qcData, scent: e.target.value})}
                        style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, marginTop: 4 }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input 
                        type="checkbox" 
                        checked={qcData.zapTest === 'pass'} 
                        onChange={e => setQcData({...qcData, zapTest: e.target.checked ? 'pass' : 'fail'})}
                      />
                      <span>Zap Test Passed (no zap on tongue)</span>
                    </label>
                  </div>
                  <button 
                    onClick={handleQCSave}
                    style={{ padding: '10px 20px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                  >
                    ✅ Save QC & Mark Ready
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Notes / Journal */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9em', marginBottom: 8 }}>📝 Notes & Journal</div>
            
            {/* Existing notes */}
            {(batch.notes || []).length > 0 && (
              <div style={{ marginBottom: 12, maxHeight: 200, overflowY: 'auto' }}>
                {batch.notes.map((note, i) => (
                  <div key={i} style={{ padding: 10, background: '#f5f5f5', borderRadius: 6, marginBottom: 6, fontSize: '0.9em' }}>
                    <div style={{ color: '#666', fontSize: '0.8em', marginBottom: 4 }}>
                      {new Date(note.date).toLocaleString()}
                    </div>
                    <div>{note.text}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Add note */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note (observations, changes, etc.)"
                style={{ flex: 1, padding: 10, border: '1px solid #ccc', borderRadius: 6 }}
                onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <button 
                onClick={handleAddNote}
                style={{ padding: '10px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid #e8e8e8' }}>
            <a 
              href="/lab/print" 
              onClick={() => sessionStorage.setItem('printBatch', JSON.stringify(batch))}
              style={{ padding: '10px 16px', background: '#607d8b', color: '#fff', borderRadius: 6, textDecoration: 'none', fontWeight: 500 }}
            >
              🖨️ Print
            </a>
            <button 
              onClick={() => { if (window.confirm('Delete this batch?')) onDelete(batch.id); }}
              style={{ padding: '10px 16px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Create Batch Modal
const CreateBatchModal = ({ recipes, onClose, onCreate }) => {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [batchName, setBatchName] = useState('');
  const [madeDate, setMadeDate] = useState(new Date().toISOString().split('T')[0]);
  const [bars, setBars] = useState(10);
  const [notes, setNotes] = useState('');
  const [soapExpiryMonths, setSoapExpiryMonths] = useState(12); // Default 12 months shelf life

  const handleCreate = async () => {
    if (!selectedRecipe) {
      alert('Please select a recipe');
      return;
    }

    // Calculate expiry date for finished soap
    const madeD = new Date(madeDate);
    const readyD = new Date(madeD.getTime() + (42 * 24 * 60 * 60 * 1000)); // 6 weeks cure
    const expiryD = new Date(readyD);
    expiryD.setMonth(expiryD.getMonth() + soapExpiryMonths);

    const batch = {
      name: batchName || `${selectedRecipe.name} - ${new Date().toLocaleDateString()}`,
      recipeId: selectedRecipe.id,
      recipeName: selectedRecipe.name,
      madeDate: madeDate,
      bars: bars,
      batchMass: selectedRecipe.computedBatchMass || selectedRecipe.batchSize || 0,
      costPerBar: selectedRecipe.totals?.perBar || 0,
      status: 'curing',
      notes: notes ? [{ text: notes, date: new Date().toISOString() }] : [],
      createdAt: new Date().toISOString(),
      // Soap expiry tracking
      soapExpiryMonths: soapExpiryMonths,
      soapExpiryDate: expiryD.toISOString().split('T')[0],
      readyDate: readyD.toISOString().split('T')[0],
    };

    await onCreate(batch);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 500 }}>
        <h3 style={{ margin: '0 0 20px' }}>📦 Create New Batch</h3>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Recipe *</label>
          <select
            value={selectedRecipe?.id || ''}
            onChange={(e) => {
              const r = recipes.find(r => r.id === e.target.value);
              setSelectedRecipe(r);
              if (r) setBars(r.bars || 10);
            }}
            style={{ width: '100%', padding: 12, border: '1px solid #ccc', borderRadius: 6 }}
          >
            <option value="">— Select a recipe —</option>
            {recipes.map(r => (
              <option key={r.id} value={r.id}>{r.name || 'Untitled'}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Batch Name</label>
          <input
            type="text"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            placeholder="e.g., Lavender Batch #3"
            style={{ width: '100%', padding: 12, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Date Made</label>
            <input
              type="date"
              value={madeDate}
              onChange={(e) => setMadeDate(e.target.value)}
              style={{ width: '100%', padding: 12, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Number of Bars</label>
            <input
              type="number"
              value={bars}
              onChange={(e) => setBars(Number(e.target.value))}
              min="1"
              style={{ width: '100%', padding: 12, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Shelf Life (months)</label>
            <select
              value={soapExpiryMonths}
              onChange={(e) => setSoapExpiryMonths(Number(e.target.value))}
              style={{ width: '100%', padding: 12, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box' }}
            >
              <option value={6}>6 months</option>
              <option value={9}>9 months</option>
              <option value={12}>12 months</option>
              <option value={18}>18 months</option>
              <option value={24}>24 months</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Initial Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any observations from making this batch..."
            rows={3}
            style={{ width: '100%', padding: 12, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleCreate}
            style={{ flex: 1, padding: '12px 20px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
          >
            ✅ Create Batch
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

// Main Batches Page Component
function BatchesPage() {
  const [batches, setBatches] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Load data
  useEffect(() => {
    const unsubBatches = onSnapshot(query(collection(db, 'batches'), orderBy('createdAt', 'desc')), (snap) => {
      setBatches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));

    const unsubRecipes = onSnapshot(collection(db, 'recipes'), (snap) => {
      setRecipes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubBatches(); unsubRecipes(); };
  }, []);

  const handleCreateBatch = async (batch) => {
    await addDoc(collection(db, 'batches'), batch);
  };

  const handleUpdateBatch = async (id, updates) => {
    await updateDoc(doc(db, 'batches', id), updates);
  };

  const handleDeleteBatch = async (id) => {
    await deleteDoc(doc(db, 'batches', id));
  };

  // Filter batches
  const filteredBatches = filterStatus === 'all' 
    ? batches 
    : batches.filter(b => b.status === filterStatus);

  // Stats
  const curingCount = batches.filter(b => b.status === 'curing').length;
  const readyCount = batches.filter(b => b.status === 'ready').length;
  const totalBars = batches.reduce((s, b) => s + num(b.bars, 0), 0);

  return (
    <div>
      <LabNavbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      {/* Page Title */}
      <h2 style={{ margin: '0 0 16px', fontSize: '1.3em' }}>📦 Batches & Curing</h2>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <div style={{ padding: 16, background: '#e3f2fd', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: '1.5em', fontWeight: 700 }}>{batches.length}</div>
          <div style={{ fontSize: '0.85em', color: '#666' }}>Total Batches</div>
        </div>
        <div style={{ padding: 16, background: '#fff3e0', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: '1.5em', fontWeight: 700 }}>{curingCount}</div>
          <div style={{ fontSize: '0.85em', color: '#666' }}>Curing</div>
        </div>
        <div style={{ padding: 16, background: '#e8f5e9', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: '1.5em', fontWeight: 700 }}>{readyCount}</div>
          <div style={{ fontSize: '0.85em', color: '#666' }}>Ready</div>
        </div>
        <div style={{ padding: 16, background: '#f3e5f5', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: '1.5em', fontWeight: 700 }}>{totalBars}</div>
          <div style={{ fontSize: '0.85em', color: '#666' }}>Total Bars</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{ padding: '12px 20px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '1em' }}
        >
          ➕ Create New Batch
        </button>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '12px 16px', border: '1px solid #ccc', borderRadius: 8, fontSize: '1em' }}
        >
          <option value="all">All Statuses</option>
          {BATCH_STATUSES.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Batch List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Loading batches...</div>
      ) : filteredBatches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#f9f9f9', borderRadius: 8, color: '#666' }}>
          <div style={{ fontSize: '3em', marginBottom: 16 }}>📦</div>
          <div style={{ fontSize: '1.1em', marginBottom: 8 }}>No batches found</div>
          <div style={{ fontSize: '0.9em' }}>Create your first batch to start tracking!</div>
        </div>
      ) : (
        <div>
          {filteredBatches.map(batch => (
            <BatchCard
              key={batch.id}
              batch={batch}
              recipes={recipes}
              onUpdate={handleUpdateBatch}
              onDelete={handleDeleteBatch}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateBatchModal
          recipes={recipes}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateBatch}
        />
      )}
    </div>
    </div>
  );
}

export default BatchesPage;

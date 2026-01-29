import React, { useState, useEffect, useRef } from 'react';
import { db } from '../utils/firebase-config';
import { collection, onSnapshot, addDoc, deleteDoc, doc, writeBatch, getDocs } from 'firebase/firestore';
import LabNavbar from './LabNavbar';

/**
 * DataBackup - Export and import all lab data
 * Route: /lab/backup
 * 
 * Features:
 * - Export all data to JSON
 * - Export individual collections to CSV
 * - Import data from JSON backup
 * - Data validation before import
 */

const COLLECTIONS = [
  { id: 'ingredients', label: 'Ingredients', icon: '📦' },
  { id: 'recipes', label: 'Recipes', icon: '📚' },
  { id: 'batches', label: 'Batches', icon: '📋' },
  { id: 'sales', label: 'Sales', icon: '💰' },
  { id: 'notes', label: 'Notes', icon: '📝' },
];

function DataBackup() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  // Load all data
  useEffect(() => {
    const unsubs = [];
    const loadedData = {};

    COLLECTIONS.forEach(col => {
      unsubs.push(onSnapshot(collection(db, col.id), (snap) => {
        loadedData[col.id] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setData({ ...loadedData });
        setLoading(false);
      }));
    });

    return () => unsubs.forEach(u => u());
  }, []);

  // Export all data as JSON
  const exportAllJSON = () => {
    setExporting(true);
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        collections: data,
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `soap-lab-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Backup exported successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Export failed: ' + error.message });
    }
    setExporting(false);
  };

  // Export single collection as CSV
  const exportCSV = (collectionId) => {
    const items = data[collectionId] || [];
    if (items.length === 0) {
      setMessage({ type: 'error', text: 'No data to export' });
      return;
    }

    // Get all unique keys from all items
    const allKeys = new Set();
    items.forEach(item => {
      Object.keys(item).forEach(key => {
        if (typeof item[key] !== 'object' || item[key] === null) {
          allKeys.add(key);
        }
      });
    });
    const headers = Array.from(allKeys);

    // Build CSV
    const csvRows = [headers.join(',')];
    items.forEach(item => {
      const row = headers.map(h => {
        const val = item[h];
        if (val === null || val === undefined) return '';
        if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return String(val);
      });
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soap-lab-${collectionId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    setMessage({ type: 'success', text: `${collectionId} exported to CSV!` });
  };

  // Handle file selection for import
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        
        // Validate structure
        if (!parsed.collections) {
          throw new Error('Invalid backup file: missing collections');
        }

        // Count items
        const counts = {};
        COLLECTIONS.forEach(col => {
          counts[col.id] = (parsed.collections[col.id] || []).length;
        });

        setImportPreview({
          data: parsed,
          exportedAt: parsed.exportedAt,
          counts,
        });
      } catch (error) {
        setMessage({ type: 'error', text: 'Invalid file: ' + error.message });
      }
    };
    reader.readAsText(file);
  };

  // Perform import
  const performImport = async (mode = 'merge') => {
    if (!importPreview) return;
    
    setImporting(true);
    try {
      const batch = writeBatch(db);
      let addedCount = 0;

      for (const col of COLLECTIONS) {
        const items = importPreview.data.collections[col.id] || [];
        
        if (mode === 'replace') {
          // Delete existing documents
          const existingDocs = await getDocs(collection(db, col.id));
          existingDocs.docs.forEach(d => {
            batch.delete(doc(db, col.id, d.id));
          });
        }

        // Add imported documents
        for (const item of items) {
          const { id, ...itemData } = item;
          const newDoc = doc(collection(db, col.id));
          batch.set(newDoc, { ...itemData, importedAt: new Date().toISOString() });
          addedCount++;
        }
      }

      await batch.commit();
      setMessage({ type: 'success', text: `Successfully imported ${addedCount} items!` });
      setImportPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setMessage({ type: 'error', text: 'Import failed: ' + error.message });
    }
    setImporting(false);
  };

  // Calculate stats
  const totalItems = Object.values(data).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  const lastBackup = localStorage.getItem('lastBackupDate');

  if (loading) {
    return (
      <div>
        <LabNavbar />
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: '2em', marginBottom: 16 }}>⏳</div>
          <div>Loading data...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <LabNavbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: '1.8em' }}>💾 Data Backup & Export</h1>
          <p style={{ margin: '8px 0 0', color: '#666' }}>Export your data for backup or import from a previous backup</p>
        </div>

        {/* Message */}
        {message.text && (
          <div style={{
            padding: 14,
            marginBottom: 20,
            borderRadius: 8,
            background: message.type === 'success' ? '#e8f5e9' : '#ffebee',
            color: message.type === 'success' ? '#2e7d32' : '#c62828',
            border: `1px solid ${message.type === 'success' ? '#a5d6a7' : '#ef9a9a'}`,
          }}>
            {message.type === 'success' ? '✅' : '❌'} {message.text}
            <button 
              onClick={() => setMessage({ type: '', text: '' })}
              style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1em' }}
            >×</button>
          </div>
        )}

        {/* Stats Overview */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: 12, 
          marginBottom: 24,
          padding: 16,
          background: '#f5f5f5',
          borderRadius: 10,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.85em', color: '#666' }}>Total Items</div>
            <div style={{ fontSize: '1.8em', fontWeight: 700, color: '#1976d2' }}>{totalItems}</div>
          </div>
          {COLLECTIONS.map(col => (
            <div key={col.id} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.85em', color: '#666' }}>{col.icon} {col.label}</div>
              <div style={{ fontSize: '1.5em', fontWeight: 600 }}>{data[col.id]?.length || 0}</div>
            </div>
          ))}
        </div>

        {/* Export Section */}
        <div style={{ marginBottom: 24, padding: 20, background: '#fff', borderRadius: 10, border: '1px solid #e0e0e0' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '1.2em' }}>📤 Export Data</h2>
          
          {/* Full Backup */}
          <div style={{ marginBottom: 20, padding: 16, background: '#e3f2fd', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>Complete Backup (JSON)</div>
                <div style={{ fontSize: '0.85em', color: '#666' }}>Export all data in a single file for complete backup</div>
              </div>
              <button
                onClick={exportAllJSON}
                disabled={exporting}
                style={{
                  padding: '12px 24px',
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: exporting ? 'wait' : 'pointer',
                  fontWeight: 600,
                  fontSize: '1em',
                }}
              >
                {exporting ? '⏳ Exporting...' : '💾 Download Backup'}
              </button>
            </div>
          </div>

          {/* Individual CSV Exports */}
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Export as CSV (spreadsheet)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {COLLECTIONS.map(col => (
              <button
                key={col.id}
                onClick={() => exportCSV(col.id)}
                disabled={(data[col.id]?.length || 0) === 0}
                style={{
                  padding: '10px 16px',
                  background: (data[col.id]?.length || 0) > 0 ? '#f5f5f5' : '#eee',
                  color: (data[col.id]?.length || 0) > 0 ? '#333' : '#999',
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  cursor: (data[col.id]?.length || 0) > 0 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {col.icon} {col.label} ({data[col.id]?.length || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Import Section */}
        <div style={{ padding: 20, background: '#fff', borderRadius: 10, border: '1px solid #e0e0e0' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '1.2em' }}>📥 Import Data</h2>
          
          {!importPreview ? (
            <div style={{ padding: 30, border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="backup-file"
              />
              <label 
                htmlFor="backup-file"
                style={{
                  display: 'inline-block',
                  padding: '14px 28px',
                  background: '#4caf50',
                  color: '#fff',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                📁 Select Backup File
              </label>
              <div style={{ marginTop: 12, fontSize: '0.9em', color: '#666' }}>
                Select a .json backup file to import
              </div>
            </div>
          ) : (
            <div style={{ padding: 20, background: '#fff3e0', borderRadius: 8 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '1.1em' }}>📋 Import Preview</h3>
              <div style={{ marginBottom: 12, fontSize: '0.9em', color: '#666' }}>
                Backup from: {new Date(importPreview.exportedAt).toLocaleString()}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 20 }}>
                {COLLECTIONS.map(col => (
                  <div key={col.id} style={{ padding: 12, background: '#fff', borderRadius: 6, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>{col.icon} {col.label}</div>
                    <div style={{ fontSize: '1.3em', fontWeight: 600, color: importPreview.counts[col.id] > 0 ? '#4caf50' : '#999' }}>
                      {importPreview.counts[col.id]}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => performImport('merge')}
                  disabled={importing}
                  style={{
                    padding: '12px 20px',
                    background: '#4caf50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: importing ? 'wait' : 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {importing ? '⏳ Importing...' : '➕ Merge with Existing'}
                </button>
                <button
                  onClick={() => performImport('replace')}
                  disabled={importing}
                  style={{
                    padding: '12px 20px',
                    background: '#f44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: importing ? 'wait' : 'pointer',
                    fontWeight: 600,
                  }}
                >
                  🔄 Replace All Data
                </button>
                <button
                  onClick={() => {
                    setImportPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  style={{
                    padding: '12px 20px',
                    background: '#eee',
                    color: '#333',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  ✕ Cancel
                </button>
              </div>
              
              <div style={{ marginTop: 12, fontSize: '0.85em', color: '#e65100' }}>
                ⚠️ <strong>Replace All</strong> will delete all existing data before importing!
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div style={{ marginTop: 24, padding: 16, background: '#f9fbe7', borderRadius: 8, fontSize: '0.9em' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>💡 Tips</div>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#555' }}>
            <li>Create regular backups to protect your data</li>
            <li>Use JSON backups for complete data preservation</li>
            <li>Use CSV exports for spreadsheet analysis</li>
            <li>Store backups in cloud storage (Google Drive, Dropbox) for extra safety</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DataBackup;

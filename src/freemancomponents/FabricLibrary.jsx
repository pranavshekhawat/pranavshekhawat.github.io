import React, { useCallback, useMemo, useRef, useState } from 'react';
import Papa from 'papaparse';
import LinkButton from './LinkButton';

function FileInput({ label, value, onChange, accept = 'image/*', className = '' }) {
  const readAsDataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  return (
    <span className={className} style={{ flex: '1 1 220px', minWidth: 0 }}>
      <label className="text-xs">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept={accept}
          className="w-full p-1 border rounded text-sm"
          onChange={async (e) => {
            const f = e.target.files && e.target.files[0];
            if (!f) return;
            const url = await readAsDataURL(f);
            onChange(url);
          }}
        />
        {value && (
          <button
            type="button"
            className="px-2 py-1 text-xs rounded bg-gray-200"
            onClick={() => onChange('')}
            title="Clear"
          >
            Clear
          </button>
        )}
      </div>
      {value && (
        <div className="mt-1">
          <img
            src={value}
            alt="Preview"
            className="max-h-24 object-contain border rounded"
          />
        </div>
      )}
    </span>
  );
}

function Section({ title, children, className = '' }) {
  return (
    <div className="border rounded p-2">
      <div className="text-xs font-semibold text-slate-600 mb-2">{title}</div>
      <div className={`w-full flex flex-wrap items-start gap-2 ${className}`}>{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, list, className = '' }) {
  return (
    <span className={className} style={{ flex: '1 1 220px', minWidth: 0 }}>
      <label className="text-xs">{label}</label>
      <input
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className="w-full p-1 border rounded text-sm"
        placeholder={placeholder}
        list={list}
      />
    </span>
  );
}

function SelectOrInput({ label, value, onChange, options = [], className = '' }) {
  const listId = `${String(label).replace(/\s+/g, '-').toLowerCase()}-list`;
  return (
    <span className={className} style={{ flex: '1 1 220px', minWidth: 0 }}>
      <label className="text-xs">{label}</label>
      <input
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className="w-full p-1 border rounded text-sm"
        list={listId}
      />
      <datalist id={listId}>
        {options.map((o, i) => (
          <option key={`${listId}-${i}`} value={o} />
        ))}
      </datalist>
    </span>
  );
}

function FieldView({ label, value }) {
  if (!value) return null;
  return (
    <span className="w-full">
      <span className="text-xs text-slate-500"><b>{label}:</b></span>
      <div className="text-sm truncate" title={String(value)}>{String(value)}</div>
    </span>
  );
}

export default function FabricLibrary({ rows, setRows }) {
  const CONTENT_PRESETS = ['As per swatch', 'TBC', '100% Cotton', '100% Linen', '55% Linen 45% Cotton'];
  const COUNT_PRESETS = ['As per swatch', 'TBC', '10s', '20s', '30s', '40s', '60s'];
  const CONSTRUCTION_PRESETS = ['TBC', 'As per swatch'];
  const WEAVE_PRESETS = ['TBC', 'As per swatch', 'Plain', '2x2 Twill', 'Twill', 'Crepe', 'Herringbone Twill', 'Waffle', 'Corduroy', 'Oxford'];

  // If parent didn't wire state yet, own local fallback
  const [localRows, setLocalRows] = useState([]);
  const fabrics = rows ?? localRows;
  const setFabrics = setRows ?? setLocalRows;

  // Uniqueness helpers
  const normalizeCode = (c) => (c || '').trim().toLowerCase();
  const isCodeTaken = useCallback(
    (code, excludeId = null) =>
      (fabrics || []).some(f => normalizeCode(f.code) === normalizeCode(code) && f.id !== excludeId),
    [fabrics]
  );

  // CSV toolbar state
  const inputRef = useRef();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newCSVName, setNewCSVName] = useState('');
  const [openedCSV, setOpenedCSV] = useState(null);
  const [originalRows, setOriginalRows] = useState([]);

  const genId = () =>
    (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  // Add/Edit
  const defaultNew = { code: '', content: '', count: '', construction: '', weave: '', cadImage: '', cadColor: '' };
  const [newItem, setNewItem] = useState({ ...defaultNew });
  const [editingIdx, setEditingIdx] = useState(null);
  const [editingItem, setEditingItem] = useState({ ...defaultNew });

  const canAdd = !!openedCSV && newItem.code.trim().length > 0 && !isCodeTaken(newItem.code);

  // CSV open
  function handleCSVUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = [];
        const seen = new Set();
        let dupCount = 0;
        results.data.forEach((r) => {
          if (!r.code) return;
          const norm = normalizeCode(r.code);
          if (seen.has(norm)) {
            dupCount += 1;
            return; // skip duplicate codes
          }
          seen.add(norm);
          parsed.push({
            id: r.id || genId(),
            code: r.code || '',
            content: r.content || '',
            count: r.count || '',
            construction: r.construction || '',
            weave: r.weave || '',
            cadImage: r.cadImage || '',
              cadColor: r.cadColor || '',
          });
        });
        setFabrics(parsed);
        setOriginalRows(parsed);
        setOpenedCSV({ name: file.name });
        if (dupCount > 0) {
          alert(`${dupCount} duplicate Fabric Code(s) were skipped while importing.`);
        }
      },
      error: () => {
        alert('Could not parse fabrics CSV.');
      }
    });
  }

  function saveCSV() {
    const data = (fabrics || []).map(r => ({
      id: r.id,
      code: r.code || '',
      content: r.content || '',
      count: r.count || '',
      construction: r.construction || '',
      weave: r.weave || '',
      cadImage: r.cadImage || '',
      cadColor: r.cadColor || '', 
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = openedCSV?.name || 'fabrics.csv';
    a.click();
    URL.revokeObjectURL(url);
    setOriginalRows(fabrics);
  }

  function isChanged() {
    return JSON.stringify(fabrics) !== JSON.stringify(originalRows);
  }

  function closeCSV() {
    if (isChanged()) {
      if (!window.confirm('You have unsaved changes. Close and discard them?')) return;
    }
    setFabrics([]);
    setOriginalRows([]);
    setOpenedCSV(null);
    if (inputRef.current) inputRef.current.value = '';
    setEditingIdx(null);
  }

  function removeFabric(id) {
    if (!window.confirm('Remove this fabric?')) return;
    setFabrics(prev => prev.filter(r => r.id !== id));
  }

  const unchanged = (a, b) => {
    const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
    for (const k of keys) {
      const av = a?.[k] ?? '';
      const bv = b?.[k] ?? '';
      if (String(av) !== String(bv)) return false;
    }
    return true;
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">Fabric Library</h2>
        <div className="flex gap-2 mb-2">
          <button
            className="px-3 py-1 rounded bg-indigo-600 text-white"
            onClick={() => setShowNewDialog(true)}
            disabled={!!openedCSV}
          >
            Create New
          </button>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleCSVUpload}
            disabled={!!openedCSV}
            ref={inputRef}
          />
          {openedCSV && (
            <>
              <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={saveCSV}>Save</button>
              <button className="px-3 py-1 rounded bg-gray-400 text-white" onClick={closeCSV}>Close</button>
              <span className="text-xs text-gray-500 ml-2">Opened: {openedCSV.name}</span>
            </>
          )}
        </div>

        {showNewDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow flex flex-col gap-3 min-w-[320px]">
              <h3 className="font-semibold text-lg">Create New Fabric Library</h3>
              <input
                className="border rounded p-2"
                placeholder="Enter file name (e.g. my-fabrics.csv)"
                value={newCSVName}
                onChange={e => setNewCSVName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  className="px-3 py-1 rounded bg-gray-300"
                  onClick={() => { setShowNewDialog(false); setNewCSVName(''); }}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1 rounded bg-indigo-600 text-white"
                  disabled={!newCSVName.trim()}
                  onClick={() => {
                    setFabrics([]); setOriginalRows([]); setOpenedCSV({ name: newCSVName.trim() });
                    setShowNewDialog(false); setNewCSVName('');
                    if (inputRef.current) inputRef.current.value = '';
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>


      {openedCSV && (
        <div className="mt-3 border rounded p-3">
          <div className="text-sm font-medium mb-2">Add Fabric</div>
          <Section>
            <Input label="Fabric Code" value={newItem.code} onChange={v => setNewItem(s => ({ ...s, code: v }))} placeholder="e.g. FB-1001" />&nbsp;
            {newItem.code && isCodeTaken(newItem.code) && (
              <div className="text-xs text-red-600 w-full">Fabric Code already exists</div>
            )}
            <SelectOrInput label="Content" value={newItem.content} onChange={v => setNewItem(s => ({ ...s, content: v }))} options={CONTENT_PRESETS} />&nbsp;
            <SelectOrInput label="Count" value={newItem.count} onChange={v => setNewItem(s => ({ ...s, count: v }))} options={COUNT_PRESETS} />&nbsp;
            <SelectOrInput label="Construction" value={newItem.construction} onChange={v => setNewItem(s => ({ ...s, construction: v }))} options={CONSTRUCTION_PRESETS} />&nbsp;
            <SelectOrInput label="Weave" value={newItem.weave} onChange={v => setNewItem(s => ({ ...s, weave: v }))} options={WEAVE_PRESETS} />&nbsp;
            <FileInput label="CAD Image" value={newItem.cadImage} onChange={v => setNewItem(s => ({ ...s, cadImage: v }))} />
              <div className="flex items-start gap-2">
              <div className="flex flex-col">
                <label className="text-xs font-medium">CAD Color (fallback)</label>
                <input
                  type="color"
                  value={/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(newItem.cadColor) ? newItem.cadColor : '#ffffff'}
                  onChange={e => setNewItem(s => ({ ...s, cadColor: e.target.value }))}
                  style={{ width: 60, height: 40, padding: 0, border: '1px solid #ccc', borderRadius: 4 }}
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="text-xs font-medium">Color Code / Name</label>
                <input
                  className="border rounded p-2 text-sm"
                  placeholder="e.g. #1E90FF or rgb(30,144,255) or 'navy'"
                  value={newItem.cadColor || ''}
                  onChange={e => setNewItem(s => ({ ...s, cadColor: e.target.value }))}
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  If no CAD image is uploaded, this solid color swatch appears in single sheets.
                </p>
              </div>
            </div>
          </Section>
          <div className="text-right mt-3">
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
              onClick={() => {
                if (!canAdd) return;
                if (isCodeTaken(newItem.code)) {
                  alert('Fabric Code must be unique.');
                  return;
                }
                setFabrics(prev => [...prev, { id: genId(), ...newItem, code: newItem.code.trim() }]);
                setNewItem({ ...defaultNew });
              }}
              disabled={!canAdd}
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 w-full max-h-[48vh] overflow-auto">
        <div className="flex flex-wrap gap-2 w-full" style={{ display: 'flex', maxWidth: '100%' }}>
          {fabrics.map((row, idx) => (
            <div
              key={row.id}
              className="border p-2 rounded text-sm flex flex-col items-stretch justify-start"
              style={{ minHeight: 0, flex: '1 0 24%', maxWidth: '24%', boxSizing: 'border-box' }}
            >
              {idx === editingIdx ? (
                <>
                  <Section>
                    <Input label="Fabric Code" value={editingItem.code} onChange={v => setEditingItem(s => ({ ...s, code: v }))} />&nbsp;
                    {editingItem.code && isCodeTaken(editingItem.code, row.id) && (
                      <div className="text-xs text-red-600 w-full">Fabric Code already exists</div>
                    )}
                    <SelectOrInput label="Content" value={editingItem.content} onChange={v => setEditingItem(s => ({ ...s, content: v }))} options={CONTENT_PRESETS} />&nbsp;
                    <SelectOrInput label="Count" value={editingItem.count} onChange={v => setEditingItem(s => ({ ...s, count: v }))} options={COUNT_PRESETS} />&nbsp;
                    <SelectOrInput label="Construction" value={editingItem.construction} onChange={v => setEditingItem(s => ({ ...s, construction: v }))} options={CONSTRUCTION_PRESETS} />&nbsp;
                    <SelectOrInput label="Weave" value={editingItem.weave} onChange={v => setEditingItem(s => ({ ...s, weave: v }))} options={WEAVE_PRESETS} />&nbsp;
                    <FileInput label="CAD Image" value={editingItem.cadImage} onChange={v => setEditingItem(s => ({ ...s, cadImage: v }))} />
                   <div className="flex items-start gap-2">
                      <div className="flex flex-col">
                        <label className="text-xs font-medium">CAD Color (fallback)</label>
                        <input
                          type="color"
                          value={/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(editingItem.cadColor) ? editingItem.cadColor : '#ffffff'}
                          onChange={e => setEditingItem(s => ({ ...s, cadColor: e.target.value }))}
                          style={{ width: 60, height: 40, padding: 0, border: '1px solid #ccc', borderRadius: 4 }}
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <label className="text-xs font-medium">Color Code / Name</label>
                        <input
                          className="border rounded p-2 text-sm"
                          placeholder="e.g. #1E90FF or rgb(30,144,255) or 'navy'"
                          value={editingItem.cadColor || ''}
                          onChange={e => setEditingItem(s => ({ ...s, cadColor: e.target.value }))}
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                          If no CAD image is uploaded, this solid color swatch appears in single sheets.
                        </p>
                      </div>
                    </div>
                  </Section>
                  <div className="w-full flex items-center gap-2 mt-2">
                    <LinkButton
                      variant="link"
                      color="green"
                      onClick={() => {
                        if (isCodeTaken(editingItem.code, row.id)) {
                          alert('Fabric Code must be unique.');
                          return;
                        }
                        const updated = { ...row, ...editingItem, code: editingItem.code.trim() };
                        setFabrics(prev => prev.map((r, i) => i === idx ? updated : r));
                        setEditingIdx(null);
                      }}
                      disabled={
                        !editingItem.code?.trim() ||
                        unchanged(editingItem, row) ||
                        isCodeTaken(editingItem.code, row.id)
                      }
                    >
                      Save
                    </LinkButton>
                    <span className="text-slate-400">•</span>
                    <LinkButton variant="link" color="red" onClick={() => setEditingIdx(null)}>Cancel</LinkButton>
                  </div>
                </>
              ) : (
                <>
                  <FieldView label="Fabric Code" value={row.code} />
                  <FieldView label="Content" value={row.content} />
                  <FieldView label="Count" value={row.count} />
                  <FieldView label="Construction" value={row.construction} />
                  <FieldView label="Weave" value={row.weave} />
                   {row.cadImage ? (                       // FIX fabric -> row
                    <img src={row.cadImage} alt={row.code} style={{ width: 160, height: 200, objectFit: 'contain', border: '1px solid #e5e7eb', borderRadius: 4 }} />
                  ) : row.cadColor ? (
                    <div
                      title={row.cadColor}
                      style={{
                        width: 160, height: 200,
                        background: row.cadColor,
                        border: '1px solid #e5e7eb',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontFamily: 'sans-serif',
                        color: '#00000088',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                    >
                      {row.cadColor}
                    </div>
                  ) : (
                    <div style={{ width: 160, height: 200, border: '1px dashed #cbd5e1', borderRadius: 4, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                      No CAD / Color
                    </div>
                  )}
                  <div className="w-full flex items-center gap-2 mt-1">
                    <LinkButton
                      variant="link"
                      color="blue"
                      onClick={() => { setEditingIdx(idx); setEditingItem({ ...row }); }}
                    >
                      Edit
                    </LinkButton>
                    <span className="text-slate-400">•</span>
                    <LinkButton color="red" variant="link" onClick={() => removeFabric(row.id)}>
                      Remove
                    </LinkButton>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
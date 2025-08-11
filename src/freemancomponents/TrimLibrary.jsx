import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import AddTrimForm from './AddTrimForm';
import LinkButton from './LinkButton';

export default function TrimLibrary({ trims, setTrims }) {
  const trimCSVInputRef = useRef();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newCSVName, setNewCSVName] = useState('');
  const [openedTrimCSV, setOpenedTrimCSV] = useState(null);
  const [originalTrims, setOriginalTrims] = useState(null);

  const [editingIdx, setEditingIdx] = useState(null);
  const [editingTrim, setEditingTrim] = useState({ code: '', image: '' });

  function handleTrimCSVUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        const parsed = [];
        results.data.forEach((r) => {
          if (r.code) parsed.push({ code: r.code, image: r.image || '' });
        });
        setTrims(parsed);
        setOriginalTrims(parsed);
        setOpenedTrimCSV({ name: file.name });
      },
    });
  }

  function saveOpenedTrimCSV() {
    const data = trims.map(t => ({ code: t.code, image: t.image }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = openedTrimCSV?.name || 'trim-library.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function isTrimsChanged() {
    return JSON.stringify(trims) !== JSON.stringify(originalTrims);
  }

  function closeOpenedTrimCSV() {
    if (isTrimsChanged()) {
      if (!window.confirm('You have some changes in your file. Closing that file will erase those changes. Are you sure you want to close?')) return;
    }
    setTrims([]);
    setOriginalTrims([]);
    setOpenedTrimCSV(null);
    if (trimCSVInputRef.current) trimCSVInputRef.current.value = '';
  }

  return (
    <div className="bg-white p-4 rounded shadow" style={{ minWidth: '1200px' }}>
      <h2 className="font-semibold">Trim Library</h2>
      <p className="text-xs text-gray-600">Add trim assets below. Each trim needs a code and an image.</p>

      <div className="flex gap-2 mb-2">
        <button
          className="px-3 py-1 rounded bg-indigo-600 text-white"
          onClick={() => setShowNewDialog(true)}
          disabled={!!openedTrimCSV}
        >
          Create New
        </button>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleTrimCSVUpload}
          disabled={!!openedTrimCSV}
          ref={trimCSVInputRef}
        />
        {openedTrimCSV && (
          <>
            <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={saveOpenedTrimCSV}>Save</button>
            <button className="px-3 py-1 rounded bg-gray-400 text-white" onClick={closeOpenedTrimCSV}>Close</button>
            <span className="text-xs text-gray-500 ml-2">Opened: {openedTrimCSV.name}</span>
          </>
        )}
      </div>

      {showNewDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow flex flex-col gap-3 min-w-[300px]">
            <h3 className="font-semibold text-lg">Create New Trim Library</h3>
            <input
              className="border rounded p-2"
              placeholder="Enter file name (e.g. my-trims.csv)"
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
                  setTrims([]); setOriginalTrims([]); setOpenedTrimCSV({ name: newCSVName.trim() }); setShowNewDialog(false); setNewCSVName('');
                  if (trimCSVInputRef.current) trimCSVInputRef.current.value = '';
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <AddTrimForm
        onAdd={(code, image) => setTrims(prev => [...prev, { code, image }])}
        existingTrims={trims}
        disabled={!openedTrimCSV}
      />

      <div className="mt-3 w-full">
        <div className="flex flex-wrap gap-2 w-full" style={{ display: 'flex', maxWidth: '100%' }}>
          {trims.map((t, idx) => (
            <div
              key={t.code + idx}
              className="border p-2 rounded text-sm flex flex-col items-center justify-center"
              style={{ minHeight: 0, flex: '1 0 20%', maxWidth: '20%', boxSizing: 'border-box' }}
            >
              {idx === editingIdx ? (
                <>
                  <input
                    className="font-medium truncate border rounded p-1 mb-1"
                    value={editingTrim.code}
                    onChange={e => setEditingTrim(x => ({ ...x, code: e.target.value }))}
                    placeholder="Code"
                  />
                  <input
                    type="file"
                    accept="image/*,image/svg+xml"
                    className="mb-1"
                    onChange={e => {
                      const file = e.target.files && e.target.files[0]; if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setEditingTrim(x => ({ ...x, image: reader.result }));
                      reader.readAsDataURL(file);
                    }}
                  />
                  {editingTrim.image && (
                    <img
                      src={editingTrim.image}
                      alt="preview"
                      style={{ width: 250, height: 250, objectFit: 'contain', borderRadius: 4, border: '1px solid #e5e7eb', background: '#f8fafc', margin: 4 }}
                    />
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <LinkButton
                      variant="link"
                      color="green"
                      onClick={() => {
                        if (trims.some((x, i) => i !== idx && x.code.trim().toLowerCase() === editingTrim.code.trim().toLowerCase())) {
                          alert('A trim with this code already exists.'); return;
                        }
                        setTrims(prev => prev.map((x, i) => i === idx ? { ...editingTrim, code: editingTrim.code.trim() } : x));
                        setEditingIdx(null);
                      }}
                      disabled={
                        !editingTrim.code ||
                        !editingTrim.image ||
                        (
                          editingTrim.code === t.code &&
                          editingTrim.image === t.image
                        )
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
                  <div><b>Code:</b> {t.code}</div>
                  {t.image && (
                    <img
                      src={t.image}
                      alt={t.code}
                      style={{ width: 250, height: 250, objectFit: 'contain', borderRadius: 4, border: '1px solid #e5e7eb', background: '#f8fafc', margin: 4 }}
                    />
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <LinkButton variant="link" color="blue" onClick={() => { setEditingIdx(idx); setEditingTrim({ ...t }); }}>Edit</LinkButton>
                    <span className="text-slate-400">•</span>
                    <LinkButton
                      variant="link"
                      color="blue"
                      onClick={() => {
                        if (window.confirm('Removing this trim is permanent. Remove it?')) {
                          setTrims(prev => prev.filter((_, i) => i !== idx));
                        }
                      }}
                    >
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
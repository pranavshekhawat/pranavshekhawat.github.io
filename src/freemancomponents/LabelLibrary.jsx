import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import AddLabelForm from './AddLabelForm';
import LinkButton from './LinkButton';

const LABEL_TYPES = ['Main Label', 'Size Label', 'Fit Label', 'Care Label'];

export default function LabelLibrary({ labels, setLabels }) {
  const labelCSVInputRef = useRef();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newCSVName, setNewCSVName] = useState('');
  const [openedLabelCSV, setOpenedLabelCSV] = useState(null);
  const [originalLabels, setOriginalLabels] = useState(null);

  const [editingIdx, setEditingIdx] = useState(null);
  const [editingLabel, setEditingLabel] = useState({ type: LABEL_TYPES[0], code: '', image: '' });

  function handleLabelCSVUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        const parsed = [];
        results.data.forEach((r) => {
          const type = r.type && LABEL_TYPES.includes(r.type) ? r.type : null;
          if (type && r.code) parsed.push({ type, code: r.code, image: r.image || '' });
        });
        setLabels(parsed);
        setOriginalLabels(parsed);
        setOpenedLabelCSV({ name: file.name });
      },
    });
  }

  function saveOpenedLabelCSV() {
    const data = labels.map(l => ({ type: l.type, code: l.code, image: l.image }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = openedLabelCSV?.name || 'label-library.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function isLabelsChanged() {
    return JSON.stringify(labels) !== JSON.stringify(originalLabels);
  }

  function closeOpenedLabelCSV() {
    if (isLabelsChanged()) {
      if (!window.confirm('You have some changes in your file. Closing that file will erase those changes. Are you sure you want to close?')) return;
    }
    setLabels([]);
    setOriginalLabels([]);
    setOpenedLabelCSV(null);
    if (labelCSVInputRef.current) labelCSVInputRef.current.value = '';
  }

  return (
    <div className="bg-white p-4 rounded shadow" style={{ minWidth: '1200px' }}>
      <h2 className="font-semibold">Label Library</h2>
      <p className="text-xs text-gray-600">Add label assets below. Each label needs a type and code. Image is optional for Care Label.</p>

      <div className="flex gap-2 mb-2">
        <button
          className="px-3 py-1 rounded bg-indigo-600 text-white"
          onClick={() => setShowNewDialog(true)}
          disabled={!!openedLabelCSV}
        >
          Create New
        </button>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleLabelCSVUpload}
          disabled={!!openedLabelCSV}
          ref={labelCSVInputRef}
        />
        {openedLabelCSV && (
          <>
            <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={saveOpenedLabelCSV}>Save</button>
            <button className="px-3 py-1 rounded bg-gray-400 text-white" onClick={closeOpenedLabelCSV}>Close</button>
            <span className="text-xs text-gray-500 ml-2">Opened: {openedLabelCSV.name}</span>
          </>
        )}
      </div>

      {showNewDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow flex flex-col gap-3 min-w-[300px]">
            <h3 className="font-semibold text-lg">Create New Label Library</h3>
            <input
              className="border rounded p-2"
              placeholder="Enter file name (e.g. my-labels.csv)"
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
                  setLabels([]); setOriginalLabels([]); setOpenedLabelCSV({ name: newCSVName.trim() }); setShowNewDialog(false); setNewCSVName('');
                  if (labelCSVInputRef.current) labelCSVInputRef.current.value = '';
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <AddLabelForm
        onAdd={(type, code, image) => setLabels(prev => [...prev, { type, code, image }])}
        existingLabels={labels}
        disabled={!openedLabelCSV}
      />

      <div className="mt-3 w-full">
        <div className="flex flex-wrap gap-2 w-full" style={{ display: 'flex', maxWidth: '100%' }}>
          {labels.map((l, idx) => (
            <div
              key={l.type + '|' + l.code + '|' + idx}
              className="border p-2 rounded text-sm flex flex-col items-center justify-center"
              style={{ minHeight: 0, flex: '1 0 20%', maxWidth: '20%', boxSizing: 'border-box' }}
            >
              {idx === editingIdx ? (
                <>
                  <select
                    className="truncate border rounded p-1 mb-1"
                    value={editingLabel.type}
                    onChange={e => setEditingLabel(x => ({ ...x, type: e.target.value }))}
                  >
                    {LABEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input
                    className="font-medium truncate border rounded p-1 mb-1"
                    value={editingLabel.code}
                    onChange={e => setEditingLabel(x => ({ ...x, code: e.target.value }))}
                    placeholder="Code"
                  />
                  <input
                    type="file"
                    accept="image/*,image/svg+xml"
                    className="mb-1"
                    onChange={e => {
                      const file = e.target.files && e.target.files[0]; if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setEditingLabel(x => ({ ...x, image: reader.result }));
                      reader.readAsDataURL(file);
                    }}
                  />
                  {editingLabel.image && (
                    <img
                      src={editingLabel.image}
                      alt="preview"
                      style={{ width: 250, height: 80, objectFit: 'contain', borderRadius: 4, border: '1px solid #e5e7eb', background: '#f8fafc', margin: 4 }}
                    />
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <LinkButton
                      variant="link"
                      color="green"
                      onClick={() => {
                        if (labels.some((x, i) =>
                          i !== idx &&
                          x.type === editingLabel.type &&
                          x.code.trim().toLowerCase() === editingLabel.code.trim().toLowerCase()
                        )) {
                          alert('A label with this type and code already exists.'); return;
                        }
                        setLabels(prev => prev.map((x, i) => i === idx ? { ...editingLabel, code: editingLabel.code.trim() } : x));
                        setEditingIdx(null);
                      }}
                      disabled={
                        !editingLabel.type ||
                        !editingLabel.code ||
                        (editingLabel.type !== 'Care Label' && !editingLabel.image) ||
                        (
                          editingLabel.type === l.type &&
                          editingLabel.code === l.code &&
                          editingLabel.image === l.image
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
                  <div><b>Type:</b> {l.type}</div>
                  <div><b>Code:</b> {l.code}</div>
                  {l.image && (
                    <img
                      src={l.image}
                      alt={`${l.type} - ${l.code}`}
                      style={{ width: 250, height: 80, objectFit: 'contain', borderRadius: 4, border: '1px solid #e5e7eb', background: '#f8fafc', margin: 4 }}
                    />
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <LinkButton variant="link" color="blue" onClick={() => { setEditingIdx(idx); setEditingLabel({ ...l }); }}>Edit</LinkButton>
                    <span className="text-slate-400">•</span>
                    <LinkButton
                      variant="link"
                      color="blue"
                      onClick={() => {
                        if (window.confirm('Removing this label is permanent. Remove it?')) {
                          setLabels(prev => prev.filter((_, i) => i !== idx));
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
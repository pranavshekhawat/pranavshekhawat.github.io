import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import AddButtonForm from './AddButtonForm';
import LinkButton from './LinkButton';

export default function ButtonLibrary({ buttons, setButtons, setRows, SUGGESTED_SIZES, SUGGESTED_COLORS }) {
  const buttonCSVInputRef = useRef();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newCSVName, setNewCSVName] = useState('');
  const [openedButtonCSV, setOpenedButtonCSV] = useState(null);
  const [originalButtons, setOriginalButtons] = useState(null);

  const [editingIdx, setEditingIdx] = useState(null);
  const [editingButton, setEditingButton] = useState({ code: '', size: '', color: '', image: '' });

  function handleButtonCSVUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        const parsed = [];
        results.data.forEach((r) => {
          if (r.code && r.size) parsed.push({ code: r.code, size: r.size, color: r.color || '', image: r.image || '' });
        });
        setButtons(parsed);
        setOriginalButtons(parsed);
        setOpenedButtonCSV({ name: file.name });
      },
    });
  }

  function saveOpenedButtonCSV() {
    const data = buttons.map(b => ({ code: b.code, size: b.size, color: b.color, image: b.image }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = openedButtonCSV?.name || 'button-library.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function isButtonsChanged() {
    return JSON.stringify(buttons) !== JSON.stringify(originalButtons);
  }

  function closeOpenedButtonCSV() {
    if (isButtonsChanged()) {
      if (!window.confirm('You have some changes in your file. Closing that file will erase those changes. Are you sure you want to close?')) return;
    }
    setButtons([]);
    setOriginalButtons([]);
    setOpenedButtonCSV(null);
    if (buttonCSVInputRef.current) buttonCSVInputRef.current.value = '';
  }

  return (
    <div className="bg-white p-4 rounded shadow" style={{ minWidth: '1200px' }}>
      <h2 className="font-semibold">Button Library</h2>
      <p className="text-xs text-gray-600">Add shirt button assets below. Each button needs a code, size, and image.</p>

      <div className="flex gap-2 mb-2">
        <button className="px-3 py-1 rounded bg-indigo-600 text-white" onClick={() => setShowNewDialog(true)} disabled={!!openedButtonCSV}>Create New</button>
        <input type="file" accept=".csv,text/csv" onChange={handleButtonCSVUpload} disabled={!!openedButtonCSV} ref={buttonCSVInputRef} />
        {openedButtonCSV && (
          <>
            <button className="px-3 py-1 rounded bg-blue-600 text-green"
              onClick={saveOpenedButtonCSV}>Save</button>
            <button className="px-3 py-1 rounded bg-gray-400 text-white" onClick={closeOpenedButtonCSV}>Close</button>
            <span className="text-xs text-gray-500 ml-2">Opened: {openedButtonCSV.name}</span>
          </>
        )}
      </div>

      {showNewDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow flex flex-col gap-3 min-w-[300px]">
            <h3 className="font-semibold text-lg">Create New Button Library</h3>
            <input className="border rounded p-2" placeholder="Enter file name (e.g. my-buttons.csv)" value={newCSVName} onChange={e => setNewCSVName(e.target.value)} autoFocus />
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-1 rounded bg-gray-300" onClick={() => { setShowNewDialog(false); setNewCSVName(''); }}>Cancel</button>
              <button className="px-3 py-1 rounded bg-indigo-600 text-white" disabled={!newCSVName.trim()} onClick={() => {
                setButtons([]); setOriginalButtons([]); setOpenedButtonCSV({ name: newCSVName.trim() }); setShowNewDialog(false); setNewCSVName('');
                if (buttonCSVInputRef.current) buttonCSVInputRef.current.value = '';
              }}>Create</button>
            </div>
          </div>
        </div>
      )}

      <AddButtonForm
        onAdd={(code, size, color, image) => setButtons(prev => [...prev, { code, size, color, image }])}
        existingButtons={buttons}
        disabled={!openedButtonCSV}
        SUGGESTED_SIZES={SUGGESTED_SIZES}
        SUGGESTED_COLORS={SUGGESTED_COLORS}
      />

      <div className="mt-3 w-full">
        <div className="flex flex-wrap gap-2 w-full" style={{ display: 'flex', maxWidth: '100%' }}>
          {buttons.map((btn, idx) => (
            <div
              key={btn.code + btn.size + idx}
              className="border p-2 rounded text-sm flex flex-col items-center justify-center"
              style={{ minHeight: 0, flex: '1 0 20%', maxWidth: '20%', boxSizing: 'border-box' }}
            >
              {idx === editingIdx ? (
                <>
                  <input className="font-medium truncate border rounded p-1 mb-1" value={editingButton.code} onChange={e => setEditingButton(b => ({ ...b, code: e.target.value }))} placeholder="Code" /> <br />
                  <input className="truncate border rounded p-1 mb-1" value={editingButton.size} onChange={e => setEditingButton(b => ({ ...b, size: e.target.value }))} placeholder="Size" list="button-size-list" /> <br />
                  <input className="truncate border rounded p-1 mb-1" value={editingButton.color} onChange={e => setEditingButton(b => ({ ...b, color: e.target.value }))} placeholder="Color" list="button-color-list" /> <br />
                  <input type="file" accept="image/*,image/svg+xml" className="mb-1" onChange={e => {
                    const file = e.target.files && e.target.files[0]; if (!file) return;
                    const reader = new FileReader(); reader.onload = () => setEditingButton(b => ({ ...b, image: reader.result })); reader.readAsDataURL(file);
                  }} /> <br />
                  {editingButton.image && <img src={editingButton.image} alt="preview" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 4, border: '1px solid #e5e7eb', background: '#f8fafc', margin: 4 }} />}
                  <div className="flex items-center gap-2 mt-1">
                    <LinkButton
                      variant="link"
                      color="green"
                      onClick={() => {
                        if (buttons.some((b, i) => i !== idx && b.code === editingButton.code && b.size === editingButton.size)) {
                          alert('A button with this code and size already exists.'); return;
                        }
                        setButtons(prev => prev.map((b, i) => i === idx ? { ...editingButton } : b));
                        setEditingIdx(null);
                      }}
                      disabled={
                        !editingButton.code ||
                        !editingButton.size ||
                        !editingButton.color ||
                        !editingButton.image ||
                        (
                          editingButton.code === btn.code &&
                          editingButton.size === btn.size &&
                          editingButton.color === btn.color &&
                          editingButton.image === btn.image
                        )
                      }
                    >
                      Save
                    </LinkButton>
                    <span className="text-slate-400">•</span>
                    <LinkButton variant="link" color='red' onClick={() => setEditingIdx(null)}>Cancel</LinkButton>
                  </div>
                </>
              ) : (
                <>
                  <div><b>Code:</b> {btn.code}</div>
                  <div><b>Size:</b> {btn.size}</div>
                  <div><b>Color:</b> {btn.color}</div>
                  {btn.image && <img src={btn.image} alt={btn.code} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 4, border: '1px solid #e5e7eb', background: '#f8fafc', margin: 4 }} />}
                  <div className="flex items-center gap-2 mt-1">
                    <LinkButton variant="link" color="blue" onClick={() => { setEditingIdx(idx); setEditingButton(btn); }}>Edit</LinkButton>
                    <span className="text-slate-400">•</span>
                    <LinkButton variant="link" color="blue" onClick={() => {
                      if (window.confirm('Removing this button is permanent and cannot be undone. Are you sure you want to remove it?')) {
                        setButtons(prev => prev.filter((_, i) => i !== idx));
                        setRows(rprev => rprev.map(r => (r.button === `${btn.code}|${btn.size}` ? { ...r, button: '' } : r)));
                      }
                    }}>Remove</LinkButton>
                  </div>
                </>
              )}
            </div>
          ))}

          <datalist id="button-size-list">{SUGGESTED_SIZES.map(s => <option key={s} value={s} />)}</datalist>
          <datalist id="button-color-list">{SUGGESTED_COLORS.map(c => <option key={c} value={c} />)}</datalist>
        </div>
      </div>
    </div>
  );
}
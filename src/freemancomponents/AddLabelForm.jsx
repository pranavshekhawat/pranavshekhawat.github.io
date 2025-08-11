import React, { useState } from 'react';

const LABEL_TYPES = ['Main Label', 'Size Label', 'Fit Label', 'Care Label'];

export default function AddLabelForm({ onAdd, existingLabels = [], disabled }) {
  const [type, setType] = useState(LABEL_TYPES[0]);
  const [code, setCode] = useState('');
  const [image, setImage] = useState('');

  const onFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const requiresImage = type !== 'Care Label';
  const isDuplicate = existingLabels.some(
    l => l.type === type && l.code.trim().toLowerCase() === code.trim().toLowerCase()
  );

  const canAdd = !disabled && type && code.trim() && (!requiresImage || image) && !isDuplicate;

  const add = () => {
    if (!canAdd) return;
    onAdd(type, code.trim(), image);
    setCode('');
    setImage('');
    setType(LABEL_TYPES[0]);
  };

  return (
    <div className="border rounded p-3 mt-2 flex flex-col gap-2">
      <div className="text-sm font-medium">Add Label</div>
      <div className="flex items-center gap-2 flex-wrap">
        <select
          className="border rounded p-2 text-sm"
          value={type}
          onChange={e => setType(e.target.value)}
          disabled={disabled}
        >
          {LABEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input
          className="border rounded p-2 text-sm"
          placeholder="Label code"
          value={code}
          onChange={e => setCode(e.target.value)}
          disabled={disabled}
        />
        <input
          type="file"
          accept="image/*,image/svg+xml"
          onChange={onFileChange}
          disabled={disabled}
        />
        <button
          type="button"
          className="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50"
          onClick={add}
          disabled={!canAdd}
        >
          Add
        </button>
      </div>
      <div className="text-xs text-gray-500">
        Image optional for Care Label.
      </div>
      {image && (
        <img
          src={image}
          alt="preview"
          style={{ width: 250, height: 80, objectFit: 'contain', borderRadius: 4, border: '1px solid #e5e7eb', background: '#f8fafc' }}
        />
      )}
    </div>
  );
}
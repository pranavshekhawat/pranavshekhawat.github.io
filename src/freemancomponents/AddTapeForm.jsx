import React, { useState } from 'react';

export default function AddTapeForm({ onAdd, existingTapes = [], disabled }) {
  const [code, setCode] = useState('');
  const [image, setImage] = useState('');

  const onFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const canAdd =
    !disabled &&
    code.trim().length > 0 &&
    image &&
    !existingTapes.some(t => t.code.trim().toLowerCase() === code.trim().toLowerCase());

  const add = () => {
    if (!canAdd) return;
    onAdd(code.trim(), image);
    setCode('');
    setImage('');
  };

  return (
    <div className="border rounded p-3 mt-2 flex flex-col gap-2">
      <div className="text-sm font-medium">Add Tape</div>
      <div className="flex items-center gap-2 flex-wrap">
        <input
          className="border rounded p-2 text-sm"
          placeholder="Tape code"
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
      {image && (
        <img
          src={image}
          alt="preview"
          style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 4, border: '1px solid #e5e7eb', background: '#f8fafc' }}
        />
      )}
    </div>
  );
}
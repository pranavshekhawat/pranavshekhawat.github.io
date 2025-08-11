import React, { useRef, useState } from 'react';

export default function AddButtonForm({ onAdd, existingButtons, disabled, SUGGESTED_SIZES, SUGGESTED_COLORS }) {
  const [code, setCode] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [image, setImage] = useState('');
  const fileRef = useRef();

  function handleAdd() {
    if (!code || !size || !color || !image) return;
    if (existingButtons.some(btn => btn.code === code && btn.size === size)) {
      alert('A button with this code and size already exists.');
      return;
    }
    onAdd(code, size, color, image);
    setCode(''); setSize(''); setColor(''); setImage('');
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="flex gap-2 items-center mt-2" style={{ opacity: disabled ? 0.5 : 1 }}>
      <input value={code} onChange={e => setCode(e.target.value)} placeholder="Button code" className="p-1 border rounded text-sm w-24" disabled={disabled} />
      <input value={size} onChange={e => setSize(e.target.value)} placeholder="Size" className="p-1 border rounded text-sm w-16" disabled={disabled} list="button-size-list" />
      {/* ÷=<datalist id="button-size-list">{SUGGESTED_SIZES.map(s => <option key={s} value={s} />)}</datalist> */}
      <input value={color} onChange={e => setColor(e.target.value)} placeholder="Color" className="p-1 border rounded text-sm w-20" disabled={disabled} list="button-color-list" />
      {/* <datalist id="button-color-list">{SUGGESTED_COLORS.map(c => <option key={c} value={c} />)}</datalist> */}
      <input type="file" accept="image/*,image/svg+xml" ref={fileRef} onChange={e => {
        const file = e.target.files && e.target.files[0]; if (!file) return;
        const reader = new FileReader(); reader.onload = () => setImage(reader.result); reader.readAsDataURL(file);
      }} disabled={disabled} />
      <button className="px-2 py-1 bg-indigo-600 text-white rounded text-sm" onClick={handleAdd} disabled={disabled || !code || !size || !color || !image}>Add</button>
      {image && <div className="w-10 h-8 flex items-center justify-center"><img src={image} alt="preview" style={{ maxWidth: 400, maxHeight: 400, width: 'auto', height: 'auto' }} /></div>}
    </div>
  );
}
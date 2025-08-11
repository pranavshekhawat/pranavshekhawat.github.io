import React, { useMemo, useRef, useState, useCallback, memo } from 'react';
import Papa from 'papaparse';
import LinkButton from './LinkButton';

// ---------- Small UI helpers ----------
function Section({ title, children }) {
  return (
    <div className="col-span-6 border rounded p-2">
      <div className="text-xs font-semibold text-slate-600 mb-2">{title}</div>
      <div className="grid grid-cols-6 gap-2">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, list, className = '' }) {
  return (
    <div className={`col-span-3 sm:col-span-2 ${className}`}>
      <label className="text-xs">{label}</label>
      <input
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className="w-full p-1 border rounded text-sm"
        placeholder={placeholder}
        list={list}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, className = '' }) {
  return (
    <div className={`col-span-6 ${className}`}>
      <label className="text-xs">{label}</label>
      <textarea
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className="w-full p-1 border rounded text-sm"
        rows={3}
      />
    </div>
  );
}

function Select({ label, value, onChange, options = [], className = '' }) {
  const opts = options.map(o => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <div className={`col-span-3 sm:col-span-2 ${className}`}>
      <label className="text-xs">{label}</label>
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className="w-full p-1 border rounded text-sm"
      >
        <option value="">{'(none)'}</option>
        {opts.map((o, i) => (
          <option key={o.value || o.label || i} value={o.value ?? o.label}>
            {o.label ?? o.value}
          </option>
        ))}
      </select>
    </div>
  );
}

function SelectOrInput({ label, value, onChange, options = [], className = '' }) {
  const listId = `${String(label).replace(/\s+/g, '-').toLowerCase()}-list`;
  return (
    <div className={`col-span-3 sm:col-span-2 ${className}`}>
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
    </div>
  );
}

function FileInput({ label, field, onChange, preview }) {
  return (
    <div className="col-span-3 sm:col-span-2">
      <label className="text-xs">{label}</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const fr = new FileReader();
          fr.onload = () => onChange(fr.result); // pass the value
          fr.readAsDataURL(file);
        }}
      />
      {preview && (
        <img
          src={preview}
          alt={label}
          style={{ width: 250, height: 250, objectFit: 'contain', borderRadius: 4, border: '1px solid #e5e7eb', background: '#f8fafc', marginTop: 6 }}
        />
      )}
    </div>
  );
}

function FieldView({ label, value }) {
  if (value == null || value === '') return null;
  return (
    <div className="w-full">
      <span className="text-xs text-slate-500"><b>{label}:</b></span>
      <div className="text-sm truncate" title={String(value)}>{String(value)}</div>
    </div>
  );
}

function ImagePreview({ src, alt }) {
  return (
    <div className="w-full">
      <img
        src={src}
        alt={alt || 'preview'}
        style={{ width: 250, height: 250, objectFit: 'contain', borderRadius: 4, border: '1px solid #e5e7eb', background: '#f8fafc', marginTop: 6 }}
      />
    </div>
  );
}

// ---------- ShirtForm (moved OUTSIDE to avoid remounts/blur) ----------
const ShirtForm = memo(function ShirtForm({
  value,
  onChange,
  buttonsArr,
  labelsArr,
  trimsArr,
  defaultSeason,
  SPECIAL_TAG1_PRESETS,
  SPECIAL_TAG2_PRESETS,
  DELIVERY_OPTIONS,
}) {
  const setField = useCallback(
    (field) => (newValue) => {
      onChange((prev) => ({ ...prev, [field]: newValue }));
    },
    [onChange]
  );

  return (
    <div className="grid grid-cols-6 gap-2 items-start">
      <Section title="Basics">
        <Input label="Season" value={value.season} onChange={setField('season')} list="season-list" placeholder={defaultSeason} />
        <Input label="Story" value={value.story} onChange={setField('story')} list="story-list" placeholder="Enter story" className="col-span-2" />
        <Input label="StyleName" value={value.name} onChange={setField('name')} placeholder="e.g. Oxford LS" />
        <Input label="Code" value={value.code} onChange={setField('code')} placeholder="e.g. SH-1001" />
        <Input label="Color" value={value.color} onChange={setField('color')} list="color-list" />
        <Select label="Delivery" value={value.delivery} onChange={setField('delivery')} options={DELIVERY_OPTIONS} />
        <TextArea label="Description" value={value.description} onChange={setField('description')} className="col-span-3" />
      </Section>

      <Section title="Buttons">
        <Input label="Primary Button Placement" value={value.primaryButtonPlacement} onChange={setField('primaryButtonPlacement')} list="placement-sketch" />
        <Select
          label="Primary Button Count"
          value={String(value.primaryButtonCount)}
          onChange={(val) => setField('primaryButtonCount')(Number(val))}
          options={Array.from({ length: 10 }, (_, i) => String(i + 1))}
        />
        <Input label="Secondary Button Placement" value={value.secondaryButtonPlacement} onChange={setField('secondaryButtonPlacement')} list="placement-sketch" />
        <Select
          label="Secondary Button Count"
          value={String(value.secondaryButtonCount)}
          onChange={(val) => setField('secondaryButtonCount')(Number(val))}
          options={Array.from({ length: 5 }, (_, i) => String(i + 1))}
        />
        <Select
          label="Secondary Button Type"
          value={value.secondaryButtonType}
          onChange={setField('secondaryButtonType')}
          options={buttonsArr.map((b) => ({
            value: `${b.code || b.name || 'BTN'}|${b.size || ''}`,
            label: `${b.code || b.name || 'Button'}${b.size ? ` (${b.size})` : ''}`,
          }))}
        />
         <Select
          label="Primary Button Type"
          value={value.primaryButtonType}
          onChange={setField('primaryButtonType')}
          options={buttonsArr.map((b) => ({
            value: `${b.code || b.name || 'BTN'}|${b.size || ''}`,
            label: `${b.code || b.name || 'Button'}${b.size ? ` (${b.size})` : ''}`,
          }))}
        />
      </Section>

      <Section title="Fit & Labels">
        <Input label="Fit" value={value.fit} onChange={setField('fit')} list="fit-list" />
        <Select
          label="Fit Label"
          value={value.fitLabel}
          onChange={setField('fitLabel')}
          options={labelsArr.map((l, idx) => ({
            value: l.code || l.name || `LABEL-${idx}`,
            label: l.name || l.code || `Label ${idx + 1}`,
          }))}
        />
        <Input label="Main Label Placement" value={value.mainLabelPlacement} onChange={setField('mainLabelPlacement')} placeholder="As per brand standard" list="placement-standard" />
        <Select
          label="Main Label"
          value={value.mainLabel}
          onChange={setField('mainLabel')}
          options={labelsArr.map((l, idx) => ({
            value: l.code || l.name || `LABEL-${idx}`,
            label: l.name || l.code || `Label ${idx + 1}`,
          }))}
        />
        <Select
          label="Size Label"
          value={value.sizeLabel}
          onChange={setField('sizeLabel')}
          options={labelsArr.map((l, idx) => ({
            value: l.code || l.name || `LABEL-${idx}`,
            label: l.name || l.code || `Label ${idx + 1}`,
          }))}
        />
        <Select
          label="Care Label"
          value={value.careLabel}
          onChange={setField('careLabel')}
          options={labelsArr.map((l, idx) => ({
            value: l.code || l.name || `LABEL-${idx}`,
            label: l.name || l.code || `Label ${idx + 1}`,
          }))}
        />
        <Input label="Size Label Placement" value={value.sizeLabelPlacement} onChange={setField('sizeLabelPlacement')} placeholder="As per brand standard" list="placement-standard" />
        <Input label="Care Label Placement" value={value.careLabelPlacement} onChange={setField('careLabelPlacement')} placeholder="As per brand standard" list="placement-standard" />
      </Section>

      <Section title="Fabric & Construction">
        <Input label="Content" value={value.content} onChange={setField('content')} list="content-list" />
        <Input label="Count" value={value.count} onChange={setField('count')} list="count-list" />
        <Input label="Construction" value={value.construction} onChange={setField('construction')} list="construction-list" />
        <Input label="Weave" value={value.weave} onChange={setField('weave')} list="weave-list" />
        <Input label="Trim Fabric" value={value.trimFabric} onChange={setField('trimFabric')} placeholder="NA" />
        <Input label="Trim Fabric Placement" value={value.trimFabricPlacement} onChange={setField('trimFabricPlacement')} placeholder="NA" />
      </Section>

      <Section title="Branding & Trims">
        <Select
          label="Branding Label 1"
          value={value.brandingLabel1}
          onChange={setField('brandingLabel1')}
          options={trimsArr.map((t, idx) => ({
            value: t.code || t.name || `TRIM-${idx}`,
            label: t.name || t.code || `Trim ${idx + 1}`,
          }))}
        />
        <Input label="Branding Label 1 Placement" value={value.brandingLabel1Placement} onChange={setField('brandingLabel1Placement')} list="placement-sketch" />
        <Select
          label="Branding Label 2"
          value={value.brandingLabel2}
          onChange={setField('brandingLabel2')}
          options={trimsArr.map((t, idx) => ({
            value: t.code || t.name || `TRIM-${idx}`,
            label: t.name || t.code || `Trim ${idx + 1}`,
          }))}
        />
        <Input label="Branding Label 2 Placement" value={value.brandingLabel2Placement} onChange={setField('brandingLabel2Placement')} list="placement-sketch" />
        <Select
          label="Trim 1"
          value={value.trim1}
          onChange={setField('trim1')}
          options={trimsArr.map((t, idx) => ({
            value: t.code || t.name || `TRIM-${idx}`,
            label: t.name || t.code || `Trim ${idx + 1}`,
          }))}
        />
        <Input label="Trim 1 Placement" value={value.trim1Placement} onChange={setField('trim1Placement')} list="placement-sketch" />
        <Select
          label="Trim 2"
          value={value.trim2}
          onChange={setField('trim2')}
          options={trimsArr.map((t, idx) => ({
            value: t.code || t.name || `TRIM-${idx}`,
            label: t.name || t.code || `Trim ${idx + 1}`,
          }))}
        />
        <Input label="Trim 2 Placement" value={value.trim2Placement} onChange={setField('trim2Placement')} list="placement-sketch" />
      </Section>

      <Section title="Wash & Threads">
        <Input label="Wash Option" value={value.washOption} onChange={setField('washOption')} list="wash-list" />
        <Input label="Top Stitch TKT" value={value.topStitchTKT} onChange={setField('topStitchTKT')} placeholder="50s" />
        <Input label="Top Stitch Color" value={value.topStitchColor} onChange={setField('topStitchColor')} placeholder="DTM" />
        <Input label="Contrast Stitch TKT" value={value.contrastStitchTKT} onChange={setField('contrastStitchTKT')} placeholder="NA" />
        <Input label="Contrast Stitch Color" value={value.contrastStitchColor} onChange={setField('contrastStitchColor')} placeholder="NA" />
      </Section>

      <Section title="Images & Packaging">
        <FileInput label="Shirt Image" field="image" onChange={setField('image')} preview={value.image} />
        <FileInput label="CAD Image" field="cadImage" onChange={setField('cadImage')} preview={value.cadImage} />
        {(value.washOption === 'As per image' || value.washOption === 'As per image (Submit wash mock)') && (
          <FileInput label="Wash Image" field="washImage" onChange={setField('washImage')} preview={value.washImage} />
        )}
        <FileInput label="Construction Detail Image" field="constructionDetailImage" onChange={setField('constructionDetailImage')} preview={value.constructionDetailImage} />
        <Input label="Packaging Method" value={value.packagingMethod} onChange={setField('packagingMethod')} placeholder="Flatpack" />
        <Input label="Hang Tag" value={value.hangTag} onChange={setField('hangTag')} placeholder="Wrangler Hang Tag" />
        <Input label="Hang Tag Placement" value={value.hangTagPlacement} onChange={setField('hangTagPlacement')} placeholder="As per brand standard" list="placement-standard" />
        <SelectOrInput label="Special Tag 1" value={value.specialTag1} onChange={setField('specialTag1')} options={SPECIAL_TAG1_PRESETS} />
        <Input label="Special Tag 1 Placement" value={value.specialTag1Placement} onChange={setField('specialTag1Placement')} placeholder="As per brand standard" list="placement-standard" />
        <SelectOrInput label="Special Tag 2" value={value.specialTag2} onChange={setField('specialTag2')} options={SPECIAL_TAG2_PRESETS} />
        <Input label="Special Tag 2 Placement" value={value.specialTag2Placement} onChange={setField('specialTag2Placement')} placeholder="As per brand standard" list="placement-standard" />
      </Section>
    </div>
  );
});

export default function ShirtList({ rows, setRows, buttons, labels = [], trims = [] }) {
  // ---------- Constants ----------
  const COLOR_PRESETS = ['Black', 'Beige', 'Brown', 'Off-White', 'Blue', 'Navy', 'White', 'Grey', 'Olive', 'Khaki', 'Cream'];
  const DELIVERY_OPTIONS = ['D1', 'D2', 'D3', 'D4', 'D5'];
  const FIT_PRESETS = ['Regular', 'Relaxed', 'Resort', 'Oversized', 'Boxy', 'Relaxed Crop'];
  const CONTENT_PRESETS = ['As per swatch', 'TBC', '100% Cotton', '100% Linen', '55% Linen 45% Cotton'];
  const COUNT_PRESETS = ['As per swatch', 'TBC', '10s', '20s', '30s', '40s', '60s'];
  const CONSTRUCTION_PRESETS = ['TBC', 'As per swatch'];
  const WEAVE_PRESETS = ['TBC', 'As per swatch', 'Plain', '2x2 Twill', 'Twill', 'Crepe', 'Herringbone Twill', 'Waffle', 'Corduroy', 'Oxford'];
  const WASH_PRESETS = ['Enzyme Softener', 'Silicon Softener', 'Normal', 'As per sketch', 'As per image', 'As per image (Submit wash mock)'];
  const PLACEMENT_SKETCH = ['As per sketch'];
  const PLACEMENT_STANDARD = ['As per brand standard'];
  const SPECIAL_TAG1_PRESETS = ['NA', 'Linen Tag', 'Indigo Tag'];
  const SPECIAL_TAG2_PRESETS = ['NA', 'Vintage Tag', 'New Season Tag'];

  // ---------- CSV toolbar state ----------
  const shirtCSVInputRef = useRef();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newCSVName, setNewCSVName] = useState('');
  const [openedShirtCSV, setOpenedShirtCSV] = useState(null);
  const [originalRows, setOriginalRows] = useState([]);

  // ---------- Season helpers ----------
  const getSeasonStrings = (d = new Date()) => {
    const m = d.getMonth();
    const y = d.getFullYear() + 1;
    const yy = String(y).slice(-2);
    if (m <= 5) return { long: `SPRING SUMMER' ${yy}`, short: `SS${yy}` };
    return { long: `FALL WINTER ${yy}`, short: `FW${yy}` };
  };
  const defaultSeason = useMemo(() => getSeasonStrings().long, []);
  const seasonOptions = useMemo(() => {
    const s = getSeasonStrings();
    return [s.long, s.short];
  }, []);

  // ---------- ID ----------
  const genId = () =>
    (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  // ---------- Suggestions ----------
  const storyOptions = useMemo(
    () => Array.from(new Set((rows || []).map(r => (r.story || '').trim()).filter(Boolean))),
    [rows]
  );

  const buttonsArr = buttons || [];
  const labelsArr = labels || [];
  const trimsArr = trims || [];

  // ---------- Defaults ----------
  const defaultNewOrEdit = {
    season: defaultSeason,
    story: '',
    name: '',
    code: '',
    button: '',
    image: '',
    color: '',
    primaryButtonPlacement: '',
    primaryButtonCount: 1,
    secondaryButtonPlacement: '',
    secondaryButtonCount: 1,
    secondaryButtonType: '',
    primaryButtonType: '',
    delivery: '',
    description: '',
    fit: '',
    fitLabel: '',
    mainLabelPlacement: 'As per brand standard',
    mainLabel: '',
    sizeLabel: '',
    careLabel: '',
    sizeLabelPlacement: 'As per brand standard',
    careLabelPlacement: 'As per brand standard',
    content: '',
    count: '',
    brandingLabel1: '',
    brandingLabel1Placement: '',
    brandingLabel2: '',
    brandingLabel2Placement: '',
    trim1: '',
    trim1Placement: '',
    trim2: '',
    trim2Placement: '',
    construction: '',
    weave: '',
    cadImage: '',
    washOption: '',
    washImage: '',
    topStitchTKT: '50s',
    topStitchColor: 'DTM',
    contrastStitchTKT: 'NA',
    contrastStitchColor: 'NA',
    constructionDetailImage: '',
    trimFabric: 'NA',
    trimFabricPlacement: 'NA',
    packagingMethod: 'Flatpack',
    hangTag: 'Wrangler Hang Tag',
    hangTagPlacement: 'As per brand standard',
    specialTag1: 'NA',
    specialTag1Placement: 'As per brand standard',
    specialTag2: 'NA',
    specialTag2Placement: 'As per brand standard',
  };

  // ---------- Add/Edit state ----------
  const [newShirt, setNewShirt] = useState({ ...defaultNewOrEdit });
  const canAdd = !!openedShirtCSV && newShirt.name.trim().length > 0 && newShirt.code.trim().length > 0;

  const [editingIdx, setEditingIdx] = useState(null);
  const [editingShirt, setEditingShirt] = useState({ ...defaultNewOrEdit });

  // ---------- CSV open ----------
  function handleShirtCSVUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = [];
        results.data.forEach((r) => {
          if (!r.name && !r.code) return;
          parsed.push({
            id: r.id || genId(),
            season: r.season || defaultSeason,
            story: r.story || '',
            name: r.name || '',
            code: r.code || '',
            button: r.button || '',
            image: r.image || '',
            color: r.color || '',
            primaryButtonPlacement: r.primaryButtonPlacement || '',
            primaryButtonCount: numOrDefault(r.primaryButtonCount, 1),
            secondaryButtonPlacement: r.secondaryButtonPlacement || '',
            secondaryButtonCount: numOrDefault(r.secondaryButtonCount, 1),
            secondaryButtonType: r.secondaryButtonType || '',
            primaryButtonType: r.primaryButtonType || '',
            delivery: r.delivery || '',
            description: r.description || '',
            fit: r.fit || '',
            fitLabel: r.fitLabel || '',
            mainLabelPlacement: r.mainLabelPlacement || 'As per brand standard',
            mainLabel: r.mainLabel || '',
            sizeLabel: r.sizeLabel || '',
            careLabel: r.careLabel || '',
            sizeLabelPlacement: r.sizeLabelPlacement || 'As per brand standard',
            careLabelPlacement: r.careLabelPlacement || 'As per brand standard',
            content: r.content || '',
            count: r.count || '',
            brandingLabel1: r.brandingLabel1 || '',
            brandingLabel1Placement: r.brandingLabel1Placement || '',
            brandingLabel2: r.brandingLabel2 || '',
            brandingLabel2Placement: r.brandingLabel2Placement || '',
            trim1: r.trim1 || '',
            trim1Placement: r.trim1Placement || '',
            trim2: r.trim2 || '',
            trim2Placement: r.trim2Placement || '',
            construction: r.construction || '',
            weave: r.weave || '',
            cadImage: r.cadImage || '',
            washOption: r.washOption || '',
            washImage: r.washImage || '',
            topStitchTKT: r.topStitchTKT || '50s',
            topStitchColor: r.topStitchColor || 'DTM',
            contrastStitchTKT: r.contrastStitchTKT || 'NA',
            contrastStitchColor: r.contrastStitchColor || 'NA',
            constructionDetailImage: r.constructionDetailImage || '',
            trimFabric: r.trimFabric || 'NA',
            trimFabricPlacement: r.trimFabricPlacement || 'NA',
            packagingMethod: r.packagingMethod || 'Flatpack',
            hangTag: r.hangTag || 'Wrangler Hang Tag',
            hangTagPlacement: r.hangTagPlacement || 'As per brand standard',
            specialTag1: r.specialTag1 || 'NA',
            specialTag1Placement: r.specialTag1Placement || 'As per brand standard',
            specialTag2: r.specialTag2 || 'NA',
            specialTag2Placement: r.specialTag2Placement || 'As per brand standard',
          });
        });
        setRows(parsed);
        setOriginalRows(parsed);
        setOpenedShirtCSV({ name: file.name });
      },
      error: () => {
        alert('Could not parse shirts CSV.');
      }
    });
  }

  function numOrDefault(v, d) {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : d;
  }

  // ---------- CSV save/close ----------
  function saveOpenedShirtCSV() {
    const data = (rows || []).map(r => ({
      id: r.id,
      season: r.season || '',
      story: r.story || '',
      name: r.name || '',
      code: r.code || '',
      button: r.button || '',
      image: r.image || '',
      color: r.color || '',
      primaryButtonPlacement: r.primaryButtonPlacement || '',
      primaryButtonCount: r.primaryButtonCount ?? '',
      secondaryButtonPlacement: r.secondaryButtonPlacement || '',
      secondaryButtonCount: r.secondaryButtonCount ?? '',
      secondaryButtonType: r.secondaryButtonType || '',
      primaryButtonType: r.primaryButtonType || '',
      delivery: r.delivery || '',
      description: r.description || '',
      fit: r.fit || '',
      fitLabel: r.fitLabel || '',
      mainLabelPlacement: r.mainLabelPlacement || '',
      mainLabel: r.mainLabel || '',
      sizeLabel: r.sizeLabel || '',
      careLabel: r.careLabel || '',
      sizeLabelPlacement: r.sizeLabelPlacement || '',
      careLabelPlacement: r.careLabelPlacement || '',
      content: r.content || '',
      count: r.count || '',
      brandingLabel1: r.brandingLabel1 || '',
      brandingLabel1Placement: r.brandingLabel1Placement || '',
      brandingLabel2: r.brandingLabel2 || '',
      brandingLabel2Placement: r.brandingLabel2Placement || '',
      trim1: r.trim1 || '',
      trim1Placement: r.trim1Placement || '',
      trim2: r.trim2 || '',
      trim2Placement: r.trim2Placement || '',
      construction: r.construction || '',
      weave: r.weave || '',
      cadImage: r.cadImage || '',
      washOption: r.washOption || '',
      washImage: r.washImage || '',
      topStitchTKT: r.topStitchTKT || '',
      topStitchColor: r.topStitchColor || '',
      contrastStitchTKT: r.contrastStitchTKT || '',
      contrastStitchColor: r.contrastStitchColor || '',
      constructionDetailImage: r.constructionDetailImage || '',
      trimFabric: r.trimFabric || '',
      trimFabricPlacement: r.trimFabricPlacement || '',
      packagingMethod: r.packagingMethod || '',
      hangTag: r.hangTag || '',
      hangTagPlacement: r.hangTagPlacement || '',
      specialTag1: r.specialTag1 || '',
      specialTag1Placement: r.specialTag1Placement || '',
      specialTag2: r.specialTag2 || '',
      specialTag2Placement: r.specialTag2Placement || '',
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = openedShirtCSV?.name || 'shirts.csv';
    a.click();
    URL.revokeObjectURL(url);
    setOriginalRows(rows);
  }

  function isShirtsChanged() {
    return JSON.stringify(rows) !== JSON.stringify(originalRows);
  }

  function closeOpenedShirtCSV() {
    if (isShirtsChanged()) {
      if (!window.confirm('You have unsaved changes. Close and discard them?')) return;
    }
    setRows([]);
    setOriginalRows([]);
    setOpenedShirtCSV(null);
    if (shirtCSVInputRef.current) shirtCSVInputRef.current.value = '';
    setEditingIdx(null);
  }

  // ---------- Row helpers ----------
  function removeShirt(id) {
    if (!window.confirm('Removing this shirt is permanent. Remove it?')) return;
    setRows(prev => prev.filter(r => r.id !== id));
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

  // ---------- UI ----------
  return (
    <div className="bg-white p-4 rounded shadow md:col-span-2">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">Shirts</h2>
        <div className="flex gap-2 mb-2">
          <button
            className="px-3 py-1 rounded bg-indigo-600 text-white"
            onClick={() => setShowNewDialog(true)}
            disabled={!!openedShirtCSV}
          >
            Create New
          </button>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleShirtCSVUpload}
            disabled={!!openedShirtCSV}
            ref={shirtCSVInputRef}
          />
          {openedShirtCSV && (
            <>
              <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={saveOpenedShirtCSV}>Save</button>
              <button className="px-3 py-1 rounded bg-gray-400 text-white" onClick={closeOpenedShirtCSV}>Close</button>
              <span className="text-xs text-gray-500 ml-2">Opened: {openedShirtCSV.name}</span>
            </>
          )}
        </div>

        {showNewDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow flex flex-col gap-3 min-w-[320px]">
              <h3 className="font-semibold text-lg">Create New Shirt Library</h3>
              <input
                className="border rounded p-2"
                placeholder="Enter file name (e.g. my-shirts.csv)"
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
                    setRows([]); setOriginalRows([]); setOpenedShirtCSV({ name: newCSVName.trim() });
                    setShowNewDialog(false); setNewCSVName('');
                    if (shirtCSVInputRef.current) shirtCSVInputRef.current.value = '';
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add form */}
      {openedShirtCSV && (
        <div className="mt-3 border rounded p-3">
          <div className="text-sm font-medium mb-2">Add Shirt</div>
          <ShirtForm
            value={newShirt}
            onChange={setNewShirt}
            buttonsArr={buttonsArr}
            labelsArr={labelsArr}
            trimsArr={trimsArr}
            defaultSeason={defaultSeason}
            SPECIAL_TAG1_PRESETS={SPECIAL_TAG1_PRESETS}
            SPECIAL_TAG2_PRESETS={SPECIAL_TAG2_PRESETS}
            DELIVERY_OPTIONS={DELIVERY_OPTIONS}
          />
          <div className="text-right mt-3">
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
              onClick={() => {
                if (!canAdd) return;
                setRows(prev => [...prev, { id: genId(), ...newShirt, name: newShirt.name.trim(), code: newShirt.code.trim() }]);
                setNewShirt({ ...defaultNewOrEdit });
                setNewShirt(s => ({ ...s, season: defaultSeason }));
              }}
              disabled={!canAdd}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Cards list */}
      <div className="mt-3 w-full max-h-[48vh] overflow-auto">
        <div className="flex flex-wrap gap-2 w-full" style={{ display: 'flex', maxWidth: '100%' }}>
          {rows.map((row, idx) => (
            <div
              key={row.id}
              className="border p-2 rounded text-sm flex flex-col items-stretch justify-start"
              style={{ minHeight: 0, flex: '1 0 20%', maxWidth: '20%', boxSizing: 'border-box' }}
            >
              {idx === editingIdx ? (
                <>
                  <ShirtForm
                    value={editingShirt}
                    onChange={setEditingShirt}
                    buttonsArr={buttonsArr}
                    labelsArr={labelsArr}
                    trimsArr={trimsArr}
                    defaultSeason={defaultSeason}
                    SPECIAL_TAG1_PRESETS={SPECIAL_TAG1_PRESETS}
                    SPECIAL_TAG2_PRESETS={SPECIAL_TAG2_PRESETS}
                    DELIVERY_OPTIONS={DELIVERY_OPTIONS}
                  />
                  <div className="w-full flex items-center gap-2 mt-2">
                    <LinkButton
                      variant="link"
                      color="green"
                      onClick={() => {
                        const updated = { ...row, ...editingShirt, name: editingShirt.name.trim(), code: editingShirt.code.trim() };
                        setRows(prev => prev.map((r, i) => i === idx ? updated : r));
                        setEditingIdx(null);
                      }}
                      disabled={
                        !editingShirt.name?.trim() ||
                        !editingShirt.code?.trim() ||
                        unchanged(editingShirt, row)
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
                  <FieldView label="Season" value={row.season} />
                  <FieldView label="Story" value={row.story} />
                  <FieldView label="StyleName" value={row.name} />
                  <FieldView label="Code" value={row.code} />
                  <FieldView label="Color" value={row.color} />
                  <FieldView label="Delivery" value={row.delivery} />
                  {row.image && <ImagePreview src={row.image} alt={row.name} />}
                  <div className="w-full flex items-center gap-2 mt-1">
                    <LinkButton
                      variant="link"
                      color="blue"
                      onClick={() => { setEditingIdx(idx); setEditingShirt({ ...defaultNewOrEdit, ...row }); }}
                    >
                      Edit
                    </LinkButton>
                    <span className="text-slate-400">•</span>
                    <LinkButton color="red" variant="link" onClick={() => removeShirt(row.id)}>
                      Remove
                    </LinkButton>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Datalists */}
      <datalist id="season-list">
        {seasonOptions.map(s => <option key={s} value={s} />)}
      </datalist>
      <datalist id="story-list">
        {storyOptions.map(s => <option key={s} value={s} />)}
      </datalist>
      <datalist id="color-list">
        {COLOR_PRESETS.map(s => <option key={s} value={s} />)}
      </datalist>
      <datalist id="fit-list">
        {FIT_PRESETS.map(s => <option key={s} value={s} />)}
      </datalist>
      <datalist id="content-list">
        {CONTENT_PRESETS.map(s => <option key={s} value={s} />)}
      </datalist>
      <datalist id="count-list">
        {COUNT_PRESETS.map(s => <option key={s} value={s} />)}
      </datalist>
      <datalist id="construction-list">
        {CONSTRUCTION_PRESETS.map(s => <option key={s} value={s} />)}
      </datalist>
      <datalist id="weave-list">
        {WEAVE_PRESETS.map(s => <option key={s} value={s} />)}
      </datalist>
      <datalist id="placement-sketch">
        {PLACEMENT_SKETCH.map(s => <option key={s} value={s} />)}
      </datalist>
      <datalist id="placement-standard">
        {PLACEMENT_STANDARD.map(s => <option key={s} value={s} />)}
      </datalist>
      <datalist id="wash-list">
        {WASH_PRESETS.map(s => <option key={s} value={s} />)}
      </datalist>
    </div>
  );
}
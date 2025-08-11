import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import ShirtList from './freemancomponents/ShirtList';
import TemplateEditor from './freemancomponents/TemplateEditor';
import ButtonLibrary from './freemancomponents/ButtonLibrary';
import TapeLibrary from './freemancomponents/TapeLibrary';
import TrimLibrary from './freemancomponents/TrimLibrary';
import LabelLibrary from './freemancomponents/LabelLibrary';

export default function Freeman() {
  // Suggestions
  const SUGGESTED_SIZES = ['14L', '16L', '18L', '20L', '22L', '24L', '26L'];
  const SUGGESTED_COLORS = ['Black', 'White', 'Navy', 'Beige', 'Olive', 'Off-white', 'Grey', 'Brown'];

  const sampleTapeSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><rect rx="6" width="100%" height="100%" fill="#f8e6e6" stroke="#e6a0a0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="#631f1f">TAPE</text></svg>';
  const sampleTapeDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sampleTapeSVG);


  const sampleTrimSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><rect rx="6" width="100%" height="100%" fill="#eef8e6" stroke="#b9e69f"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="#2f631f">TRIM</text></svg>';
  const sampleTrimDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sampleTrimSVG);

 const sampleMainLabelSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="80"><rect rx="6" width="100%" height="100%" fill="#e6eef8" stroke="#9fbce6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="#1f3a63">MAIN LABEL</text></svg>';
  const sampleMainLabelDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sampleMainLabelSVG);
 

  // Seed data
  const sampleButtonSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><rect rx="6" width="100%" height="100%" fill="#e6eef8" stroke="#9fbce6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="#1f3a63">BUTTON</text></svg>';
  const sampleButtonDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sampleButtonSVG);

  // State lifted to top so children can share
  const [buttons, setButtons] = useState([
    { code: 'BTN001', size: 'M', color: 'black', image: sampleButtonDataUrl }
  ]);

  const [rows, setRows] = useState(() => [
    { id: uuidv4(), name: 'Classic White Shirt', code: 'WH001', image: '', button: '' },
  ]);

  const [template, setTemplate] = useState(() => `
<div style="padding:24px; font-family: Arial, Helvetica, sans-serif;">
  <div style="border:1px solid #e5e7eb; padding:16px; width:520px;">
    <div style="height:240px; display:flex; align-items:center; justify-content:center;">{{image}}</div>
    <h2 style="margin:12px 0 4px 0; font-size:18px">{{name}}</h2>
    <div style="color:#4b5563;">Code: {{code}}</div>
    <div style="margin-top:12px">Button: {{button}}</div>
  </div>
</div>
`);

  const [tapes, setTapes] = useState([
    { code: 'TAPE001', image: sampleTapeDataUrl }
  ]);

  const [trims, setTrims] = useState([
    { code: 'TRIM001', image: sampleTrimDataUrl }
  ]);
  const [labels, setLabels] = useState([
    { type: 'Main Label', code: 'LBL-MAIN-001', image: sampleMainLabelDataUrl },
    { type: 'Care Label', code: 'CARE-001', image: '' },
  ]);

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="w-full mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold">Shirt Catalog Generator — Freeman (Upgraded)</h1>
          <p className="text-sm text-gray-600">Manage shirts & button library, upload images, edit template, export CSV and PDF (one shirt per page).</p>
        </header>

        {/* Shirts editor */}
        <ShirtList rows={rows} setRows={setRows} buttons={buttons} labels={labels} trims={trims} />

        {/* Template editor + preview */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <TemplateEditor template={template} setTemplate={setTemplate} rows={rows} buttons={buttons} />
          {/* Preview is rendered inside TemplateEditor */}
        </div>

        {/* Button Library */}
        <div className="mt-6">
          <ButtonLibrary
            buttons={buttons}
            setButtons={setButtons}
            setRows={setRows}
            SUGGESTED_SIZES={SUGGESTED_SIZES}
            SUGGESTED_COLORS={SUGGESTED_COLORS}
          />
        </div>

        {/* Tape Library */}
        <div className="mt-6">
          <TapeLibrary tapes={tapes} setTapes={setTapes} />
        </div>

        {/* Trim Library */}
        <div className="mt-6">
          <TrimLibrary trims={trims} setTrims={setTrims} />
        </div>

        {/* Label Library */}
        <div className="mt-6">
          <LabelLibrary labels={labels} setLabels={setLabels} />
        </div>

      </div>
    </div>
  );
}
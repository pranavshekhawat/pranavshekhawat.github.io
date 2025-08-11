import React from 'react';
import { renderTemplateHtmlForRow } from '../freemanutils/rendering';
import { exportRowsToPDF } from '../freemanutils/pdfutils';

export default function TemplateEditor({ template, setTemplate, rows, buttons }) {
  function handleTemplateFile(e) {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = () => setTemplate(String(reader.result)); reader.readAsText(file);
  }

  return (
    <>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold">Template Editor</h2>
        <p className="text-xs text-gray-600">Edit the HTML template. Tokens: <code className="ml-1">{"{{name}}"}</code>, <code>{"{{code}}"}</code>, <code>{"{{image}}"}</code>, <code>{"{{button}}"}</code>.</p>

        <div className="mt-2">
          <input type="file" accept="text/html" onChange={handleTemplateFile} />
          <textarea value={template} onChange={(e) => setTemplate(e.target.value)} className="w-full h-56 p-2 border rounded mt-2" />
        </div>

        <div className="mt-2 flex gap-2">
          <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => exportRowsToPDF(rows, template, buttons)}>Export to PDF (one shirt / page)</button>
          <button className="px-3 py-1 rounded bg-gray-700 text-white" onClick={() => navigator.clipboard?.writeText(template) && alert('Template copied to clipboard')}>Copy Template</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold">Preview</h2>
        <p className="text-xs text-gray-600">Live preview of the first shirt using the template.</p>
        <div className="mt-3">
          {rows.length === 0 ? (
            <div className="text-sm text-gray-500">No shirts to preview</div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: renderTemplateHtmlForRow(template, rows[0], buttons) }} />
          )}
        </div>
      </div>
    </>
  );
}
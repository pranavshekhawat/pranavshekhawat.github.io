import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// A4 landscape at 300 PPI: 3508 x 2480 px
const PAGE_W = 3508;
const PAGE_H = 2480;
const PADDING = 36;
const TRANSPARENT_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';

const safe = (v, d = '') => (v == null ? d : String(v));
const normalizeStyle = (s) => String(s || '').trim().toLowerCase();

function groupByStyle(rows = []) {
  const map = new Map();
  rows.forEach(r => {
    const key = normalizeStyle(r.name);
    if (!key) return;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(r);
  });
  return map;
}

// ---------- DOM helpers (offscreen render host) ----------
function createHost() {
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-99999px';
  host.style.top = '0';
  host.style.background = '#fff';
  host.style.width = `${PAGE_W}px`;
  host.style.height = `${PAGE_H}px`;
  host.style.overflow = 'hidden';
  document.body.appendChild(host);
  return host;
}

function el(tag, style = {}, inner = '') {
  const n = document.createElement(tag);
  Object.assign(n.style, style);
  if (inner) n.innerHTML = inner;
  return n;
}

function line(label, value) {
  const row = el('div', { display: 'flex', fontSize: '26px', marginBottom: '6px' });
  const l = el('div', { fontWeight: '700', color: '#111', width: '420px' }, safe(label));
  const v = el('div', { color: '#111', flex: '1 1 auto' }, safe(value));
  row.append(l, v);
  return row;
}

function imageEl(src, style = {}) {
  const img = document.createElement('img');
  img.crossOrigin = 'anonymous';
  img.loading = 'eager';
  img.decoding = 'async';
  img.src = src || TRANSPARENT_PNG;
  img.onerror = () => { img.src = TRANSPARENT_PNG; };
  Object.assign(img.style, {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    background: '#fff',
    ...style,
  });
  return img;
}

function detailsTable(fields, columns) {
  const tbl = el('table', {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '22px',
    tableLayout: 'fixed',
  });
  const thead = el('thead');
  const trh = el('tr');
  const th0 = el('th', {
    border: '2px solid #111', padding: '8px 10px', background: '#111', color: '#fff', textAlign: 'left'
  }, 'Field');
  trh.appendChild(th0);
  columns.forEach((col, i) => {
    trh.appendChild(el('th', {
      border: '2px solid #111', padding: '8px 10px', background: '#111', color: '#fff', textAlign: 'left'
    }, safe(col.color || col.fabricCode || `Var ${i + 1}`)));
  });
  thead.appendChild(trh);

  const tbody = el('tbody');
  fields.forEach(f => {
    const tr = el('tr');
    tr.appendChild(el('td', { border: '2px solid #111', padding: '8px 10px', fontWeight: '700', width: '360px' }, f.label));
    columns.forEach(col => {
      tr.appendChild(el('td', { border: '2px solid #111', padding: '8px 10px' }, safe(col[f.key])));
    });
    tbody.appendChild(tr);
  });

  tbl.append(thead, tbody);
  return tbl;
}

// ---------- Page builders ----------
function buildPage1(styleName, base, variants) {
  const page = el('div', {
    width: `${PAGE_W}px`, height: `${PAGE_H}px`, background: '#fff', boxSizing: 'border-box', padding: `${PADDING}px`,
    fontFamily: 'Arial, Helvetica, sans-serif', color: '#111'
  });

  // Header
  const header = el('div', {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    borderBottom: '6px solid #000', paddingBottom: '14px'
  });
  const hLeft = el('div');
  hLeft.append(
    el('div', { fontSize: '48px', fontWeight: '800', letterSpacing: '2px' }, safe(styleName).toUpperCase()),
    el('div', { fontSize: '24px', color: '#374151', marginTop: '4px' }, safe(base.story))
  );
  const hRight = el('div', { textAlign: 'right', fontSize: '22px', color: '#111' }, `Delivery: ${safe(base.delivery)}`);
  header.append(hLeft, hRight);

  // Columns
  const cols = el('div', { display: 'flex', gap: '24px', marginTop: '18px', height: 'calc(100% - 120px)' });

  // Left details (once)
  const left = el('div', { flex: '1 1 46%', display: 'flex', flexDirection: 'column', gap: '6px', overflow: 'hidden', paddingRight: '8px' });
  left.append(
    el('div', { fontSize: '28px', fontWeight: '700', marginBottom: '6px' }, 'Basic Details'),
    line('Season', base.season),
    line('Story', base.story),
    line('Description', base.description),
    line('Fit', base.fit),
    line('Care Label', base.careLabel),
    line('Care Label Placement', base.careLabelPlacement),
    line('Main Label Placement', base.mainLabelPlacement),
    line('Size Label Placement', base.sizeLabelPlacement),
    line('Trim Fabric Placement', base.trimFabricPlacement),
    line('Branding Label 1 Placement', base.brandingLabel1Placement),
    line('Branding Label 2 Placement', base.brandingLabel2Placement),
    line('Trim 1 Placement', base.trim1Placement),
    line('Trim 2 Placement', base.trim2Placement),
    line('Wash Option', base.washOption),
    line('Special Tag 1', base.specialTag1),
    line('Special Tag 1 Placement', base.specialTag1Placement),
    line('Special Tag 2', base.specialTag2),
    line('Special Tag 2 Placement', base.specialTag2Placement),
    line('Primary Button', `${safe(base.primaryButtonType)} • ${safe(base.primaryButtonCount)} • ${safe(base.primaryButtonPlacement)}`),
    line('Secondary Button', `${safe(base.secondaryButtonType)} • ${safe(base.secondaryButtonCount)} • ${safe(base.secondaryButtonPlacement)}`)
  );

  // Right: variants grid
  const right = el('div', { flex: '1 1 54%', display: 'flex', flexDirection: 'column' });
  right.append(el('div', { fontSize: '28px', fontWeight: '700', marginBottom: '6px' }, 'Images & Colorways'));

  const grid = el('div', { display: 'flex', flexWrap: 'wrap', gap: '16px', alignContent: 'flex-start', overflow: 'auto' });
  variants.forEach(v => {
    const card = el('div', {
      width: 'calc(50% - 8px)', border: '2px dashed #e5e7eb', padding: '12px', background: '#fafafa',
      display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start'
    });
    const imgWrap = el('div', { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '860px', background: '#fff' });
    imgWrap.append(imageEl(v.image, { maxHeight: '100%' }));
    const cap = el('div', { fontSize: '24px', marginTop: '10px', color: '#111' },
      `<b>Fabric Code:</b> ${safe(v.fabricCode)}<br/><span style="color:#374151"><b>Color:</b> ${safe(v.color)}</span>`
    );
    card.append(imgWrap, cap);
    grid.append(card);
  });
  right.append(grid);

  cols.append(left, right);
  page.append(header, cols);
  return page;
}

function buildPage2(base) {
  const page = el('div', {
    width: `${PAGE_W}px`, height: `${PAGE_H}px`, background: '#fff', boxSizing: 'border-box', padding: `${PADDING}px`,
    fontFamily: 'Arial, Helvetica, sans-serif', color: '#111'
  });

  const header = el('div', {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    borderBottom: '6px solid #000', paddingBottom: '14px'
  });
  header.append(
    el('div', { fontSize: '40px', fontWeight: '800' }, 'THREADS & CONSTRUCTION'),
    el('div', { fontSize: '22px', color: '#111' }, safe(base.name || '').toUpperCase())
  );

  const body = el('div', { display: 'flex', gap: '24px', marginTop: '18px', height: 'calc(100% - 110px)' });

  const left = el('div', { flex: '0.55', display: 'flex', flexDirection: 'column' });
  left.append(
    el('div', { fontSize: '28px', fontWeight: '700', marginBottom: '10px' }, 'Thread Details'),
    line('Top Stitch TKT', base.topStitchTKT),
    line('Top Stitch Color', base.topStitchColor),
    line('Contrast Stitch TKT', base.contrastStitchTKT),
    line('Contrast Stitch Color', base.contrastStitchColor)
  );

  const right = el('div', { flex: '0.45', display: 'flex', flexDirection: 'column' });
  right.append(el('div', { fontSize: '28px', fontWeight: '700', marginBottom: '10px' }, 'Construction Detail Image'));
  const imgBox = el('div', { border: '2px dashed #e5e7eb', background: '#fafafa', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' });
  if (base.constructionDetailImage) {
    imgBox.append(imageEl(base.constructionDetailImage, { maxHeight: '980px' }));
  } else {
    imgBox.append(el('div', { color: '#9ca3af', fontSize: '24px' }, 'No construction image'));
  }
  right.append(imgBox);

  body.append(left, right);
  page.append(header, body);
  return page;
}

function buildPage3(styleName, variants) {
  const page = el('div', {
    width: `${PAGE_W}px`, height: `${PAGE_H}px`, background: '#fff', boxSizing: 'border-box', padding: `${PADDING}px`,
    fontFamily: 'Arial, Helvetica, sans-serif', color: '#111'
  });

  const header = el('div', {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    borderBottom: '6px solid #000', paddingBottom: '14px'
  });
  header.append(
    el('div', { fontSize: '40px', fontWeight: '800' }, 'DETAILS TABLE'),
    el('div', { fontSize: '22px', color: '#111' }, safe(styleName || '').toUpperCase())
  );

  const columns = variants.map(v => v);
  const FIELDS = [
    { key: 'fabricCode', label: 'Fabric Code' },
    { key: 'color', label: 'Color' },
    { key: 'delivery', label: 'Delivery' },
    { key: 'fit', label: 'Fit' },
    { key: 'careLabel', label: 'Care Label' },
    { key: 'careLabelPlacement', label: 'Care Label Placement' },
    { key: 'mainLabelPlacement', label: 'Main Label Placement' },
    { key: 'sizeLabelPlacement', label: 'Size Label Placement' },
    { key: 'trimFabricPlacement', label: 'Trim Fabric Placement' },
    { key: 'brandingLabel1Placement', label: 'Branding Label 1 Placement' },
    { key: 'brandingLabel2Placement', label: 'Branding Label 2 Placement' },
    { key: 'trim1Placement', label: 'Trim 1 Placement' },
    { key: 'trim2Placement', label: 'Trim 2 Placement' },
    { key: 'washOption', label: 'Wash Option' },
    { key: 'specialTag1', label: 'Special Tag 1' },
    { key: 'specialTag1Placement', label: 'Special Tag 1 Placement' },
    { key: 'specialTag2', label: 'Special Tag 2' },
    { key: 'specialTag2Placement', label: 'Special Tag 2 Placement' },
    { key: 'primaryButtonType', label: 'Primary Button Type' },
    { key: 'primaryButtonCount', label: 'Primary Button Count' },
    { key: 'primaryButtonPlacement', label: 'Primary Button Placement' },
    { key: 'secondaryButtonType', label: 'Secondary Button Type' },
    { key: 'secondaryButtonCount', label: 'Secondary Button Count' },
    { key: 'secondaryButtonPlacement', label: 'Secondary Button Placement' },
  ];

  const body = el('div', { marginTop: '18px' });
  body.append(detailsTable(FIELDS, columns));

  page.append(header, body);
  return page;
}

// ---------- Render helpers ----------
async function renderPageToPng(node) {
  const canvas = await html2canvas(node, {
    backgroundColor: '#ffffff',
    scale: 1,
    useCORS: true,
    imageTimeout: 15000,
  });
  return canvas.toDataURL('image/png');
}

async function buildPdfFromPages(pagesPng) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [PAGE_W, PAGE_H], compress: true });
  pagesPng.forEach((png, idx) => {
    if (idx > 0) doc.addPage([PAGE_W, PAGE_H], 'landscape');
    doc.addImage(png, 'PNG', 0, 0, PAGE_W, PAGE_H);
  });
  return doc.output('blob');
}

function styleFileName(styleName) {
  return `${safe(styleName).toUpperCase().replace(/[^\w\-]+/g, '_')}.pdf`;
}

// ---------- Public API ----------
export async function downloadDocketsZip(rows = []) {
  const groups = groupByStyle(rows);
  if (!groups.size) {
    alert('No styles found to generate dockets.');
    return;
  }

  const host = createHost();
  const zip = new JSZip();

  try {
    for (const [styleKey, variants] of groups.entries()) {
      try {
        const base = variants[0] || {};
        const styleName = base.name || styleKey;

        const page1 = buildPage1(styleName, base, variants);
        const page2 = buildPage2(base);
        const page3 = buildPage3(styleName, variants);

        host.innerHTML = ''; host.appendChild(page1);
        const img1 = await renderPageToPng(page1);

        host.innerHTML = ''; host.appendChild(page2);
        const img2 = await renderPageToPng(page2);

        host.innerHTML = ''; host.appendChild(page3);
        const img3 = await renderPageToPng(page3);

        const pdfBlob = await buildPdfFromPages([img1, img2, img3]);
        zip.file(styleFileName(styleName), pdfBlob);
      } catch (err) {
        console.error(`Failed to build docket for style "${styleKey}":`, err);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'DOCKETS.zip');
  } catch (err) {
    console.error('Failed to generate ZIP:', err);
    alert(`Failed to generate ZIP: ${err?.message || err}`);
  } finally {
    host.remove();
  }
}
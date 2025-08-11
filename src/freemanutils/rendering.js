export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function findButtonFromValue(buttons, value) {
  // value format: "CODE|SIZE"
  const [code, size] = String(value || '').split('|');
  return buttons.find(b => b.code === code && b.size === size);
}

export function renderTemplateHtmlForRow(template, row, buttons) {
  let html = String(template);

  const imageHTML = row.image ? `<img src="${row.image}" alt="${escapeHtml(row.name)}" style="max-height:220px; object-fit:contain;" />` : '';

  let buttonHTML = '';
  if (row.button) {
    const btn = findButtonFromValue(buttons, row.button);
    buttonHTML = btn?.image
      ? `<img src="${btn.image}" alt="${escapeHtml(btn.code)}" style="height:28px; object-fit:contain;" />`
      : escapeHtml(row.button);
  }

  html = html.split('{{image}}').join(imageHTML);
  html = html.split('{{button}}').join(buttonHTML);
  html = html.split('{{name}}').join(escapeHtml(row.name || ''));
  html = html.split('{{code}}').join(escapeHtml(row.code || ''));

  return html;
}
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { renderTemplateHtmlForRow } from './rendering';

export async function exportRowsToPDF(rows, template, buttons) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);

  const pages = rows.map((r) => {
    const page = document.createElement('div');
    page.style.width = '800px';
    page.style.padding = '0 0 24px 0';
    page.innerHTML = renderTemplateHtmlForRow(template, r, buttons);
    container.appendChild(page);
    return page;
  });

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });

  for (let i = 0; i < pages.length; i++) {
    const node = pages[i];
    const canvas = await html2canvas(node, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  }

  pdf.save('shirts-by-page.pdf');
  document.body.removeChild(container);
}
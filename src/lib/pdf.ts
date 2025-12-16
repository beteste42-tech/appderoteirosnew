import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportElementToPdf(element: HTMLElement, opts: { fileName?: string; title?: string; subtitle?: string }) {
  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
  pdf.save(opts.fileName || 'export.pdf');
}

export async function exportElementsToPdf(elements: HTMLElement[], opts: { fileName?: string; title?: string; subtitle?: string }) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  for (let i = 0; i < elements.length; i++) {
    const canvas = await html2canvas(elements[i]);
    const imgData = canvas.toDataURL('image/png');
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
  }
  pdf.save(opts.fileName || 'export.pdf');
}

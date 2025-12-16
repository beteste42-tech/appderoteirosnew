import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type InfoItem = { label: string; value: string };

const fetchImageAsDataUrl = async (url: string) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
};

export const exportElementToPdf = async (
  element: HTMLElement,
  opts: { fileName?: string; title: string; subtitle?: string; info?: InfoItem[]; logoUrl?: string }
) => {
  const canvas = await html2canvas(element, { backgroundColor: '#ffffff', scale: 2, useCORS: true });
  const imgData = canvas.toDataURL('image/png');
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(14, 165, 233);
  doc.rect(0, 0, pageWidth, 32, 'F');

  let logoX = 12;
  if (opts.logoUrl) {
    const logo = await fetchImageAsDataUrl(opts.logoUrl);
    if (logo) {
      doc.addImage(logo, 'PNG', 10, 6, 20, 20);
      logoX = 34;
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text(opts.title, logoX, 15);
  if (opts.subtitle) {
    doc.setFontSize(12);
    doc.text(opts.subtitle, logoX, 23);
  }

  const info = opts.info || [];
  if (info.length) {
    const boxX = 10;
    const boxY = 38;
    const boxW = pageWidth - 20;
    const boxH = 32;
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(boxX, boxY, boxW, boxH, 3, 3, 'F');
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(11);
    const colW = boxW / 2;
    const leftItems = info.slice(0, Math.ceil(info.length / 2));
    const rightItems = info.slice(Math.ceil(info.length / 2));
    leftItems.forEach((item, idx) => {
      doc.text(`${item.label}: ${item.value}`, boxX + 6, boxY + 10 + idx * 8);
    });
    rightItems.forEach((item, idx) => {
      doc.text(`${item.label}: ${item.value}`, boxX + colW + 6, boxY + 10 + idx * 8);
    });
  }

  const imageTop = info.length ? 75 : 40;
  const imageMargin = 10;
  const maxImgW = pageWidth - imageMargin * 2;
  const imgW = maxImgW;
  const imgH = (canvas.height / canvas.width) * imgW;
  const finalH = Math.min(imgH, pageHeight - imageTop - 10);
  doc.addImage(imgData, 'PNG', imageMargin, imageTop, imgW, finalH);

  doc.save(opts.fileName || 'rota.pdf');
};

export const exportElementsToPdf = async (
  elements: HTMLElement[],
  opts: { fileName?: string; title: string; subtitle?: string; logoUrl?: string }
) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 0; i < elements.length; i++) {
    if (i > 0) doc.addPage('a4', 'p');
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, pageWidth, 32, 'F');
    let logoX = 12;
    if (opts.logoUrl) {
      const logo = await fetchImageAsDataUrl(opts.logoUrl);
      if (logo) {
        doc.addImage(logo, 'PNG', 10, 6, 20, 20);
        logoX = 34;
      }
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(opts.title, logoX, 15);
    if (opts.subtitle) {
      doc.setFontSize(12);
      doc.text(opts.subtitle, logoX, 23);
    }
    const canvas = await html2canvas(elements[i], { backgroundColor: '#ffffff', scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const imageTop = 40;
    const imageMargin = 10;
    const maxImgW = pageWidth - imageMargin * 2;
    const imgW = maxImgW;
    const imgH = (canvas.height / canvas.width) * imgW;
    const finalH = Math.min(imgH, pageHeight - imageTop - 10);
    doc.addImage(imgData, 'PNG', imageMargin, imageTop, imgW, finalH);
  }
  doc.save(opts.fileName || 'resumo.pdf');
};

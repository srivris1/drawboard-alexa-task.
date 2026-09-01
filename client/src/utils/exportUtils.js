import { jsPDF } from 'jspdf';

export function exportAsPNG(canvas, filename) {
  const name = filename || 'drawboard_canvas.png';

  const link = document.createElement('a');
  link.download = name;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportAsPDF(canvas, filename) {
  const name = filename || 'drawboard_canvas.pdf';

  const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: [canvas.width, canvas.height]
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(name);
}

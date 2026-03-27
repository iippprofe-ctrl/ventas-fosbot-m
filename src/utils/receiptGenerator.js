import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getSettings } from './store';

export const generateReceiptPDF = (sale, action = 'download') => {
  const img = new Image();
  img.src = 'logo.png';
  
  img.onload = () => {
    createPDF(img);
  };
  
  img.onerror = () => {
    createPDF(null);
  };

  const createPDF = (loadedImg) => {
    const doc = new jsPDF({ format: 'a5' }); 
    
    const settings = getSettings();
    
    if (loadedImg) {
      try {
        doc.addImage(loadedImg, 'PNG', 10, 8, 20, 20);
      } catch(e) {}
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(30, 131, 252);
    doc.text('FISBOT MAKER', 74, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text('Líder en robótica educativa', 74, 21, { align: 'center' });
    doc.text('Zona Villa Dolores, Plaza Juana Azurduy', 74, 26, { align: 'center' });
    doc.text(`Cel: ${settings.phone || settings.whatsapp || '-'}`, 74, 31, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(10, 35, 138, 35);
    
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text(`Recibo Nro:`, 10, 45);
    doc.setFont('helvetica', 'normal');
    doc.text(`${sale.receiptNumber}`, 35, 45);

    doc.setFont('helvetica', 'bold');
    doc.text(`Fecha:`, 10, 51);
    doc.setFont('helvetica', 'normal');
    doc.text(`${new Date(sale.timestamp).toLocaleString()}`, 25, 51);

    doc.setFont('helvetica', 'bold');
    doc.text(`Cliente:`, 10, 57);
    doc.setFont('helvetica', 'normal');
    doc.text(`${sale.customerName}`, 25, 57);

    doc.setFont('helvetica', 'bold');
    doc.text(`Punto de Venta:`, 10, 63);
    doc.setFont('helvetica', 'normal');
    doc.text(`${sale.sellerName}`, 40, 63);
    
    const tableData = sale.items.map(item => [
      item.quantity,
      item.name,
      `Bs. ${parseFloat(item.price * item.quantity).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['Cant.', 'Descripción', 'Subtotal']],
      body: tableData,
      theme: 'plain',
      headStyles: { fontStyle: 'bold', textColor: [0, 0, 0], fillColor: [240, 240, 240] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 
        0: { halign: 'center', cellWidth: 15 },
        2: { halign: 'right' } 
      }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL A PAGAR:', 60, finalY);
    doc.setTextColor(0, 150, 0); 
    doc.text(`Bs. ${parseFloat(sale.total).toFixed(2)}`, 138, finalY, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text('¡Gracias por su compra!', 74, finalY + 15, { align: 'center' });
    doc.text('Este recibo no es editable una vez generado.', 74, finalY + 20, { align: 'center' });

    if (action === 'print') {
      doc.autoPrint();
      const blob = doc.output('bloburl');
      window.open(blob, '_blank');
    } else {
      doc.save(`Recibo_${sale.receiptNumber}.pdf`);
    }
  };
};

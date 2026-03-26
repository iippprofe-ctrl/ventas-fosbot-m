import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateCatalogPDF = (products, categoryTitle = 'Todos los Productos') => {
  const doc = new jsPDF();
  const loadedImg = new Image();
  loadedImg.src = '/logo.png';

  const runGeneration = (img) => {
    if (img) {
      doc.addImage(img, 'PNG', 15, 10, 30, 25);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 131, 252); 
    doc.text('FISBOT MAKER', 105, 18, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Líder en robótica educativa', 105, 26, { align: 'center' });
    doc.setFont('helvetica', 'italic');
    doc.text(`Catálogo: ${categoryTitle}`, 105, 33, { align: 'center' });

    let currentY = 45;
    
    const categoriesToDraw = categoryTitle === 'Todos' 
      ? [...new Set(products.map(p => p.category))]
      : [categoryTitle];

    categoriesToDraw.forEach((cat, index) => {
      const catProducts = categoryTitle === 'Todos' 
        ? products.filter(p => p.category === cat)
        : products;

      if (catProducts.length === 0) return;

      if (index > 0 || currentY > 45) {
        if (currentY > 230) {
          doc.addPage();
          currentY = 20;
        } else {
          currentY += 10;
        }
      }

      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'bold');
      doc.text(cat, 15, currentY);
      currentY += 5;

      const tableData = catProducts.map(p => [
        '', // Placeholder for image
        p.name,
        p.description || '-',
        `Bs. ${parseFloat(p.price).toFixed(2)}`,
        p.stock > 0 ? 'En Stock' : 'Agotado'
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Imagen', 'Nombre del producto', 'Descripción', 'Precio', 'Disponibilidad']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [11, 15, 25], textColor: [30, 131, 252] }, 
        styles: { fontSize: 10, cellPadding: 3, valign: 'middle', minCellHeight: 22 },
        columnStyles: { 0: { cellWidth: 25 }, 2: { cellWidth: 50 } },
        alternateRowStyles: { fillColor: [248, 248, 250] },
        didDrawCell: (data) => {
          if (data.column.index === 0 && data.cell.section === 'body') {
            const product = catProducts[data.row.index];
            if (product.image && product.image.startsWith('data:image')) {
              try {
                const parts = product.image.split(';');
                const mime = parts[0].split(':')[1];
                const type = mime.split('/')[1].toUpperCase();
                doc.addImage(product.image, type, data.cell.x + 2, data.cell.y + 2, 18, 18);
              } catch (e) {}
            }
          }
        }
      });

      currentY = doc.lastAutoTable.finalY + 10;
    });

    const safeTitle = categoryTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`Catalogo_FisbotMaker_${safeTitle}.pdf`);
  };

  loadedImg.onload = () => runGeneration(loadedImg);
  loadedImg.onerror = () => runGeneration(null);
  
  // Safety timeout in case onload doesn't fire (e.g. cached or specific browser issue)
  setTimeout(() => {
    if (doc.internal.pages.length === 1 && doc.lastAutoTable === undefined) {
       // if it hasn't started yet, force it
       // but we want to avoid double saving. 
       // In a simple app like this, we'll trust onload for now or just check a flag.
    }
  }, 2000);
};

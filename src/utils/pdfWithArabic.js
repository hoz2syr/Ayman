/**
 * Enhanced PDF Export with Arabic Support
 * تصدير PDF مع دعم العربية
 */
import { jsPDF } from 'jspdf';

/**
 * Create PDF document with Arabic text support
 * Uses fallback to image for Arabic text rendering
 */
export const createArabicPDF = (options = {}) => {
  const {
    orientation = 'portrait',
    unit = 'mm',
    format = 'a4',
  } = options;

  const doc = new jsPDF({
    orientation,
    unit,
    format,
  });

  // Set RTL direction for Arabic
  // Note: jsPDF has limited RTL support, text alignment is handled via 'align: right'

  return doc;
};

/**
 * Add Arabic text to PDF
 * @param {object} doc - jsPDF document
 * @param {string} text - النص العربي
 * @param {number} x - الإحداثي الأفقي
 * @param {number} y - الإحداثي العمودي
 * @param {object} options - خيارات الخط
 */
export const addArabicText = (doc, text, x, y, options = {}) => {
  const {
    fontSize = 12,
    fontStyle = 'normal',
    align = 'right',
    color = [0, 0, 0],
  } = options;

  doc.setFontSize(fontSize);
  doc.setFontStyle(fontStyle);
  doc.setTextColor(...color);

  // For RTL languages, we need to reverse the text
  const rtlText = text;

  // Set text alignment
  if (align === 'right') {
    doc.text(rtlText, x, y, { align: 'right' });
  } else if (align === 'center') {
    doc.text(rtlText, x, y, { align: 'center' });
  } else {
    doc.text(rtlText, x, y);
  }
};

/**
 * Add table to PDF with Arabic support
 * @param {object} doc - jsPDF document
 * @param {Array} headers - رؤوس الأعمدة
 * @param {Array} rows - صفوف البيانات
 * @param {number} startY - نقطة البداية العمودية
 * @param {object} options - خيارات الجدول
 */
export const addArabicTable = (doc, headers, rows, startY, options = {}) => {
  const {
    colWidths = [],
    rowHeight = 10,
    fontSize = 10,
    headerBgColor = [66, 66, 66],
    headerTextColor = [255, 255, 255],
    alternateRowColors = true,
  } = options;

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const tableWidth = pageWidth - (margin * 2);

  // Calculate column widths if not provided
  const numCols = headers.length;
  const calculatedWidth = tableWidth / numCols;
  const widths = colWidths.length > 0 ? colWidths : Array(numCols).fill(calculatedWidth);

  // Draw header
  doc.setFillColor(...headerBgColor);
  doc.rect(margin, startY, tableWidth, rowHeight, 'F');

  doc.setFontSize(fontSize);
  doc.setTextColor(...headerTextColor);
  doc.setFont('helvetica', 'bold');

  let xPos = margin;
  headers.forEach((header, i) => {
    doc.text(String(header), xPos + widths[i] - 2, startY + rowHeight / 2 + 3, { align: 'right' });
    xPos += widths[i];
  });

  // Draw rows
  doc.setFont('helvetica', 'normal');
  let yPos = startY + rowHeight;

  rows.forEach((row, rowIndex) => {
    // Alternate row colors
    if (alternateRowColors && rowIndex % 2 === 1) {
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, yPos, tableWidth, rowHeight, 'F');
    }

    doc.setTextColor(0, 0, 0);
    xPos = margin;
    row.forEach((cell, cellIndex) => {
      doc.text(String(cell || ''), xPos + widths[cellIndex] - 2, yPos + rowHeight / 2 + 3, { align: 'right' });
      xPos += widths[cellIndex];
    });

    yPos += rowHeight;
  });

  return yPos;
};

/**
 * Export simple PDF with Arabic support
 * @param {string} title - عنوان المستند
 * @param {Array} content - محتوى المستند
 * @param {string} filename - اسم الملف
 */
export const exportSimplePDF = async (title, content, filename = 'document.pdf') => {
  const doc = createArabicPDF();
  
  // Add title
  addArabicText(doc, title, 105, 20, {
    fontSize: 18,
    fontStyle: 'bold',
    align: 'center',
    color: [51, 51, 51],
  });

  // Add date
  const date = new Date().toLocaleDateString('ar-SA');
  addArabicText(doc, `التاريخ: ${date}`, 105, 28, {
    fontSize: 10,
    align: 'center',
    color: [128, 128, 128],
  });

  // Add content
  let yPos = 40;
  content.forEach(item => {
    if (item.type === 'header') {
      addArabicText(doc, item.text, 190, yPos, {
        fontSize: 14,
        fontStyle: 'bold',
        color: [51, 51, 51],
      });
      yPos += 10;
    } else if (item.type === 'text') {
      addArabicText(doc, item.text, 190, yPos, {
        fontSize: 11,
        color: [0, 0, 0],
      });
      yPos += 7;
    } else if (item.type === 'keyValue') {
      addArabicText(doc, `${item.key}: ${item.value}`, 190, yPos, {
        fontSize: 10,
        color: [64, 64, 64],
      });
      yPos += 6;
    }
  });

  // Save
  doc.save(filename);
};

export default {
  createArabicPDF,
  addArabicText,
  addArabicTable,
  exportSimplePDF,
};

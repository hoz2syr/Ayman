import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const A4_WIDTH = 210;
const A4_HEIGHT = 297;
const MARGIN = 15;
const CONTENT_WIDTH = A4_WIDTH - (MARGIN * 2);

const colors = {
  primary: '#1e3a5f',
  secondary: '#3b82f6',
  gold: '#b8960c',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  text: '#1f2937',
  textLight: '#6b7280',
  border: '#e5e7eb',
  background: '#f9fafb',
};

const fonts = {
  normal: 'arial',
  bold: 'arial',
};

const createHeader = (doc, company, docNumber, title, date) => {
  const y = MARGIN;
  
  doc.setFillColor(colors.primary);
  doc.rect(0, y, A4_WIDTH, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('arial', 'bold');
  doc.text(company?.companyName || 'شركة البناء الحديث', A4_WIDTH / 2, y + 10, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('arial', 'normal');
  const companyInfo = [
    company?.phone ? `الهاتف: ${company.phone}` : null,
    company?.email ? `البريد: ${company.email}` : null,
    company?.address ? `العنوان: ${company.address}` : null,
  ].filter(Boolean).join(' | ');
  if (companyInfo) {
    doc.text(companyInfo, A4_WIDTH / 2, y + 17, { align: 'center' });
  }
  
  doc.setDrawColor(colors.gold);
  doc.setLineWidth(1);
  doc.line(MARGIN, y + 25, A4_WIDTH - MARGIN, y + 25);
  
  doc.setTextColor(colors.text);
  doc.setFontSize(18);
  doc.setFont('arial', 'bold');
  doc.text(title, A4_WIDTH / 2, y + 38, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(colors.textLight);
  doc.setFont('arial', 'normal');
  
  const dateStr = date ? format(new Date(date), 'yyyy/MM/dd', { locale: ar }) : format(new Date(), 'yyyy/MM/dd', { locale: ar });
  doc.text(`رقم الوثيقة: ${docNumber || '-'}`, A4_WIDTH - MARGIN, y + 45, { align: 'right' });
  doc.text(`التاريخ: ${dateStr}`, MARGIN, y + 45, { align: 'left' });
  
  return y + 55;
};

const createFooter = (doc, pageNum, totalPages, company) => {
  const y = A4_HEIGHT - 15;
  
  doc.setDrawColor(colors.border);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, A4_WIDTH - MARGIN, y);
  
  doc.setFontSize(8);
  doc.setTextColor(colors.textLight);
  
  const footerText = `تطبيق BuildMaster Pro - ${company?.companyName || 'نظام إدارة المشاريع'}`;
  doc.text(footerText, A4_WIDTH / 2, y + 5, { align: 'center' });
  
  doc.text(`صفحة ${pageNum} من ${totalPages}`, A4_WIDTH - MARGIN, y + 5, { align: 'right' });
  
  doc.text(format(new Date(), 'yyyy/MM/dd HH:mm', { locale: ar }), MARGIN, y + 5, { align: 'left' });
};

const addPageNumber = (doc) => {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
  }
};

export const generateInvoicePDF = async (invoice, company, items = []) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const exchangeRate = invoice.exchangeRate || 13000;
    
    let y = createHeader(doc, company, invoice.invoiceNumber, `فاتورة رقم ${invoice.invoiceNumber}`, invoice.issueDate);
    
    doc.setFillColor(colors.background);
    doc.rect(MARGIN, y, CONTENT_WIDTH, 25, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(colors.text);
    
    const clientInfo = [
      { label: 'اسم العميل', value: invoice.clientName || '-' },
      { label: 'الهاتف', value: invoice.clientPhone || '-' },
      { label: 'البريد الإلكتروني', value: invoice.clientEmail || '-' },
      { label: 'العنوان', value: invoice.clientAddress || '-' },
    ];
    
    clientInfo.forEach((info, idx) => {
      const x = MARGIN + (idx % 2 === 0 ? 0 : CONTENT_WIDTH / 2);
      const rowY = y + Math.floor(idx / 2) * 8 + 4;
      
      doc.setFont('arial', 'bold');
      doc.setTextColor(colors.textLight);
      doc.text(info.label + ':', x, rowY);
      
      doc.setFont('arial', 'normal');
      doc.setTextColor(colors.text);
      doc.text(info.value, x + 22, rowY);
    });
    
    y += 30;
    
    doc.setFillColor(colors.primary);
    doc.rect(MARGIN, y, CONTENT_WIDTH, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('arial', 'bold');
    doc.text('البنود', MARGIN + 2, y + 5.5);
    
    y += 10;
    
    const tableHeaders = ['الصنف', 'الوحدة', 'الكمية', 'السعر ($)', 'الإجمالي ($)', 'الإجمالي (ل.س)'];
    const colWidths = [60, 20, 20, 25, 30, 35];
    let x = MARGIN;
    
    doc.setFillColor(colors.background);
    doc.rect(MARGIN, y, CONTENT_WIDTH, 8, 'F');
    doc.setTextColor(colors.text);
    doc.setFontSize(9);
    doc.setFont('arial', 'bold');
    
    tableHeaders.forEach((header, idx) => {
      doc.text(header, x + colWidths[idx] / 2, y + 5.5, { align: 'center' });
      x += colWidths[idx];
    });
    
    y += 10;
    
    doc.setFont('arial', 'normal');
    let subtotal = 0;
    
    (invoice.items || []).forEach((item, index) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPriceUSD) || 0;
      const totalUSD = qty * price;
      const totalSYP = totalUSD * exchangeRate;
      subtotal += totalUSD;
      
      if (index % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(245, 247, 250);
      }
      doc.rect(MARGIN, y - 2, CONTENT_WIDTH, 8, 'F');
      
      x = MARGIN;
      doc.setTextColor(colors.text);
      doc.text(item.description || item.name || '-', x + colWidths[0] / 2, y + 3, { align: 'center' });
      x += colWidths[0];
      
      doc.text(item.unit || '-', x + colWidths[1] / 2, y + 3, { align: 'center' });
      x += colWidths[1];
      
      doc.text(qty.toString(), x + colWidths[2] / 2, y + 3, { align: 'center' });
      x += colWidths[2];
      
      doc.text(price.toLocaleString(), x + colWidths[3] / 2, y + 3, { align: 'center' });
      x += colWidths[3];
      
      doc.text(totalUSD.toLocaleString(), x + colWidths[4] / 2, y + 3, { align: 'center' });
      x += colWidths[4];
      
      doc.text(totalSYP.toLocaleString(), x + colWidths[5] / 2, y + 3, { align: 'center' });
      
      y += 8;
    });
    
    y += 5;
    
    doc.setDrawColor(colors.border);
    doc.line(MARGIN, y, A4_WIDTH - MARGIN, y);
    y += 8;
    
    const totals = [
      { label: 'المجموع الفرعي:', value: `${subtotal.toLocaleString()} $` },
      { label: 'بالتوقيت ل.س:', value: `${(subtotal * exchangeRate).toLocaleString()} ل.س` },
    ];
    
    if (invoice.discount && invoice.discount > 0) {
      totals.push({ label: 'الخصم:', value: `-${invoice.discount}%` });
    }
    
    if (invoice.tax && invoice.tax > 0) {
      totals.push({ label: 'الضريبة:', value: `+${invoice.tax}%` });
    }
    
    totals.forEach((total, idx) => {
      const labelX = MARGIN + 80;
      const valueX = A4_WIDTH - MARGIN;
      
      doc.setFont('arial', 'bold');
      doc.setTextColor(colors.textLight);
      doc.text(total.label, labelX, y + idx * 7);
      
      doc.setFont('arial', 'bold');
      doc.setTextColor(idx === totals.length - 1 ? colors.primary : colors.text);
      doc.text(total.value, valueX, y + idx * 7, { align: 'right' });
    });
    
    y += totals.length * 7 + 10;
    
    if (invoice.notes) {
      doc.setFillColor(colors.background);
      doc.rect(MARGIN, y, CONTENT_WIDTH, 20, 'F');
      doc.setFont('arial', 'bold');
      doc.setTextColor(colors.text);
      doc.text('ملاحظات:', MARGIN + 2, y + 5);
      doc.setFont('arial', 'normal');
      doc.setTextColor(colors.textLight);
      
      const splitNotes = doc.splitTextToSize(invoice.notes, CONTENT_WIDTH - 5);
      doc.text(splitNotes.slice(0, 3), MARGIN + 2, y + 12);
    }
    
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      createFooter(doc, i, pageCount, company);
    }
    
    doc.save(`فاتورة-${invoice.invoiceNumber}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return false;
  }
};

export const generateExpensesPDF = async (expenses, company, options = {}) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const { projectName = null, dateRange = null } = options;
    
    let y = createHeader(doc, company, null, 'تقرير المصاريف', new Date());
    
    if (projectName || dateRange) {
      doc.setFillColor(colors.background);
      doc.rect(MARGIN, y, CONTENT_WIDTH, 12, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(colors.text);
      
      if (projectName) {
        doc.setFont('arial', 'bold');
        doc.text(`المشروع: ${projectName}`, MARGIN + 2, y + 7);
      }
      if (dateRange) {
        doc.setFont('arial', 'normal');
        doc.text(`الفترة: ${dateRange}`, A4_WIDTH - MARGIN - 2, y + 7, { align: 'right' });
      }
      y += 18;
    }
    
    const tableHeaders = ['التاريخ', 'الوصف', 'الفئة', 'المشروع', 'المبلغ ($)', 'المبلغ (ل.س)'];
    const colWidths = [25, 50, 25, 35, 30, 30];
    let x = MARGIN;
    
    doc.setFillColor(colors.primary);
    doc.rect(MARGIN, y, CONTENT_WIDTH, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('arial', 'bold');
    
    tableHeaders.forEach((header, idx) => {
      doc.text(header, x + colWidths[idx] / 2, y + 5.5, { align: 'center' });
      x += colWidths[idx];
    });
    
    y += 10;
    
    let totalUSD = 0;
    let totalSYP = 0;
    const exchangeRate = 13000;
    
    doc.setFont('arial', 'normal');
    
    expenses.forEach((expense, index) => {
      const amountUSD = parseFloat(expense.amount) || 0;
      const amountSYP = (expense.amountSYP) ? parseFloat(expense.amountSYP) : (amountUSD * exchangeRate);
      totalUSD += amountUSD;
      totalSYP += amountSYP;
      
      if (index % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(245, 247, 250);
      }
      doc.rect(MARGIN, y - 2, CONTENT_WIDTH, 8, 'F');
      
      x = MARGIN;
      doc.setTextColor(colors.text);
      
      doc.text(expense.date || '-', x + colWidths[0] / 2, y + 3, { align: 'center' });
      x += colWidths[0];
      
      const desc = expense.description?.substring(0, 25) || '-';
      doc.text(desc, x + colWidths[1] / 2, y + 3, { align: 'center' });
      x += colWidths[1];
      
      doc.text(expense.category || '-', x + colWidths[2] / 2, y + 3, { align: 'center' });
      x += colWidths[2];
      
      doc.text(expense.projectName || '-', x + colWidths[3] / 2, y + 3, { align: 'center' });
      x += colWidths[3];
      
      doc.text(amountUSD.toLocaleString(), x + colWidths[4] / 2, y + 3, { align: 'center' });
      x += colWidths[4];
      
      doc.text(amountSYP.toLocaleString(), x + colWidths[5] / 2, y + 3, { align: 'center' });
      
      y += 8;
    });
    
    y += 5;
    doc.setDrawColor(colors.border);
    doc.line(MARGIN, y, A4_WIDTH - MARGIN, y);
    y += 8;
    
    doc.setFillColor(colors.primary);
    doc.rect(MARGIN, y, CONTENT_WIDTH, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('arial', 'bold');
    
    doc.text(`الإجمالي: ${totalUSD.toLocaleString()} $ / ${totalSYP.toLocaleString()} ل.س`, A4_WIDTH / 2, y + 6.5, { align: 'center' });
    
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      createFooter(doc, i, pageCount, company);
    }
    
    doc.save(`تقرير_المصاريف.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating expenses PDF:', error);
    return false;
  }
};

export const generateDecisionPDF = async (decision, company) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    let y = createHeader(doc, company, decision.decisionNumber, `قرار هندسي رقم ${decision.decisionNumber}`, decision.date);
    
    doc.setFillColor(colors.background);
    doc.rect(MARGIN, y, CONTENT_WIDTH, 20, 'F');
    
    doc.setFontSize(10);
    
    const info = [
      { label: 'الموضوع', value: decision.subject || '-' },
      { label: 'الجهة المسؤولة', value: decision.responsibleParty || '-' },
      { label: 'الحالة', value: decision.status || '-' },
      { label: 'الموعد النهائي', value: decision.dueDate || '-' },
    ];
    
    info.forEach((item, idx) => {
      const x = MARGIN + (idx % 2 === 0 ? 0 : CONTENT_WIDTH / 2);
      const rowY = y + Math.floor(idx / 2) * 7 + 5;
      
      doc.setFont('arial', 'bold');
      doc.setTextColor(colors.textLight);
      doc.text(item.label + ':', x, rowY);
      
      doc.setFont('arial', 'normal');
      doc.setTextColor(colors.text);
      doc.text(item.value, x + 25, rowY);
    });
    
    y += 25;
    
    doc.setFont('arial', 'bold');
    doc.setTextColor(colors.text);
    doc.setFontSize(12);
    doc.text('وصف المشكلة:', MARGIN, y);
    y += 7;
    
    doc.setFont('arial', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(colors.textLight);
    const descLines = doc.splitTextToSize(decision.description || '-', CONTENT_WIDTH);
    doc.text(descLines, MARGIN, y);
    y += descLines.length * 5 + 5;
    
    doc.setFont('arial', 'bold');
    doc.setTextColor(colors.text);
    doc.setFontSize(12);
    doc.text('القرار المتخذ:', MARGIN, y);
    y += 7;
    
    doc.setFont('arial', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(colors.textLight);
    const decisionLines = doc.splitTextToSize(decision.decision || '-', CONTENT_WIDTH);
    doc.text(decisionLines, MARGIN, y);
    
    if (decision.notes) {
      y += decisionLines.length * 5 + 10;
      
      doc.setFillColor(colors.background);
      doc.rect(MARGIN, y, CONTENT_WIDTH, 15, 'F');
      
      doc.setFont('arial', 'bold');
      doc.setTextColor(colors.text);
      doc.text('ملاحظات:', MARGIN + 2, y + 5);
      
      doc.setFont('arial', 'normal');
      doc.setTextColor(colors.textLight);
      const notesLines = doc.splitTextToSize(decision.notes, CONTENT_WIDTH - 5);
      doc.text(notesLines.slice(0, 2), MARGIN + 2, y + 11);
    }
    
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      createFooter(doc, i, pageCount, company);
    }
    
    doc.save(`قرار-${decision.decisionNumber}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating decision PDF:', error);
    return false;
  }
};

export const generateReportPDF = async (report, company) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    let y = createHeader(doc, company, report.reportNumber, `تقرير هندسي رقم ${report.reportNumber}`, report.date);
    
    doc.setFillColor(colors.background);
    doc.rect(MARGIN, y, CONTENT_WIDTH, 15, 'F');
    
    doc.setFontSize(10);
    
    const info = [
      { label: 'الموضوع', value: report.subject || '-' },
      { label: 'المهندس المسؤول', value: report.engineer || '-' },
    ];
    
    info.forEach((item, idx) => {
      doc.setFont('arial', 'bold');
      doc.setTextColor(colors.textLight);
      doc.text(item.label + ':', MARGIN + (idx * 100), y + 5 + idx * 7);
      
      doc.setFont('arial', 'normal');
      doc.setTextColor(colors.text);
      doc.text(item.value, MARGIN + (idx * 100) + 25, y + 5 + idx * 7);
    });
    
    y += 20;
    
    doc.setFont('arial', 'bold');
    doc.setTextColor(colors.text);
    doc.setFontSize(12);
    doc.text('الوصف التفصيلي:', MARGIN, y);
    y += 7;
    
    doc.setFont('arial', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(colors.textLight);
    const descLines = doc.splitTextToSize(report.description || '-', CONTENT_WIDTH);
    doc.text(descLines, MARGIN, y);
    y += descLines.length * 5 + 5;
    
    if (report.recommendations) {
      doc.setFont('arial', 'bold');
      doc.setTextColor(colors.text);
      doc.setFontSize(12);
      doc.text('التوصيات:', MARGIN, y);
      y += 7;
      
      doc.setFont('arial', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(colors.textLight);
      const recLines = doc.splitTextToSize(report.recommendations, CONTENT_WIDTH);
      doc.text(recLines, MARGIN, y);
    }
    
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      createFooter(doc, i, pageCount, company);
    }
    
    doc.save(`تقرير-${report.reportNumber}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating report PDF:', error);
    return false;
  }
};

export const generateContractPDF = async (contract, company) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    let y = createHeader(doc, company, contract.contractNumber, `عقد بيع رقم ${contract.contractNumber}`, contract.contractDate);
    
    doc.setFillColor(colors.background);
    doc.rect(MARGIN, y, CONTENT_WIDTH, 25, 'F');
    
    doc.setFontSize(10);
    
    const info = [
      { label: 'المشتري', value: contract.buyerName || '-' },
      { label: 'رقم هوية المشتري', value: contract.buyerId || '-' },
      { label: 'رقم الهاتف', value: contract.buyerPhone || '-' },
      { label: 'البريد الإلكتروني', value: contract.buyerEmail || '-' },
    ];
    
    info.forEach((item, idx) => {
      const x = MARGIN + (idx % 2 === 0 ? 0 : CONTENT_WIDTH / 2);
      const rowY = y + Math.floor(idx / 2) * 7 + 5;
      
      doc.setFont('arial', 'bold');
      doc.setTextColor(colors.textLight);
      doc.text(item.label + ':', x, rowY);
      
      doc.setFont('arial', 'normal');
      doc.setTextColor(colors.text);
      doc.text(item.value, x + 30, rowY);
    });
    
    y += 30;
    
    if (contract.unitId) {
      doc.setFillColor(colors.background);
      doc.rect(MARGIN, y, CONTENT_WIDTH, 15, 'F');
      
      doc.setFont('arial', 'bold');
      doc.setTextColor(colors.text);
      doc.text('معلومات الوحدة:', MARGIN + 2, y + 5);
      
      doc.setFont('arial', 'normal');
      doc.setTextColor(colors.textLight);
      doc.text(`المشروع: ${contract.projectName || '-'} - الطابق: ${contract.floor || '-'} - رقم الوحدة: ${contract.unitNumber || '-'}`, MARGIN + 2, y + 11);
      
      y += 20;
    }
    
    doc.setDrawColor(colors.primary);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, A4_WIDTH - MARGIN, y);
    y += 10;
    
    const priceInfo = [
      { label: 'سعر البيع:', value: `${(contract.sellingPrice || 0).toLocaleString()} ${contract.currency || '$'}` },
      { label: 'المقدم:', value: `${(contract.downPayment || 0).toLocaleString()} ${contract.currency || '$'}` },
      { label: 'طريقة الدفع:', value: contract.paymentMethod || '-' },
    ];
    
    priceInfo.forEach((item, idx) => {
      doc.setFont('arial', 'bold');
      doc.setTextColor(colors.text);
      doc.setFontSize(12);
      doc.text(item.label, MARGIN, y + idx * 8);
      
      doc.setFont('arial', 'normal');
      doc.setTextColor(colors.primary);
      doc.text(item.value, A4_WIDTH - MARGIN, y + idx * 8, { align: 'right' });
    });
    
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      createFooter(doc, i, pageCount, company);
    }
    
    doc.save(`عقد-${contract.contractNumber}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating contract PDF:', error);
    return false;
  }
};

export const generateLeadPDF = async (lead, company) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    let y = createHeader(doc, company, null, `بيانات العميل المحتمل`, lead.createdAt);
    
    doc.setFillColor(colors.background);
    doc.rect(MARGIN, y, CONTENT_WIDTH, 25, 'F');
    
    doc.setFontSize(10);
    
    const info = [
      { label: 'الاسم', value: lead.fullName || '-' },
      { label: 'رقم الهاتف', value: lead.phone || '-' },
      { label: 'البريد الإلكتروني', value: lead.email || '-' },
      { label: 'المشروع المهتم', value: lead.projectName || '-' },
      { label: 'الوحدة المطلوبة', value: lead.unitName || '-' },
      { label: 'الحالة', value: lead.stage || '-' },
      { label: 'الميزانية المتوقعة', value: lead.budget ? `${lead.budget.toLocaleString()}` : '-' },
    ];
    
    info.forEach((item, idx) => {
      const x = MARGIN + (idx % 2 === 0 ? 0 : CONTENT_WIDTH / 2);
      const rowY = y + Math.floor(idx / 2) * 7 + 5;
      
      doc.setFont('arial', 'bold');
      doc.setTextColor(colors.textLight);
      doc.text(item.label + ':', x, rowY);
      
      doc.setFont('arial', 'normal');
      doc.setTextColor(colors.text);
      doc.text(item.value, x + 30, rowY);
    });
    
    if (lead.notes) {
      y += 30;
      doc.setFillColor(colors.background);
      doc.rect(MARGIN, y, CONTENT_WIDTH, 15, 'F');
      
      doc.setFont('arial', 'bold');
      doc.setTextColor(colors.text);
      doc.text('ملاحظات:', MARGIN + 2, y + 5);
      
      doc.setFont('arial', 'normal');
      doc.setTextColor(colors.textLight);
      const notesLines = doc.splitTextToSize(lead.notes, CONTENT_WIDTH - 5);
      doc.text(notesLines.slice(0, 2), MARGIN + 2, y + 11);
    }
    
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      createFooter(doc, i, pageCount, company);
    }
    
    doc.save(`عميل-محتمل-${lead.fullName || 'data'}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating lead PDF:', error);
    return false;
  }
};

export default {
  generateInvoicePDF,
  generateExpensesPDF,
  generateDecisionPDF,
  generateReportPDF,
  generateContractPDF,
  generateLeadPDF,
};

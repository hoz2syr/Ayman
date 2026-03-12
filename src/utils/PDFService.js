import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs;

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
  white: '#ffffff',
};

const defaultFonts = {
  arabic: 'Cairo',
  normal: 'Cairo',
};

const formatDate = (date) => {
  if (!date) return new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  return new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatNumber = (num) => {
  const n = parseFloat(num || 0);
  return n.toLocaleString();
};

const createHeader = (company, docNumber, title, date) => ({
  columns: [
    {
      width: '*',
      stack: [
        { text: company?.name || 'اسم الشركة', style: 'companyName', margin: [0, 0, 0, 5] },
        company?.commercialRecord ? { text: `سجل تجاري: ${company.commercialRecord}`, style: 'companyInfo' } : {},
        company?.taxNumber ? { text: `الضريبة: ${company.taxNumber}`, style: 'companyInfo' } : {},
        company?.phone ? { text: `📞 ${company.phone}`, style: 'companyInfo' } : {},
        company?.address ? { text: `📍 ${company.address}`, style: 'companyInfo' } : {},
      ],
    },
    {
      width: 'auto',
      stack: [
        { text: docNumber || '', style: 'docNumber', alignment: 'right' },
        { text: formatDate(date), style: 'date', alignment: 'right' },
      ],
    },
  ],
  margin: [0, 0, 0, 10],
});

const createTitle = (title) => ({
  text: title,
  style: 'title',
  alignment: 'center',
  margin: [0, 0, 0, 15],
});

const createInfoGrid = (items) => ({
  table: {
    widths: ['*', '*'],
    body: items.reduce((rows, item, index) => {
      if (index % 2 === 0) {
        rows.push([
          { text: `${item.label}:`, style: 'infoLabel' },
          { text: item.value || '-', style: 'infoValue' },
        ]);
      } else {
        rows[rows.length - 1].push(
          { text: `${item.label}:`, style: 'infoLabel' },
          { text: item.value || '-', style: 'infoValue' }
        );
      }
      return rows;
    }, []),
  },
  layout: 'noBorders',
  margin: [0, 0, 0, 10],
});

const createFooter = (company) => ({
  columns: [
    {
      width: '*',
      stack: [
        { text: 'التوقيع المعتمد', style: 'signatureLabel', alignment: 'center' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 120, y2: 0, lineWidth: 1, lineColor: colors.text }] },
        { text: company?.ownerName || company?.owner || 'المدير العام', style: 'signatureLabel', alignment: 'center', margin: [0, 5, 0, 0] },
      ],
    },
    {
      width: '*',
      stack: [
        { text: 'الختم الرسمي', style: 'signatureLabel', alignment: 'center' },
        { canvas: [{ type: 'rect', x: 0, y: 0, w: 50, h: 50, r: 25, lineWidth: 2, lineColor: colors.gold }], alignment: 'center' },
      ],
    },
  ],
  margin: [0, 30, 0, 30],
});

const createPageNumber = (currentPage, pageCount) => ({
  text: `صفحة ${currentPage} من ${pageCount}`,
  style: 'pageNumber',
  alignment: 'center',
  margin: [0, 10, 0, 0],
});

const styles = {
  companyName: { fontSize: 16, bold: true, color: colors.primary, font: defaultFonts.arabic },
  companyInfo: { fontSize: 8, color: colors.textLight, font: defaultFonts.arabic },
  docNumber: { fontSize: 12, bold: true, color: colors.primary, font: defaultFonts.arabic },
  date: { fontSize: 9, color: colors.textLight, font: defaultFonts.arabic },
  title: { fontSize: 18, bold: true, color: colors.primary, font: defaultFonts.arabic },
  sectionTitle: { fontSize: 12, bold: true, color: colors.primary, font: defaultFonts.arabic, margin: [0, 10, 0, 5] },
  infoLabel: { fontSize: 10, color: colors.textLight, font: defaultFonts.arabic },
  infoValue: { fontSize: 10, bold: true, color: colors.text, font: defaultFonts.arabic },
  tableHeader: { fillColor: colors.primary, color: colors.white, bold: true, fontSize: 10, alignment: 'center', font: defaultFonts.arabic },
  tableCell: { fontSize: 9, alignment: 'center', color: colors.text, font: defaultFonts.arabic },
  tableCellBold: { fontSize: 9, bold: true, alignment: 'center', color: colors.text, font: defaultFonts.arabic },
  totalRow: { fillColor: colors.primary, color: colors.white, bold: true, fontSize: 11, alignment: 'center', font: defaultFonts.arabic },
  textBlock: { fontSize: 10, color: colors.text, lineHeight: 1.5, font: defaultFonts.arabic, alignment: 'justify' },
  notesTitle: { fontSize: 10, bold: true, color: colors.text, font: defaultFonts.arabic },
  notesText: { fontSize: 9, color: colors.textLight, font: defaultFonts.arabic },
  signatureLabel: { fontSize: 9, color: colors.textLight, font: defaultFonts.arabic },
  pageNumber: { fontSize: 9, color: colors.textLight, font: defaultFonts.arabic },
  currencyBox: { fontSize: 12, bold: true, color: colors.white, fillColor: colors.primary, alignment: 'center', font: defaultFonts.arabic },
};

export const generateInvoicePDF = async (data, company) => {
  try {
    const exchangeRate = data.exchangeRate || 13000;
    const subtotal = data.items?.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPriceUSD) || 0)), 0) || 0;
    const totalSYP = subtotal * exchangeRate;

    const infoItems = [
      { label: 'رقم الفاتورة', value: data.invoiceNumber },
      { label: 'التاريخ', value: formatDate(data.issueDate) },
      { label: 'الاستحقاق', value: data.dueDate ? formatDate(data.dueDate) : '-' },
      { label: 'الحالة', value: data.status },
      { label: 'اسم العميل', value: data.clientName },
      { label: 'الهاتف', value: data.clientPhone || '-' },
      { label: 'البريد الإلكتروني', value: data.clientEmail || '-' },
      { label: 'العنوان', value: data.clientAddress || '-' },
    ];

    const tableBody = [
      [
        { text: 'الصنف', ...styles.tableHeader },
        { text: 'الوحدة', ...styles.tableHeader },
        { text: 'الكمية', ...styles.tableHeader },
        { text: 'السعر ($)', ...styles.tableHeader },
        { text: 'الإجمالي ($)', ...styles.tableHeader },
        { text: 'الإجمالي (ل.س)', ...styles.tableHeader },
      ],
    ];

    data.items?.forEach((item, index) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPriceUSD) || 0;
      const total = qty * price;
      tableBody.push([
        { text: item.name || item.description || '-', ...styles.tableCell },
        { text: item.unit || '-', ...styles.tableCell },
        { text: formatNumber(qty), ...styles.tableCell },
        { text: formatNumber(price), ...styles.tableCell },
        { text: formatNumber(total), ...styles.tableCell },
        { text: formatNumber(total * exchangeRate), ...styles.tableCell },
      ]);
    });

    tableBody.push([
      { text: '', ...styles.tableCell },
      { text: '', ...styles.tableCell },
      { text: '', ...styles.tableCell },
      { text: 'الإجمالي:', ...styles.tableCellBold },
      { text: formatNumber(subtotal), ...styles.tableCellBold },
      { text: formatNumber(totalSYP), ...styles.tableCellBold },
    ]);

    const docDefinition = {
      content: [
        createHeader(company, data.invoiceNumber, `فاتورة رقم ${data.invoiceNumber}`, data.issueDate),
        createTitle(`فاتورة رقم ${data.invoiceNumber}`),
        { text: `التاريخ: ${formatDate(data.issueDate)}`, style: 'date', alignment: 'center', margin: [0, -10, 0, 10] },
        { text: 'معلومات الفاتورة والعميل', style: 'sectionTitle' },
        createInfoGrid(infoItems),
        data.projectName ? { text: `المشروع: ${data.projectName}`, style: 'notesTitle', margin: [0, 5, 0, 10] } : {},
        { text: 'البنود', style: 'sectionTitle' },
        { table: { body: tableBody }, layout: 'lightHorizontalLines' },
        { text: `المبلغ الإجمالي: ${formatNumber(subtotal)} دولار أمريكي = ${formatNumber(totalSYP)} ل.س`, style: 'currencyBox', margin: [0, 10, 0, 10], fillColor: colors.primary },
        data.notes ? { text: 'ملاحظات', style: 'sectionTitle' } : {},
        data.notes ? { text: data.notes, style: 'textBlock' } : {},
        createFooter(company),
      ],
      styles,
      defaultStyle: { font: defaultFonts.arabic, direction: 'rtl' },
      pageSize: 'A4',
      pageMargins: [25, 25, 25, 25],
      footer: (currentPage, pageCount) => createPageNumber(currentPage, pageCount),
    };

    const filename = `فاتورة-${data.invoiceNumber || 'document'}.pdf`;
    pdfMake.createPdf(docDefinition).download(filename);
    return true;
  } catch (error) {
    console.error('Invoice PDF Error:', error);
    throw error;
  }
};

export const generateExpensesPDF = async (data, company, options = {}) => {
  try {
    const { expenses = [], projectName, dateRange } = data;
    const exchangeRate = 13000;
    const totalUSD = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const totalSYP = totalUSD * exchangeRate;

    const tableBody = [
      [
        { text: 'التاريخ', ...styles.tableHeader },
        { text: 'الوصف', ...styles.tableHeader },
        { text: 'الفئة', ...styles.tableHeader },
        { text: 'المشروع', ...styles.tableHeader },
        { text: 'المبلغ ($)', ...styles.tableHeader },
        { text: 'المبلغ (ل.س)', ...styles.tableHeader },
      ],
    ];

    expenses.forEach(e => {
      tableBody.push([
        { text: e.date || '-', ...styles.tableCell },
        { text: (e.description || '-').substring(0, 30), ...styles.tableCell },
        { text: e.category || '-', ...styles.tableCell },
        { text: e.projectName || 'عام', ...styles.tableCell },
        { text: formatNumber(e.amount), ...styles.tableCell },
        { text: formatNumber((parseFloat(e.amount) || 0) * exchangeRate), ...styles.tableCell },
      ]);
    });

    tableBody.push([
      { text: '', ...styles.tableCell },
      { text: '', ...styles.tableCell },
      { text: '', ...styles.tableCell },
      { text: 'الإجمالي:', ...styles.tableCellBold },
      { text: formatNumber(totalUSD), ...styles.tableCellBold },
      { text: formatNumber(totalSYP), ...styles.tableCellBold },
    ]);

    const docDefinition = {
      content: [
        createHeader(company, dateRange || new Date().toISOString().split('T')[0], 'تقرير المصاريف', new Date()),
        createTitle('تقرير المصاريف'),
        projectName ? { text: `المشروع: ${projectName}`, style: 'notesTitle', margin: [0, 5, 0, 5] } : {},
        dateRange ? { text: `الفترة: ${dateRange}`, style: 'notesText', margin: [0, 0, 0, 10] } : {},
        { text: 'تفاصيل المصاريف', style: 'sectionTitle' },
        { table: { body: tableBody }, layout: 'lightHorizontalLines' },
        { text: `إجمالي المصاريف: ${formatNumber(totalUSD)} دولار أمريكي = ${formatNumber(totalSYP)} ل.س`, style: 'currencyBox', margin: [0, 10, 0, 10], fillColor: colors.primary },
        createFooter(company),
      ],
      styles,
      defaultStyle: { font: defaultFonts.arabic, direction: 'rtl' },
      pageSize: 'A4',
      pageMargins: [25, 25, 25, 25],
      footer: (currentPage, pageCount) => createPageNumber(currentPage, pageCount),
    };

    const filename = options.filename || 'تقرير_المصاريف.pdf';
    pdfMake.createPdf(docDefinition).download(filename);
    return true;
  } catch (error) {
    console.error('Expenses PDF Error:', error);
    throw error;
  }
};

export const generateDecisionPDF = async (data, company) => {
  try {
    const infoItems = [
      { label: 'رقم القرار', value: data.decisionNumber },
      { label: 'التاريخ', value: formatDate(data.date) },
      { label: 'الموضوع', value: data.subject },
      { label: 'الحالة', value: data.status },
      { label: 'الجهة المسؤولة', value: data.responsibleParty || '-' },
      { label: 'الموعد النهائي', value: data.dueDate ? formatDate(data.dueDate) : '-' },
    ];

    const docDefinition = {
      content: [
        createHeader(company, data.decisionNumber, `قرار هندسي رقم ${data.decisionNumber}`, data.date),
        createTitle(`قرار هندسي رقم ${data.decisionNumber}`),
        { text: 'معلومات القرار', style: 'sectionTitle' },
        createInfoGrid(infoItems),
        data.projectName ? { text: `المشروع: ${data.projectName}`, style: 'notesTitle', margin: [0, 5, 0, 10] } : {},
        data.description ? { text: 'وصف المشكلة', style: 'sectionTitle' } : {},
        data.description ? { text: data.description, style: 'textBlock' } : {},
        data.decision ? { text: 'القرار المتخذ', style: 'sectionTitle' } : {},
        data.decision ? { text: data.decision, style: 'textBlock' } : {},
        data.notes ? { text: 'ملاحظات', style: 'sectionTitle' } : {},
        data.notes ? { text: data.notes, style: 'textBlock' } : {},
        createFooter(company),
      ],
      styles,
      defaultStyle: { font: defaultFonts.arabic, direction: 'rtl' },
      pageSize: 'A4',
      pageMargins: [25, 25, 25, 25],
      footer: (currentPage, pageCount) => createPageNumber(currentPage, pageCount),
    };

    const filename = `قرار-${data.decisionNumber || 'document'}.pdf`;
    pdfMake.createPdf(docDefinition).download(filename);
    return true;
  } catch (error) {
    console.error('Decision PDF Error:', error);
    throw error;
  }
};

export const generateReportPDF = async (data, company) => {
  try {
    const infoItems = [
      { label: 'رقم التقرير', value: data.reportNumber },
      { label: 'التاريخ', value: formatDate(data.date) },
      { label: 'الموضوع', value: data.subject },
      { label: 'الحالة', value: data.status },
      { label: 'المهندس المسؤول', value: data.engineerName || data.engineer || '-' },
    ];

    const docDefinition = {
      content: [
        createHeader(company, data.reportNumber, `تقرير هندسي رقم ${data.reportNumber}`, data.date),
        createTitle(`تقرير هندسي رقم ${data.reportNumber}`),
        { text: 'معلومات التقرير', style: 'sectionTitle' },
        createInfoGrid(infoItems),
        data.projectName ? { text: `المشروع: ${data.projectName}`, style: 'notesTitle', margin: [0, 5, 0, 10] } : {},
        data.description ? { text: 'الوصف التفصيلي', style: 'sectionTitle' } : {},
        data.description ? { text: data.description, style: 'textBlock' } : {},
        data.recommendations ? { text: 'التوصيات', style: 'sectionTitle' } : {},
        data.recommendations ? { text: data.recommendations, style: 'textBlock' } : {},
        data.notes ? { text: 'ملاحظات', style: 'sectionTitle' } : {},
        data.notes ? { text: data.notes, style: 'textBlock' } : {},
        createFooter(company),
      ],
      styles,
      defaultStyle: { font: defaultFonts.arabic, direction: 'rtl' },
      pageSize: 'A4',
      pageMargins: [25, 25, 25, 25],
      footer: (currentPage, pageCount) => createPageNumber(currentPage, pageCount),
    };

    const filename = `تقرير-${data.reportNumber || 'document'}.pdf`;
    pdfMake.createPdf(docDefinition).download(filename);
    return true;
  } catch (error) {
    console.error('Report PDF Error:', error);
    throw error;
  }
};

export const generateContractPDF = async (data, company) => {
  try {
    const infoItems = [
      { label: 'رقم العقد', value: data.contractNumber },
      { label: 'التاريخ', value: formatDate(data.contractDate) },
      { label: 'المشتري', value: data.buyerName },
      { label: 'رقم الهوية', value: data.buyerId || '-' },
      { label: 'رقم الهاتف', value: data.buyerPhone || '-' },
      { label: 'البريد الإلكتروني', value: data.buyerEmail || '-' },
    ];

    const priceTable = {
      table: {
        body: [
          [
            { text: 'سعر البيع', style: 'infoLabel' },
            { text: `${formatNumber(data.sellingPrice)} ${data.currency || '$'}`, style: 'infoValue', alignment: 'right' },
          ],
          [
            { text: 'المقدم', style: 'infoLabel' },
            { text: `${formatNumber(data.downPayment)} ${data.currency || '$'}`, style: 'infoValue', alignment: 'right' },
          ],
          [
            { text: 'طريقة الدفع', style: 'infoLabel' },
            { text: data.paymentMethod || '-', style: 'infoValue', alignment: 'right' },
          ],
          [
            { text: 'المتبقي', style: 'infoLabel' },
            { text: `${formatNumber((parseFloat(data.sellingPrice) || 0) - (parseFloat(data.downPayment) || 0))} ${data.currency || '$'}`, style: 'infoValue', alignment: 'right' },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 10],
    };

    const docDefinition = {
      content: [
        createHeader(company, data.contractNumber, `عقد بيع رقم ${data.contractNumber}`, data.contractDate),
        createTitle(`عقد بيع رقم ${data.contractNumber}`),
        { text: 'معلومات العقد', style: 'sectionTitle' },
        createInfoGrid(infoItems),
        data.projectName ? { text: `المشروع: ${data.projectName}`, style: 'notesTitle', margin: [0, 5, 0, 5] } : {},
        data.unitNumber ? { text: `الوحدة: ${data.unitNumber} - الطابق: ${data.floor || '-'}`, style: 'notesText', margin: [0, 0, 0, 10] } : {},
        { text: 'معلومات الدفع', style: 'sectionTitle' },
        priceTable,
        data.notes ? { text: 'ملاحظات', style: 'sectionTitle' } : {},
        data.notes ? { text: data.notes, style: 'textBlock' } : {},
        createFooter(company),
      ],
      styles,
      defaultStyle: { font: defaultFonts.arabic, direction: 'rtl' },
      pageSize: 'A4',
      pageMargins: [25, 25, 25, 25],
      footer: (currentPage, pageCount) => createPageNumber(currentPage, pageCount),
    };

    const filename = `عقد-${data.contractNumber || 'document'}.pdf`;
    pdfMake.createPdf(docDefinition).download(filename);
    return true;
  } catch (error) {
    console.error('Contract PDF Error:', error);
    throw error;
  }
};

export const generateLeadPDF = async (data, company) => {
  try {
    const infoItems = [
      { label: 'الاسم', value: data.fullName || data.name },
      { label: 'رقم الهاتف', value: data.phone },
      { label: 'البريد الإلكتروني', value: data.email || '-' },
      { label: 'المشروع المهتم', value: data.projectName || '-' },
      { label: 'الوحدة المطلوبة', value: data.unitName || data.unit || '-' },
      { label: 'الحالة', value: data.stage || data.status || '-' },
      { label: 'الميزانية المتوقعة', value: data.budget ? `${formatNumber(data.budget)} $` : '-' },
      { label: 'التاريخ', value: formatDate(data.createdAt) },
    ];

    const docDefinition = {
      content: [
        createHeader(company, data.id || 'DATA', 'بيانات العميل المحتمل', data.createdAt),
        createTitle('بيانات العميل المحتمل'),
        { text: 'معلومات العميل', style: 'sectionTitle' },
        createInfoGrid(infoItems),
        data.notes ? { text: 'ملاحظات', style: 'sectionTitle' } : {},
        data.notes ? { text: data.notes, style: 'textBlock' } : {},
        createFooter(company),
      ],
      styles,
      defaultStyle: { font: defaultFonts.arabic, direction: 'rtl' },
      pageSize: 'A4',
      pageMargins: [25, 25, 25, 25],
      footer: (currentPage, pageCount) => createPageNumber(currentPage, pageCount),
    };

    const filename = `عميل-م-${data.fullName || data.name || 'data'}.pdf`;
    pdfMake.createPdf(docDefinition).download(filename);
    return true;
  } catch (error) {
    console.error('Lead PDF Error:', error);
    throw error;
  }
};

export const generateProjectPDF = async (data, company) => {
  try {
    const infoItems = [
      { label: 'اسم المشروع', value: data.name },
      { label: 'الموقع', value: data.location || '-' },
      { label: 'نوع المشروع', value: data.type || '-' },
      { label: 'الحالة', value: data.status },
      { label: 'تاريخ البدء', value: formatDate(data.startDate) },
      { label: 'تاريخ الانتهاء', value: data.endDate ? formatDate(data.endDate) : '-' },
      { label: 'المساحة', value: data.area ? `${data.area} م²` : '-' },
      { label: 'الوحدات', value: data.unitsCount || '-' },
    ];

    let content = [
      createHeader(company, data.projectNumber || data.id, `مشروع ${data.name}`, new Date()),
      createTitle(`مشروع ${data.name}`),
      { text: 'معلومات المشروع', style: 'sectionTitle' },
      createInfoGrid(infoItems),
    ];

    if (data.description) {
      content.push({ text: 'الوصف', style: 'sectionTitle' });
      content.push({ text: data.description, style: 'textBlock' });
    }

    if (data.units && data.units.length > 0) {
      const tableBody = [
        [
          { text: 'اسم الوحدة', ...styles.tableHeader },
          { text: 'الطابق', ...styles.tableHeader },
          { text: 'المساحة', ...styles.tableHeader },
          { text: 'السعر', ...styles.tableHeader },
          { text: 'الحالة', ...styles.tableHeader },
        ],
      ];

      data.units.forEach(u => {
        tableBody.push([
          { text: u.name || u.unitNumber || '-', ...styles.tableCell },
          { text: u.floor || '-', ...styles.tableCell },
          { text: u.area ? `${u.area} م²` : '-', ...styles.tableCell },
          { text: u.price ? formatNumber(u.price) : '-', ...styles.tableCell },
          { text: u.status || '-', ...styles.tableCell },
        ]);
      });

      content.push({ text: 'الوحدات', style: 'sectionTitle' });
      content.push({ table: { body: tableBody }, layout: 'lightHorizontalLines' });
    }

    content.push(createFooter(company));

    const docDefinition = {
      content,
      styles,
      defaultStyle: { font: defaultFonts.arabic, direction: 'rtl' },
      pageSize: 'A4',
      pageMargins: [25, 25, 25, 25],
      footer: (currentPage, pageCount) => createPageNumber(currentPage, pageCount),
    };

    const filename = `مشروع-${data.name || 'project'}.pdf`;
    pdfMake.createPdf(docDefinition).download(filename);
    return true;
  } catch (error) {
    console.error('Project PDF Error:', error);
    throw error;
  }
};

export default {
  generateInvoicePDF,
  generateExpensesPDF,
  generateDecisionPDF,
  generateReportPDF,
  generateContractPDF,
  generateLeadPDF,
  generateProjectPDF,
};

/**
 * خدمة تصدير PDF احترافية
 * تصميم: أبيض نظيف — نص أسود — بدون ألوان — أرقام لاتينية
 * الإصدار: 16.0 - مع خط Amiri للعربية و Roboto للأرقام
 */
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { getExchangeRate, formatDate, formatNumber } from './exportUtils';

pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs;

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
};

pdfMake.fonts = {
  Amiri: {
    normal: `${getBaseUrl()}/fonts/Amiri-Regular.ttf`,
    bold: `${getBaseUrl()}/fonts/Amiri-Bold.ttf`,
  },
  Roboto: {
    normal: `${getBaseUrl()}/fonts/Roboto-Regular.ttf`,
    bold: `${getBaseUrl()}/fonts/Roboto-Bold.ttf`,
  },
};

const BLACK = '#000000';
const GRAY  = '#555555';
const AR_FONT = 'Amiri';
const EN_FONT = 'Roboto';

// التحقق من صحة الصورة قبل استخدامها في PDF
// pdfMake في المتصفح يدعم فقط data URLs (base64)
const isValidImage = (imageSource) => {
  if (!imageSource) return false;
  const img = String(imageSource);
  // pdfMake في المتصفح يدعم فقط data URLs
  // يجب أن تكون base64 صالحة تبدأ بـ data:image/
  if (!img.startsWith('data:image/')) return false;
  
  // تحقق من أن لها امتداد صالح
  const validExtensions = ['png', 'jpeg', 'jpg', 'gif', 'webp'];
  const match = img.match(/^data:image\/(\w+);base64,/);
  if (!match) return false;
  
  return validExtensions.includes(match[1].toLowerCase());
};

// ─── دعم العربية ────────────────────────────────────────────────────────
const ar = (text) => {
  if (!text) return '';
  return String(text).replace(/ /g, '\u00A0');
};

const arNum = (num) => {
  return String(num);
};

// ─── أرقام لاتينية دائماً ────────────────────────────────────────────
const toLatinNum = (value) =>
  String(value).replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

const formatPrice = (price) => toLatinNum(formatNumber(price));

const usd = (amount, bold = false) => [
  { text: '$', font: EN_FONT, bold },
  { text: ' ' + formatPrice(amount), font: EN_FONT, bold },
];

const syp = (amount, bold = false) => [
  { text: formatPrice(amount), font: EN_FONT, bold },
  { text: ' ل.س', font: AR_FONT, bold },
];

// ─── القيم الفارغة / "الكل" ───────────────────────────────────────────
const BLANK_VALUES = ['الكل', 'كل', 'all', 'ALL', 'كل\u00A0المشاريع', 'none', 'undefined', 'null'];
const isBlank = (val) => !val || BLANK_VALUES.includes(String(val).trim());

// ─── أدوات التحميل ───────────────────────────────────────────────────
const downloadPDF = async (doc, filename = 'document.pdf') => {
  try { doc.download(filename); }
  catch { try { doc.open(); } catch { console.error('PDF error: unable to open'); } }
};
const openPDF = (doc) => { try { doc.open(); } catch (e) { console.error('PDF error:', e); } };

// ─── Layouts ──────────────────────────────────────────────────────────
const cleanLayout = {
  hLineWidth: () => 0, vLineWidth: () => 0,
  paddingTop: () => 5, paddingBottom: () => 5,
  paddingLeft: () => 6, paddingRight: () => 6,
};
const headerLineLayout = {
  hLineWidth: (i) => i === 1 ? 0.5 : 0,
  vLineWidth: () => 0,
  hLineColor: () => BLACK,
  paddingTop: () => 6, paddingBottom: () => 6,
  paddingLeft: () => 6, paddingRight: () => 6,
};

// ─── الترويسة ─────────────────────────────────────────────────────────
const createHeader = (company, title, subtitle = null) => {
  const stack = [];

  if (company?.logo && isValidImage(company.logo)) {
    try {
      stack.push({ image: company.logo, width: 60, height: 60, alignment: 'center', margin: [0, 0, 0, 6] });
    } catch (e) {
      console.warn('Invalid logo image, skipping:', e);
    }
  }

  if (company?.name) {
    stack.push({ text: ar(company.name), fontSize: 15, bold: true, color: BLACK, alignment: 'center', font: AR_FONT });
  }

  const info = [];
  if (company?.commercialRecord) info.push(`${ar('سجل\u00A0تجاري')}: ${company.commercialRecord}`);
  if (company?.taxNumber)        info.push(`${ar('الضريبة')}: ${company.taxNumber}`);
  if (company?.phone)            info.push(`${ar('الهاتف')}: ${company.phone}`);
  if (info.length > 0) {
    stack.push({ text: info.join('   |   '), fontSize: 8, color: GRAY, alignment: 'center', font: AR_FONT, margin: [0, 3, 0, 0] });
  }

  stack.push({
    canvas: [{ type: 'line', x1: 0, y1: 8, x2: 515, y2: 8, lineWidth: 0.8, lineColor: BLACK }],
    margin: [0, 6, 0, 0],
  });

  stack.push({ text: ar(title), fontSize: 13, bold: true, color: BLACK, alignment: 'center', font: AR_FONT, margin: [0, 8, 0, subtitle ? 3 : 4] });

  if (subtitle) {
    stack.push({ text: ar(subtitle), fontSize: 9, color: GRAY, alignment: 'center', font: AR_FONT, margin: [0, 0, 0, 4] });
  }

  return { stack, margin: [0, 0, 0, 14] };
};

// ─── صندوق معلومات ────────────────────────────────────────────────────
const makeInfoBox = (title, rows) => ({
  stack: [
    { text: ar(title), fontSize: 10, bold: true, color: BLACK, font: AR_FONT, margin: [0, 0, 0, 4] },
    {
      table: {
        widths: ['38%', '62%'],
        body: rows.map(([label, value]) => [
          { text: ar(label),    fontSize: 9, color: GRAY,  font: AR_FONT },
          { text: value || '-', fontSize: 9, color: BLACK, font: AR_FONT },
        ]),
      },
      layout: cleanLayout,
    },
  ],
  margin: [0, 0, 8, 10],
});

// ─── عنوان قسم ────────────────────────────────────────────────────────
const sec = (text) => ({ text: ar(text), fontSize: 10, bold: true, color: BLACK, font: AR_FONT, margin: [0, 12, 0, 4] });

// ─── خلية نصية مع دعم العربية ─────────────────────────────────────────
const textCell = (value, bold = false, align = 'right', color = BLACK) => {
  const val = value || '-';
  // For Arabic text, use right alignment
  return { 
    text: ar(String(val)), 
    fontSize: 9, 
    bold, 
    color, 
    font: AR_FONT, 
    alignment: align 
  };
};

// ─── خلية بها مبلغ $ ─────────────────────────────────────────────────
const usdCell = (amount, align = 'right') => {
  const formatted = formatNumber(amount);
  return { 
    text: '$ ' + formatted, 
    fontSize: 9, 
    color: BLACK, 
    font: EN_FONT,
    alignment: align 
  };
};

// ─── خلية بها مبلغ ل.س ────────────────────────────────────────────────
const sypCell = (amount, align = 'right') => {
  const formatted = formatNumber(amount);
  return { 
    text: formatted + ' ل.س', 
    fontSize: 9, 
    color: BLACK, 
    font: AR_FONT, 
    alignment: align 
  };
};

// ─── جدول الأصناف ─────────────────────────────────────────────────────
const createItemsTable = (items, exchangeRate) => {
  const hdr = (t) => ({ text: ar(t), fontSize: 9, bold: true, color: BLACK, font: AR_FONT, alignment: 'right' });

  const body = [
    [hdr('الصنف'), hdr('الوحدة'), hdr('الكمية'), hdr('السعر'), hdr('الإجمالي'), hdr('الإجمالي')],
    ...items.map(item => {
      const qty   = parseFloat(item.quantity)    || 0;
      const price = parseFloat(item.unitPriceUSD) || 0;
      const total = qty * price;
      return [
        textCell(item.name || '-', false, 'right'),
        textCell(item.unit || '-', false, 'center'),
        { text: arNum(formatPrice(qty)), fontSize: 9, color: BLACK, font: 'Roboto', alignment: 'center' },
        usdCell(price),
        usdCell(total),
        sypCell(total * exchangeRate),
      ];
    }),
  ];

  return {
    table: { headerRows: 1, widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'], body },
    layout: headerLineLayout,
    margin: [0, 4, 0, 8],
  };
};

// ─── ملخص الفاتورة ────────────────────────────────────────────────────
const createTotalSection = (subtotal, taxRate, total, exchangeRate) => {
  const taxAmount = subtotal * (taxRate / 100);
  const lbl = (t) => ({ text: ar(t), fontSize: 9, color: GRAY,  font: AR_FONT });
  const boldLbl = (t) => ({ text: ar(t), fontSize: 10, bold: true, color: BLACK, font: AR_FONT });

  return {
    columns: [
      { width: '*', text: '' },
      {
        width: 230,
        stack: [
          sec('ملخص\u00A0الفاتورة'),
          {
            table: {
              widths: ['*', 'auto'],
              body: [
                [ lbl('المجموع\u00A0الفرعي'),                              { text: usd(subtotal),  fontSize: 9,  color: BLACK, alignment: 'left' } ],
                [ lbl(`${ar('الضريبة')} (${toLatinNum(taxRate)}%)`),      { text: usd(taxAmount), fontSize: 9,  color: BLACK, alignment: 'left' } ],
                [ boldLbl('الإجمالي\u00A0المطلوب'),                         { text: usd(total, true), fontSize: 10, color: BLACK, alignment: 'left' } ],
                [ lbl('ما\u00A0يعادل\u00A0بالليرة'),                       { text: syp(total * exchangeRate), fontSize: 8, color: GRAY, alignment: 'left' } ],
              ],
            },
            layout: {
              hLineWidth: (i, node) => i === node.table.body.length - 2 ? 0.5 : 0,
              vLineWidth: () => 0, hLineColor: () => BLACK,
              paddingTop: () => 5, paddingBottom: () => 5, paddingLeft: () => 6, paddingRight: () => 6,
            },
          },
        ],
      },
    ],
    margin: [0, 4, 0, 0],
  };
};

// ─── التذييل ──────────────────────────────────────────────────────────
const createFooter = (company, currentPage = null, pageCount = null) => {
  const stack = [];

  stack.push({
    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: BLACK }],
    margin: [0, 6, 0, 10],
  });

  const hasSignature = company?.signature && isValidImage(company.signature);
  const hasStamp = company?.stamp && isValidImage(company.stamp);

  if (hasSignature || hasStamp) {
    let sigCol = { width: 100, text: '' };
    let stampCol = { width: 100, text: '' };

    if (hasSignature) {
      try {
        sigCol = {
          stack: [
            { image: company.signature, width: 65, height: 28, alignment: 'center' },
            { canvas: [{ type: 'line', x1: 5, y1: 2, x2: 75, y2: 2, lineWidth: 0.5, lineColor: BLACK }], margin: [0, 4, 0, 0] },
            { text: ar('التوقيع\u00A0المعتمد'), fontSize: 7.5, color: GRAY, alignment: 'center', font: AR_FONT, margin: [0, 3, 0, 0] },
          ], width: 100,
        };
      } catch (e) {
        console.warn('Invalid signature image, skipping:', e);
      }
    }

    if (hasStamp) {
      try {
        stampCol = {
          stack: [
            { image: company.stamp, width: 52, height: 52, alignment: 'center' },
            { canvas: [{ type: 'line', x1: 5, y1: 2, x2: 65, y2: 2, lineWidth: 0.5, lineColor: BLACK }], margin: [0, 4, 0, 0] },
            { text: ar('الختم\u00A0الرسمي'), fontSize: 7.5, color: GRAY, alignment: 'center', font: AR_FONT, margin: [0, 3, 0, 0] },
          ], width: 100,
        };
      } catch (e) {
        console.warn('Invalid stamp image, skipping:', e);
      }
    }

    stack.push({ columns: [sigCol, { width: '*', text: '' }, stampCol] });
  }

  const dateStr = new Date().toLocaleDateString('en-GB');
  const pageStr = currentPage ? `   |   ${ar('صفحة')} ${currentPage} ${ar('من')} ${pageCount}` : '';
  stack.push({
    text: `${ar('تاريخ\u00A0الطباعة')}: ${dateStr}${pageStr}`,
    fontSize: 7, color: GRAY, alignment: 'center', font: AR_FONT, margin: [0, 10, 0, 0],
  });

  return { stack, margin: [40, 14, 40, 0] };
};

const pagedFooter = (company) => (p, total) => createFooter(company, p, total);

// ─── إعدادات مشتركة ───────────────────────────────────────────────────
const defaultStyle = { 
  font: AR_FONT, 
  fontSize: 10, 
  rtl: true, 
  color: BLACK,
  alignment: 'right',
  lineHeight: 1.3,
};

// ─── generateInvoicePDF ───────────────────────────────────────────────
export const generateInvoicePDF = async (data, company, options = {}) => {
  try {
    if (!data) throw new Error('بيانات الفاتورة مطلوبة');
    const exchangeRate = data.exchangeRate || getExchangeRate();
    const items = data.items || [];
    let subtotal = 0;
    items.forEach(i => { subtotal += (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPriceUSD) || 0); });
    const taxRate = parseFloat(data.taxRate) || 15;
    const total   = subtotal + subtotal * (taxRate / 100);
    const statusMap = { 'مدفوع': 'مدفوع', 'مفتوح': 'مفتوح', 'متأخر': 'متأخر' };

    const content = {
      pageSize: 'A4', pageMargins: [40, 40, 40, 60],
      content: [
        createHeader(company, `فاتورة\u00A0رقم: ${data.invoiceNumber || '-'}`),
        {
          columns: [
            { width: '50%', ...makeInfoBox('معلومات\u00A0الفاتورة', [
              ['رقم\u00A0الفاتورة',    data.invoiceNumber || '-'],
              ['التاريخ',              data.issueDate ? formatDate(data.issueDate) : '-'],
              ['تاريخ\u00A0الاستحقاق', data.dueDate   ? formatDate(data.dueDate)   : '-'],
              ['الحالة',               statusMap[data.status] || 'مسودة'],
            ])},
            { width: '50%', ...makeInfoBox('معلومات\u00A0العميل', [
              ['الاسم',   data.clientName    || '-'],
              ['البريد',  data.clientEmail   || '-'],
              ['الهاتف',  data.clientPhone   || '-'],
              ['العنوان', data.clientAddress || '-'],
            ])},
          ],
        },
      ],
      defaultStyle,
    };

    if (!isBlank(data.projectName)) {
      content.content.push({ text: `${ar('المشروع')}: ${data.projectName}`, fontSize: 9, color: GRAY, font: AR_FONT, margin: [0, 0, 0, 6] });
    }

    content.content.push(sec('بنود\u00A0الفاتورة'));
    content.content.push(createItemsTable(items, exchangeRate));
    content.content.push(createTotalSection(subtotal, taxRate, total, exchangeRate));

    if (data.notes) {
      content.content.push(sec('ملاحظات'));
      content.content.push({ text: data.notes, fontSize: 9, color: GRAY, font: AR_FONT });
    }

    content.footer = createFooter(company);
    const doc = pdfMake.createPdf(content);
    if (options.download !== false) await downloadPDF(doc, `فاتورة_${data.invoiceNumber || new Date().toISOString().split('T')[0]}.pdf`);
    else openPDF(doc);
    return { success: true };
  } catch (error) {
    console.error('PDF Error:', error);
    return { success: false, error: error.message };
  }
};

// ─── generateExpensesPDF ──────────────────────────────────────────────
export const generateExpensesPDF = async (data, company, options = {}) => {
  try {
    const { expenses = [], projectName, dateRange, exchangeRate: dataExchangeRate } = data;
    if (expenses.length === 0) throw new Error('لا توجد مصروفات للتصدير');

    // Use per-expense exchange rate or the provided default
    const exchangeRate = dataExchangeRate || getExchangeRate();
    let totalUSD = 0;
    expenses.forEach(e => { totalUSD += parseFloat(e.amount) || 0; });

    // بناء العنوان الفرعي — يتجاهل "الكل" من كلا الحقلين
    const hasProject  = !isBlank(projectName);
    const hasRange    = !isBlank(dateRange);
    let subtitle = null;
    if      (hasProject && hasRange) subtitle = `${projectName}  —  ${dateRange}`;
    else if (hasRange)               subtitle = `${ar('الفترة')}: ${dateRange}`;
    else if (hasProject)             subtitle = `${ar('المشروع')}: ${projectName}`;

    const hdr = (t) => ({ text: ar(t), fontSize: 9, bold: true, color: BLACK, font: AR_FONT, alignment: 'right' });

    const body = [
      [hdr('التاريخ'), hdr('الوصف'), hdr('الفئة'), hdr('المشروع'), hdr('المبلغ $'), hdr('المبلغ ل.س')],
      ...expenses.map(expense => {
        const amount = parseFloat(expense.amount) || 0;
        return [
          textCell(expense.date || '-', false, 'center'),
          textCell((expense.description || '-').substring(0, 30), false, 'right'),
          textCell(expense.category || '-', false, 'center'),
          textCell(expense.projectName || '-', false, 'center'),
          usdCell(amount),
          sypCell(amount * exchangeRate),
        ];
      }),
      [
        { text: ar('الإجمالي'), colSpan: 4, fontSize: 9, bold: true, color: BLACK, font: AR_FONT, alignment: 'right' },
        {}, {}, {},
        usdCell(totalUSD),
        sypCell(totalUSD * exchangeRate),
      ],
    ];

    const content = {
      pageSize: 'A4', pageMargins: [40, 40, 40, 60],
      content: [
        createHeader(company, 'تقرير\u00A0المصاريف', subtitle),
        sec('سجل\u00A0المصاريف'),
        {
          table: { headerRows: 1, widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'], body },
          layout: headerLineLayout,
          margin: [0, 4, 0, 8],
        },
      ],
      defaultStyle,
    };

    if (data.notes) {
      content.content.push(sec('ملاحظات'));
      content.content.push({ text: data.notes, fontSize: 9, color: GRAY, font: AR_FONT });
    }

    content.footer = pagedFooter(company);
    const doc = pdfMake.createPdf(content);
    const safeName = hasProject ? projectName : 'عام';
    if (options.download !== false) await downloadPDF(doc, `مصاريف_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`);
    else openPDF(doc);
    return { success: true };
  } catch (error) {
    console.error('PDF Error:', error);
    return { success: false, error: error.message };
  }
};

// ─── generateContractPDF ──────────────────────────────────────────────
export const generateContractPDF = async (data, company, options = {}) => {
  try {
    if (!data) throw new Error('بيانات العقد مطلوبة');
    const sellingPrice = parseFloat(data.sellingPrice) || 0;
    const downPayment  = parseFloat(data.downPayment)  || 0;
    const remaining    = sellingPrice - downPayment;

    const content = {
      pageSize: 'A4', pageMargins: [40, 40, 40, 60],
      content: [
        createHeader(company, `عقد\u00A0بيع\u00A0رقم: ${data.contractNumber || '-'}`),
        {
          columns: [
            { width: '50%', ...makeInfoBox('معلومات\u00A0العقد', [
              ['رقم\u00A0العقد',   data.contractNumber || '-'],
              ['التاريخ',          data.contractDate ? formatDate(data.contractDate) : '-'],
              ['الحالة',           data.status || '-'],
            ])},
            { width: '50%', ...makeInfoBox('معلومات\u00A0المشتري', [
              ['الاسم',            data.buyerName  || '-'],
              ['رقم\u00A0الهوية',  data.buyerId    || '-'],
              ['الهاتف',           data.buyerPhone || '-'],
              ['البريد',           data.buyerEmail || '-'],
            ])},
          ],
        },
        sec('تفاصيل\u00A0العقار'),
        {
          table: {
            widths: ['30%', '70%'],
            body: [
              [ { text: ar('المشروع'), fontSize: 9, color: GRAY,  font: AR_FONT }, textCell(data.projectName || '-', false, 'right') ],
              [ { text: ar('الوحدة'),  fontSize: 9, color: GRAY,  font: AR_FONT }, textCell(`${data.unitNumber || '-'} - ${ar('الطابق')}: ${data.floor || '-'}`, false, 'right') ],
            ],
          },
          layout: cleanLayout, margin: [0, 0, 0, 8],
        },
        sec('معلومات\u00A0الدفع'),
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 230,
              table: {
                widths: ['*', 'auto'],
                body: [
                  [ { text: ar('سعر\u00A0البيع'), fontSize: 9, color: GRAY, font: AR_FONT }, { text: usd(sellingPrice), fontSize: 9, color: BLACK, alignment: 'left' } ],
                  [ { text: ar('المقدم'),          fontSize: 9, color: GRAY, font: AR_FONT }, { text: usd(downPayment),  fontSize: 9, color: BLACK, alignment: 'left' } ],
                  [ { text: ar('المتبقي'),          fontSize: 10, bold: true, color: BLACK, font: AR_FONT }, { text: usd(remaining, true), fontSize: 10, color: BLACK, alignment: 'left' } ],
                ],
              },
              layout: {
                hLineWidth: (i, node) => i === node.table.body.length - 1 ? 0.5 : 0,
                vLineWidth: () => 0, hLineColor: () => BLACK,
                paddingTop: () => 5, paddingBottom: () => 5, paddingLeft: () => 6, paddingRight: () => 6,
              },
            },
          ],
        },
      ],
      defaultStyle,
    };

    if (data.notes) {
      content.content.push(sec('ملاحظات'));
      content.content.push({ text: data.notes, fontSize: 9, color: GRAY, font: AR_FONT });
    }

    content.footer = createFooter(company);
    const doc = pdfMake.createPdf(content);
    if (options.download !== false) await downloadPDF(doc, `عقد_${data.contractNumber || new Date().toISOString().split('T')[0]}.pdf`);
    else openPDF(doc);
    return { success: true };
  } catch (error) {
    console.error('PDF Error:', error);
    return { success: false, error: error.message };
  }
};

// ─── generateDecisionPDF ─────────────────────────────────────────────
export const generateDecisionPDF = async (data, company, options = {}) => {
  try {
    if (!data) throw new Error('بيانات القرار مطلوبة');

    const content = {
      pageSize: 'A4', pageMargins: [40, 40, 40, 60],
      content: [
        createHeader(company, `قرار\u00A0هندسي\u00A0رقم: ${data.decisionNumber || '-'}`),
        {
          columns: [
            { width: '50%', ...makeInfoBox('معلومات\u00A0القرار', [
              ['رقم\u00A0القرار',      data.decisionNumber || '-'],
              ['التاريخ',              data.date    ? formatDate(data.date)    : '-'],
              ['الحالة',               data.status  || '-'],
              ['الموعد\u00A0النهائي',  data.dueDate ? formatDate(data.dueDate) : '-'],
            ])},
            { width: '50%', ...makeInfoBox('معلومات\u00A0إضافية', [
              ['الجهة\u00A0المسؤولة', data.responsibleParty || '-'],
              ['المشروع',              data.projectName      || '-'],
            ])},
          ],
        },
      ],
      defaultStyle,
    };

    if (data.subject)     { content.content.push(sec('الموضوع'));             content.content.push({ text: data.subject,     fontSize: 9, color: BLACK, font: AR_FONT }); }
    if (data.description) { content.content.push(sec('وصف\u00A0المشكلة'));   content.content.push({ text: data.description, fontSize: 9, color: BLACK, font: AR_FONT }); }
    if (data.decision)    { content.content.push(sec('القرار\u00A0المتخذ'));  content.content.push({ text: data.decision,    fontSize: 9, color: BLACK, font: AR_FONT }); }
    if (data.notes)       { content.content.push(sec('ملاحظات'));             content.content.push({ text: data.notes,       fontSize: 9, color: GRAY,  font: AR_FONT }); }

    content.footer = createFooter(company);
    const doc = pdfMake.createPdf(content);
    if (options.download !== false) await downloadPDF(doc, `قرار_${data.decisionNumber || new Date().toISOString().split('T')[0]}.pdf`);
    else openPDF(doc);
    return { success: true };
  } catch (error) {
    console.error('PDF Error:', error);
    return { success: false, error: error.message };
  }
};

// ─── generateReportPDF ────────────────────────────────────────────────
export const generateReportPDF = async (data, company, options = {}) => {
  try {
    if (!data) throw new Error('بيانات التقرير مطلوبة');

    const content = {
      pageSize: 'A4', pageMargins: [40, 40, 40, 60],
      content: [
        createHeader(company, `تقرير\u00A0هندسي\u00A0رقم: ${data.reportNumber || '-'}`),
        {
          columns: [
            { width: '50%', ...makeInfoBox('معلومات\u00A0التقرير', [
              ['رقم\u00A0التقرير',     data.reportNumber || '-'],
              ['التاريخ',              data.date ? formatDate(data.date) : '-'],
              ['الحالة',               data.status || '-'],
            ])},
            { width: '50%', ...makeInfoBox('معلومات\u00A0إضافية', [
              ['المهندس\u00A0المسؤول', data.engineerName || data.engineer || '-'],
              ['المشروع',              data.projectName  || '-'],
            ])},
          ],
        },
      ],
      defaultStyle,
    };

    if (data.subject)         { content.content.push(sec('الموضوع'));              content.content.push({ text: data.subject,          fontSize: 9, color: BLACK, font: AR_FONT }); }
    if (data.description)     { content.content.push(sec('الوصف\u00A0التفصيلي')); content.content.push({ text: data.description,     fontSize: 9, color: BLACK, font: AR_FONT }); }
    if (data.recommendations) { content.content.push(sec('التوصيات'));             content.content.push({ text: data.recommendations, fontSize: 9, color: BLACK, font: AR_FONT }); }
    if (data.notes)           { content.content.push(sec('ملاحظات'));              content.content.push({ text: data.notes,           fontSize: 9, color: GRAY,  font: AR_FONT }); }

    content.footer = createFooter(company);
    const doc = pdfMake.createPdf(content);
    if (options.download !== false) await downloadPDF(doc, `تقرير_${data.reportNumber || new Date().toISOString().split('T')[0]}.pdf`);
    else openPDF(doc);
    return { success: true };
  } catch (error) {
    console.error('PDF Error:', error);
    return { success: false, error: error.message };
  }
};

// ─── generateLeadPDF ──────────────────────────────────────────────────
export const generateLeadPDF = async (data, company, options = {}) => {
  try {
    if (!data) throw new Error('بيانات العميل مطلوبة');

    const lbl = (t) => ({ text: ar(t), fontSize: 9, color: GRAY, font: AR_FONT });

    const content = {
      pageSize: 'A4', pageMargins: [40, 40, 40, 60],
      content: [
        createHeader(company, 'بيانات\u00A0العميل\u00A0المحتمل'),
        {
          columns: [
            { width: '50%', ...makeInfoBox('معلومات\u00A0شخصية', [
              ['الاسم',                 data.fullName || data.name || '-'],
              ['رقم\u00A0الهاتف',       data.phone    || '-'],
              ['البريد\u00A0الإلكتروني', data.email   || '-'],
              ['التاريخ',               data.createdAt ? formatDate(data.createdAt) : '-'],
            ])},
            {
              width: '50%',
              stack: [
                { text: ar('معلومات\u00A0المشروع'), fontSize: 10, bold: true, color: BLACK, font: AR_FONT, margin: [0, 0, 0, 4] },
                {
                  table: {
                    widths: ['38%', '62%'],
                    body: [
                      [ lbl('المشروع\u00A0المهتم'),  textCell(data.projectName || '-', false, 'right') ],
                      [ lbl('الوحدة\u00A0المطلوبة'), textCell(data.unitName || data.unit || '-', false, 'right') ],
                      [ lbl('الحالة'),                textCell(data.stage || data.status || '-', false, 'right') ],
                      [ lbl('الميزانية'),
                        data.budget && !isBlank(String(data.budget))
                          ? { text: usd(data.budget), fontSize: 9, color: BLACK, alignment: 'right' }
                          : textCell('-', false, 'right')
                      ],
                    ],
                  },
                  layout: cleanLayout,
                },
              ],
              margin: [0, 0, 8, 10],
            },
          ],
        },
      ],
      defaultStyle,
    };

    if (data.notes) {
      content.content.push(sec('ملاحظات'));
      content.content.push({ text: data.notes, fontSize: 9, color: GRAY, font: AR_FONT });
    }

    content.footer = createFooter(company);
    const doc = pdfMake.createPdf(content);
    if (options.download !== false) await downloadPDF(doc, `عميل_${data.fullName || 'محتمل'}_${new Date().toISOString().split('T')[0]}.pdf`);
    else openPDF(doc);
    return { success: true };
  } catch (error) {
    console.error('PDF Error:', error);
    return { success: false, error: error.message };
  }
};

// ─── generateProjectPDF ───────────────────────────────────────────────
export const generateProjectPDF = async (data, company, options = {}) => {
  try {
    if (!data) throw new Error('بيانات المشروع مطلوبة');

    const content = {
      pageSize: 'A4', pageMargins: [40, 40, 40, 60],
      content: [
        createHeader(company, `مشروع: ${data.name || '-'}`),
        {
          columns: [
            { width: '50%', ...makeInfoBox('معلومات\u00A0المشروع', [
              ['اسم\u00A0المشروع', data.name     || '-'],
              ['الموقع',           data.location || '-'],
              ['نوع\u00A0المشروع', data.type     || '-'],
              ['الحالة',           data.status   || '-'],
            ])},
            { width: '50%', ...makeInfoBox('التواريخ\u00A0والأرقام', [
              ['تاريخ\u00A0البدء',    data.startDate ? formatDate(data.startDate) : '-'],
              ['تاريخ\u00A0الانتهاء', data.endDate   ? formatDate(data.endDate)   : '-'],
              ['المساحة',             data.area       ? toLatinNum(data.area) + ' م²' : '-'],
              ['الوحدات',             data.unitsCount ? toLatinNum(data.unitsCount)   : '-'],
            ])},
          ],
        },
      ],
      defaultStyle,
    };

    if (data.description) {
      content.content.push(sec('الوصف'));
      content.content.push({ text: data.description, fontSize: 9, color: BLACK, font: AR_FONT, margin: [0, 0, 0, 8] });
    }

    if (data.units && data.units.length > 0) {
      content.content.push(sec('الوحدات'));
      const hdr = (t) => ({ text: ar(t), fontSize: 9, bold: true, color: BLACK, font: AR_FONT, alignment: 'right' });
      const body = [
        [hdr('اسم الوحدة'), hdr('الطابق'), hdr('المساحة'), hdr('السعر'), hdr('الحالة')],
        ...data.units.map(u => [
          textCell(u.name || u.unitNumber || '-', false, 'right'),
          textCell(u.floor || '-', false, 'center'),
          textCell(u.area ? toLatinNum(u.area) + ' م²' : '-', false, 'center'),
          u.price ? usdCell(u.price) : textCell('-'),
          textCell(u.status || '-', false, 'center'),
        ]),
      ];
      content.content.push({
        table: { headerRows: 1, widths: ['*', 'auto', 'auto', 'auto', 'auto'], body },
        layout: headerLineLayout,
        margin: [0, 4, 0, 8],
      });
    }

    content.footer = createFooter(company);
    const doc = pdfMake.createPdf(content);
    if (options.download !== false) await downloadPDF(doc, `مشروع_${data.name || 'عام'}_${new Date().toISOString().split('T')[0]}.pdf`);
    else openPDF(doc);
    return { success: true };
  } catch (error) {
    console.error('PDF Error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  generateInvoicePDF, generateExpensesPDF, generateDecisionPDF,
  generateReportPDF,  generateContractPDF, generateLeadPDF,
  generateProjectPDF, downloadPDF, openPDF,
};
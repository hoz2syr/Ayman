import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, HeightRule, ImageRun } from 'docx';
import { getCompanyInfo } from './storage';
import { downloadBlob } from './downloadUtils';
import QRCode from 'qrcode';
import { formatDate, validateExportData, getExportErrorMessage } from './exportUtils';

/**
 * توليد QR Code كـ buffer مع معالجة failures
 * @param {string} url - رابط QR
 * @returns {Promise<Uint8Array|null>} QR buffer أو null عند الفشل
 */
const generateQRBuffer = async (url) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 100,
      margin: 1,
      color: {
        dark: '#1e3a5f',
        light: '#ffffff'
      }
    });
    const base64Data = qrDataUrl.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.codePointAt(i);
    }
    return bytes;
  } catch (error) {
    console.warn('QR generation failed, continuing without QR:', error.message);
    return null;
  }
};

/**
 * إنشاء مستند Word احترافي مع دعم RTL
 * @param {object} data - بيانات الوثيقة
 */
export const createWordDocument = async (data) => {
  const companyInfo = getCompanyInfo();
  
  const children = [];
  
  // === الترويسة ===
  // توليد QR Code - يستمر حتى لو فشل
  const docType = data.docType || 'document';
  const docNumber = data.docNumber || '---';
  const baseUrl = typeof globalThis.window !== 'undefined' ? globalThis.window.location.origin : '';
  const qrUrl = `${baseUrl}/view/${docType}/${docNumber}`;
  const qrBuffer = await generateQRBuffer(qrUrl);
  
  // تحويل شعار الشركة إلى buffer إذا وُجد - يستمر حتى لو فشل
  let logoBuffer = null;
  if (companyInfo?.logo) {
    try {
      const logoResponse = await fetch(companyInfo.logo);
      if (logoResponse.ok) {
        const logoBlob = await logoResponse.arrayBuffer();
        logoBuffer = new Uint8Array(logoBlob);
      }
    } catch (e) {
      console.warn('Logo loading failed, using default:', e.message);
    }
  }
  
  // صف الترويسة: [شعار] | رقم الوثيقة | هاتف | [QR]
  const headerCells = [];
  
  // خلية الشعار
  if (logoBuffer) {
    headerCells.push(
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new ImageRun({
                data: logoBuffer,
                transformation: {
                  width: 50,
                  height: 50,
                },
                alignment: AlignmentType.CENTER,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
        shading: { fill: '1e3a5f' },
        width: { size: 20, type: WidthType.PERCENTAGE },
      })
    );
  } else {
    headerCells.push(
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: companyInfo?.name?.charAt(0) || 'ش',
                bold: true,
                size: 32,
                color: 'ffffff',
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
        shading: { fill: '1e3a5f' },
        width: { size: 20, type: WidthType.PERCENTAGE },
      })
    );
  }
  
  // خلية رقم الوثيقة
  headerCells.push(
    new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: `رقم الوثيقة:\n${docNumber}`,
              bold: true,
              size: 18,
              color: 'ffffff',
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
      ],
      shading: { fill: '1e3a5f' },
      width: { size: 30, type: WidthType.PERCENTAGE },
    })
  );
  
  // خلية الهاتف
  headerCells.push(
    new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: companyInfo?.phone ? `📞\n${companyInfo.phone}` : '',
              size: 14,
              color: 'ffffff',
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
      ],
      shading: { fill: '1e3a5f' },
      width: { size: 25, type: WidthType.PERCENTAGE },
    })
  );
  
  // خلية QR Code
  if (qrBuffer) {
    headerCells.push(
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new ImageRun({
                data: qrBuffer,
                transformation: {
                  width: 40,
                  height: 40,
                },
                alignment: AlignmentType.CENTER,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
        shading: { fill: '1e3a5f' },
        width: { size: 25, type: WidthType.PERCENTAGE },
      })
    );
  } else {
    headerCells.push(
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: 'QR',
                size: 14,
                color: 'ffffff',
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
        shading: { fill: '1e3a5f' },
        width: { size: 25, type: WidthType.PERCENTAGE },
      })
    );
  }
  
  // إضافة جدول الترويسة
  children.push(
    new Table({
      rows: [
        new TableRow({
          children: headerCells,
          height: { value: 800, rule: HeightRule.EXACT },
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  );
  
  // === خط ذهبي ===
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '═══════════════════════════════════════════════════════════════════════════════════════════════',
          color: 'b8960c',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
    })
  );
  
  // === عنوان الوثيقة ===
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.title || 'عنوان الوثيقة',
          bold: true,
          size: 44,
          font: 'Tahoma',
          color: '1e293b',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );
  
  // === التاريخ ===
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `التاريخ: ${data.date || formatDate(new Date())}`,
          size: 20,
          font: 'Tahoma',
          color: '475569',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );
  
  // === معالجة البيانات ===
  const sections = data.sections || data.content || [];
  let rowIndex = 0;
  
  for (const section of sections) {
    // عنوان القسم
    if (section.title) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.title,
              bold: true,
              size: 28,
              font: 'Tahoma',
              color: '1e293b',
            }),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 400, after: 200 },
        })
      );
    }
    
    // جدول البيانات
    if (section.table) {
      const tableHeaders = section.table.headers || [];
      const tableRows = section.table.rows || [];
      const isTotalRow = section.isTotalRow || false;
      
      const headerCells = tableHeaders.map(header => 
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: header,
                  bold: true,
                  size: 18,
                  color: 'ffffff',
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          shading: { fill: '2d5a8e' },
        })
      );
      
      const rows = [
        new TableRow({
          children: headerCells,
          height: { value: 400, rule: HeightRule.EXACT },
        }),
      ];
      
      for (const row of tableRows) {
        rowIndex++;
        let bgColor;
        if (isTotalRow) {
          bgColor = '1e3a5f';
        } else {
          bgColor = rowIndex % 2 === 0 ? 'f8fafc' : 'ffffff';
        }
        const textColor = isTotalRow ? 'ffffff' : '000000';
        
        const rowCells = row.map(cell => 
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: String(cell),
                    size: 16,
                    color: textColor,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: { fill: bgColor },
          })
        );
        
        rows.push(
          new TableRow({
            children: rowCells,
            height: { value: 350, rule: HeightRule.EXACT },
          })
        );
      }
      
      const table = new Table({
        rows: rows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      });
      
      children.push(table, new Paragraph({ spacing: { after: 300 } }));
    }
    
    // محتوى نصي (key-value)
    if (section.content && Array.isArray(section.content)) {
      for (const item of section.content) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${item.label}: `,
                bold: true,
                size: 18,
                color: '475569',
              }),
              new TextRun({
                text: item.value || '-',
                size: 18,
              }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 100 },
          })
        );
      }
    }
    
    // نص عادي
    if (section.text) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.text,
              size: 18,
            }),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 200 },
        })
      );
    }
  }
  
  // === التوقيع والختم (إذا لم يُطلب إخفاؤه) ===
  if (data.showFooter !== false) {
    // خط فاصل
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '═══════════════════════════════════════════════════════════════════════════════════════════════',
            color: 'cbd5e1',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 500, after: 400 },
      })
    );
    
    // التوقيع والختم
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'التوقيع المعتمد: __________________        الختم الرسمي: __________________',
            size: 16,
            color: '64748b',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
    
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: companyInfo?.owner || 'المدير العام',
            size: 14,
            color: '94a3b8',
          }),
        ],
        alignment: AlignmentType.CENTER,
      })
    );
  }
  
  // === إنشاء المستند ===
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: 12240,
            height: 15840,
          },
          margin: {
            top: 1440,
            bottom: 1440,
            left: 1440,
            right: 1440,
          },
        },
      },
      children: children,
    }],
  });
  
  return doc;
};

/**
 * تصدير إلى ملف Word
 * @param {object} data - بيانات الوثيقة
 * @param {string} filename - اسم الملف
 * @param {string} docType - نوع الوثيقة
 */
export const exportToWord = async (data, filename = 'document', docType = 'document') => {
  try {
    const validation = validateExportData(data, 'بيانات الوثيقة');
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }
    
    const docData = {
      ...data,
      docType,
      date: data.date || formatDate(new Date()),
    };
    
    const doc = await createWordDocument(docData);
    
    const blob = await Packer.toBlob(doc);
    
    downloadBlob(blob, `${filename}.docx`);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: getExportErrorMessage('تصدير الملف', error) };
  }
};

/**
 * تصدير عنصر HTML إلى Word
 */
export const exportElementToWord = async (elementRef, filename = 'document') => {
  if (!elementRef?.current) {
    throw new Error('Element reference is required');
  }
  
  const element = elementRef.current;
  const text = element.innerText || element.textContent;
  
  const data = {
    title: 'مستند',
    docNumber: '',
    date: formatDate(new Date()),
    content: [
      { text, alignment: AlignmentType.RIGHT }
    ]
  };
  
  return exportToWord(data, filename);
};

export default { createWordDocument, exportToWord, exportElementToWord };

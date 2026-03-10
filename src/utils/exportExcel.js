import * as XLSX from 'xlsx';
import { getCompanyInfo, getSettings } from './storage';

const PRIMARY_COLOR = '1E3A5F';
const SECONDARY_COLOR = '2D5A8E';
const ACCENT_COLOR = '3B82F6';
const WHITE = 'FFFFFF';
const LIGHT_GRAY = 'F8FAFC';
const BORDER_COLOR = 'E5E7EB';

export const exportToExcel = (data, filename, title, options = {}) => {
  const {
    sheetName = 'Sheet1',
    headers = [],
    headerKeys = [],
    totalsRow = null,
    projectName = '',
  } = options;

  const company = getCompanyInfo() || {};
  const settings = getSettings() || {};
  const exchangeRate = settings.exchangeRateUSD || 13000;

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([]);

  let rowIndex = 0;
  const startColumn = 0;
  const endColumn = headers.length > 0 ? headers.length - 1 : 5;

  // ============================================
  // HEADER SECTION - Company Logo & Info
  // ============================================
  
  // Try to add company logo if available
  let logoAdded = false;
  if (company.logo && typeof company.logo === 'string') {
    try {
      let logoBase64 = company.logo;
      if (logoBase64.startsWith('data:')) {
        logoBase64 = logoBase64.split(',')[1];
      }
      
      if (!ws['!images']) ws['!images'] = [];
      ws['!images'].push({
        name: 'logo',
        data: logoBase64,
        position: 'A1',
      });
      logoAdded = true;
    } catch (error) {
      console.warn('Failed to add logo:', error);
    }
  }
  
  // Row 1: Company Name - Large Title
  const companyNameRow = [{
    v: company.name || 'شركة البناء',
    t: 's',
    s: {
      font: { bold: true, size: 18, color: { rgb: PRIMARY_COLOR } },
      alignment: { horizontal: 'center', vertical: 'center' },
    },
  }];
  XLSX.utils.sheet_add_aoa(ws, [companyNameRow], { origin: `A${rowIndex + 1}` });
  ws['!merges'] = [{ s: { r: rowIndex, c: startColumn }, e: { r: rowIndex, c: endColumn } }];
  rowIndex++;

  // Row 2: Company Tagline / Address
  const taglineRow = [{
    v: company.address || '',
    t: 's',
    s: {
      font: { size: 10, color: { rgb: '6B7280' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    },
  }];
  XLSX.utils.sheet_add_aoa(ws, [taglineRow], { origin: `A${rowIndex + 1}` });
  ws['!merges'].push({ s: { r: rowIndex, c: startColumn }, e: { r: rowIndex, c: endColumn } });
  rowIndex++;

  // Row 3: Contact Info (Phone | Email)
  const contactInfo = [];
  if (company.phone) contactInfo.push(`📞 ${company.phone}`);
  if (company.email) contactInfo.push(`✉️ ${company.email}`);
  
  const contactRow = [{
    v: contactInfo.join('  |  '),
    t: 's',
    s: {
      font: { size: 9, color: { rgb: '6B7280' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    },
  }];
  XLSX.utils.sheet_add_aoa(ws, [contactRow], { origin: `A${rowIndex + 1}` });
  ws['!merges'].push({ s: { r: rowIndex, c: startColumn }, e: { r: rowIndex, c: endColumn } });
  rowIndex++;

  // Empty row
  rowIndex++;

  // ============================================
  // REPORT TITLE SECTION
  // ============================================

  // Row: Report Title
  const reportTitleRow = [{
    v: title,
    t: 's',
    s: {
      font: { bold: true, size: 14, color: { rgb: WHITE } },
      fill: { fgColor: { rgb: SECONDARY_COLOR } },
      alignment: { horizontal: 'center', vertical: 'center' },
    },
  }];
  XLSX.utils.sheet_add_aoa(ws, [reportTitleRow], { origin: `A${rowIndex + 1}` });
  ws['!merges'].push({ s: { r: rowIndex, c: startColumn }, e: { r: rowIndex, c: endColumn } });
  rowIndex++;

  // Row: Project Name (if provided)
  if (projectName) {
    const projectRow = [{
      v: `المشروع: ${projectName}`,
      t: 's',
      s: {
        font: { size: 11, color: { rgb: PRIMARY_COLOR } },
        alignment: { horizontal: 'center', vertical: 'center' },
      },
    }];
    XLSX.utils.sheet_add_aoa(ws, [projectRow], { origin: `A${rowIndex + 1}` });
    ws['!merges'].push({ s: { r: rowIndex, c: startColumn }, e: { r: rowIndex, c: endColumn } });
    rowIndex++;
  }

  // Row: Date
  const dateRow = [{
    v: `تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`,
    t: 's',
    s: {
      font: { size: 10, color: { rgb: '6B7280' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    },
  }];
  XLSX.utils.sheet_add_aoa(ws, [dateRow], { origin: `A${rowIndex + 1}` });
  ws['!merges'].push({ s: { r: rowIndex, c: startColumn }, e: { r: rowIndex, c: endColumn } });
  rowIndex++;

  // Empty row
  rowIndex++;

  // ============================================
  // TABLE HEADERS
  // ============================================

  if (headers.length > 0) {
    const headerRow = headers.map(h => ({
      v: h,
      t: 's',
      s: {
        font: { bold: true, size: 11, color: { rgb: WHITE } },
        fill: { fgColor: { rgb: SECONDARY_COLOR } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: PRIMARY_COLOR } },
          bottom: { style: 'thin', color: { rgb: PRIMARY_COLOR } },
          left: { style: 'thin', color: { rgb: PRIMARY_COLOR } },
          right: { style: 'thin', color: { rgb: PRIMARY_COLOR } },
        },
      },
    }));
    XLSX.utils.sheet_add_aoa(ws, [headerRow], { origin: `A${rowIndex + 1}` });
    rowIndex++;
  }

  // ============================================
  // DATA ROWS
  // ============================================

  data.forEach((item, index) => {
    const dataRow = headers.map((header, colIndex) => {
      let value = '';
      
      if (headerKeys && headerKeys[colIndex]) {
        const key = headerKeys[colIndex];
        value = item[key];
        
        if (value === null || value === undefined) {
          value = '';
        } else if (typeof value === 'number') {
          if (key.toLowerCase().includes('usd')) {
            value = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          } else if (key.toLowerCase().includes('syp')) {
            value = value.toLocaleString('ar-SA');
          }
        }
      }
      
      return {
        v: value,
        t: typeof value === 'number' ? 'n' : 's',
        s: {
          font: { size: 10 },
          fill: { fgColor: { rgb: index % 2 === 0 ? WHITE : LIGHT_GRAY } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: BORDER_COLOR } },
            bottom: { style: 'thin', color: { rgb: BORDER_COLOR } },
            left: { style: 'thin', color: { rgb: BORDER_COLOR } },
            right: { style: 'thin', color: { rgb: BORDER_COLOR } },
          },
        },
      };
    });
    
    XLSX.utils.sheet_add_aoa(ws, [dataRow.map(d => d.v)], { origin: `A${rowIndex + 1}` });
    
    dataRow.forEach((cell, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
      if (ws[cellRef]) {
        ws[cellRef].s = cell.s;
      }
    });
    
    rowIndex++;
  });

  // ============================================
  // TOTALS ROW
  // ============================================

  if (totalsRow) {
    // Empty row before totals
    rowIndex++;

    const totalsDataRow = headers.map((header, colIndex) => {
      let value = '';
      
      if (totalsRow.headerKeys && totalsRow.headerKeys[colIndex] !== undefined) {
        const key = totalsRow.headerKeys[colIndex];
        if (typeof key === 'string') {
          value = totalsRow.values[key] !== undefined ? totalsRow.values[key] : '';
          
          if (typeof value === 'number') {
            if (key.toLowerCase().includes('usd')) {
              value = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            } else if (key.toLowerCase().includes('syp')) {
              value = value.toLocaleString('ar-SA');
            }
          }
        }
      }
      
      return {
        v: value,
        t: typeof value === 'number' ? 'n' : 's',
        s: {
          font: { bold: true, size: 11 },
          fill: { fgColor: { rgb: PRIMARY_COLOR } },
          color: { rgb: WHITE },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'medium', color: { rgb: PRIMARY_COLOR } },
            bottom: { style: 'medium', color: { rgb: PRIMARY_COLOR } },
            left: { style: 'medium', color: { rgb: PRIMARY_COLOR } },
            right: { style: 'medium', color: { rgb: PRIMARY_COLOR } },
          },
        },
      };
    });
    
    XLSX.utils.sheet_add_aoa(ws, [totalsDataRow.map(d => d.v)], { origin: `A${rowIndex + 1}` });
    
    totalsDataRow.forEach((cell, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
      if (ws[cellRef]) {
        ws[cellRef].s = cell.s;
      }
    });
  }

  // ============================================
  // FOOTER
  // ============================================

  rowIndex++;
  
  // Footer row
  const footerRow = [{
    v: `نظام بناء برو - تقرير مولد تلقائياً`,
    t: 's',
    s: {
      font: { size: 8, color: { rgb: '9CA3AF' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    },
  }];
  XLSX.utils.sheet_add_aoa(ws, [footerRow], { origin: `A${rowIndex + 1}` });
  ws['!merges'].push({ s: { r: rowIndex, c: startColumn }, e: { r: rowIndex, c: endColumn } });

  // ============================================
  // COLUMN WIDTHS
  // ============================================

  const colWidths = headers.map((header, index) => {
    const headerLength = header ? header.length : 10;
    return { wch: Math.max(headerLength + 5, 12) };
  });
  ws['!cols'] = colWidths;

  // Add sheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Write file
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportExpensesToExcel = (expenses, projects, contractors, selectedProjectId = null) => {
  const headers = ['التصنيف', 'الوصف', 'المشروع', 'المقاول', 'المبلغ ($)', 'المبلغ (ل.س)', 'التاريخ', 'ملاحظات'];
  const headerKeys = ['category', 'description', 'projectName', 'contractorName', 'amountUSD', 'amountSYP', 'date', 'notes'];
  const settings = getSettings() || {};
  const exchangeRate = settings.exchangeRateUSD || 13000;

  const filteredExpenses = selectedProjectId 
    ? expenses.filter(e => e.projectId === selectedProjectId)
    : expenses;
    
  const selectedProject = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId) 
    : null;

  const data = filteredExpenses.map(expense => {
    const project = projects.find(p => p.id === expense.projectId);
    const contractor = contractors.find(c => c.id === expense.contractorId);

    return {
      category: expense.category || '',
      description: expense.description || '',
      projectName: project?.name || '-',
      contractorName: contractor?.name || '-',
      amountUSD: expense.amountUSD || expense.amount || 0,
      amountSYP: (expense.amountUSD || expense.amount || 0) * exchangeRate,
      date: expense.date || '',
      notes: expense.notes || '',
    };
  });

  const totals = {
    amountUSD: data.reduce((sum, d) => sum + (d.amountUSD || 0), 0),
    amountSYP: data.reduce((sum, d) => sum + (d.amountSYP || 0), 0),
  };

  exportToExcel(data, 'تقرير_المصاريف', 'تقرير المصاريف', {
    headers,
    headerKeys,
    projectName: selectedProject?.name || '',
    totalsRow: {
      headerKeys: [0, 0, 0, 0, 'amountUSD', 'amountSYP', 0, 0],
      values: { amountUSD: totals.amountUSD, amountSYP: totals.amountSYP },
    },
  });
};

export const exportInvoicesToExcel = (invoices, projects, selectedProjectId = null) => {
  const headers = ['رقم الفاتورة', 'اسم العميل', 'المشروع', 'الحالة', 'التاريخ', 'الإجمالي ($)', 'الإجمالي (ل.س)'];
  const headerKeys = ['invoiceNumber', 'clientName', 'projectName', 'status', 'issueDate', 'totalUSD', 'totalSYP'];
  const settings = getSettings() || {};
  const exchangeRate = settings.exchangeRateUSD || 13000;

  const filteredInvoices = selectedProjectId 
    ? invoices.filter(i => i.projectId === selectedProjectId)
    : invoices;
    
  const selectedProject = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId) 
    : null;

  const data = filteredInvoices.map(invoice => {
    const project = projects.find(p => p.id === invoice.projectId);

    return {
      invoiceNumber: invoice.invoiceNumber || '',
      clientName: invoice.clientName || '',
      projectName: project?.name || '-',
      status: invoice.status || '',
      issueDate: invoice.issueDate || '',
      totalUSD: invoice.totalUSD || 0,
      totalSYP: invoice.totalSYP || (invoice.totalUSD || 0) * exchangeRate,
    };
  });

  const totals = {
    totalUSD: data.reduce((sum, d) => sum + (d.totalUSD || 0), 0),
    totalSYP: data.reduce((sum, d) => sum + (d.totalSYP || 0), 0),
  };

  exportToExcel(data, 'تقرير_الفواتير', 'تقرير الفواتير', {
    headers,
    headerKeys,
    projectName: selectedProject?.name || '',
    totalsRow: {
      headerKeys: [0, 0, 0, 0, 0, 'totalUSD', 'totalSYP'],
      values: { totalUSD: totals.totalUSD, totalSYP: totals.totalSYP },
    },
  });
};

export const exportLeadsToExcel = (leads, projects, units, selectedProjectId = null) => {
  const headers = ['الاسم', 'الهاتف', 'البريد الإلكتروني', 'المشروع', 'الوحدة', 'المرحلة', 'الميزانية', 'تاريخ التواصل'];
  const headerKeys = ['fullName', 'phone', 'email', 'projectName', 'unitName', 'stage', 'budget', 'contactDate'];

  const filteredLeads = selectedProjectId 
    ? leads.filter(l => l.projectId === selectedProjectId)
    : leads;
    
  const selectedProject = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId) 
    : null;

  const data = filteredLeads.map(lead => {
    const project = projects.find(p => p.id === lead.projectId);
    const unit = units.find(u => u.id === lead.unitId);

    const stageLabels = {
      interested: 'مهتم',
      visited: 'زيارة',
      offered: 'عرض سعر',
      negotiating: 'تفاوض',
      reserved: 'حجز',
      sold: 'مباع',
      cancelled: 'ملغي',
    };

    return {
      fullName: lead.fullName || '',
      phone: lead.phone || '',
      email: lead.email || '',
      projectName: project?.name || '-',
      unitName: unit ? `${unit.type} ${unit.unitNumber}` : '-',
      stage: stageLabels[lead.stage] || lead.stage,
      budget: lead.budget || '',
      contactDate: lead.contactDate || '',
    };
  });

  exportToExcel(data, 'قائمة_المهتمين', 'قائمة المهتمين', {
    headers,
    headerKeys,
    projectName: selectedProject?.name || '',
  });
};

export default {
  exportToExcel,
  exportExpensesToExcel,
  exportInvoicesToExcel,
  exportLeadsToExcel,
};

import ExcelJS from 'exceljs';
import { getCompanyInfo, getSettings } from './storage';

const colors = {
  primary: '1E3A5F',
  secondary: '2D5A8E',
  gold: 'B8960C',
  success: '22C55E',
  danger: 'EF4444',
  warning: 'F59E0B',
  text: '1F2937',
  textLight: '6B7280',
  border: 'E5E7EB',
  background: 'F9FAFB',
  white: 'FFFFFF',
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatNumber = (num) => {
  const n = parseFloat(num || 0);
  return n.toLocaleString();
};

const addHeader = (worksheet, company, title, projectName) => {
  const cols = worksheet.columns.length || 8;
  
  worksheet.mergeCells(1, 1, 1, cols);
  worksheet.getCell(1, 1).value = company?.name || 'اسم الشركة';
  worksheet.getCell(1, 1).font = { bold: true, size: 18, color: { argb: 'FF' + colors.primary } };
  worksheet.getCell(1, 1).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 35;

  if (company?.commercialRecord || company?.taxNumber) {
    worksheet.mergeCells(2, 1, 2, cols);
    let infoText = '';
    if (company?.commercialRecord) infoText += `سجل تجاري: ${company.commercialRecord}`;
    if (company?.taxNumber) infoText += ` | ضريبة: ${company.taxNumber}`;
    worksheet.getCell(2, 1).value = infoText;
    worksheet.getCell(2, 1).font = { size: 9, color: { argb: 'FF' + colors.textLight } };
    worksheet.getCell(2, 1).alignment = { horizontal: 'center' };
  }

  if (company?.phone || company?.email) {
    worksheet.mergeCells(3, 1, 3, cols);
    let contactText = '';
    if (company?.phone) contactText += `📞 ${company.phone}`;
    if (company?.email) contactText += ` | ✉️ ${company.email}`;
    worksheet.getCell(3, 1).value = contactText;
    worksheet.getCell(3, 1).font = { size: 9, color: { argb: 'FF' + colors.textLight } };
    worksheet.getCell(3, 1).alignment = { horizontal: 'center' };
  }

  const titleRow = 5;
  worksheet.mergeCells(titleRow, 1, titleRow, cols);
  worksheet.getCell(titleRow, 1).value = title;
  worksheet.getCell(titleRow, 1).font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
  worksheet.getCell(titleRow, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.secondary } };
  worksheet.getCell(titleRow, 1).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(titleRow).height = 28;

  if (projectName) {
    const projectRow = titleRow + 1;
    worksheet.mergeCells(projectRow, 1, projectRow, cols);
    worksheet.getCell(projectRow, 1).value = `المشروع: ${projectName}`;
    worksheet.getCell(projectRow, 1).font = { bold: true, size: 11, color: { argb: 'FF' + colors.primary } };
    worksheet.getCell(projectRow, 1).alignment = { horizontal: 'center' };
  }

  const dateRow = titleRow + 2;
  worksheet.mergeCells(dateRow, 1, dateRow, cols);
  worksheet.getCell(dateRow, 1).value = `تاريخ التقرير: ${formatDate(new Date())}`;
  worksheet.getCell(dateRow, 1).font = { size: 10, color: { argb: 'FF' + colors.textLight } };
  worksheet.getCell(dateRow, 1).alignment = { horizontal: 'center' };

  return dateRow + 2;
};

const addTableHeader = (worksheet, headers, startRow) => {
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(startRow, index + 1);
    cell.value = header;
    cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.primary } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF' + colors.primary } },
      bottom: { style: 'thin', color: { argb: 'FF' + colors.primary } },
      left: { style: 'thin', color: { argb: 'FF' + colors.primary } },
      right: { style: 'thin', color: { argb: 'FF' + colors.primary } },
    };
  });
  worksheet.getRow(startRow).height = 25;
  return startRow + 1;
};

const addDataRows = (worksheet, data, headerKeys, startRow) => {
  let rowNum = startRow;
  
  data.forEach((item, index) => {
    headerKeys.forEach((key, colIndex) => {
      let value = '';
      if (key && item[key] !== undefined) {
        value = item[key];
        if (value === null || value === undefined) value = '';
      }
      
      const cell = worksheet.getCell(rowNum, colIndex + 1);
      cell.value = value;
      cell.font = { size: 10 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: index % 2 === 0 ? 'FF' + colors.white : 'FF' + colors.background } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF' + colors.border } },
        bottom: { style: 'thin', color: { argb: 'FF' + colors.border } },
        left: { style: 'thin', color: { argb: 'FF' + colors.border } },
        right: { style: 'thin', color: { argb: 'FF' + colors.border } },
      };
    });
    worksheet.getRow(rowNum).height = 22;
    rowNum++;
  });
  
  return rowNum;
};

const addTotalsRow = (worksheet, headers, totalsData, startRow) => {
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(startRow, index + 1);
    
    if (totalsData[index]) {
      cell.value = totalsData[index];
      cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.primary } };
    } else {
      cell.value = index === 0 ? 'الإجمالي:' : '';
      if (index === 0) {
        cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.primary } };
      }
    }
    
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF' + colors.primary } },
      bottom: { style: 'medium', color: { argb: 'FF' + colors.primary } },
      left: { style: 'medium', color: { argb: 'FF' + colors.primary } },
      right: { style: 'medium', color: { argb: 'FF' + colors.primary } },
    };
  });
  worksheet.getRow(startRow).height = 25;
  return startRow + 1;
};

const addFooter = (worksheet, startRow, cols) => {
  worksheet.mergeCells(startRow, 1, startRow, cols);
  const cell = worksheet.getCell(startRow, 1);
  cell.value = `نظام بناء برو - تقرير مولد تلقائياً | ${formatDate(new Date())}`;
  cell.font = { size: 8, color: { argb: 'FF9CA3AF' } };
  cell.alignment = { horizontal: 'center' };
};

const autoFitColumns = (worksheet, headers) => {
  worksheet.columns.forEach((column, index) => {
    const headerLength = headers[index]?.length || 10;
    let maxLength = headerLength + 5;
    column.width = Math.max(maxLength, 12);
  });
};

export const exportExpensesToExcel = (expenses, projects, contractors, selectedProjectId = null) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BuildMaster Pro';
  workbook.created = new Date();
  
  const worksheet = workbook.addWorksheet('تقرير المصاريف', {
    views: [{ rightToLeft: true }],
  });

  const company = getCompanyInfo();
  const settings = getSettings() || {};
  const exchangeRate = settings.exchangeRateUSD || 13000;

  const filteredExpenses = selectedProjectId 
    ? expenses.filter(e => e.projectId === selectedProjectId)
    : expenses;
    
  const selectedProject = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId) 
    : null;

  const headers = ['التصنيف', 'الوصف', 'المشروع', 'المقاول', 'المبلغ ($)', 'المبلغ (ل.س)', 'التاريخ'];
  const headerKeys = ['category', 'description', 'projectName', 'contractorName', 'amountUSD', 'amountSYP', 'date'];

  const data = filteredExpenses.map(expense => {
    const project = projects.find(p => p.id === expense.projectId);
    const contractor = contractors.find(c => c.id === expense.contractorId);

    return {
      category: expense.category || '-',
      description: (expense.description || '-').substring(0, 40),
      projectName: project?.name || '-',
      contractorName: contractor?.name || '-',
      amountUSD: formatNumber(expense.amountUSD || expense.amount || 0),
      amountSYP: formatNumber((expense.amountUSD || expense.amount || 0) * exchangeRate),
      date: expense.date || '-',
    };
  });

  const totals = {
    amountUSD: data.reduce((sum, d) => sum + parseFloat(d.amountUSD.replace(/,/g, '') || 0), 0),
    amountSYP: data.reduce((sum, d) => sum + parseFloat(d.amountSYP.replace(/,/g, '') || 0), 0),
  };

  const titleRow = addHeader(worksheet, company, 'تقرير المصاريف', selectedProject?.name);
  const headerRow = addTableHeader(worksheet, headers, titleRow);
  const dataRow = addDataRows(worksheet, data, headerKeys, headerRow);
  
  const totalsData = ['', '', '', '', formatNumber(totals.amountUSD), formatNumber(totals.amountSYP), ''];
  addTotalsRow(worksheet, headers, totalsData, dataRow);
  
  autoFitColumns(worksheet, headers);
  addFooter(worksheet, dataRow + 2, headers.length);

  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'تقرير_المصاريف.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
};

export const exportInvoicesToExcel = (invoices, projects, selectedProjectId = null) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BuildMaster Pro';
  workbook.created = new Date();
  
  const worksheet = workbook.addWorksheet('تقرير الفواتير', {
    views: [{ rightToLeft: true }],
  });

  const company = getCompanyInfo();
  const settings = getSettings() || {};
  const exchangeRate = settings.exchangeRateUSD || 13000;

  const filteredInvoices = selectedProjectId 
    ? invoices.filter(i => i.projectId === selectedProjectId)
    : invoices;
    
  const selectedProject = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId) 
    : null;

  const headers = ['رقم الفاتورة', 'اسم العميل', 'المشروع', 'الحالة', 'التاريخ', 'الإجمالي ($)', 'الإجمالي (ل.س)'];
  const headerKeys = ['invoiceNumber', 'clientName', 'projectName', 'status', 'issueDate', 'totalUSD', 'totalSYP'];

  const data = filteredInvoices.map(invoice => {
    const project = projects.find(p => p.id === invoice.projectId);
    const totalUSD = invoice.totalUSD || (invoice.items || []).reduce((sum, item) => {
      return sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPriceUSD) || 0));
    }, 0);

    return {
      invoiceNumber: invoice.invoiceNumber || '-',
      clientName: invoice.clientName || '-',
      projectName: project?.name || '-',
      status: invoice.status || '-',
      issueDate: invoice.issueDate || '-',
      totalUSD: formatNumber(totalUSD),
      totalSYP: formatNumber(totalUSD * exchangeRate),
    };
  });

  const totals = {
    totalUSD: data.reduce((sum, d) => sum + parseFloat(d.totalUSD.replace(/,/g, '') || 0), 0),
    totalSYP: data.reduce((sum, d) => sum + parseFloat(d.totalSYP.replace(/,/g, '') || 0), 0),
  };

  const titleRow = addHeader(worksheet, company, 'تقرير الفواتير', selectedProject?.name);
  const headerRow = addTableHeader(worksheet, headers, titleRow);
  const dataRow = addDataRows(worksheet, data, headerKeys, headerRow);
  
  const totalsData = ['', '', '', '', '', formatNumber(totals.totalUSD), formatNumber(totals.totalSYP)];
  addTotalsRow(worksheet, headers, totalsData, dataRow);
  
  autoFitColumns(worksheet, headers);
  addFooter(worksheet, dataRow + 2, headers.length);

  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'تقرير_الفواتير.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
};

export const exportLeadsToExcel = (leads, projects, units, selectedProjectId = null) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BuildMaster Pro';
  workbook.created = new Date();
  
  const worksheet = workbook.addWorksheet('قائمة المهتمين', {
    views: [{ rightToLeft: true }],
  });

  const company = getCompanyInfo();

  const filteredLeads = selectedProjectId 
    ? leads.filter(l => l.projectId === selectedProjectId)
    : leads;
    
  const selectedProject = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId) 
    : null;

  const stageLabels = {
    interested: 'مهتم',
    visited: 'زيارة',
    offered: 'عرض سعر',
    negotiating: 'تفاوض',
    reserved: 'حجز',
    sold: 'مباع',
    cancelled: 'ملغي',
  };

  const headers = ['الاسم', 'الهاتف', 'البريد الإلكتروني', 'المشروع', 'الوحدة', 'المرحلة', 'الميزانية', 'التاريخ'];
  const headerKeys = ['fullName', 'phone', 'email', 'projectName', 'unitName', 'stage', 'budget', 'createdAt'];

  const data = filteredLeads.map(lead => {
    const project = projects.find(p => p.id === lead.projectId);
    const unit = units.find(u => u.id === lead.unitId);

    return {
      fullName: lead.fullName || '-',
      phone: lead.phone || '-',
      email: lead.email || '-',
      projectName: project?.name || '-',
      unitName: unit ? `${unit.type} ${unit.unitNumber}` : '-',
      stage: stageLabels[lead.stage] || lead.stage || '-',
      budget: lead.budget ? formatNumber(lead.budget) + ' $' : '-',
      createdAt: lead.createdAt ? formatDate(lead.createdAt) : '-',
    };
  });

  const titleRow = addHeader(worksheet, company, 'قائمة المهتمين', selectedProject?.name);
  const headerRow = addTableHeader(worksheet, headers, titleRow);
  addDataRows(worksheet, data, headerKeys, headerRow);
  
  autoFitColumns(worksheet, headers);
  addFooter(worksheet, headerRow + data.length + 2, headers.length);

  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'قائمة_المهتمين.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
};

export const exportProjectsToExcel = (projects) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BuildMaster Pro';
  workbook.created = new Date();
  
  const worksheet = workbook.addWorksheet('قائمة المشاريع', {
    views: [{ rightToLeft: true }],
  });

  const company = getCompanyInfo();

  const headers = ['اسم المشروع', 'الموقع', 'النوع', 'الحالة', 'تاريخ البدء', 'المدة', 'الميزانية', 'المدفوع', 'المتبقي'];
  const headerKeys = ['name', 'location', 'type', 'status', 'startDate', 'duration', 'budget', 'paidAmount', 'remaining'];

  const data = projects.map(project => ({
    name: project.name || '-',
    location: project.location || '-',
    type: project.type || '-',
    status: project.status || '-',
    startDate: project.startDate || '-',
    duration: project.duration ? `${project.duration} شهر` : '-',
    budget: formatNumber(project.budget || 0),
    paidAmount: formatNumber(project.paidAmount || 0),
    remaining: formatNumber((project.budget || 0) - (project.paidAmount || 0)),
  }));

  const titleRow = addHeader(worksheet, company, 'قائمة المشاريع', '');
  const headerRow = addTableHeader(worksheet, headers, titleRow);
  addDataRows(worksheet, data, headerKeys, headerRow);
  
  autoFitColumns(worksheet, headers);
  addFooter(worksheet, headerRow + data.length + 2, headers.length);

  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'قائمة_المشاريع.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
};

export const exportContractorsToExcel = (contractors) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BuildMaster Pro';
  workbook.created = new Date();
  
  const worksheet = workbook.addWorksheet('قائمة المقاولين', {
    views: [{ rightToLeft: true }],
  });

  const company = getCompanyInfo();

  const headers = ['اسم المقاول', 'التخصص', 'الهاتف', 'البريد الإلكتروني', 'العنوان', 'السجل التجاري', 'الرصيد'];
  const headerKeys = ['name', 'specialty', 'phone', 'email', 'address', 'commercialRecord', 'balance'];

  const data = contractors.map(contractor => ({
    name: contractor.name || '-',
    specialty: contractor.specialty || '-',
    phone: contractor.phone || '-',
    email: contractor.email || '-',
    address: contractor.address || '-',
    commercialRecord: contractor.commercialRecord || '-',
    balance: formatNumber(contractor.balance || 0),
  }));

  const titleRow = addHeader(worksheet, company, 'قائمة المقاولين', '');
  const headerRow = addTableHeader(worksheet, headers, titleRow);
  addDataRows(worksheet, data, headerKeys, headerRow);
  
  autoFitColumns(worksheet, headers);
  addFooter(worksheet, headerRow + data.length + 2, headers.length);

  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'قائمة_المقاولين.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
};

export default {
  exportExpensesToExcel,
  exportInvoicesToExcel,
  exportLeadsToExcel,
  exportProjectsToExcel,
  exportContractorsToExcel,
};

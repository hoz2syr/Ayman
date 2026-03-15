// ============================================
// Miftah - نظام إدارة مشاريع البناء (BuildMaster Pro)
// التخزين على Supabase كمصدر وحيد للبيانات
// ============================================

import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ============================================
// Company Information Schema
// ============================================
export const CompanySchema = {
  name: '',
  owner: '',
  phone: '',
  email: '',
  address: '',
  logo: null,
  signature: null,
  stamp: null,
  taxNumber: '',
  commercialRecord: '',
};

// ============================================
// Project Schema
// ============================================
export const ProjectSchema = {
  name: '',
  location: '',
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  startDate: '',
  endDate: '',
  status: 'قيد التنفيذ',
  budget: 0,
  paidAmount: 0,
  description: '',
  notes: '',
};

// ============================================
// Drawing Schema
// ============================================
export const DrawingSchema = {
  projectId: null,
  name: '',
  type: '',
  relatedReports: [],
  relatedDecisions: [],
  file: null,
  fileName: '',
  notes: '',
};

// ============================================
// Report Schema
// ============================================
export const ReportSchema = {
  projectId: null,
  subject: '',
  date: '',
  engineer: '',
  description: '',
  notes: '',
  recommendations: '',
  attachments: [],
  relatedDrawings: [],
  relatedDecisions: [],
};

// ============================================
// Decision Schema
// ============================================
export const DecisionSchema = {
  projectId: null,
  subject: '',
  date: '',
  responsibleParty: '',
  description: '',
  decision: '',
  status: 'معلق',
  dueDate: '',
  notes: '',
  attachments: [],
  relatedDrawings: [],
  relatedReports: [],
};

// ============================================
// Expense Schema
// ============================================
export const ExpenseSchema = {
  projectId: null,
  contractorId: null,
  category: '',
  description: '',
  amount: 0,
  date: '',
  receipt: null,
  notes: '',
};

// ============================================
// Invoice Schema
// ============================================
export const InvoiceSchema = {
  invoiceNumber: '',
  projectId: null,
  contractorId: null,
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  clientAddress: '',
  items: [],
  subtotalUSD: 0,
  subtotalSYP: 0,
  taxRate: 15,
  taxAmountUSD: 0,
  taxAmountSYP: 0,
  totalUSD: 0,
  totalSYP: 0,
  status: 'مفتوح',
  issueDate: '',
  dueDate: '',
  paymentTerms: '',
  notes: '',
};

// ============================================
// Contractor Schema
// ============================================
export const ContractorSchema = {
  name: '',
  type: 'مقاول',
  specialty: '',
  phone: '',
  email: '',
  address: '',
  contractStartDate: '',
  contractEndDate: '',
  agreedAmountUSD: 0,
  agreedAmountSYP: 0,
  notes: '',
  rating: 0,
  payments: [],
};

// ============================================
// Unit Schema
// ============================================
export const UnitSchema = {
  unitNumber: '',
  type: 'apartment',
  projectId: null,
  floor: '',
  area: 0,
  rooms: 0,
  bathrooms: 0,
  priceUSD: 0,
  priceSYP: 0,
  status: 'available',
  buyerId: '',
  description: '',
  notes: '',
};

// ============================================
// Lead Schema
// ============================================
export const LeadSchema = {
  fullName: '',
  phone: '',
  nationalId: '',
  idIssueDate: '',
  email: '',
  projectId: '',
  unitId: '',
  stage: 'interested',
  budget: 0,
  notes: '',
  contactDate: '',
};

// ============================================
// Contract Schema
// ============================================
export const ContractSchema = {
  contractNumber: '',
  date: '',
  sellerName: '',
  sellerLicense: '',
  buyerId: '',
  buyerName: '',
  buyerNationalId: '',
  buyerIdIssueDate: '',
  unitId: '',
  propertyNumber: '',
  region: '',
  unitDescription: '',
  area: 0,
  floor: '',
  totalUSD: 0,
  pricePerMeter: 0,
  totalSYP: 0,
  remainingSYP: 0,
  witness1: '',
  witness2: '',
  notes: '',
};

// ============================================
// Settings Schema
// ============================================
export const SettingsSchema = {
  currency: 'SAR',
  currencySymbol: 'ر.س',
  taxRate: 15,
  dateFormat: 'DD/MM/YYYY',
  language: 'ar',
  theme: 'dark',
  exchangeRateUSD: 13000,
};

// ============================================
// مفاتيح الإعدادات البسيطة في localStorage
// ============================================
const UI_SETTINGS_KEYS = {
  THEME: 'buildmaster_theme',
  LANGUAGE: 'buildmaster_language',
};

// ============================================
// دوال الإعدادات البسيطة (localStorage فقط)
// ============================================

export const getTheme = () => {
  return localStorage.getItem(UI_SETTINGS_KEYS.THEME) || 'dark';
};

export const setTheme = (theme) => {
  localStorage.setItem(UI_SETTINGS_KEYS.THEME, theme);
  document.documentElement.setAttribute('data-theme', theme);
};

export const getLanguage = () => {
  return localStorage.getItem(UI_SETTINGS_KEYS.LANGUAGE) || 'ar';
};

export const setLanguage = (lang) => {
  localStorage.setItem(UI_SETTINGS_KEYS.LANGUAGE, lang);
};

// ============================================
// Company Information (Supabase Only)
// ============================================

export const getCompanyInfo = async () => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured');
    return { ...CompanySchema };
  }

  const { data, error } = await supabase
    .from('company_info')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching company info:', error);
    return { ...CompanySchema };
  }

  return data || { ...CompanySchema };
};

export const setCompanyInfo = async (companyInfo) => {
  if (!isSupabaseConfigured()) {
    console.error('❌ Supabase not configured - cannot save');
    return false;
  }

  const now = new Date().toISOString();
  const companyData = {
    name: companyInfo.name || '',
    owner: companyInfo.owner || '',
    phone: companyInfo.phone || '',
    email: companyInfo.email || '',
    address: companyInfo.address || '',
    logo: companyInfo.logo || null,
    signature: companyInfo.signature || null,
    stamp: companyInfo.stamp || null,
    tax_number: companyInfo.taxNumber || '',
    commercial_record: companyInfo.commercialRecord || '',
    updated_at: now,
  };

  // Check if company exists
  const { data: existing } = await supabase
    .from('company_info')
    .select('id')
    .limit(1)
    .maybeSingle();

  let result;
  if (existing) {
    // Update existing
    result = await supabase
      .from('company_info')
      .update(companyData)
      .eq('id', existing.id)
      .select()
      .maybeSingle();
  } else {
    // Insert new
    companyData.created_at = now;
    result = await supabase
      .from('company_info')
      .insert(companyData)
      .select()
      .maybeSingle();
  }

  if (result?.error) {
    console.error('Error saving company info:', result.error);
    return false;
  }

  console.log('✅ Company info saved to Supabase');
  return true;
};

export const isCompanySetup = async () => {
  const company = await getCompanyInfo();
  return !!(company?.name?.trim() !== '');
};

// ============================================
// Projects (Supabase Only)
// ============================================

export const getProjects = async () => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return data || [];
};

export const getProject = async (id) => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  return error ? null : data;
};

export const saveProject = async (project) => {
  if (!isSupabaseConfigured()) {
    console.error('❌ Supabase not configured - cannot save');
    return null;
  }

  const now = new Date().toISOString();
  const projectData = {
    name: project.name,
    location: project.location || '',
    client_name: project.clientName || '',
    client_phone: project.clientPhone || '',
    client_email: project.clientEmail || '',
    start_date: project.startDate || '',
    end_date: project.endDate || '',
    status: project.status || 'قيد التنفيذ',
    budget: parseFloat(project.budget) || 0,
    paid_amount: parseFloat(project.paidAmount) || 0,
    description: project.description || '',
    notes: project.notes || '',
    updated_at: now,
  };

  let result;

  if (project.id) {
    // Update existing
    result = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', project.id)
      .select()
      .single();
  } else {
    // Create new
    projectData.created_at = now;
    result = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();
  }

  if (result.error) {
    console.error('Error saving project:', result.error);
    return null;
  }

  console.log('✅ Project saved to Supabase:', result.data?.id);
  return result.data?.id;
};

export const deleteProject = async (id) => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting project:', error);
    return false;
  }

  console.log('✅ Project deleted from Supabase:', id);
  return true;
};

// ============================================
// Drawings (Supabase Only)
// ============================================

export const getDrawings = async () => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('drawings')
    .select('*')
    .order('created_at', { ascending: false });

  return error ? [] : (data || []);
};

export const getDrawingsByProject = async (projectId) => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('drawings')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  return error ? [] : (data || []);
};

export const saveDrawing = async (drawing) => {
  if (!isSupabaseConfigured()) return null;

  const now = new Date().toISOString();
  const drawingData = {
    project_id: drawing.projectId,
    name: drawing.name,
    type: drawing.type || '',
    related_reports: drawing.relatedReports || [],
    related_decisions: drawing.relatedDecisions || [],
    file: drawing.file,
    file_name: drawing.fileName || '',
    notes: drawing.notes || '',
    updated_at: now,
  };

  let result;

  if (drawing.id) {
    result = await supabase
      .from('drawings')
      .update(drawingData)
      .eq('id', drawing.id)
      .select()
      .single();
  } else {
    drawingData.drawing_number = await generateDrawingNumber();
    drawingData.created_at = now;
    result = await supabase
      .from('drawings')
      .insert(drawingData)
      .select()
      .single();
  }

  if (result.error) {
    console.error('Error saving drawing:', result.error);
    return null;
  }

  return result.data?.id;
};

export const deleteDrawing = async (id) => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('drawings')
    .delete()
    .eq('id', id);

  return !error;
};

const generateDrawingNumber = async () => {
  const drawings = await getDrawings();
  const year = new Date().getFullYear();
  const yearDrawings = drawings.filter(d => d.drawing_number?.includes(`-${year}-`));
  let maxNum = 0;
  yearDrawings.forEach(d => {
    const match = d.drawing_number?.match(/-(\d+)$/);
    if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
  });
  return `DRW-${year}-${(maxNum + 1).toString().padStart(4, '0')}`;
};

// ============================================
// Reports (Supabase Only)
// ============================================

export const getReports = async () => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  return error ? [] : (data || []);
};

export const getReportsByProject = async (projectId) => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  return error ? [] : (data || []);
};

export const saveReport = async (report) => {
  if (!isSupabaseConfigured()) return null;

  const now = new Date().toISOString();
  const reportData = {
    project_id: report.projectId,
    subject: report.subject || '',
    date: report.date || '',
    engineer: report.engineer || '',
    description: report.description || '',
    notes: report.notes || '',
    recommendations: report.recommendations || '',
    attachments: report.attachments || [],
    related_drawings: report.relatedDrawings || [],
    related_decisions: report.relatedDecisions || [],
    updated_at: now,
  };

  let result;

  if (report.id) {
    result = await supabase
      .from('reports')
      .update(reportData)
      .eq('id', report.id)
      .select()
      .single();
  } else {
    reportData.report_number = await generateReportNumber();
    reportData.created_at = now;
    result = await supabase
      .from('reports')
      .insert(reportData)
      .select()
      .single();
  }

  if (result.error) {
    console.error('Error saving report:', result.error);
    return null;
  }

  return result.data?.id;
};

export const deleteReport = async (id) => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id);

  return !error;
};

const generateReportNumber = async () => {
  const reports = await getReports();
  const year = new Date().getFullYear();
  const yearReports = reports.filter(r => r.report_number?.includes(`-${year}-`));
  let maxNum = 0;
  yearReports.forEach(r => {
    const match = r.report_number?.match(/-(\d+)$/);
    if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
  });
  return `RPT-${year}-${(maxNum + 1).toString().padStart(4, '0')}`;
};

// ============================================
// Decisions (Supabase Only)
// ============================================

export const getDecisions = async () => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('decisions')
    .select('*')
    .order('created_at', { ascending: false });

  return error ? [] : (data || []);
};

export const getDecisionsByProject = async (projectId) => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('decisions')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  return error ? [] : (data || []);
};

export const saveDecision = async (decision) => {
  if (!isSupabaseConfigured()) return null;

  const now = new Date().toISOString();
  const decisionData = {
    project_id: decision.projectId,
    subject: decision.subject || '',
    date: decision.date || '',
    responsible_party: decision.responsibleParty || '',
    description: decision.description || '',
    decision: decision.decision || '',
    status: decision.status || 'معلق',
    due_date: decision.dueDate || '',
    notes: decision.notes || '',
    attachments: decision.attachments || [],
    related_drawings: decision.relatedDrawings || [],
    related_reports: decision.relatedReports || [],
    updated_at: now,
  };

  let result;

  if (decision.id) {
    result = await supabase
      .from('decisions')
      .update(decisionData)
      .eq('id', decision.id)
      .select()
      .single();
  } else {
    decisionData.decision_number = await generateDecisionNumber();
    decisionData.created_at = now;
    result = await supabase
      .from('decisions')
      .insert(decisionData)
      .select()
      .single();
  }

  if (result.error) {
    console.error('Error saving decision:', result.error);
    return null;
  }

  return result.data?.id;
};

export const deleteDecision = async (id) => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('decisions')
    .delete()
    .eq('id', id);

  return !error;
};

const generateDecisionNumber = async () => {
  const decisions = await getDecisions();
  const year = new Date().getFullYear();
  const yearDecisions = decisions.filter(d => d.decision_number?.includes(`-${year}-`));
  let maxNum = 0;
  yearDecisions.forEach(d => {
    const match = d.decision_number?.match(/-(\d+)$/);
    if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
  });
  return `DEC-${year}-${(maxNum + 1).toString().padStart(4, '0')}`;
};

// ============================================
// Expenses (Supabase Only)
// ============================================

export const getExpenses = async () => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false });

  return error ? [] : (data || []);
};

export const getExpense = async (id) => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single();

  return error ? null : data;
};

export const getExpensesByProject = async (projectId) => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  return error ? [] : (data || []);
};

export const saveExpense = async (expense) => {
  if (!isSupabaseConfigured()) return null;

  const now = new Date().toISOString();
  const expenseData = {
    project_id: expense.projectId,
    contractor_id: expense.contractorId,
    category: expense.category || '',
    description: expense.description || '',
    amount: parseFloat(expense.amount) || 0,
    date: expense.date || '',
    receipt: expense.receipt,
    notes: expense.notes || '',
    updated_at: now,
  };

  let result;

  if (expense.id) {
    result = await supabase
      .from('expenses')
      .update(expenseData)
      .eq('id', expense.id)
      .select()
      .single();
  } else {
    expenseData.created_at = now;
    result = await supabase
      .from('expenses')
      .insert(expenseData)
      .select()
      .single();
  }

  if (result.error) {
    console.error('Error saving expense:', result.error);
    return null;
  }

  return result.data?.id;
};

export const deleteExpense = async (id) => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  return !error;
};

// ============================================
// Invoices (Supabase Only)
// ============================================

export const getInvoices = async () => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });

  return error ? [] : (data || []);
};

export const getInvoice = async (id) => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();

  return error ? null : data;
};

export const getInvoicesByProject = async (projectId) => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  return error ? [] : (data || []);
};

export const saveInvoice = async (invoice) => {
  if (!isSupabaseConfigured()) return null;

  const now = new Date().toISOString();
  const invoiceData = {
    invoice_number: invoice.invoiceNumber || await generateInvoiceNumber(),
    project_id: invoice.projectId,
    contractor_id: invoice.contractorId,
    client_name: invoice.clientName || '',
    client_email: invoice.clientEmail || '',
    client_phone: invoice.clientPhone || '',
    client_address: invoice.clientAddress || '',
    items: invoice.items || [],
    subtotal_usd: parseFloat(invoice.subtotalUSD) || 0,
    subtotal_syp: parseFloat(invoice.subtotalSYP) || 0,
    tax_rate: parseFloat(invoice.taxRate) || 15,
    tax_amount_usd: parseFloat(invoice.taxAmountUSD) || 0,
    tax_amount_syp: parseFloat(invoice.taxAmountSYP) || 0,
    total_usd: parseFloat(invoice.totalUSD) || 0,
    total_syp: parseFloat(invoice.totalSYP) || 0,
    status: invoice.status || 'مفتوح',
    issue_date: invoice.issueDate || '',
    due_date: invoice.dueDate || '',
    payment_terms: invoice.paymentTerms || '',
    notes: invoice.notes || '',
    paid_at: invoice.paidAt,
    updated_at: now,
  };

  let result;

  if (invoice.id) {
    result = await supabase
      .from('invoices')
      .update(invoiceData)
      .eq('id', invoice.id)
      .select()
      .single();
  } else {
    invoiceData.created_at = now;
    result = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();
  }

  if (result.error) {
    console.error('Error saving invoice:', result.error);
    return null;
  }

  return result.data?.id;
};

export const deleteInvoice = async (id) => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  return !error;
};

const generateInvoiceNumber = async () => {
  const invoices = await getInvoices();
  const year = new Date().getFullYear();
  const yearInvoices = invoices.filter(i => i.invoice_number?.includes(`-${year}-`));
  let maxNum = 0;
  yearInvoices.forEach(i => {
    const match = i.invoice_number?.match(/-(\d+)$/);
    if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
  });
  return `INV-${year}-${(maxNum + 1).toString().padStart(4, '0')}`;
};

// ============================================
// Contractors (Supabase Only)
// ============================================

export const getContractors = async () => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('contractors')
    .select('*')
    .order('created_at', { ascending: false });

  return error ? [] : (data || []);
};

export const getContractor = async (id) => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('contractors')
    .select('*')
    .eq('id', id)
    .single();

  return error ? null : data;
};

export const saveContractor = async (contractor) => {
  if (!isSupabaseConfigured()) return null;

  const now = new Date().toISOString();
  const contractorData = {
    name: contractor.name || '',
    type: contractor.type || 'مقاول',
    specialty: contractor.specialty || '',
    phone: contractor.phone || '',
    email: contractor.email || '',
    address: contractor.address || '',
    contract_start_date: contractor.contractStartDate || '',
    contract_end_date: contractor.contractEndDate || '',
    agreed_amount_usd: parseFloat(contractor.agreedAmountUSD) || 0,
    agreed_amount_syp: parseFloat(contractor.agreedAmountSYP) || 0,
    notes: contractor.notes || '',
    rating: contractor.rating || 0,
    payments: contractor.payments || [],
    updated_at: now,
  };

  let result;

  if (contractor.id) {
    result = await supabase
      .from('contractors')
      .update(contractorData)
      .eq('id', contractor.id)
      .select()
      .single();
  } else {
    contractorData.created_at = now;
    result = await supabase
      .from('contractors')
      .insert(contractorData)
      .select()
      .single();
  }

  if (result.error) {
    console.error('Error saving contractor:', result.error);
    return null;
  }

  return result.data?.id;
};

export const deleteContractor = async (id) => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('contractors')
    .delete()
    .eq('id', id);

  return !error;
};

export const addContractorPayment = async (contractorId, payment) => {
  const contractor = await getContractor(contractorId);
  if (!contractor) return null;

  const payments = [...(contractor.payments || []), {
    id: crypto.randomUUID(),
    ...payment,
    created_at: new Date().toISOString(),
  }];

  const result = await saveContractor({
    ...contractor,
    payments,
  });

  return result ? payments[payments.length - 1] : null;
};

export const getContractorPayments = async (contractorId) => {
  const contractor = await getContractor(contractorId);
  return contractor?.payments || [];
};

// ============================================
// Units (Supabase Only)
// ============================================

export const getUnits = async () => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('units')
    .select('*')
    .order('created_at', { ascending: false });

  return error ? [] : (data || []);
};

export const getUnit = async (id) => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('id', id)
    .single();

  return error ? null : data;
};

export const getUnitsByProject = async (projectId) => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  return error ? [] : (data || []);
};

export const getAvailableUnits = async () => {
  const units = await getUnits();
  return units.filter(u => u.status === 'available');
};

export const saveUnit = async (unit) => {
  if (!isSupabaseConfigured()) return null;

  const settings = await getSettings();
  const exchangeRate = settings.exchange_rate_usd || 13000;
  const now = new Date().toISOString();

  const unitData = {
    unit_number: unit.unitNumber || '',
    type: unit.type || 'apartment',
    project_id: unit.projectId,
    floor: unit.floor || '',
    area: parseFloat(unit.area) || 0,
    rooms: parseInt(unit.rooms) || 0,
    bathrooms: parseInt(unit.bathrooms) || 0,
    price_usd: parseFloat(unit.priceUSD) || 0,
    price_syp: (parseFloat(unit.priceUSD) || 0) * exchangeRate,
    status: unit.status || 'available',
    buyer_id: unit.buyerId || '',
    description: unit.description || '',
    notes: unit.notes || '',
    updated_at: now,
  };

  let result;

  if (unit.id) {
    result = await supabase
      .from('units')
      .update(unitData)
      .eq('id', unit.id)
      .select()
      .single();
  } else {
    unitData.created_at = now;
    result = await supabase
      .from('units')
      .insert(unitData)
      .select()
      .single();
  }

  if (result.error) {
    console.error('Error saving unit:', result.error);
    return null;
  }

  return result.data?.id;
};

export const deleteUnit = async (id) => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('units')
    .delete()
    .eq('id', id);

  return !error;
};

export const updateUnitStatus = async (id, status, buyerId = null) => {
  const unit = await getUnit(id);
  if (!unit) return false;

  const result = await supabase
    .from('units')
    .update({
      status,
      buyer_id: buyerId || unit.buyer_id,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  return !result.error;
};

// ============================================
// Leads (Supabase Only)
// ============================================

export const getLeads = async () => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  return error ? [] : (data || []);
};

export const getLead = async (id) => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  return error ? null : data;
};

export const getLeadsByProject = async (projectId) => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  return error ? [] : (data || []);
};

export const getActiveLeads = async () => {
  const leads = await getLeads();
  return leads.filter(l => !['sold', 'cancelled'].includes(l.stage));
};

export const saveLead = async (lead) => {
  if (!isSupabaseConfigured()) return null;

  const now = new Date().toISOString();
  const leadData = {
    full_name: lead.fullName || '',
    phone: lead.phone || '',
    national_id: lead.nationalId || '',
    id_issue_date: lead.idIssueDate || '',
    email: lead.email || '',
    project_id: lead.projectId || '',
    unit_id: lead.unitId || '',
    stage: lead.stage || 'interested',
    budget: parseFloat(lead.budget) || 0,
    notes: lead.notes || '',
    contact_date: lead.contactDate || '',
    updated_at: now,
  };

  let result;

  if (lead.id) {
    result = await supabase
      .from('leads')
      .update(leadData)
      .eq('id', lead.id)
      .select()
      .single();
  } else {
    leadData.created_at = now;
    result = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();
  }

  if (result.error) {
    console.error('Error saving lead:', result.error);
    return null;
  }

  return result.data?.id;
};

export const deleteLead = async (id) => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  return !error;
};

export const updateLeadStage = async (id, stage) => {
  if (!isSupabaseConfigured()) return false;

  const result = await supabase
    .from('leads')
    .update({
      stage,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  return !result.error;
};

// ============================================
// Contracts (Supabase Only)
// ============================================

export const getContracts = async () => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .order('created_at', { ascending: false });

  return error ? [] : (data || []);
};

export const getContract = async (id) => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', id)
    .single();

  return error ? null : data;
};

export const getContractsByUnit = async (unitId) => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('unit_id', unitId)
    .order('created_at', { ascending: false });

  return error ? [] : (data || []);
};

export const getContractsByLead = async (leadId) => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('buyer_id', leadId)
    .order('created_at', { ascending: false });

  return error ? [] : (data || []);
};

export const saveContract = async (contract) => {
  if (!isSupabaseConfigured()) return null;

  const settings = await getSettings();
  const exchangeRate = settings.exchange_rate_usd || 13000;
  const now = new Date().toISOString();

  const totalUSD = parseFloat(contract.totalUSD) || 0;
  const area = parseFloat(contract.area) || 1;

  const contractData = {
    contract_number: contract.contractNumber || await generateContractNumber(),
    date: contract.date || '',
    seller_name: contract.sellerName || '',
    seller_license: contract.sellerLicense || '',
    buyer_id: contract.buyerId || '',
    buyer_name: contract.buyerName || '',
    buyer_national_id: contract.buyerNationalId || '',
    buyer_id_issue_date: contract.buyerIdIssueDate || '',
    unit_id: contract.unitId || '',
    property_number: contract.propertyNumber || '',
    region: contract.region || '',
    unit_description: contract.unitDescription || '',
    area,
    floor: contract.floor || '',
    total_usd: totalUSD,
    price_per_meter: area > 0 ? totalUSD / area : 0,
    total_syp: totalUSD * exchangeRate,
    remaining_syp: totalUSD * exchangeRate,
    witness1: contract.witness1 || '',
    witness2: contract.witness2 || '',
    notes: contract.notes || '',
    updated_at: now,
  };

  let result;

  if (contract.id) {
    result = await supabase
      .from('contracts')
      .update(contractData)
      .eq('id', contract.id)
      .select()
      .single();
  } else {
    contractData.created_at = now;
    result = await supabase
      .from('contracts')
      .insert(contractData)
      .select()
      .single();
  }

  if (result.error) {
    console.error('Error saving contract:', result.error);
    return null;
  }

  return result.data?.id;
};

export const deleteContract = async (id) => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('contracts')
    .delete()
    .eq('id', id);

  return !error;
};

const generateContractNumber = async () => {
  const contracts = await getContracts();
  const year = new Date().getFullYear();
  const yearContracts = contracts.filter(c => c.contract_number?.includes(`-${year}-`));
  let maxNum = 0;
  yearContracts.forEach(c => {
    const match = c.contract_number?.match(/-(\d+)$/);
    if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
  });
  return `CNT-${year}-${(maxNum + 1).toString().padStart(4, '0')}`;
};

export const getContractNumber = async () => generateContractNumber();

// ============================================
// Settings (Supabase Only)
// ============================================

export const getSettings = async () => {
  if (!isSupabaseConfigured()) {
    return { ...SettingsSchema };
  }

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching settings:', error);
    return { ...SettingsSchema };
  }

  return data || { ...SettingsSchema };
};

export const saveSettings = async (settings) => {
  if (!isSupabaseConfigured()) return false;

  // Check if settings exist
  const { data: existing } = await supabase
    .from('settings')
    .select('id')
    .limit(1)
    .single();

  let result;

  if (existing) {
    result = await supabase
      .from('settings')
      .update({
        currency: settings.currency || 'SAR',
        currency_symbol: settings.currencySymbol || 'ر.س',
        tax_rate: parseFloat(settings.taxRate) || 15,
        date_format: settings.dateFormat || 'DD/MM/YYYY',
        language: settings.language || 'ar',
        theme: settings.theme || 'dark',
        exchange_rate_usd: parseFloat(settings.exchangeRateUSD) || 13000,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();
  } else {
    result = await supabase
      .from('settings')
      .insert({
        currency: settings.currency || 'SAR',
        currency_symbol: settings.currencySymbol || 'ر.س',
        tax_rate: parseFloat(settings.taxRate) || 15,
        date_format: settings.dateFormat || 'DD/MM/YYYY',
        language: settings.language || 'ar',
        theme: settings.theme || 'dark',
        exchange_rate_usd: parseFloat(settings.exchangeRateUSD) || 13000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
  }

  if (result.error) {
    console.error('Error saving settings:', result.error);
    return false;
  }

  return true;
};

// ============================================
// Utility Functions
// ============================================

// Clear all local data (for logout)
export const clearAllData = () => {
  // Clear theme and language preferences (optional - keeps user preferences)
  // To clear everything including preferences, use localStorage.clear()
  
  // Clear any cached data that might be stored locally
  // The app uses Supabase as the primary source, so we mainly need to clear local state
  
  console.log('🧹 Local data cleared');
};

// Export all data to JSON
export const exportAllData = async () => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot export data');
    return {};
  }

  const [projects, drawings, reports, decisions, expenses, invoices, contractors, units, leads, contracts, settings, companyInfo] = await Promise.all([
    getProjects(),
    getDrawings(),
    getReports(),
    getDecisions(),
    getExpenses(),
    getInvoices(),
    getContractors(),
    getUnits(),
    getLeads(),
    getContracts(),
    getSettings(),
    getCompanyInfo()
  ]);

  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    data: {
      projects,
      drawings,
      reports,
      decisions,
      expenses,
      invoices,
      contractors,
      units,
      leads,
      contracts,
      settings,
      companyInfo
    }
  };
};

// Import data from JSON
export const importData = async (importedData) => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot import data');
    return;
  }

  if (!importedData || !importedData.data) {
    throw new Error('Invalid data format');
  }

  const { data } = importedData;

  // Import each data type - we'll just save each item
  // This assumes the structure matches our save functions
  
  if (data.projects) {
    for (const project of data.projects) {
      await saveProject(project);
    }
  }

  if (data.drawings) {
    for (const drawing of data.drawings) {
      await saveDrawing(drawing);
    }
  }

  if (data.reports) {
    for (const report of data.reports) {
      await saveReport(report);
    }
  }

  if (data.decisions) {
    for (const decision of data.decisions) {
      await saveDecision(decision);
    }
  }

  if (data.expenses) {
    for (const expense of data.expenses) {
      await saveExpense(expense);
    }
  }

  if (data.invoices) {
    for (const invoice of data.invoices) {
      await saveInvoice(invoice);
    }
  }

  if (data.contractors) {
    for (const contractor of data.contractors) {
      await saveContractor(contractor);
    }
  }

  if (data.units) {
    for (const unit of data.units) {
      await saveUnit(unit);
    }
  }

  if (data.leads) {
    for (const lead of data.leads) {
      await saveLead(lead);
    }
  }

  if (data.contracts) {
    for (const contract of data.contracts) {
      await saveContract(contract);
    }
  }

  if (data.settings) {
    await saveSettings(data.settings);
  }

  if (data.companyInfo) {
    await setCompanyInfo(data.companyInfo);
  }

  console.log('✅ Data imported successfully');
};

export const isSyncing = () => isSupabaseConfigured();

// View URL Generator
export const generateViewUrl = (docType, docNumber) => {
  const baseUrl = globalThis.location?.origin || '';
  return `${baseUrl}/view/${docType}/${docNumber}`;
};

// ============================================
// Realtime Subscription (Optional Enhancement)
// ============================================

export const subscribeToTable = (table, callback) => {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel(`${table}-changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
      console.log(`🔄 ${table} changed:`, payload);
      callback(payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export default {
  CompanySchema,
  ProjectSchema,
  DrawingSchema,
  ReportSchema,
  DecisionSchema,
  ExpenseSchema,
  InvoiceSchema,
  ContractorSchema,
  UnitSchema,
  LeadSchema,
  ContractSchema,
  SettingsSchema,
  getCompanyInfo,
  setCompanyInfo,
  isCompanySetup,
  getProjects,
  getProject,
  saveProject,
  deleteProject,
  getDrawings,
  getDrawingsByProject,
  saveDrawing,
  deleteDrawing,
  getReports,
  getReportsByProject,
  saveReport,
  deleteReport,
  getDecisions,
  getDecisionsByProject,
  saveDecision,
  deleteDecision,
  getExpenses,
  getExpense,
  getExpensesByProject,
  saveExpense,
  deleteExpense,
  getInvoices,
  getInvoice,
  getInvoicesByProject,
  saveInvoice,
  deleteInvoice,
  getContractors,
  getContractor,
  saveContractor,
  deleteContractor,
  addContractorPayment,
  getContractorPayments,
  getUnits,
  getUnit,
  getUnitsByProject,
  getAvailableUnits,
  saveUnit,
  deleteUnit,
  updateUnitStatus,
  getLeads,
  getLead,
  getLeadsByProject,
  getActiveLeads,
  saveLead,
  deleteLead,
  updateLeadStage,
  getContracts,
  getContract,
  getContractsByUnit,
  getContractsByLead,
  saveContract,
  deleteContract,
  getContractNumber,
  getSettings,
  saveSettings,
  generateViewUrl,
  isSyncing,
  getTheme,
  setTheme,
  getLanguage,
  setLanguage,
  subscribeToTable,
  clearAllData,
};

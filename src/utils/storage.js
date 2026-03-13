// ============================================
// Miftah - نظام إدارة مشاريع البناء (BuildMaster Pro)
// أدوات التخزين المحلية + Supabase
// ============================================

import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Check if Supabase is configured
const useSupabase = isSupabaseConfigured();

// Supabase table mapping
const SUPABASE_TABLES = {
  'buildmaster_company_info': 'company_info',
  'buildmaster_projects': 'projects',
  'buildmaster_drawings': 'drawings',
  'buildmaster_reports': 'reports',
  'buildmaster_decisions': 'decisions',
  'buildmaster_expenses': 'expenses',
  'buildmaster_invoices': 'invoices',
  'buildmaster_contractors': 'contractors',
  'buildmaster_settings': 'settings',
  'buildmaster_units': 'units',
  'buildmaster_leads': 'leads',
  'buildmaster_contracts': 'contracts',
};

// Generic Supabase functions
const supabaseGet = async (localKey) => {
  if (!useSupabase) return null;
  const table = SUPABASE_TABLES[localKey];
  if (!table) return null;
  
  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
  if (error) {
    console.error(`Supabase get error for ${localKey}:`, error);
    return null;
  }
  return data;
};

const supabaseSave = async (localKey, items) => {
  if (!useSupabase) return false;
  const table = SUPABASE_TABLES[localKey];
  if (!table) return false;
  
  // Delete existing and insert new
  await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (items && items.length > 0) {
    const { error } = await supabase.from(table).insert(items);
    if (error) {
      console.error(`Supabase save error for ${localKey}:`, error);
      return false;
    }
  }
  return true;
};

const STORAGE_KEYS = {
  // بيانات الشركة
  COMPANY_INFO: 'buildmaster_company_info',
  
  // المشاريع
  PROJECTS: 'buildmaster_projects',
  PROJECT_PREFIX: 'buildmaster_project_',
  
  // المخططات
  DRAWINGS: 'buildmaster_drawings',
  DRAWING_PREFIX: 'buildmaster_drawing_',
  
  // التقارير الهندسية
  REPORTS: 'buildmaster_reports',
  REPORT_PREFIX: 'buildmaster_report_',
  
  // القرارات الهندسية
  DECISIONS: 'buildmaster_decisions',
  DECISION_PREFIX: 'buildmaster_decision_',
  
  // المصروفات
  EXPENSES: 'buildmaster_expenses',
  EXPENSE_PREFIX: 'buildmaster_expense_',
  
  // الفواتير
  INVOICES: 'buildmaster_invoices',
  INVOICE_PREFIX: 'buildmaster_invoice_',
  
  // المقاولين
  CONTRACTORS: 'buildmaster_contractors',
  CONTRACTOR_PREFIX: 'buildmaster_contractor_',
  
  // الإعدادات
  SETTINGS: 'buildmaster_settings',

  // المصادقة
  AUTH_USER: 'buildmaster_auth_user',

  // الوحدات السكنية
  UNITS: 'buildmaster_units',
  
  // المهتمون
  LEADS: 'buildmaster_leads',
  
  // العقود
  CONTRACTS: 'buildmaster_contracts',
};

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
  createdAt: null,
};

// ============================================
// Project Schema
// ============================================
export const ProjectSchema = {
  id: null,
  name: '',
  location: '',
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  startDate: '',
  endDate: '',
  status: 'قيد التنفيذ', // قيد التنفيذ، مكتمل، متوقف، ملغى
  budget: 0,
  paidAmount: 0,
  description: '',
  notes: '',
  createdAt: null,
  updatedAt: null,
};

// ============================================
// Drawing Schema (المخططات)
// ============================================
export const DrawingSchema = {
  id: null,
  drawingNumber: '', // DRW-2025-001
  projectId: null,
  name: '',
  type: '', // معماري، إنشائي، كهربائي، ميكانيكي، صحي
  relatedReports: [], // [RPT-001, RPT-002]
  relatedDecisions: [], // [DEC-001]
  file: null, // base64
  fileName: '',
  notes: '',
  createdAt: null,
  updatedAt: null,
};

// ============================================
// Report Schema (التقارير الهندسية)
// ============================================
export const ReportSchema = {
  id: null,
  reportNumber: '', // RPT-2025-001
  projectId: null,
  subject: '',
  date: '',
  engineer: '',
  description: '',
  notes: '',
  recommendations: '',
  attachments: [], // [{ name, type, data }]
  relatedDrawings: [], // [DRW-001]
  relatedDecisions: [], // [DEC-001]
  createdAt: null,
  updatedAt: null,
};

// ============================================
// Decision Schema (القرارات الهندسية)
// ============================================
export const DecisionSchema = {
  id: null,
  decisionNumber: '', // DEC-2025-001
  projectId: null,
  subject: '',
  date: '',
  responsibleParty: '',
  description: '',
  decision: '', // القرار المتخذ
  status: 'معلق', // معلق، منفذ، ملغي
  dueDate: '',
  notes: '',
  attachments: [], // [{ name, type, data }]
  relatedDrawings: [], // [DRW-001]
  relatedReports: [], // [RPT-001]
  createdAt: null,
  updatedAt: null,
};

// ============================================
// Expense Schema
// ============================================
export const ExpenseSchema = {
  id: null,
  projectId: null,
  contractorId: null,
  category: '', // مواد بناء، معدات، عمالة، نقل، أخرى
  description: '',
  amount: 0,
  date: '',
  receipt: null,
  notes: '',
  createdAt: null,
};

// ============================================
// Invoice Schema
// ============================================
export const InvoiceSchema = {
  id: null,
  invoiceNumber: '',
  projectId: null,
  contractorId: null,
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  clientAddress: '',
  items: [], // [{ name, unit, quantity, unitPriceUSD, unitPriceSYP, totalUSD, totalSYP }]
  subtotalUSD: 0,
  subtotalSYP: 0,
  taxRate: 15,
  taxAmountUSD: 0,
  taxAmountSYP: 0,
  totalUSD: 0,
  totalSYP: 0,
  status: 'مفتوح', // مسودة، مفتوح، مدفوع، متأخر
  issueDate: '',
  dueDate: '',
  paymentTerms: '',
  notes: '',
  createdAt: null,
  paidAt: null,
};

// ============================================
// Contractor Schema
// ============================================
export const ContractorSchema = {
  id: null,
  name: '',
  type: 'مقاول', // مقاول، مورد
  specialty: '', // بناء، تشطيب، كهرباء، صرف، تكييف، مواد بناء، معدات
  phone: '',
  email: '',
  address: '',
  contractStartDate: '',
  contractEndDate: '',
  agreedAmountUSD: 0,
  agreedAmountSYP: 0,
  notes: '',
  rating: 0,
  payments: [], // [{ id, date, amountUSD, amountSYP, projectId, notes, createdAt }]
  createdAt: null,
};

// ============================================
// Unit Schema (الوحدات السكنية)
// ============================================
export const UnitSchema = {
  id: null,
  unitNumber: '',
  type: 'apartment', // apartment|shop|office|storage
  projectId: null,
  floor: '',
  area: 0,
  rooms: 0,
  bathrooms: 0,
  priceUSD: 0,
  priceSYP: 0,
  status: 'available', // available|reserved|sold
  buyerId: '',
  description: '',
  notes: '',
  createdAt: null,
};

// ============================================
// Lead Schema (المهتمون)
// ============================================
export const LeadSchema = {
  id: null,
  fullName: '',
  phone: '',
  nationalId: '',
  idIssueDate: '',
  email: '',
  projectId: '',
  unitId: '',
  stage: 'interested', // interested|visited|offered|negotiating|reserved|sold|cancelled
  budget: 0,
  notes: '',
  contactDate: '',
  createdAt: null,
};

// ============================================
// Contract Schema (العقود)
// ============================================
export const ContractSchema = {
  id: null,
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
  createdAt: null,
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
  exchangeRateUSD: 13000, // سعر الصرف للدولار مقابل الليرة السورية
};

// ============================================
// Generic Storage Functions
// ============================================

// الحصول على عنصر من التخزين
export const getItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting item ${key}:`, error);
    return null;
  }
};

// حفظ عنصر في التخزين
export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting item ${key}:`, error);
    return false;
  }
};

// حذف عنصر من التخزين
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item ${key}:`, error);
    return false;
  }
};

// ============================================
// Company Information Functions
// ============================================

export const getCompanyInfo = () => {
  loadSupabaseCache();
  const data = getFromCache(STORAGE_KEYS.COMPANY_INFO);
  return data[0] || getItem(STORAGE_KEYS.COMPANY_INFO) || { ...CompanySchema };
};

export const setCompanyInfo = (companyInfo) => {
  const data = {
    ...companyInfo,
    createdAt: companyInfo.createdAt || new Date().toISOString(),
  };
  setItem(STORAGE_KEYS.COMPANY_INFO, data);
  
  // Also sync to Supabase
  if (useSupabase) {
    supabase.from('company_info').delete().neq('id', '00000000-0000-0000-0000-000000000000').then(() => {
      supabase.from('company_info').insert(data).then(({ error }) => {
        if (error) console.error('Error syncing company to Supabase:', error);
        else console.log('✅ Company info synced to Supabase');
      });
    });
  }
};

export const isCompanySetup = () => {
  const company = getCompanyInfo();
  return !!(company?.name?.trim() !== '');
};

// ============================================
// Projects Functions
// ============================================

export const getProjects = () => {
  loadSupabaseCache();
  return getFromCache(STORAGE_KEYS.PROJECTS);
};

export const getProject = (id) => {
  const projects = getProjects();
  return projects.find(p => p.id === id) || null;
};

export const saveProject = (project) => {
  const projects = getProjects();
  const now = new Date().toISOString();
  
  if (project.id) {
    // تحديث مشروع موجود
    const index = projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...project, updatedAt: now };
    }
  } else {
    // إضافة مشروع جديد
    const newProject = {
      ...project,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    projects.push(newProject);
  }
  
  saveToCache(STORAGE_KEYS.PROJECTS, projects);
  return project.id ? project.id : projects[projects.length - 1].id;
};

export const deleteProject = (id) => {
  const projects = getProjects().filter(p => p.id !== id);
  saveToCache(STORAGE_KEYS.PROJECTS, projects);
};

// ============================================
// Drawings Functions (المخططات)
// ============================================

export const getDrawings = () => {
  loadSupabaseCache();
  return getFromCache(STORAGE_KEYS.DRAWINGS);
};

export const getDrawingsByProject = (projectId) => {
  const drawings = getDrawings();
  return drawings.filter(d => d.projectId === projectId);
};

export const saveDrawing = (drawing) => {
  const drawings = getDrawings();
  const now = new Date().toISOString();
  
  if (drawing.id) {
    const index = drawings.findIndex(d => d.id === drawing.id);
    if (index !== -1) {
      drawings[index] = { ...drawings[index], ...drawing, updatedAt: now };
    }
  } else {
    const newDrawing = {
      ...drawing,
      id: Date.now().toString(),
      drawingNumber: generateDrawingNumber(),
      createdAt: now,
      updatedAt: now,
    };
    drawings.push(newDrawing);
  }
  
  saveToCache(STORAGE_KEYS.DRAWINGS, drawings);
};

export const deleteDrawing = (id) => {
  const drawings = getDrawings().filter(d => d.id !== id);
  saveToCache(STORAGE_KEYS.DRAWINGS, drawings);
};

// توليد رقم المخطط تلقائياً
const generateDrawingNumber = () => {
  const drawings = getDrawings();
  const year = new Date().getFullYear();
  
  // Get max number for current year
  const yearDrawings = drawings.filter(d => d.drawingNumber?.includes(`-${year}-`));
  let maxNum = 0;
  
  yearDrawings.forEach(d => {
    const match = d.drawingNumber.match(/-(\d+)$/);
    if (match) {
      const num = Number.parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  
  const count = maxNum + 1;
  return `DRW-${year}-${count.toString().padStart(4, '0')}`;
};

export const getDrawingNumber = () => generateDrawingNumber();

// ============================================
// Reports Functions (التقارير الهندسية)
// ============================================

export const getReports = () => {
  loadSupabaseCache();
  return getFromCache(STORAGE_KEYS.REPORTS);
};

export const getReportsByProject = (projectId) => {
  const reports = getReports();
  return reports.filter(r => r.projectId === projectId);
};

export const saveReport = (report) => {
  const reports = getReports();
  const now = new Date().toISOString();
  
  if (report.id) {
    const index = reports.findIndex(r => r.id === report.id);
    if (index !== -1) {
      reports[index] = { ...reports[index], ...report, updatedAt: now };
    }
  } else {
    const newReport = {
      ...report,
      id: Date.now().toString(),
      reportNumber: generateReportNumber(),
      createdAt: now,
      updatedAt: now,
    };
    reports.push(newReport);
  }
  
  saveToCache(STORAGE_KEYS.REPORTS, reports);
};

export const deleteReport = (id) => {
  const reports = getReports().filter(r => r.id !== id);
  saveToCache(STORAGE_KEYS.REPORTS, reports);
};

const generateReportNumber = () => {
  const reports = getReports();
  const year = new Date().getFullYear();
  
  // Get max number for current year
  const yearReports = reports.filter(r => r.reportNumber?.includes(`-${year}-`));
  let maxNum = 0;
  
  yearReports.forEach(r => {
    const match = r.reportNumber.match(/-(\d+)$/);
    if (match) {
      const num = Number.parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  
  const count = maxNum + 1;
  return `RPT-${year}-${count.toString().padStart(4, '0')}`;
};

// ============================================
// Decisions Functions (القرارات الهندسية)
// ============================================

export const getDecisions = () => {
  loadSupabaseCache();
  return getFromCache(STORAGE_KEYS.DECISIONS);
};

export const getDecisionsByProject = (projectId) => {
  const decisions = getDecisions();
  return decisions.filter(d => d.projectId === projectId);
};

export const saveDecision = (decision) => {
  const decisions = getDecisions();
  const now = new Date().toISOString();
  
  if (decision.id) {
    const index = decisions.findIndex(d => d.id === decision.id);
    if (index !== -1) {
      decisions[index] = { ...decisions[index], ...decision, updatedAt: now };
    }
  } else {
    const newDecision = {
      ...decision,
      id: Date.now().toString(),
      decisionNumber: generateDecisionNumber(),
      createdAt: now,
      updatedAt: now,
    };
    decisions.push(newDecision);
  }
  
  saveToCache(STORAGE_KEYS.DECISIONS, decisions);
};

export const deleteDecision = (id) => {
  const decisions = getDecisions().filter(d => d.id !== id);
  saveToCache(STORAGE_KEYS.DECISIONS, decisions);
};

const generateDecisionNumber = () => {
  const decisions = getDecisions();
  const year = new Date().getFullYear();
  
  // Get max number for current year
  const yearDecisions = decisions.filter(d => d.decisionNumber?.includes(`-${year}-`));
  let maxNum = 0;
  
  yearDecisions.forEach(d => {
    const match = d.decisionNumber.match(/-(\d+)$/);
    if (match) {
      const num = Number.parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  
  const count = maxNum + 1;
  return `DEC-${year}-${count.toString().padStart(4, '0')}`;
};

// ============================================
// Expenses Functions
// ============================================

// Cache for Supabase data
let supabaseCache = {};
let cacheLoaded = false;

const loadSupabaseCache = async () => {
  if (!useSupabase || cacheLoaded) return;
  
  try {
    const [companyInfo, projects, expenses, invoices, contractors, settings, units, leads, contracts, drawings, reports, decisions] = await Promise.all([
      supabase.from('company_info').select('*').limit(1).single(),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('expenses').select('*').order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      supabase.from('contractors').select('*').order('created_at', { ascending: false }),
      supabase.from('settings').select('*').limit(1).single(),
      supabase.from('units').select('*').order('created_at', { ascending: false }),
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('contracts').select('*').order('created_at', { ascending: false }),
      supabase.from('drawings').select('*').order('created_at', { ascending: false }),
      supabase.from('reports').select('*').order('created_at', { ascending: false }),
      supabase.from('decisions').select('*').order('created_at', { ascending: false }),
    ]);

    supabaseCache = {
      company_info: companyInfo.data ? [companyInfo.data] : [],
      projects: projects.data || [],
      expenses: expenses.data || [],
      invoices: invoices.data || [],
      contractors: contractors.data || [],
      settings: settings.data ? [settings.data] : [],
      units: units.data || [],
      leads: leads.data || [],
      contracts: contracts.data || [],
      drawings: drawings.data || [],
      reports: reports.data || [],
      decisions: decisions.data || [],
    };
    cacheLoaded = true;
    console.log('✅ Supabase cache loaded');
  } catch (error) {
    console.error('Error loading Supabase cache:', error);
  }
};

const getFromCache = (key) => {
  if (useSupabase && supabaseCache[key]) {
    return supabaseCache[key];
  }
  return getItem(key) || [];
};

const saveToCache = (key, data) => {
  // Always save to localStorage
  setItem(key, data);
  
  // Also save to Supabase if configured
  if (useSupabase) {
    const table = SUPABASE_TABLES[key];
    if (table && data.length > 0) {
      // Clear and re-insert
      supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000').then(() => {
        const dataToInsert = data.map(item => ({
          ...item,
          created_at: item.createdAt || item.created_at || new Date().toISOString(),
          updated_at: item.updatedAt || new Date().toISOString(),
        }));
        supabase.from(table).insert(dataToInsert).then(({ error }) => {
          if (error) console.error(`Error syncing to Supabase (${table}):`, error);
          else console.log(`✅ Synced to Supabase: ${table}`);
        });
      });
    }
  }
};

export const getExpenses = () => {
  loadSupabaseCache();
  return getFromCache(STORAGE_KEYS.EXPENSES);
};

export const getExpense = (id) => {
  const expenses = getExpenses();
  return expenses.find(e => e.id === id) || null;
};

export const getExpensesByProject = (projectId) => {
  const expenses = getExpenses();
  return expenses.filter(e => e.projectId === projectId);
};

export const saveExpense = (expense) => {
  const expenses = getExpenses();
  const now = new Date().toISOString();
  
  if (expense.id) {
    // تحديث مصروف موجود
    const index = expenses.findIndex(e => e.id === expense.id);
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...expense, updatedAt: now };
    }
  } else {
    // إضافة مصروف جديد
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    expenses.push(newExpense);
  }
  
  saveToCache(STORAGE_KEYS.EXPENSES, expenses);
};

export const deleteExpense = (id) => {
  const expenses = getExpenses().filter(e => e.id !== id);
  saveToCache(STORAGE_KEYS.EXPENSES, expenses);
};

// ============================================
// Invoices Functions
// ============================================

export const getInvoices = () => {
  loadSupabaseCache();
  return getFromCache(STORAGE_KEYS.INVOICES);
};

export const getInvoice = (id) => {
  const invoices = getInvoices();
  return invoices.find(i => i.id === id) || null;
};

export const getInvoicesByProject = (projectId) => {
  const invoices = getInvoices();
  return invoices.filter(i => i.projectId === projectId);
};

export const saveInvoice = (invoice) => {
  const invoices = getInvoices();
  const now = new Date().toISOString();
  
  if (invoice.id) {
    // تحديث فاتورة موجودة
    const index = invoices.findIndex(i => i.id === invoice.id);
    if (index !== -1) {
      invoices[index] = { ...invoices[index], ...invoice, updatedAt: now };
    }
  } else {
    // إضافة فاتورة جديدة
    const newInvoice = {
      ...invoice,
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(),
      createdAt: now,
      updatedAt: now,
    };
    invoices.push(newInvoice);
  }
  
  saveToCache(STORAGE_KEYS.INVOICES, invoices);
};

export const deleteInvoice = (id) => {
  const invoices = getInvoices().filter(i => i.id !== id);
  saveToCache(STORAGE_KEYS.INVOICES, invoices);
};

const generateInvoiceNumber = () => {
  const invoices = getInvoices();
  const year = new Date().getFullYear();
  
  // Get max number for current year
  const yearInvoices = invoices.filter(i => i.invoiceNumber?.includes(`-${year}-`));
  let maxNum = 0;
  
  yearInvoices.forEach(i => {
    const match = i.invoiceNumber.match(/-(\d+)$/);
    if (match) {
      const num = Number.parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  
  const count = maxNum + 1;
  return `INV-${year}-${count.toString().padStart(4, '0')}`;
};

// ============================================
// Contractors Functions
// ============================================

export const getContractors = () => {
  loadSupabaseCache();
  return getFromCache(STORAGE_KEYS.CONTRACTORS);
};

export const getContractor = (id) => {
  const contractors = getContractors();
  return contractors.find(c => c.id === id) || null;
};

export const saveContractor = (contractor) => {
  const contractors = getContractors();
  const now = new Date().toISOString();
  
  if (contractor.id) {
    // تحديث مقاول موجود
    const index = contractors.findIndex(c => c.id === contractor.id);
    if (index !== -1) {
      contractors[index] = { ...contractors[index], ...contractor, updatedAt: now };
    }
  } else {
    // إضافة مقاول جديد
    const newContractor = {
      ...contractor,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    contractors.push(newContractor);
  }
  
  saveToCache(STORAGE_KEYS.CONTRACTORS, contractors);
};

export const deleteContractor = (id) => {
  const contractors = getContractors().filter(c => c.id !== id);
  saveToCache(STORAGE_KEYS.CONTRACTORS, contractors);
};

export const addContractorPayment = (contractorId, payment) => {
  const contractors = getContractors();
  const index = contractors.findIndex(c => c.id === contractorId);
  
  if (index !== -1) {
    const newPayment = {
      id: Date.now().toString(),
      ...payment,
      createdAt: new Date().toISOString(),
    };
    
    contractors[index].payments = [
      ...(contractors[index].payments || []),
      newPayment
    ];
    
    saveToCache(STORAGE_KEYS.CONTRACTORS, contractors);
    return newPayment;
  }
  return null;
};

export const getContractorPayments = (contractorId) => {
  const contractor = getContractor(contractorId);
  return contractor?.payments || [];
};

// ============================================
// Units Functions (الوحدات السكنية)
// ============================================

export const getUnits = () => {
  loadSupabaseCache();
  return getFromCache(STORAGE_KEYS.UNITS);
};

export const getUnit = (id) => {
  const units = getUnits();
  return units.find(u => u.id === id) || null;
};

export const getUnitsByProject = (projectId) => {
  const units = getUnits();
  return units.filter(u => u.projectId === projectId);
};

export const getAvailableUnits = () => {
  const units = getUnits();
  return units.filter(u => u.status === 'available');
};

export const saveUnit = (unit) => {
  const units = getUnits();
  const now = new Date().toISOString();
  const settings = getSettings();
  const exchangeRate = settings.exchangeRateUSD || 13000;
  
  const validatedUnit = {
    ...unit,
    priceUSD: Number.parseFloat(unit.priceUSD) || 0,
    priceSYP: (Number.parseFloat(unit.priceUSD) || 0) * exchangeRate,
    area: Number.parseFloat(unit.area) || 0,
  };
  
  if (unit.id) {
    const index = units.findIndex(u => u.id === unit.id);
    if (index !== -1) {
      units[index] = { 
        ...units[index], 
        ...validatedUnit, 
        priceSYP: validatedUnit.priceUSD * exchangeRate,
        updatedAt: now 
      };
    }
  } else {
    const newUnit = {
      ...validatedUnit,
      id: Date.now().toString(),
      priceSYP: validatedUnit.priceUSD * exchangeRate,
      createdAt: now,
    };
    units.push(newUnit);
  }
  
  saveToCache(STORAGE_KEYS.UNITS, units);
  return unit.id ? unit.id : units[units.length - 1].id;
};

export const deleteUnit = (id) => {
  const units = getUnits().filter(u => u.id !== id);
  saveToCache(STORAGE_KEYS.UNITS, units);
};

export const updateUnitStatus = (id, status, buyerId = null) => {
  const units = getUnits();
  const index = units.findIndex(u => u.id === id);
  
  if (index !== -1) {
    units[index] = { 
      ...units[index], 
      status, 
      buyerId: buyerId || units[index].buyerId,
      updatedAt: new Date().toISOString() 
    };
    saveToCache(STORAGE_KEYS.UNITS, units);
  }
};

// ============================================
// Leads Functions (المهتمون)
// ============================================

export const getLeads = () => {
  loadSupabaseCache();
  return getFromCache(STORAGE_KEYS.LEADS);
};

export const getLead = (id) => {
  const leads = getLeads();
  return leads.find(l => l.id === id) || null;
};

export const getLeadsByProject = (projectId) => {
  const leads = getLeads();
  return leads.filter(l => l.projectId === projectId);
};

export const getActiveLeads = () => {
  const leads = getLeads();
  return leads.filter(l => !['sold', 'cancelled'].includes(l.stage));
};

export const saveLead = (lead) => {
  const leads = getLeads();
  const now = new Date().toISOString();
  
  if (lead.id) {
    const index = leads.findIndex(l => l.id === lead.id);
    if (index !== -1) {
      leads[index] = { ...leads[index], ...lead, updatedAt: now };
    }
  } else {
    const newLead = {
      ...lead,
      id: Date.now().toString(),
      createdAt: now,
    };
    leads.push(newLead);
  }
  
  saveToCache(STORAGE_KEYS.LEADS, leads);
  return lead.id ? lead.id : leads[leads.length - 1].id;
};

export const deleteLead = (id) => {
  const leads = getLeads().filter(l => l.id !== id);
  saveToCache(STORAGE_KEYS.LEADS, leads);
};

export const updateLeadStage = (id, stage) => {
  const leads = getLeads();
  const index = leads.findIndex(l => l.id === id);
  
  if (index !== -1) {
    leads[index] = { ...leads[index], stage, updatedAt: new Date().toISOString() };
    saveToCache(STORAGE_KEYS.LEADS, leads);
  }
};

// ============================================
// Contracts Functions (العقود)
// ============================================

export const getContracts = () => {
  loadSupabaseCache();
  return getFromCache(STORAGE_KEYS.CONTRACTS);
};

export const getContract = (id) => {
  const contracts = getContracts();
  return contracts.find(c => c.id === id) || null;
};

export const getContractsByUnit = (unitId) => {
  const contracts = getContracts();
  return contracts.filter(c => c.unitId === unitId);
};

export const getContractsByLead = (leadId) => {
  const contracts = getContracts();
  return contracts.filter(c => c.buyerId === leadId);
};

export const saveContract = (contract) => {
  const contracts = getContracts();
  const now = new Date().toISOString();
  const settings = getSettings();
  const exchangeRate = settings.exchangeRateUSD || 13000;
  
  const totalUSD = contract.totalUSD || 0;
  const area = contract.area || 1;
  
  const contractData = {
    ...contract,
    pricePerMeter: area > 0 ? totalUSD / area : 0,
    totalSYP: totalUSD * exchangeRate,
    remainingSYP: totalUSD * exchangeRate,
  };
  
  if (contract.id) {
    const index = contracts.findIndex(c => c.id === contract.id);
    if (index !== -1) {
      contracts[index] = { ...contracts[index], ...contractData, updatedAt: now };
    }
  } else {
    const newContract = {
      ...contractData,
      id: Date.now().toString(),
      contractNumber: generateContractNumber(),
      createdAt: now,
    };
    contracts.push(newContract);
  }
  
  saveToCache(STORAGE_KEYS.CONTRACTS, contracts);
  return contract.id ? contract.id : contracts[contracts.length - 1].id;
};

export const deleteContract = (id) => {
  const contracts = getContracts().filter(c => c.id !== id);
  saveToCache(STORAGE_KEYS.CONTRACTS, contracts);
};

const generateContractNumber = () => {
  const contracts = getContracts();
  const year = new Date().getFullYear();
  
  const yearContracts = contracts.filter(c => c.contractNumber?.includes(`-${year}-`));
  let maxNum = 0;
  
  yearContracts.forEach(c => {
    const match = c.contractNumber.match(/-(\d+)$/);
    if (match) {
      const num = Number.parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  
  const count = maxNum + 1;
  return `CNT-${year}-${count.toString().padStart(4, '0')}`;
};

export const getContractNumber = () => generateContractNumber();

// ============================================
// Settings Functions
// ============================================

export const getSettings = () => {
  loadSupabaseCache();
  const data = getFromCache(STORAGE_KEYS.SETTINGS);
  return data[0] || getItem(STORAGE_KEYS.SETTINGS) || { ...SettingsSchema };
};

export const saveSettings = (settings) => {
  setItem(STORAGE_KEYS.SETTINGS, settings);
  
  // Also sync to Supabase
  if (useSupabase) {
    supabase.from('settings').delete().neq('id', '00000000-0000-0000-0000-000000000000').then(() => {
      supabase.from('settings').insert(settings).then(({ error }) => {
        if (error) console.error('Error syncing settings to Supabase:', error);
        else console.log('✅ Settings synced to Supabase');
      });
    });
  }
};

// Check if Supabase is configured and syncing
export const isSyncing = () => useSupabase;

// ============================================
// Utility Functions
// ============================================

// مسح جميع البيانات
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Also clear Supabase
  if (useSupabase) {
    const tables = Object.values(SUPABASE_TABLES);
    tables.forEach(table => {
      supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    });
  }
  supabaseCache = {};
  cacheLoaded = false;
};

// تصدير البيانات
export const exportAllData = () => {
  const data = {};
  Object.values(STORAGE_KEYS).forEach(key => {
    data[key] = getItem(key);
  });
  return data;
};

// استيراد البيانات
export const importData = (data) => {
  Object.entries(data).forEach(([key, value]) => {
    if (Object.values(STORAGE_KEYS).includes(key)) {
      setItem(key, value);
    }
  });
};

// ============================================
// View URL Generator
// ============================================

export const generateViewUrl = (docType, docNumber) => {
  const baseUrl = globalThis.location.origin;
  return `${baseUrl}/view/${docType}/${docNumber}`;
};

export default {
  STORAGE_KEYS,
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
  clearAllData,
  exportAllData,
  importData,
  isSyncing,
};

import { supabase, isSupabaseConfigured, STORAGE_KEYS } from './supabase';

const handleError = (error, operation) => {
  console.error(`Database ${operation} error:`, error);
  return null;
};

const handleResponse = (data) => {
  if (data === null || data === undefined) return null;
  if (Array.isArray(data)) return data.filter(item => item !== null);
  return data;
};

const checkSupabase = () => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, operation skipped');
    return false;
  }
  return true;
};

// Legacy localStorage functions kept for potential future use
// eslint-disable-next-line no-unused-vars
const _localStorageGet = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

// eslint-disable-next-line no-unused-vars
const _localStorageSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export const db = {
  _useLocal: () => !isSupabaseConfigured(),
  company: {
    get: async () => {
      if (!checkSupabase()) return null;
      try {
        const { data, error } = await supabase.from('company_info').select('*').limit(1).maybeSingle();
        return error ? handleError(error, 'company.get') : handleResponse(data, 'company.get');
      } catch (err) {
        return handleError(err, 'company.get');
      }
    },
    save: async (company) => {
      if (!checkSupabase()) return null;
      try {
        const existing = await db.company.get();
        const companyData = {
          name: company.name || '',
          owner: company.owner || '',
          phone: company.phone || '',
          email: company.email || '',
          address: company.address || '',
          logo: company.logo || null,
          signature: company.signature || null,
          stamp: company.stamp || null,
          tax_number: company.taxNumber || '',
          commercial_record: company.commercialRecord || '',
          updated_at: new Date().toISOString()
        };
        if (existing) {
          const { data, error } = await supabase.from('company_info').update(companyData).eq('id', existing.id).select().single();
          return error ? handleError(error, 'company.update') : data;
        } else {
          companyData.created_at = new Date().toISOString();
          const { data, error } = await supabase.from('company_info').insert(companyData).select().single();
          return error ? handleError(error, 'company.insert') : data;
        }
      } catch (err) {
        return handleError(err, 'company.save');
      }
    },
  },

  projects: {
    getAll: async () => {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      return error ? handleError(error, 'projects.getAll') : handleResponse(data, 'projects.getAll');
    },
    getById: async (id) => {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
      return error ? handleError(error, 'projects.getById') : data;
    },
    create: async (project) => {
      const projectData = {
        name: project.name || '',
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
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('projects').insert(projectData).select().single();
      return error ? handleError(error, 'projects.create') : data;
    },
    update: async (id, project) => {
      const projectData = {
        name: project.name || '',
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
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('projects').update(projectData).eq('id', id).select().single();
      return error ? handleError(error, 'projects.update') : data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      return error ? handleError(error, 'projects.delete') : true;
    },
  },

  drawings: {
    getAll: async () => {
      const { data, error } = await supabase.from('drawings').select('*').order('created_at', { ascending: false });
      return error ? handleError(error, 'drawings.getAll') : handleResponse(data, 'drawings.getAll');
    },
    getByProject: async (projectId) => {
      const { data, error } = await supabase.from('drawings').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
      return error ? handleError(error, 'drawings.getByProject') : handleResponse(data, 'drawings.getByProject');
    },
    create: async (drawing) => {
      const drawingData = {
        project_id: drawing.projectId,
        name: drawing.name || '',
        type: drawing.type || '',
        related_reports: drawing.relatedReports || [],
        related_decisions: drawing.relatedDecisions || [],
        file: drawing.file || null,
        file_name: drawing.fileName || '',
        notes: drawing.notes || '',
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('drawings').insert(drawingData).select().single();
      return error ? handleError(error, 'drawings.create') : data;
    },
    update: async (id, drawing) => {
      const drawingData = {
        project_id: drawing.projectId,
        name: drawing.name || '',
        type: drawing.type || '',
        related_reports: drawing.relatedReports || [],
        related_decisions: drawing.relatedDecisions || [],
        file: drawing.file || null,
        file_name: drawing.fileName || '',
        notes: drawing.notes || '',
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('drawings').update(drawingData).eq('id', id).select().single();
      return error ? handleError(error, 'drawings.update') : data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('drawings').delete().eq('id', id);
      return error ? handleError(error, 'drawings.delete') : true;
    },
  },

  reports: {
    getAll: async () => {
      const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
      return error ? handleError(error, 'reports.getAll') : handleResponse(data, 'reports.getAll');
    },
    getByProject: async (projectId) => {
      const { data, error } = await supabase.from('reports').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
      return error ? handleError(error, 'reports.getByProject') : handleResponse(data, 'reports.getByProject');
    },
    create: async (report) => {
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
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('reports').insert(reportData).select().single();
      return error ? handleError(error, 'reports.create') : data;
    },
    update: async (id, report) => {
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
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('reports').update(reportData).eq('id', id).select().single();
      return error ? handleError(error, 'reports.update') : data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('reports').delete().eq('id', id);
      return error ? handleError(error, 'reports.delete') : true;
    },
  },

  decisions: {
    getAll: async () => {
      const { data, error } = await supabase.from('decisions').select('*').order('created_at', { ascending: false });
      return error ? handleError(error, 'decisions.getAll') : handleResponse(data, 'decisions.getAll');
    },
    getByProject: async (projectId) => {
      const { data, error } = await supabase.from('decisions').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
      return error ? handleError(error, 'decisions.getByProject') : handleResponse(data, 'decisions.getByProject');
    },
    create: async (decision) => {
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
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('decisions').insert(decisionData).select().single();
      return error ? handleError(error, 'decisions.create') : data;
    },
    update: async (id, decision) => {
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
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('decisions').update(decisionData).eq('id', id).select().single();
      return error ? handleError(error, 'decisions.update') : data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('decisions').delete().eq('id', id);
      return error ? handleError(error, 'decisions.delete') : true;
    },
  },

  expenses: {
    getAll: async () => {
      const { data, error } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
      return error ? handleError(error, 'expenses.getAll') : handleResponse(data, 'expenses.getAll');
    },
    getById: async (id) => {
      const { data, error } = await supabase.from('expenses').select('*').eq('id', id).single();
      return error ? handleError(error, 'expenses.getById') : data;
    },
    getByProject: async (projectId) => {
      const { data, error } = await supabase.from('expenses').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
      return error ? handleError(error, 'expenses.getByProject') : handleResponse(data, 'expenses.getByProject');
    },
    create: async (expense) => {
      const expenseData = {
        project_id: expense.projectId,
        contractor_id: expense.contractorId,
        category: expense.category || '',
        description: expense.description || '',
        amount: parseFloat(expense.amount) || 0,
        date: expense.date || '',
        receipt: expense.receipt || null,
        notes: expense.notes || '',
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('expenses').insert(expenseData).select().single();
      return error ? handleError(error, 'expenses.create') : data;
    },
    update: async (id, expense) => {
      const expenseData = {
        project_id: expense.projectId,
        contractor_id: expense.contractorId,
        category: expense.category || '',
        description: expense.description || '',
        amount: parseFloat(expense.amount) || 0,
        date: expense.date || '',
        receipt: expense.receipt || null,
        notes: expense.notes || '',
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('expenses').update(expenseData).eq('id', id).select().single();
      return error ? handleError(error, 'expenses.update') : data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      return error ? handleError(error, 'expenses.delete') : true;
    },
  },

  invoices: {
    getAll: async () => {
      const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
      return error ? handleError(error, 'invoices.getAll') : handleResponse(data, 'invoices.getAll');
    },
    getById: async (id) => {
      const { data, error } = await supabase.from('invoices').select('*').eq('id', id).single();
      return error ? handleError(error, 'invoices.getById') : data;
    },
    getByProject: async (projectId) => {
      const { data, error } = await supabase.from('invoices').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
      return error ? handleError(error, 'invoices.getByProject') : handleResponse(data, 'invoices.getByProject');
    },
    create: async (invoice) => {
      const invoiceData = {
        invoice_number: invoice.invoiceNumber || '',
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
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('invoices').insert(invoiceData).select().single();
      return error ? handleError(error, 'invoices.create') : data;
    },
    update: async (id, invoice) => {
      const invoiceData = {
        invoice_number: invoice.invoiceNumber || '',
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
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('invoices').update(invoiceData).eq('id', id).select().single();
      return error ? handleError(error, 'invoices.update') : data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      return error ? handleError(error, 'invoices.delete') : true;
    },
  },

  contractors: {
    getAll: async () => {
      const { data, error } = await supabase.from('contractors').select('*').order('created_at', { ascending: false });
      return error ? handleError(error, 'contractors.getAll') : handleResponse(data, 'contractors.getAll');
    },
    getById: async (id) => {
      const { data, error } = await supabase.from('contractors').select('*').eq('id', id).single();
      return error ? handleError(error, 'contractors.getById') : data;
    },
    addPayment: async (contractorId, payment) => {
      const contractor = await db.contractors.getById(contractorId);
      if (!contractor) return null;
      const payments = [...(contractor.payments || []), {
        id: crypto.randomUUID(),
        ...payment,
        created_at: new Date().toISOString(),
      }];
      const result = await db.contractors.update(contractorId, { ...contractor, payments });
      return result ? payments[payments.length - 1] : null;
    },
    getPayments: async (contractorId) => {
      const contractor = await db.contractors.getById(contractorId);
      return contractor?.payments || [];
    },
    create: async (contractor) => {
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
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('contractors').insert(contractorData).select().single();
      return error ? handleError(error, 'contractors.create') : data;
    },
    update: async (id, contractor) => {
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
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('contractors').update(contractorData).eq('id', id).select().single();
      return error ? handleError(error, 'contractors.update') : data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('contractors').delete().eq('id', id);
      return error ? handleError(error, 'contractors.delete') : true;
    },
  },

  units: {
    getAll: async () => {
      const { data, error } = await supabase.from('units').select('*').order('created_at', { ascending: false });
      return error ? handleError(error, 'units.getAll') : handleResponse(data, 'units.getAll');
    },
    getById: async (id) => {
      const { data, error } = await supabase.from('units').select('*').eq('id', id).single();
      return error ? handleError(error, 'units.getById') : data;
    },
    getByProject: async (projectId) => {
      const { data, error } = await supabase.from('units').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
      return error ? handleError(error, 'units.getByProject') : handleResponse(data, 'units.getByProject');
    },
    getAvailable: async () => {
      const { data, error } = await supabase.from('units').select('*').eq('status', 'available').order('created_at', { ascending: false });
      return error ? handleError(error, 'units.getAvailable') : handleResponse(data, 'units.getAvailable');
    },
    updateStatus: async (id, status, buyerId = null) => {
      const unit = await db.units.getById(id);
      if (!unit) return false;
      const { data, error } = await supabase.from('units').update({
        status,
        buyer_id: buyerId || unit.buyer_id,
        updated_at: new Date().toISOString()
      }).eq('id', id).select().single();
      return error ? handleError(error, 'units.updateStatus') : !!data;
    },
    create: async (unit) => {
      const unitData = {
        unit_number: unit.unitNumber || '',
        type: unit.type || 'apartment',
        project_id: unit.projectId,
        floor: unit.floor || '',
        area: parseFloat(unit.area) || 0,
        rooms: parseInt(unit.rooms) || 0,
        bathrooms: parseInt(unit.bathrooms) || 0,
        price_usd: parseFloat(unit.priceUSD) || 0,
        price_syp: parseFloat(unit.priceSYP) || 0,
        status: unit.status || 'available',
        buyer_id: unit.buyerId || '',
        description: unit.description || '',
        notes: unit.notes || '',
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('units').insert(unitData).select().single();
      return error ? handleError(error, 'units.create') : data;
    },
    update: async (id, unit) => {
      const unitData = {
        unit_number: unit.unitNumber || '',
        type: unit.type || 'apartment',
        project_id: unit.projectId,
        floor: unit.floor || '',
        area: parseFloat(unit.area) || 0,
        rooms: parseInt(unit.rooms) || 0,
        bathrooms: parseInt(unit.bathrooms) || 0,
        price_usd: parseFloat(unit.priceUSD) || 0,
        price_syp: parseFloat(unit.priceSYP) || 0,
        status: unit.status || 'available',
        buyer_id: unit.buyerId || '',
        description: unit.description || '',
        notes: unit.notes || '',
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('units').update(unitData).eq('id', id).select().single();
      return error ? handleError(error, 'units.update') : data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('units').delete().eq('id', id);
      return error ? handleError(error, 'units.delete') : true;
    },
  },

  leads: {
    getAll: async () => {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      return error ? handleError(error, 'leads.getAll') : handleResponse(data, 'leads.getAll');
    },
    getById: async (id) => {
      const { data, error } = await supabase.from('leads').select('*').eq('id', id).single();
      return error ? handleError(error, 'leads.getById') : data;
    },
    getByProject: async (projectId) => {
      const { data, error } = await supabase.from('leads').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
      return error ? handleError(error, 'leads.getByProject') : handleResponse(data, 'leads.getByProject');
    },
    getActive: async () => {
      const { data, error } = await supabase.from('leads').select('*').not('stage', 'eq', 'sold').not('stage', 'eq', 'cancelled').order('created_at', { ascending: false });
      return error ? handleError(error, 'leads.getActive') : handleResponse(data, 'leads.getActive');
    },
    updateStage: async (id, stage) => {
      const { data, error } = await supabase.from('leads').update({
        stage,
        updated_at: new Date().toISOString()
      }).eq('id', id).select().single();
      return error ? handleError(error, 'leads.updateStage') : !!data;
    },
    create: async (lead) => {
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
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('leads').insert(leadData).select().single();
      return error ? handleError(error, 'leads.create') : data;
    },
    update: async (id, lead) => {
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
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('leads').update(leadData).eq('id', id).select().single();
      return error ? handleError(error, 'leads.update') : data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      return error ? handleError(error, 'leads.delete') : true;
    },
  },

  contracts: {
    getAll: async () => {
      const { data, error } = await supabase.from('contracts').select('*').order('created_at', { ascending: false });
      return error ? handleError(error, 'contracts.getAll') : handleResponse(data, 'contracts.getAll');
    },
    getById: async (id) => {
      const { data, error } = await supabase.from('contracts').select('*').eq('id', id).single();
      return error ? handleError(error, 'contracts.getById') : data;
    },
    getByUnit: async (unitId) => {
      const { data, error } = await supabase.from('contracts').select('*').eq('unit_id', unitId).order('created_at', { ascending: false });
      return error ? handleError(error, 'contracts.getByUnit') : handleResponse(data, 'contracts.getByUnit');
    },
    getByLead: async (leadId) => {
      const { data, error } = await supabase.from('contracts').select('*').eq('buyer_id', leadId).order('created_at', { ascending: false });
      return error ? handleError(error, 'contracts.getByLead') : handleResponse(data, 'contracts.getByLead');
    },
    create: async (contract) => {
      const contractData = {
        contract_number: contract.contractNumber || '',
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
        area: parseFloat(contract.area) || 0,
        floor: contract.floor || '',
        total_usd: parseFloat(contract.totalUSD) || 0,
        price_per_meter: parseFloat(contract.pricePerMeter) || 0,
        total_syp: parseFloat(contract.totalSYP) || 0,
        remaining_syp: parseFloat(contract.remainingSYP) || 0,
        witness1: contract.witness1 || '',
        witness2: contract.witness2 || '',
        notes: contract.notes || '',
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('contracts').insert(contractData).select().single();
      return error ? handleError(error, 'contracts.create') : data;
    },
    update: async (id, contract) => {
      const contractData = {
        contract_number: contract.contractNumber || '',
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
        area: parseFloat(contract.area) || 0,
        floor: contract.floor || '',
        total_usd: parseFloat(contract.totalUSD) || 0,
        price_per_meter: parseFloat(contract.pricePerMeter) || 0,
        total_syp: parseFloat(contract.totalSYP) || 0,
        remaining_syp: parseFloat(contract.remainingSYP) || 0,
        witness1: contract.witness1 || '',
        witness2: contract.witness2 || '',
        notes: contract.notes || '',
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('contracts').update(contractData).eq('id', id).select().single();
      return error ? handleError(error, 'contracts.update') : data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('contracts').delete().eq('id', id);
      return error ? handleError(error, 'contracts.delete') : true;
    },
    getNextNumber: async () => {
      const contracts = await db.contracts.getAll();
      const year = new Date().getFullYear();
      const yearContracts = contracts.filter(c => c.contract_number?.includes(`-${year}-`));
      let maxNum = 0;
      yearContracts.forEach(c => {
        const match = c.contract_number?.match(/-(\d+)$/);
        if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
      });
      return `CNT-${year}-${(maxNum + 1).toString().padStart(4, '0')}`;
    },
  },

  settings: {
    get: async () => {
      if (!checkSupabase()) return null;
      try {
        const { data, error } = await supabase.from('settings').select('*').limit(1).maybeSingle();
        return error ? handleError(error, 'settings.get') : data;
      } catch (err) {
        return handleError(err, 'settings.get');
      }
    },
    save: async (settings) => {
      if (!checkSupabase()) return null;
      try {
        const existing = await db.settings.get();
        const settingsData = {
          currency: settings.currency || 'SAR',
          currency_symbol: settings.currencySymbol || 'ر.س',
          tax_rate: parseFloat(settings.taxRate) || 15,
          date_format: settings.dateFormat || 'DD/MM/YYYY',
          language: settings.language || 'ar',
          theme: settings.theme || 'dark',
          exchange_rate_usd: parseFloat(settings.exchangeRateUSD) || 13000,
        };
        if (existing) {
          const { data, error } = await supabase.from('settings').update({ ...settingsData, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single();
          return error ? handleError(error, 'settings.update') : data;
        } else {
          const { data, error } = await supabase.from('settings').insert({ ...settingsData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }).select().single();
          return error ? handleError(error, 'settings.insert') : data;
        }
      } catch (err) {
        return handleError(err, 'settings.save');
      }
    },
  },

  files: {
    upload: async (file, folder = 'documents') => {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${folder}/${fileName}`;
      
      const { data: _uploadData, error } = await supabase.storage
        .from('files')
        .upload(filePath, file);
      
      if (error) {
        console.error('Upload error:', error);
        return null;
      }
      
      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);
      
      return urlData?.publicUrl || null;
    },
    delete: async (filePath) => {
      const { error } = await supabase.storage.from('files').remove([filePath]);
      return error ? false : true;
    },
  },

  migrate: {
    fromLocalStorage: async () => {
      const localData = localStorage.getItem('buildmaster_data');
      if (!localData) return { success: false, message: 'No local data found' };
      
      try {
        const data = JSON.parse(localData);
        
        if (data.buildmaster_company_info) {
          await db.company.save(data.buildmaster_company_info);
        }
        
        if (data.buildmaster_projects) {
          for (const p of data.buildmaster_projects) {
            await db.projects.create({
              name: p.name,
              location: p.location,
              clientName: p.clientName || p.client_name,
              clientPhone: p.clientPhone || p.client_phone,
              clientEmail: p.clientEmail || p.client_email,
              startDate: p.startDate || p.start_date,
              endDate: p.endDate || p.end_date,
              status: p.status,
              budget: p.budget,
              paidAmount: p.paidAmount || p.paid_amount,
              description: p.description,
              notes: p.notes,
            });
          }
        }
        
        if (data.buildmaster_contractors || data[STORAGE_KEYS?.CONTRACTORS]) {
          const contractors = data.buildmaster_contractors || data[STORAGE_KEYS?.CONTRACTORS] || [];
          for (const c of contractors) {
            await db.contractors.create({
              name: c.name,
              type: c.type,
              specialty: c.specialty,
              phone: c.phone,
              email: c.email,
              address: c.address,
              contractStartDate: c.contractStartDate || c.contract_start_date,
              contractEndDate: c.contractEndDate || c.contract_end_date,
              agreedAmountUSD: c.agreedAmountUSD || c.agreed_amount_usd,
              agreedAmountSYP: c.agreedAmountSYP || c.agreed_amount_syp,
              notes: c.notes,
              rating: c.rating,
              payments: c.payments || [],
            });
          }
        }
        
        if (data.buildmaster_expenses || data[STORAGE_KEYS?.EXPENSES]) {
          const expenses = data.buildmaster_expenses || data[STORAGE_KEYS?.EXPENSES] || [];
          for (const e of expenses) {
            await db.expenses.create({
              projectId: e.projectId || e.project_id,
              contractorId: e.contractorId || e.contractor_id,
              category: e.category,
              description: e.description,
              amount: e.amount,
              date: e.date,
              receipt: e.receipt,
              notes: e.notes,
            });
          }
        }
        
        if (data.buildmaster_invoices || data[STORAGE_KEYS?.INVOICES]) {
          const invoices = data.buildmaster_invoices || data[STORAGE_KEYS?.INVOICES] || [];
          for (const i of invoices) {
            await db.invoices.create({
              invoiceNumber: i.invoiceNumber || i.invoice_number,
              projectId: i.projectId || i.project_id,
              contractorId: i.contractorId || i.contractor_id,
              clientName: i.clientName || i.client_name,
              clientEmail: i.clientEmail || i.client_email,
              clientPhone: i.clientPhone || i.client_phone,
              clientAddress: i.clientAddress || i.client_address,
              items: i.items || [],
              subtotalUSD: i.subtotalUSD || i.subtotal_usd,
              subtotalSYP: i.subtotalSYP || i.subtotal_syp,
              taxRate: i.taxRate || i.tax_rate,
              taxAmountUSD: i.taxAmountUSD || i.tax_amount_usd,
              taxAmountSYP: i.taxAmountSYP || i.tax_amount_syp,
              totalUSD: i.totalUSD || i.total_usd,
              totalSYP: i.totalSYP || i.total_syp,
              status: i.status,
              issueDate: i.issueDate || i.issue_date,
              dueDate: i.dueDate || i.due_date,
              paymentTerms: i.paymentTerms || i.payment_terms,
              notes: i.notes,
              paidAt: i.paidAt || i.paid_at,
            });
          }
        }
        
        if (data.buildmaster_settings) {
          await db.settings.save(data.buildmaster_settings);
        }
        
        return { success: true, message: 'Data migrated successfully' };
      } catch (err) {
        console.error('Migration error:', err);
        return { success: false, message: err.message };
      }
    },
  },
};

export default db;

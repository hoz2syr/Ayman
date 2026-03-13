import db from '../lib/database';

const mapProject = (p) => ({
  ...p,
  clientName: p.client_name,
  clientPhone: p.client_phone,
  clientEmail: p.client_email,
  startDate: p.start_date,
  endDate: p.end_date,
  paidAmount: p.paid_amount,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
});

const mapContractor = (c) => ({
  ...c,
  agreedAmountUSD: c.agreed_amount_usd,
  agreedAmountSYP: c.agreed_amount_syp,
  contractStartDate: c.contract_start_date,
  contractEndDate: c.contract_end_date,
  createdAt: c.created_at,
});

const mapExpense = (e) => ({
  ...e,
  contractorId: e.contractor_id,
  createdAt: e.created_at,
});

const mapInvoice = (i) => ({
  ...i,
  invoiceNumber: i.invoice_number,
  projectId: i.project_id,
  contractorId: i.contractor_id,
  clientName: i.client_name,
  clientEmail: i.client_email,
  clientPhone: i.client_phone,
  clientAddress: i.client_address,
  subtotalUSD: i.subtotal_usd,
  subtotalSYP: i.subtotal_syp,
  taxRate: i.tax_rate,
  taxAmountUSD: i.tax_amount_usd,
  taxAmountSYP: i.tax_amount_syp,
  totalUSD: i.total_usd,
  totalSYP: i.total_syp,
  issueDate: i.issue_date,
  dueDate: i.due_date,
  paymentTerms: i.payment_terms,
  paidAt: i.paid_at,
  createdAt: i.created_at,
});

const mapDrawing = (d) => ({
  ...d,
  drawingNumber: d.drawing_number,
  projectId: d.project_id,
  relatedReports: d.related_reports || [],
  relatedDecisions: d.related_decisions || [],
  fileName: d.file_name,
  createdAt: d.created_at,
  updatedAt: d.updated_at,
});

const mapReport = (r) => ({
  ...r,
  reportNumber: r.report_number,
  projectId: r.project_id,
  relatedDrawings: r.related_drawings || [],
  relatedDecisions: r.related_decisions || [],
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const mapDecision = (d) => ({
  ...d,
  decisionNumber: d.decision_number,
  projectId: d.project_id,
  responsibleParty: d.responsible_party,
  dueDate: d.due_date,
  relatedDrawings: d.related_drawings || [],
  relatedReports: d.related_reports || [],
  createdAt: d.created_at,
  updatedAt: d.updated_at,
});

const mapUnit = (u) => ({
  ...u,
  unitNumber: u.unit_number,
  projectId: u.project_id,
  priceUSD: u.price_usd,
  priceSYP: u.price_syp,
  buyerId: u.buyer_id,
  createdAt: u.created_at,
});

const mapLead = (l) => ({
  ...l,
  fullName: l.full_name,
  nationalId: l.national_id,
  idIssueDate: l.id_issue_date,
  projectId: l.project_id,
  unitId: l.unit_id,
  contactDate: l.contact_date,
  createdAt: l.created_at,
});

const mapContract = (c) => ({
  ...c,
  contractNumber: c.contract_number,
  sellerName: c.seller_name,
  sellerLicense: c.seller_license,
  buyerId: c.buyer_id,
  buyerName: c.buyer_name,
  buyerNationalId: c.buyer_national_id,
  buyerIdIssueDate: c.buyer_id_issue_date,
  unitId: c.unit_id,
  propertyNumber: c.property_number,
  unitDescription: c.unit_description,
  pricePerMeter: c.price_per_meter,
  totalSYP: c.total_syp,
  remainingSYP: c.remaining_syp,
  witness1: c.witness1,
  witness2: c.witness2,
  createdAt: c.created_at,
});

export const storage = {
  getCompanyInfo: async () => {
    const data = await db.company.get();
    return data || { name: '', owner: '', phone: '', email: '', address: '', logo: null };
  },

  setCompanyInfo: async (companyInfo) => {
    await db.company.save(companyInfo);
  },

  isCompanySetup: async () => {
    const company = await db.company.get();
    return !!(company?.name?.trim() !== '');
  },

  getProjects: async () => {
    const data = await db.projects.getAll();
    return (data || []).map(mapProject);
  },

  getProject: async (id) => {
    const data = await db.projects.getById(id);
    return data ? mapProject(data) : null;
  },

  saveProject: async (project) => {
    const projectData = {
      name: project.name,
      location: project.location,
      client_name: project.clientName,
      client_phone: project.clientPhone,
      client_email: project.clientEmail,
      start_date: project.startDate,
      end_date: project.endDate,
      status: project.status,
      budget: Number.parseFloat(project.budget) || 0,
      paid_amount: Number.parseFloat(project.paidAmount) || 0,
      description: project.description,
      notes: project.notes,
    };

    if (project.id) {
      await db.projects.update(project.id, projectData);
      return project.id;
    } else {
      const result = await db.projects.create(projectData);
      return result?.id;
    }
  },

  deleteProject: async (id) => {
    await db.projects.delete(id);
  },

  getContractors: async () => {
    const data = await db.contractors.getAll();
    return (data || []).map(mapContractor);
  },

  getContractor: async (id) => {
    const data = await db.contractors.getById(id);
    return data ? mapContractor(data) : null;
  },

  saveContractor: async (contractor) => {
    const contractorData = {
      name: contractor.name,
      type: contractor.type,
      specialty: contractor.specialty,
      phone: contractor.phone,
      email: contractor.email,
      address: contractor.address,
      contract_start_date: contractor.contractStartDate,
      contract_end_date: contractor.contractEndDate,
      agreed_amount_usd: Number.parseFloat(contractor.agreedAmountUSD) || 0,
      agreed_amount_syp: Number.parseFloat(contractor.agreedAmountSYP) || 0,
      notes: contractor.notes,
      rating: contractor.rating || 0,
    };

    if (contractor.id) {
      await db.contractors.update(contractor.id, contractorData);
      return contractor.id;
    } else {
      const result = await db.contractors.create(contractorData);
      return result?.id;
    }
  },

  deleteContractor: async (id) => {
    await db.contractors.delete(id);
  },

  getExpenses: async () => {
    const data = await db.expenses.getAll();
    return (data || []).map(mapExpense);
  },

  getExpensesByProject: async (projectId) => {
    const data = await db.expenses.getByProject(projectId);
    return (data || []).map(mapExpense);
  },

  saveExpense: async (expense) => {
    const expenseData = {
      project_id: expense.projectId,
      contractor_id: expense.contractorId,
      category: expense.category,
      description: expense.description,
      amount: Number.parseFloat(expense.amount) || 0,
      date: expense.date,
      notes: expense.notes,
    };

    if (expense.id) {
      await db.expenses.update(expense.id, expenseData);
      return expense.id;
    } else {
      const result = await db.expenses.create(expenseData);
      return result?.id;
    }
  },

  deleteExpense: async (id) => {
    await db.expenses.delete(id);
  },

  getInvoices: async () => {
    const data = await db.invoices.getAll();
    return (data || []).map(mapInvoice);
  },

  getInvoicesByProject: async (projectId) => {
    const data = await db.invoices.getByProject(projectId);
    return (data || []).map(mapInvoice);
  },

  saveInvoice: async (invoice) => {
    const invoiceData = {
      invoice_number: invoice.invoiceNumber,
      project_id: invoice.projectId,
      contractor_id: invoice.contractorId,
      client_name: invoice.clientName,
      client_email: invoice.clientEmail,
      client_phone: invoice.clientPhone,
      client_address: invoice.clientAddress,
      items: invoice.items,
      subtotal_usd: Number.parseFloat(invoice.subtotalUSD) || 0,
      subtotal_syp: Number.parseFloat(invoice.subtotalSYP) || 0,
      tax_rate: Number.parseFloat(invoice.taxRate) || 15,
      tax_amount_usd: Number.parseFloat(invoice.taxAmountUSD) || 0,
      tax_amount_syp: Number.parseFloat(invoice.taxAmountSYP) || 0,
      total_usd: Number.parseFloat(invoice.totalUSD) || 0,
      total_syp: Number.parseFloat(invoice.totalSYP) || 0,
      status: invoice.status,
      issue_date: invoice.issueDate,
      due_date: invoice.dueDate,
      payment_terms: invoice.paymentTerms,
      notes: invoice.notes,
      paid_at: invoice.paidAt,
    };

    if (invoice.id) {
      await db.invoices.update(invoice.id, invoiceData);
      return invoice.id;
    } else {
      const result = await db.invoices.create(invoiceData);
      return result?.id;
    }
  },

  deleteInvoice: async (id) => {
    await db.invoices.delete(id);
  },

  getDrawings: async () => {
    const data = await db.drawings.getAll();
    return (data || []).map(mapDrawing);
  },

  getDrawingsByProject: async (projectId) => {
    const data = await db.drawings.getByProject(projectId);
    return (data || []).map(mapDrawing);
  },

  saveDrawing: async (drawing) => {
    const drawingData = {
      project_id: drawing.projectId,
      name: drawing.name,
      type: drawing.type,
      related_reports: drawing.relatedReports || [],
      related_decisions: drawing.relatedDecisions || [],
      file: drawing.file,
      file_name: drawing.fileName,
      notes: drawing.notes,
    };

    if (drawing.id) {
      await db.drawings.update(drawing.id, drawingData);
      return drawing.id;
    } else {
      const result = await db.drawings.create(drawingData);
      return result?.id;
    }
  },

  deleteDrawing: async (id) => {
    await db.drawings.delete(id);
  },

  getReports: async () => {
    const data = await db.reports.getAll();
    return (data || []).map(mapReport);
  },

  getReportsByProject: async (projectId) => {
    const data = await db.reports.getByProject(projectId);
    return (data || []).map(mapReport);
  },

  saveReport: async (report) => {
    const reportData = {
      project_id: report.projectId,
      subject: report.subject,
      date: report.date,
      engineer: report.engineer,
      description: report.description,
      notes: report.notes,
      recommendations: report.recommendations,
      attachments: report.attachments,
      related_drawings: report.relatedDrawings || [],
      related_decisions: report.relatedDecisions || [],
    };

    if (report.id) {
      await db.reports.update(report.id, reportData);
      return report.id;
    } else {
      const result = await db.reports.create(reportData);
      return result?.id;
    }
  },

  deleteReport: async (id) => {
    await db.reports.delete(id);
  },

  getDecisions: async () => {
    const data = await db.decisions.getAll();
    return (data || []).map(mapDecision);
  },

  getDecisionsByProject: async (projectId) => {
    const data = await db.decisions.getByProject(projectId);
    return (data || []).map(mapDecision);
  },

  saveDecision: async (decision) => {
    const decisionData = {
      project_id: decision.projectId,
      subject: decision.subject,
      date: decision.date,
      responsible_party: decision.responsibleParty,
      description: decision.description,
      decision: decision.decision,
      status: decision.status,
      due_date: decision.dueDate,
      notes: decision.notes,
      attachments: decision.attachments,
      related_drawings: decision.relatedDrawings || [],
      related_reports: decision.relatedReports || [],
    };

    if (decision.id) {
      await db.decisions.update(decision.id, decisionData);
      return decision.id;
    } else {
      const result = await db.decisions.create(decisionData);
      return result?.id;
    }
  },

  deleteDecision: async (id) => {
    await db.decisions.delete(id);
  },

  getUnits: async () => {
    const data = await db.units.getAll();
    return (data || []).map(mapUnit);
  },

  getUnitsByProject: async (projectId) => {
    const data = await db.units.getByProject(projectId);
    return (data || []).map(mapUnit);
  },

  getAvailableUnits: async () => {
    const data = await db.units.getAll();
    return (data || []).map(mapUnit).filter(u => u.status === 'available');
  },

  saveUnit: async (unit) => {
    const unitData = {
      unit_number: unit.unitNumber,
      type: unit.type,
      project_id: unit.projectId,
      floor: unit.floor,
      area: Number.parseFloat(unit.area) || 0,
      rooms: Number.parseFloat(unit.rooms) || 0,
      bathrooms: Number.parseFloat(unit.bathrooms) || 0,
      price_usd: Number.parseFloat(unit.priceUSD) || 0,
      price_syp: Number.parseFloat(unit.priceSYP) || 0,
      status: unit.status,
      buyer_id: unit.buyerId,
      description: unit.description,
      notes: unit.notes,
    };

    if (unit.id) {
      await db.units.update(unit.id, unitData);
      return unit.id;
    } else {
      const result = await db.units.create(unitData);
      return result?.id;
    }
  },

  deleteUnit: async (id) => {
    await db.units.delete(id);
  },

  getLeads: async () => {
    const data = await db.leads.getAll();
    return (data || []).map(mapLead);
  },

  getActiveLeads: async () => {
    const data = await db.leads.getAll();
    return (data || []).map(mapLead).filter(l => !['sold', 'cancelled'].includes(l.stage));
  },

  saveLead: async (lead) => {
    const leadData = {
      full_name: lead.fullName,
      phone: lead.phone,
      national_id: lead.nationalId,
      id_issue_date: lead.idIssueDate,
      email: lead.email,
      project_id: lead.projectId,
      unit_id: lead.unitId,
      stage: lead.stage,
      budget: Number.parseFloat(lead.budget) || 0,
      notes: lead.notes,
      contact_date: lead.contactDate,
    };

    if (lead.id) {
      await db.leads.update(lead.id, leadData);
      return lead.id;
    } else {
      const result = await db.leads.create(leadData);
      return result?.id;
    }
  },

  deleteLead: async (id) => {
    await db.leads.delete(id);
  },

  getContracts: async () => {
    const data = await db.contracts.getAll();
    return (data || []).map(mapContract);
  },

  saveContract: async (contract) => {
    const contractData = {
      contract_number: contract.contractNumber,
      date: contract.date,
      seller_name: contract.sellerName,
      seller_license: contract.sellerLicense,
      buyer_id: contract.buyerId,
      buyer_name: contract.buyerName,
      buyer_national_id: contract.buyerNationalId,
      buyer_id_issue_date: contract.buyerIdIssueDate,
      unit_id: contract.unitId,
      property_number: contract.propertyNumber,
      region: contract.region,
      unit_description: contract.unitDescription,
      area: Number.parseFloat(contract.area) || 0,
      floor: contract.floor,
      total_usd: Number.parseFloat(contract.totalUSD) || 0,
      price_per_meter: Number.parseFloat(contract.pricePerMeter) || 0,
      total_syp: Number.parseFloat(contract.totalSYP) || 0,
      remaining_syp: Number.parseFloat(contract.remainingSYP) || 0,
      witness1: contract.witness1,
      witness2: contract.witness2,
      notes: contract.notes,
    };

    if (contract.id) {
      await db.contracts.update(contract.id, contractData);
      return contract.id;
    } else {
      const result = await db.contracts.create(contractData);
      return result?.id;
    }
  },

  deleteContract: async (id) => {
    await db.contracts.delete(id);
  },

  getSettings: async () => {
    const data = await db.settings.get();
    if (!data) {
      return {
        currency: 'SAR',
        currencySymbol: 'ر.س',
        taxRate: 15,
        dateFormat: 'DD/MM/YYYY',
        language: 'ar',
        theme: 'dark',
        exchangeRateUSD: 13000,
      };
    }
    return {
      currency: data.currency || 'SAR',
      currencySymbol: data.currency_symbol || 'ر.س',
      taxRate: data.tax_rate || 15,
      dateFormat: data.date_format || 'DD/MM/YYYY',
      language: data.language || 'ar',
      theme: data.theme || 'dark',
      exchangeRateUSD: data.exchange_rate_usd || 13000,
    };
  },

  saveSettings: async (settings) => {
    const settingsData = {
      currency: settings.currency,
      currency_symbol: settings.currencySymbol,
      tax_rate: settings.taxRate,
      date_format: settings.dateFormat,
      language: settings.language,
      theme: settings.theme,
      exchange_rate_usd: settings.exchangeRateUSD,
    };
    await db.settings.save(settingsData);
  },

  migrate: async () => {
    return await db.migrate.fromLocalStorage();
  },
};

export default storage;

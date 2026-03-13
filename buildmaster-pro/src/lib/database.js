import { supabase, isSupabaseConfigured, STORAGE_KEYS } from './supabase';

const handleError = (error, operation) => {
  console.error(`Database ${operation} error:`, error);
  return null;
};

const handleResponse = (data, operation) => {
  if (data === null || data === undefined) return null;
  if (Array.isArray(data)) return data.filter(item => item !== null);
  return data;
};

const localStorageGet = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

const localStorageSet = (key, value) => {
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
      const { data, error } = await supabase.from('company_info').select('*').limit(1).single();
      return error ? handleError(error, 'company.get') : handleResponse(data, 'company.get');
    },
    save: async (company) => {
      const existing = await db.company.get();
      if (existing) {
        const { data, error } = await supabase.from('company_info').update({
          ...company, updated_at: new Date().toISOString()
        }).eq('id', existing.id).select().single();
        return error ? handleError(error, 'company.update') : data;
      } else {
        const { data, error } = await supabase.from('company_info').insert(company).select().single();
        return error ? handleError(error, 'company.insert') : data;
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
      const { data, error } = await supabase.from('projects').insert(project).select().single();
      return error ? handleError(error, 'projects.create') : data;
    },
    update: async (id, project) => {
      const { data, error } = await supabase.from('projects').update({
        ...project, updated_at: new Date().toISOString()
      }).eq('id', id).select().single();
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
      const { data, error } = await supabase.from('drawings').insert(drawing).select().single();
      return error ? handleError(error, 'drawings.create') : data;
    },
    update: async (id, drawing) => {
      const { data, error } = await supabase.from('drawings').update({
        ...drawing, updated_at: new Date().toISOString()
      }).eq('id', id).select().single();
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
      const { data, error } = await supabase.from('reports').insert(report).select().single();
      return error ? handleError(error, 'reports.create') : data;
    },
    update: async (id, report) => {
      const { data, error } = await supabase.from('reports').update({
        ...report, updated_at: new Date().toISOString()
      }).eq('id', id).select().single();
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
      const { data, error } = await supabase.from('decisions').insert(decision).select().single();
      return error ? handleError(error, 'decisions.create') : data;
    },
    update: async (id, decision) => {
      const { data, error } = await supabase.from('decisions').update({
        ...decision, updated_at: new Date().toISOString()
      }).eq('id', id).select().single();
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
    getByProject: async (projectId) => {
      const { data, error } = await supabase.from('expenses').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
      return error ? handleError(error, 'expenses.getByProject') : handleResponse(data, 'expenses.getByProject');
    },
    create: async (expense) => {
      const { data, error } = await supabase.from('expenses').insert(expense).select().single();
      return error ? handleError(error, 'expenses.create') : data;
    },
    update: async (id, expense) => {
      const { data, error } = await supabase.from('expenses').update(expense).eq('id', id).select().single();
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
    getByProject: async (projectId) => {
      const { data, error } = await supabase.from('invoices').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
      return error ? handleError(error, 'invoices.getByProject') : handleResponse(data, 'invoices.getByProject');
    },
    create: async (invoice) => {
      const { data, error } = await supabase.from('invoices').insert(invoice).select().single();
      return error ? handleError(error, 'invoices.create') : data;
    },
    update: async (id, invoice) => {
      const { data, error } = await supabase.from('invoices').update(invoice).eq('id', id).select().single();
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
    create: async (contractor) => {
      const { data, error } = await supabase.from('contractors').insert(contractor).select().single();
      return error ? handleError(error, 'contractors.create') : data;
    },
    update: async (id, contractor) => {
      const { data, error } = await supabase.from('contractors').update(contractor).eq('id', id).select().single();
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
    getByProject: async (projectId) => {
      const { data, error } = await supabase.from('units').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
      return error ? handleError(error, 'units.getByProject') : handleResponse(data, 'units.getByProject');
    },
    create: async (unit) => {
      const { data, error } = await supabase.from('units').insert(unit).select().single();
      return error ? handleError(error, 'units.create') : data;
    },
    update: async (id, unit) => {
      const { data, error } = await supabase.from('units').update(unit).eq('id', id).select().single();
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
    create: async (lead) => {
      const { data, error } = await supabase.from('leads').insert(lead).select().single();
      return error ? handleError(error, 'leads.create') : data;
    },
    update: async (id, lead) => {
      const { data, error } = await supabase.from('leads').update(lead).eq('id', id).select().single();
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
    create: async (contract) => {
      const { data, error } = await supabase.from('contracts').insert(contract).select().single();
      return error ? handleError(error, 'contracts.create') : data;
    },
    update: async (id, contract) => {
      const { data, error } = await supabase.from('contracts').update(contract).eq('id', id).select().single();
      return error ? handleError(error, 'contracts.update') : data;
    },
    delete: async (id) => {
      const { error } = await supabase.from('contracts').delete().eq('id', id);
      return error ? handleError(error, 'contracts.delete') : true;
    },
  },

  settings: {
    get: async () => {
      const { data, error } = await supabase.from('settings').select('*').limit(1).single();
      return error ? handleError(error, 'settings.get') : data;
    },
    save: async (settings) => {
      const existing = await db.settings.get();
      if (existing) {
        const { data, error } = await supabase.from('settings').update(settings).eq('id', existing.id).select().single();
        return error ? handleError(error, 'settings.update') : data;
      } else {
        const { data, error } = await supabase.from('settings').insert(settings).select().single();
        return error ? handleError(error, 'settings.insert') : data;
      }
    },
  },

  files: {
    upload: async (file, folder = 'documents') => {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${folder}/${fileName}`;
      
      const { data, error } = await supabase.storage
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
              client_name: p.clientName,
              client_phone: p.clientPhone,
              client_email: p.clientEmail,
              start_date: p.startDate,
              end_date: p.endDate,
              status: p.status,
              budget: p.budget,
              paid_amount: p.paidAmount,
              description: p.description,
              notes: p.notes,
            });
          }
        }
        
        if (data.buildmaster_contractors) {
          for (const c of data.buildmaster_contractors) {
            await db.contractors.create({
              name: c.name,
              type: c.type,
              specialty: c.specialty,
              phone: c.phone,
              email: c.email,
              address: c.address,
              agreed_amount_usd: c.agreedAmountUSD,
              agreed_amount_syp: c.agreedAmountSYP,
              notes: c.notes,
              rating: c.rating,
            });
          }
        }
        
        if (data.buildmaster_expenses) {
          for (const e of data.buildmaster_expenses) {
            await db.expenses.create({
              project_id: e.projectId,
              category: e.category,
              description: e.description,
              amount: e.amount,
              date: e.date,
              notes: e.notes,
            });
          }
        }
        
        if (data.buildmaster_invoices) {
          for (const i of data.buildmaster_invoices) {
            await db.invoices.create({
              invoice_number: i.invoiceNumber,
              project_id: i.projectId,
              client_name: i.clientName,
              items: i.items,
              total_usd: i.totalUSD,
              total_syp: i.totalSYP,
              status: i.status,
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

import { supabase } from './supabase';

class RealtimeSync {
  constructor() {
    this.channels = new Map();
    this.subscribers = new Map();
  }

  subscribe(table, callback) {
    if (!supabase) {
      console.warn('Supabase not configured, realtime sync disabled');
      return;
    }

    const channelName = `${table}-changes`;
    
    if (this.channels.has(channelName)) {
      const channel = this.channels.get(channelName);
      const tableCallbacks = this.subscribers.get(channelName) || [];
      tableCallbacks.push(callback);
      this.subscribers.set(channelName, tableCallbacks);
      return;
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table
      }, (payload) => {
        const callbacks = this.subscribers.get(channelName) || [];
        callbacks.forEach(cb => cb(payload));
      })
      .subscribe();

    this.channels.set(channelName, channel);
    this.subscribers.set(channelName, [callback]);

    console.log(`📡 Subscribed to ${table} changes`);
  }

  unsubscribe(table) {
    const channelName = `${table}-changes`;
    const channel = this.channels.get(channelName);
    
    if (channel && supabase) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      this.subscribers.delete(channelName);
      console.log(`📡 Unsubscribed from ${table} changes`);
    }
  }

  unsubscribeAll() {
    this.channels.forEach((channel, name) => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    });
    this.channels.clear();
    this.subscribers.clear();
  }
}

export const realtimeSync = new RealtimeSync();

export const TABLES = {
  COMPANY_INFO: 'company_info',
  PROJECTS: 'projects',
  DRAWINGS: 'drawings',
  REPORTS: 'reports',
  DECISIONS: 'decisions',
  EXPENSES: 'expenses',
  INVOICES: 'invoices',
  CONTRACTORS: 'contractors',
  UNITS: 'units',
  LEADS: 'leads',
  CONTRACTS: 'contracts',
  SETTINGS: 'settings',
};

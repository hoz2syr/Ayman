import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderKanban, Receipt, FileText, Users, TrendingUp, DollarSign, AlertTriangle, Calendar, ArrowLeft, Home as HomeIcon } from 'lucide-react';
import { getProjects, getExpenses, getInvoices, getContractors, getCompanyInfo, getUnits, getLeads, getContracts } from '../utils/storage';

const Home = () => {
  const navigate = useNavigate();
  
  // Get all data
  const projects = useMemo(() => getProjects(), []);
  const expenses = useMemo(() => getExpenses(), []);
  const invoices = useMemo(() => getInvoices(), []);
  const contractors = useMemo(() => getContractors(), []);
  const company = useMemo(() => getCompanyInfo(), []);
  const units = useMemo(() => getUnits(), []);
  const leads = useMemo(() => getLeads(), []);
  const contracts = useMemo(() => getContracts(), []);

  // Calculate stats
  const stats = useMemo(() => {
    const totalBudget = projects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amountUSD || e.amount || 0)), 0);
    
    const availableUnits = units.filter(u => u.status === 'available').length;
    const soldUnits = units.filter(u => u.status === 'sold').length;
    const activeLeads = leads.filter(l => !['sold', 'cancelled'].includes(l.stage)).length;
    const totalSalesUSD = contracts.reduce((sum, c) => sum + (parseFloat(c.totalUSD) || 0), 0);
    
    return {
      projects: projects.length,
      expenses: expenses.length,
      invoices: invoices.length,
      contractors: contractors.length,
      totalBudget,
      totalExpenses,
      availableUnits,
      soldUnits,
      activeLeads,
      totalSalesUSD,
    };
  }, [projects, expenses, invoices, contractors, units, leads, contracts]);

  // Calculate alerts
  const alerts = useMemo(() => {
    const now = new Date();
    const result = { contracts: [], invoices: [], leads: [], units: [] };
    
    // Contracts expiring in 30 days
    contracts.forEach(c => {
      if (c.contractEndDate) {
        const endDate = new Date(c.contractEndDate);
        const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
          result.contracts.push({
            id: c.id,
            name: c.name,
            daysLeft: daysUntilExpiry,
            endDate: c.contractEndDate,
          });
        }
      }
    });
    
    // Invoices pending > 7 days
    invoices.forEach(inv => {
      if (inv.status === 'مفتوح' || inv.status === 'مسودة') {
        const issueDate = new Date(inv.issueDate);
        const daysPending = Math.ceil((now - issueDate) / (1000 * 60 * 60 * 24));
        
        if (daysPending > 7) {
          result.invoices.push({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            clientName: inv.clientName,
            daysPending,
            amount: inv.totalUSD || 0,
          });
        }
      }
    });
    
    // Leads in negotiating stage for more than 7 days
    leads.forEach(lead => {
      if (lead.stage === 'negotiating' && lead.contactDate) {
        const contactDate = new Date(lead.contactDate);
        const daysInNegotiation = Math.ceil((now - contactDate) / (1000 * 60 * 60 * 24));
        
        if (daysInNegotiation > 7) {
          result.leads.push({
            id: lead.id,
            name: lead.fullName,
            daysInNegotiation,
          });
        }
      }
    });
    
    // Reserved units without contract for more than 14 days
    units.forEach(unit => {
      if (unit.status === 'reserved' && unit.updatedAt) {
        const reservedDate = new Date(unit.updatedAt);
        const daysReserved = Math.ceil((now - reservedDate) / (1000 * 60 * 60 * 24));
        
        if (daysReserved > 14) {
          result.units.push({
            id: unit.id,
            unitNumber: unit.unitNumber,
            daysReserved,
          });
        }
      }
    });
    
    return result;
  }, [contractors, invoices, leads, units]);

  const statCards = [
    { title: 'المشاريع', value: stats.projects, icon: FolderKanban, color: 'bg-blue-500', path: '/projects' },
    { title: 'المصروفات', value: stats.expenses, icon: Receipt, color: 'bg-red-500', path: '/expenses' },
    { title: 'الفواتير', value: stats.invoices, icon: FileText, color: 'bg-green-500', path: '/invoices' },
    { title: 'المقاولون', value: stats.contractors, icon: Users, color: 'bg-yellow-500', path: '/contractors' },
  ];

  const salesCards = [
    { title: 'الوحدات المتاحة', value: stats.availableUnits, icon: HomeIcon, color: 'bg-green-500', path: '/sales' },
    { title: 'الوحدات المباعة', value: stats.soldUnits, icon: HomeIcon, color: 'bg-gray-500', path: '/sales' },
    { title: 'المهتمون النشطون', value: stats.activeLeads, icon: Users, color: 'bg-blue-500', path: '/sales' },
    { title: 'إجمالي المبيعات', value: `$${stats.totalSalesUSD.toLocaleString()}`, icon: DollarSign, color: 'bg-amber-500', path: '/sales' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Section */}
      <div className="card">
        <h1 className="text-2xl font-bold text-white mb-2">
          مرحباً بك، {company?.name || 'في BuildMaster Pro'}
        </h1>
        <p className="text-slate-400">نظام إدارة مشاريع البناء المتكامل</p>
      </div>

      {/* Alerts Section */}
      {(alerts.contracts.length > 0 || alerts.invoices.length > 0 || alerts.leads.length > 0 || alerts.units.length > 0) && (
        <div className="space-y-3">
          {/* Contract Alerts - Orange */}
          {alerts.contracts.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-orange-400" />
                <h3 className="font-semibold text-orange-400">عقود تنتهي قريباً</h3>
              </div>
              <div className="space-y-2">
                {alerts.contracts.map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-orange-500/5 p-2 rounded">
                    <div>
                      <span className="text-white">{c.name}</span>
                      <span className="text-orange-400 mr-2">({c.daysLeft} يوم)</span>
                    </div>
                    <button 
                      onClick={() => navigate('/contractors')}
                      className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-1"
                    >
                      عرض التفاصيل <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoice Alerts - Red */}
          {alerts.invoices.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="font-semibold text-red-400">فواتير معلقة منذ أكثر من 7 أيام</h3>
              </div>
              <div className="space-y-2">
                {alerts.invoices.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between bg-red-500/5 p-2 rounded">
                    <div>
                      <span className="text-white">{inv.invoiceNumber}</span>
                      <span className="text-slate-400 mr-2">- {inv.clientName}</span>
                      <span className="text-red-400 mr-2">({inv.daysPending} يوم)</span>
                    </div>
                    <button 
                      onClick={() => navigate('/invoices')}
                      className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                    >
                      عرض التفاصيل <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leads Negotiating Alert - Orange */}
          {alerts.leads.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-orange-400" />
                <h3 className="font-semibold text-orange-400">مهتمون في مرحلة تفاوض لأكثر من 7 أيام</h3>
              </div>
              <div className="space-y-2">
                {alerts.leads.map(lead => (
                  <div key={lead.id} className="flex items-center justify-between bg-orange-500/5 p-2 rounded">
                    <div>
                      <span className="text-white">{lead.name}</span>
                      <span className="text-orange-400 mr-2">({lead.daysInNegotiation} يوم)</span>
                    </div>
                    <button 
                      onClick={() => navigate('/sales')}
                      className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-1"
                    >
                      عرض التفاصيل <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reserved Units Alert - Red */}
          {alerts.units.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <HomeIcon className="w-5 h-5 text-red-400" />
                <h3 className="font-semibold text-red-400">وحدات محجوزة أكثر من 14 يوم بدون عقد</h3>
              </div>
              <div className="space-y-2">
                {alerts.units.map(unit => (
                  <div key={unit.id} className="flex items-center justify-between bg-red-500/5 p-2 rounded">
                    <div>
                      <span className="text-white">وحدة {unit.unitNumber}</span>
                      <span className="text-red-400 mr-2">({unit.daysReserved} يوم)</span>
                    </div>
                    <button 
                      onClick={() => navigate('/sales')}
                      className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                    >
                      عرض التفاصيل <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Link key={index} to={stat.path} className="card hover:ring-2 hover:ring-[#3b82f6] transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Sales Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {salesCards.map((stat, index) => (
          <Link key={index} to={stat.path} className="card hover:ring-2 hover:ring-[#3b82f6] transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">إجمالي الميزانية</h3>
            <DollarSign className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-3xl font-bold text-[#3b82f6]">
            {stats.totalBudget.toLocaleString('ar-SA')} ر.س
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">إجمالي المصروفات</h3>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-3xl font-bold text-[#ef4444]">
            ${stats.totalExpenses.toFixed(2)}
          </p>
          {stats.totalBudget > 0 && (
            <p className="text-sm text-slate-400 mt-2">
              نسبة الإنفاق: {((stats.totalExpenses / stats.totalBudget) * 100).toFixed(1)}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

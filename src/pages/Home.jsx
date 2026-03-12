import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderKanban, Receipt, FileText, Users, TrendingUp, DollarSign, AlertTriangle, Calendar, ArrowLeft, Home as HomeIcon, Building, BarChart3 } from 'lucide-react';
import { getProjects, getExpenses, getInvoices, getContractors, getCompanyInfo, getUnits, getLeads, getContracts } from '../utils/storage';
import { ExpensesPieChart, MonthlyExpensesChart, ProjectsBarChart, SalesLineChart } from '../components/shared/Charts';
import { SkeletonStats } from '../components/shared/Skeleton';

const Home = () => {
  const navigate = useNavigate();
  const [showCharts, setShowCharts] = useState(false);
  
  const projects = useMemo(() => getProjects(), []);
  const expenses = useMemo(() => getExpenses(), []);
  const invoices = useMemo(() => getInvoices(), []);
  const contractors = useMemo(() => getContractors(), []);
  const company = useMemo(() => getCompanyInfo(), []);
  const units = useMemo(() => getUnits(), []);
  const leads = useMemo(() => getLeads(), []);
  const contracts = useMemo(() => getContracts(), []);

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

  const alerts = useMemo(() => {
    const now = new Date();
    const result = { contracts: [], invoices: [], leads: [], units: [] };
    
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
  }, [contracts, invoices, leads, units]);

  const statCards = [
    { title: 'المشاريع', value: stats.projects, icon: FolderKanban, color: 'bg-blue-500', path: '/projects' },
    { title: 'المصروفات', value: stats.expenses, icon: Receipt, color: 'bg-red-500', path: '/expenses' },
    { title: 'الفواتير', value: stats.invoices, icon: FileText, color: 'bg-green-500', path: '/invoices' },
    { title: 'المقاولون', value: stats.contractors, icon: Users, color: 'bg-yellow-500', path: '/contractors' },
  ];

  const salesCards = [
    { title: 'الوحدات المتاحة', value: stats.availableUnits, icon: Building, color: 'bg-green-500', path: '/sales' },
    { title: 'الوحدات المباعة', value: stats.soldUnits, icon: HomeIcon, color: 'bg-gray-500', path: '/sales' },
    { title: 'المهتمون النشطون', value: stats.activeLeads, icon: Users, color: 'bg-blue-500', path: '/sales' },
    { title: 'إجمالي المبيعات', value: `$${stats.totalSalesUSD.toLocaleString()}`, icon: DollarSign, color: 'bg-amber-500', path: '/sales' },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6 animate-fadeIn">
      {/* Welcome Section */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">
              مرحباً بك، {company?.name || 'في BuildMaster Pro'}
            </h1>
            <p className="text-slate-400 text-sm">نظام إدارة مشاريع البناء المتكامل</p>
          </div>
          <div className="hidden sm:block w-16 h-16 bg-[#3b82f6] rounded-xl flex items-center justify-center">
            <Building className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(alerts.contracts.length > 0 || alerts.invoices.length > 0 || alerts.leads.length > 0 || alerts.units.length > 0) && (
        <div className="space-y-2 sm:space-y-3">
          {alerts.contracts.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 flex-shrink-0" />
                <h3 className="font-semibold text-orange-400 text-sm sm:text-base truncate">عقود تنتهي قريباً</h3>
              </div>
              <div className="space-y-2">
                {alerts.contracts.slice(0, 3).map(c => (
                  <div key={c.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-orange-500/5 p-2 rounded">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                      <span className="text-white text-sm truncate">{c.name}</span>
                      <span className="text-orange-400 text-xs shrink-0">({c.daysLeft} يوم)</span>
                    </div>
                    <button 
                      onClick={() => navigate('/contractors')}
                      className="text-orange-400 hover:text-orange-300 text-xs sm:text-sm flex items-center gap-1 self-start sm:self-center touch-target py-1"
                    >
                      عرض <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {alerts.contracts.length > 3 && (
                  <p className="text-orange-400 text-xs">و {alerts.contracts.length - 3} المزيد...</p>
                )}
              </div>
            </div>
          )}

          {alerts.invoices.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
                <h3 className="font-semibold text-red-400 text-sm sm:text-base truncate">فواتير معلقة</h3>
              </div>
              <div className="space-y-2">
                {alerts.invoices.slice(0, 3).map(inv => (
                  <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-red-500/5 p-2 rounded">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                      <span className="text-white text-sm truncate">{inv.invoiceNumber}</span>
                      <span className="text-slate-400 text-xs truncate">- {inv.clientName}</span>
                      <span className="text-red-400 text-xs shrink-0">({inv.daysPending} يوم)</span>
                    </div>
                    <button 
                      onClick={() => navigate('/invoices')}
                      className="text-red-400 hover:text-red-300 text-xs sm:text-sm flex items-center gap-1 self-start sm:self-center touch-target py-1"
                    >
                      عرض <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {alerts.leads.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 flex-shrink-0" />
                <h3 className="font-semibold text-orange-400 text-sm sm:text-base truncate">مهتمون في تفاوض</h3>
              </div>
              <div className="space-y-2">
                {alerts.leads.slice(0, 3).map(lead => (
                  <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-orange-500/5 p-2 rounded">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="text-white text-sm">{lead.name}</span>
                      <span className="text-orange-400 text-xs">({lead.daysInNegotiation} يوم)</span>
                    </div>
                    <button 
                      onClick={() => navigate('/sales')}
                      className="text-orange-400 hover:text-orange-300 text-xs sm:text-sm flex items-center gap-1 touch-target py-1"
                    >
                      عرض <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {alerts.units.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
                <h3 className="font-semibold text-red-400 text-sm sm:text-base truncate">وحدات محجوزة</h3>
              </div>
              <div className="space-y-2">
                {alerts.units.slice(0, 3).map(unit => (
                  <div key={unit.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-red-500/5 p-2 rounded">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="text-white text-sm">وحدة {unit.unitNumber}</span>
                      <span className="text-red-400 text-xs">({unit.daysReserved} يوم)</span>
                    </div>
                    <button 
                      onClick={() => navigate('/sales')}
                      className="text-red-400 hover:text-red-300 text-xs sm:text-sm flex items-center gap-1 touch-target py-1"
                    >
                      عرض <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {statCards.map((stat, index) => (
          <Link 
            key={index} 
            to={stat.path} 
            className="card hover:ring-2 hover:ring-[#3b82f6] transition-all touch-target"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-slate-400 text-xs sm:text-sm truncate">{stat.title}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0 ml-2`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Sales Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {salesCards.map((stat, index) => (
          <Link 
            key={index} 
            to={stat.path} 
            className="card hover:ring-2 hover:ring-[#3b82f6] transition-all touch-target"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-slate-400 text-xs sm:text-sm truncate">{stat.title}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-1 truncate">{stat.value}</p>
              </div>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0 ml-2`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">إجمالي الميزانية</h3>
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#3b82f6]">
            {stats.totalBudget.toLocaleString('ar-SA')} ر.س
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">إجمالي المصروفات</h3>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#ef4444]">
            ${stats.totalExpenses.toFixed(2)}
          </p>
          {stats.totalBudget > 0 && (
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              نسبة الإنفاق: {((stats.totalExpenses / stats.totalBudget) * 100).toFixed(1)}%
            </p>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="mt-4">
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="card w-full flex items-center justify-between hover:ring-2 hover:ring-[#3b82f6] transition-all"
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-[#3b82f6]" />
            <span className="font-semibold text-white">الرسوم البيانية والإحصائيات</span>
          </div>
          <span className={`transform transition-transform ${showCharts ? 'rotate-180' : ''}`}>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </span>
        </button>

        {showCharts && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-fadeIn">
            <MonthlyExpensesChart expenses={expenses} />
            <ExpensesPieChart expenses={expenses} />
            <ProjectsBarChart projects={projects} />
            <SalesLineChart contracts={contracts} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

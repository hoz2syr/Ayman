import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderKanban, Receipt, FileText, Users, TrendingUp, DollarSign, AlertTriangle, Calendar, ArrowLeft, Home as HomeIcon, Building, BarChart3, Activity, TrendingDown, Clock, Loader2 } from 'lucide-react';
import { getProjects, getExpenses, getInvoices, getContractors, getCompanyInfo, getUnits, getLeads, getContracts, subscribeToTable } from '../utils/storage';
import { ExpensesPieChart, MonthlyExpensesChart, ProjectsBarChart, SalesLineChart } from '../components/shared/Charts';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const SectionHeader = ({ title, icon: Icon, badge }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
        <Icon className="w-4 h-4 text-blue-400" />
      </div>
      <h2 className="text-base sm:text-lg font-semibold text-white">{title}</h2>
    </div>
    {badge}
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const [showCharts, setShowCharts] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [company, setCompany] = useState(null);
  const [units, setUnits] = useState([]);
  const [leads, setLeads] = useState([]);
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, expensesData, invoicesData, contractorsData, companyData, unitsData, leadsData, contractsData] = await Promise.all([
          getProjects(),
          getExpenses(),
          getInvoices(),
          getContractors(),
          getCompanyInfo(),
          getUnits(),
          getLeads(),
          getContracts()
        ]);
        
        setProjects(projectsData || []);
        setExpenses(expensesData || []);
        setInvoices(invoicesData || []);
        setContractors(contractorsData || []);
        setCompany(companyData);
        setUnits(unitsData || []);
        setLeads(leadsData || []);
        setContracts(contractsData || []);
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Realtime subscription - تحديث تلقائي عند تغيير البيانات
    const unsubscribes = [];
    const tables = ['projects', 'expenses', 'invoices', 'contractors', 'units', 'leads', 'contracts'];
    
    tables.forEach(table => {
      const unsub = subscribeToTable(table, () => {
        loadData(); // إعادة تحميل البيانات عند تغييرها
      });
      unsubscribes.push(unsub);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

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
    { title: 'المشاريع', value: stats.projects, icon: FolderKanban, color: 'blue', path: '/projects', delay: 0 },
    { title: 'المصروفات', value: stats.expenses, icon: Receipt, color: 'red', path: '/expenses', delay: 100 },
    { title: 'الفواتير', value: stats.invoices, icon: FileText, color: 'green', path: '/invoices', delay: 200 },
    { title: 'المقاولون', value: stats.contractors, icon: Users, color: 'amber', path: '/contractors', delay: 300 },
  ];

  const salesCards = [
    { title: 'الوحدات المتاحة', value: stats.availableUnits, icon: Building, color: 'emerald', path: '/sales', delay: 400 },
    { title: 'الوحدات المباعة', value: stats.soldUnits, icon: HomeIcon, color: 'indigo', path: '/sales', delay: 500 },
    { title: 'المهتمون النشطون', value: stats.activeLeads, icon: Users, color: 'purple', path: '/sales', delay: 600 },
    { title: 'إجمالي المبيعات', value: `$${stats.totalSalesUSD.toLocaleString()}`, icon: DollarSign, color: 'amber', path: '/sales', delay: 700 },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'bg-blue-500', text: 'text-blue-400' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'bg-red-500', text: 'text-red-400' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', icon: 'bg-green-500', text: 'text-green-400' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'bg-amber-500', text: 'text-amber-400' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: 'bg-emerald-500', text: 'text-emerald-400' },
    slate: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', icon: 'bg-slate-500', text: 'text-slate-400' },
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', icon: 'bg-indigo-500', text: 'text-indigo-400' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: 'bg-orange-500', text: 'text-orange-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: 'bg-purple-500', text: 'text-purple-400' },
  };

  const allCards = [
    ...statCards.map(card => ({ ...card, section: 'main' })),
    ...salesCards.map(card => ({ ...card, section: 'sales' })),
  ];

  const getCardsForSection = (section) => {
    return allCards.filter(card => card.section === section);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Section - Hero Style */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800/80 to-slate-800/40 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-700/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
              مرحباً بك، {company?.name || 'في BuildMaster Pro'}
            </h1>
            <p className="text-slate-400 text-sm">نظام إدارة مشاريع البناء المتكامل</p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Building className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section - Only show when there are alerts */}
      {(alerts.contracts.length > 0 || alerts.invoices.length > 0 || alerts.leads.length > 0 || alerts.units.length > 0) && (
        <div className="space-y-3">
          <SectionHeader title="التنبيهات والمهام المطلوبة" icon={AlertTriangle} />
          <div className="grid gap-3">
            {alerts.contracts.length > 0 && (
              <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-orange-400 text-sm">عقود تنتهي قريباً</h3>
                  <span className="mr-auto bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">{alerts.contracts.length}</span>
                </div>
                <div className="space-y-2">
                  {alerts.contracts.slice(0, 3).map(c => (
                    <div key={c.id} className="flex items-center justify-between bg-orange-500/5 p-3 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-white text-sm truncate">{c.name}</span>
                        <span className="text-orange-400 text-xs shrink-0">({c.daysLeft} يوم)</span>
                      </div>
                      <button onClick={() => navigate('/contractors')} className="text-orange-400 hover:text-orange-300 text-xs flex items-center gap-1 shrink-0">
                        عرض <ArrowLeft className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {alerts.invoices.length > 0 && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-red-400" />
                  </div>
                  <h3 className="font-semibold text-red-400 text-sm">فواتير معلقة</h3>
                  <span className="mr-auto bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">{alerts.invoices.length}</span>
                </div>
                <div className="space-y-2">
                  {alerts.invoices.slice(0, 3).map(inv => (
                    <div key={inv.id} className="flex items-center justify-between bg-red-500/5 p-3 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-white text-sm truncate">{inv.invoiceNumber}</span>
                        <span className="text-slate-400 text-xs truncate">- {inv.clientName}</span>
                        <span className="text-red-400 text-xs shrink-0">({inv.daysPending} يوم)</span>
                      </div>
                      <button onClick={() => navigate('/invoices')} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 shrink-0">
                        عرض <ArrowLeft className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {alerts.leads.length > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="font-semibold text-amber-400 text-sm">مهتمون في تفاوض</h3>
                  <span className="mr-auto bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">{alerts.leads.length}</span>
                </div>
                <div className="space-y-2">
                  {alerts.leads.slice(0, 3).map(lead => (
                    <div key={lead.id} className="flex items-center justify-between bg-amber-500/5 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">{lead.name}</span>
                        <span className="text-amber-400 text-xs">({lead.daysInNegotiation} يوم)</span>
                      </div>
                      <button onClick={() => navigate('/sales')} className="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1">
                        عرض <ArrowLeft className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {alerts.units.length > 0 && (
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <HomeIcon className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-purple-400 text-sm">وحدات محجوزة طويلاً</h3>
                  <span className="mr-auto bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full">{alerts.units.length}</span>
                </div>
                <div className="space-y-2">
                  {alerts.units.slice(0, 3).map(unit => (
                    <div key={unit.id} className="flex items-center justify-between bg-purple-500/5 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">وحدة {unit.unitNumber}</span>
                        <span className="text-purple-400 text-xs">({unit.daysReserved} يوم)</span>
                      </div>
                      <button onClick={() => navigate('/sales')} className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1">
                        عرض <ArrowLeft className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid - Main KPIs */}
      <div className="space-y-3">
        <SectionHeader title="إحصائيات المشاريع" icon={FolderKanban} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((stat, index) => (
            <Link key={index} to={stat.path}>
              <StatCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                delay={stat.delay}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Sales Stats Grid */}
      <div className="space-y-3">
        <SectionHeader title="مبيعات الوحدات" icon={DollarSign} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {salesCards.map((stat, index) => (
            <Link key={index} to={stat.path}>
              <StatCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                delay={stat.delay}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="space-y-3">
        <SectionHeader title="الملخص المالي" icon={TrendingUp} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm font-medium">إجمالي الميزانية</span>
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-blue-400">
              {stats.totalBudget.toLocaleString('ar-SA')} <span className="text-sm font-normal text-slate-400">ر.س</span>
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm font-medium">إجمالي المصروفات</span>
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-red-400">
              ${stats.totalExpenses.toLocaleString()}
            </p>
            {stats.totalBudget > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((stats.totalExpenses / stats.totalBudget) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-400 shrink-0">
                  {((stats.totalExpenses / stats.totalBudget) * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden">
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-slate-800/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <span className="font-semibold text-white">الرسوم البيانية والإحصائيات</span>
          </div>
          <span className={`transform transition-transform duration-300 ${showCharts ? 'rotate-180' : ''}`}>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </span>
        </button>

        {showCharts && (
          <div className="p-4 sm:p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
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

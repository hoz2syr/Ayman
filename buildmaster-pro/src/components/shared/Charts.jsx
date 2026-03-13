import { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
        <p className="text-white font-semibold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ExpensesPieChart = ({ expenses = [] }) => {
  const data = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, exp) => {
      const category = exp.category || 'أخرى';
      acc[category] = (acc[category] || 0) + (parseFloat(exp.amount) || 0);
      return acc;
    }, {});
    
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: Math.round(value)
    }));
  }, [expenses]);

  if (!data.length) {
    return (
      <div className="card flex items-center justify-center h-64">
        <p className="text-slate-400">لا توجد بيانات للعرض</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-4">توزيع المصروفات</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const MonthlyExpensesChart = ({ expenses = [] }) => {
  const data = useMemo(() => {
    const monthlyData = {};
    
    expenses.forEach(exp => {
      const date = new Date(exp.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (parseFloat(exp.amount) || 0);
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, amount]) => ({
        month,
        amount: Math.round(amount)
      }));
  }, [expenses]);

  if (!data.length) {
    return (
      <div className="card flex items-center justify-center h-64">
        <p className="text-slate-400">لا توجد بيانات للعرض</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-4">المصروفات الشهرية</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorAmount)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ProjectsBarChart = ({ projects = [] }) => {
  const data = useMemo(() => {
    return projects.slice(0, 5).map(p => ({
      name: p.name?.substring(0, 10) || 'بدون اسم',
      budget: parseFloat(p.budget) || 0,
      paid: parseFloat(p.paidAmount) || 0
    }));
  }, [projects]);

  if (!data.length) {
    return (
      <div className="card flex items-center justify-center h-64">
        <p className="text-slate-400">لا توجد بيانات للعرض</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-4">مقارنة ميزانيات المشاريع</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="budget" name="الميزانية" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="paid" name="المدفوع" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SalesLineChart = ({ contracts = [] }) => {
  const data = useMemo(() => {
    const monthlyData = {};
    
    contracts.forEach(c => {
      if (c.contractDate) {
        const date = new Date(c.contractDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (parseFloat(c.totalUSD) || 0);
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, total]) => ({
        month,
        total: Math.round(total)
      }));
  }, [contracts]);

  if (!data.length) {
    return (
      <div className="card flex items-center justify-center h-64">
        <p className="text-slate-400">لا توجد بيانات للعرض</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-4">المبيعات الشهرية</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#22c55e" 
            strokeWidth={3}
            dot={{ fill: '#22c55e', strokeWidth: 2 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const InvoicesStatusChart = ({ invoices = [] }) => {
  const data = useMemo(() => {
    const statusCounts = invoices.reduce((acc, inv) => {
      const status = inv.status || 'مفتوح';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value
    }));
  }, [invoices]);

  if (!data.length) {
    return (
      <div className="card flex items-center justify-center h-64">
        <p className="text-slate-400">لا توجد بيانات للعرض</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-4">حالة الفواتير</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default {
  ExpensesPieChart,
  MonthlyExpensesChart,
  ProjectsBarChart,
  SalesLineChart,
  InvoicesStatusChart
};

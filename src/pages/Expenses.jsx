import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, FileDown, Calendar, Filter } from 'lucide-react';
import { getExpenses, deleteExpense, getProjects, getContractors, getCompanyInfo } from '../utils/storage';
import ExpenseForm from '../components/forms/ExpenseForm';
import { generateExpensesPDF } from '../utils/PDFService';
import { exportExpensesToExcel } from '../utils/exportExcel';
import DatePicker from '../components/shared/DatePicker';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import { useToast } from '../components/shared/Toast';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';

const Expenses = () => {
  const { showToast } = useToast();
  const [expenseModal, setExpenseModal] = useState({ isOpen: false, expense: null });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  
  const refreshData = () => setRefreshTrigger(prev => prev + 1);
  
  // Force re-render on refresh trigger
  useEffect(() => {}, [refreshTrigger]);
  
  // Filters
  const [dateFilter, setDateFilter] = useState('all'); // all, daily, weekly, monthly
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  
  const expenses = getExpenses();
  const projects = getProjects();
  const contractors = getContractors();

  // Calculate totals by category
  const totals = useMemo(() => {
    const result = {
      wages: 0,    // أجور عمال
      materials: 0, // مواد بناء
      equipment: 0, // معدات
      operations: 0, // تشغيل
      total: 0
    };
    
    expenses.forEach(e => {
      const amount = parseFloat(e.amount || 0);
      result.total += amount;
      
      switch (e.category) {
        case 'أجور عمال':
        case 'عمالة':
          result.wages += amount;
          break;
        case 'مواد بناء':
          result.materials += amount;
          break;
        case 'معدات':
          result.equipment += amount;
          break;
        case 'تشغيل':
        case 'نقل':
        case 'أخرى':
          result.operations += amount;
          break;
        default:
          result.operations += amount;
      }
    });
    
    return result;
  }, [expenses]);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];
    
    // Date filter
    const now = new Date();
    if (dateFilter !== 'all') {
      filtered = filtered.filter(e => {
        if (!e.date) return false;
        const expenseDate = new Date(e.date);
        
        if (dateFilter === 'daily') {
          return expenseDate.toDateString() === now.toDateString();
        } else if (dateFilter === 'weekly') {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return expenseDate >= weekAgo;
        } else if (dateFilter === 'monthly') {
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return expenseDate >= monthAgo;
        }
        return true;
      });
    }
    
    // Date range filter
    if (startDate) {
      filtered = filtered.filter(e => e.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(e => e.date <= endDate);
    }
    
    // Project filter
    if (projectFilter !== 'all') {
      filtered = filtered.filter(e => e.projectId === projectFilter);
    }
    
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, dateFilter, startDate, endDate, projectFilter]);

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'عام';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'أجور عمال': 'أجور',
      'عمالة': 'أجور',
      'مواد بناء': 'مواد',
      'معدات': 'معدات',
      'تشغيل': 'تشغيل',
      'نقل': 'نقل',
      'أخرى': 'أخرى',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'أجور عمال': 'bg-green-500',
      'عمالة': 'bg-green-500',
      'مواد بناء': 'bg-blue-500',
      'معدات': 'bg-orange-500',
      'تشغيل': 'bg-purple-500',
      'نقل': 'bg-yellow-500',
      'أخرى': 'bg-slate-500',
    };
    return colors[category] || 'bg-slate-500';
  };

  const handleDelete = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const executeDelete = () => {
    deleteExpense(deleteConfirm.id);
    showToast('تم حذف المصروف بنجاح', 'success');
    refreshData();
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const handleOpenModal = (expense = null) => {
    setExpenseModal({ isOpen: true, expense });
  };

  // Prepare expense data for PDF
  const prepareExpenseData = () => {
    const expenseList = filteredExpenses.map(e => ({
      date: e.date,
      description: e.description,
      category: e.category,
      projectName: getProjectName(e.projectId),
      amount: Number.parseFloat(e.amountUSD) || 0,
      exchangeRate: e.exchangeRate || getSettings()?.exchangeRateUSD || 13000,
    }));
    
    // Get the most common exchange rate or use the first one
    const exchangeRates = expenseList.map(e => e.exchangeRate).filter(Boolean);
    const defaultExchangeRate = exchangeRates.length > 0 ? exchangeRates[0] : (getSettings()?.exchangeRateUSD || 13000);
    
    return {
      expenses: expenseList,
      totals,
      exchangeRate: defaultExchangeRate,
      projectName: projectFilter !== 'all' ? getProjectName(projectFilter) : null,
      dateRange: startDate && endDate ? `${startDate} - ${endDate}` : 
                 dateFilter !== 'all' ? 
                 (dateFilter === 'daily' ? 'اليومي' : 
                  dateFilter === 'weekly' ? 'الأسبوعي' : 'الشهري') : 'الكل',
    };
  };

  // Get company info
  const companyInfo = getCompanyInfo();

  const handleExportExcel = () => {
    exportExpensesToExcel(expenses, projects, contractors, projectFilter !== 'all' ? projectFilter : null);
  };

  const handleExportPDF = async () => {
    try {
      const expenseData = prepareExpenseData();
      
      if (!expenseData.expenses || expenseData.expenses.length === 0) {
        showToast('لا توجد مصروفات للتصدير', 'warning');
        return;
      }
      
      const filename = (() => {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const companyName = companyInfo?.name?.replace(/[^a-zA-Zأ-ي]/g, '_') || 'Company';
        const projectName = expenseData.projectName 
          ? expenseData.projectName.replace(/[^a-zA-Zأ-ي]/g, '_')
          : 'عام';
        
        const seq = String(expenseData.expenses.length).padStart(3, '0');
        
        const filename = `${companyName}_${projectName}_مصروف_${seq}_${dateStr}`;
        
        return filename;
      })();
      
      const result = await generateExpensesPDF(expenseData, companyInfo, {
        projectName: expenseData.projectName,
        dateRange: expenseData.dateRange,
        filename: filename,
      });
      
      if (result?.success) {
        showToast('تم تصدير المصاريف بنجاح', 'success');
      } else {
        showToast(result?.error || 'حدث خطأ في إنشاء ملف PDF', 'error');
      }
    } catch (error) {
      console.error('PDF Export Error:', error);
      showToast('حدث خطأ في إنشاء ملف PDF: ' + error.message, 'error');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white">المصاريف</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center gap-1 md:gap-2 text-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">إضافة مصروف</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">الفلترة:</span>
          </div>
          
          {/* Date Type Filter */}
          <div className="flex gap-1 bg-slate-700 rounded-lg p-1 overflow-x-auto">
            {[
              { value: 'all', label: 'الكل' },
              { value: 'daily', label: 'يومي' },
              { value: 'weekly', label: 'أسبوعي' },
              { value: 'monthly', label: 'شهري' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setDateFilter(opt.value)}
                className={`px-2 md:px-3 py-1.5 text-xs md:text-sm rounded-md transition-colors whitespace-nowrap ${
                  dateFilter === opt.value
                    ? 'bg-[#3b82f6] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Date Range */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <DatePicker
              value={startDate}
              onChange={(date) => setStartDate(date)}
              placeholder="من"
              className="w-full sm:w-32 md:w-36"
            />
            <span className="text-slate-400">-</span>
            <DatePicker
              value={endDate}
              onChange={(date) => setEndDate(date)}
              placeholder="إلى"
              className="w-full sm:w-32 md:w-36"
            />
          </div>

          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="form-input text-sm w-40"
          >
            <option value="all">كل المشاريع</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Clear Filters */}
          {(dateFilter !== 'all' || startDate || endDate || projectFilter !== 'all') && (
            <button
              onClick={() => {
                setDateFilter('all');
                setStartDate('');
                setEndDate('');
                setProjectFilter('all');
              }}
              className="text-sm text-red-400 hover:text-red-300"
            >
              إعادة تعيين
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-green-600/20 to-green-600/5 border border-green-500/30">
          <p className="text-sm text-green-400 mb-1">أجور العمال</p>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(totals.wages)}</p>
          <p className="text-xs text-slate-400">دولار</p>
        </div>
        
        <div className="card bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-500/30">
          <p className="text-sm text-blue-400 mb-1">مواد البناء</p>
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(totals.materials)}</p>
          <p className="text-xs text-slate-400">دولار</p>
        </div>
        
        <div className="card bg-gradient-to-br from-orange-600/20 to-orange-600/5 border border-orange-500/30">
          <p className="text-sm text-orange-400 mb-1">المعدات</p>
          <p className="text-2xl font-bold text-orange-400">{formatCurrency(totals.equipment)}</p>
          <p className="text-xs text-slate-400">دولار</p>
        </div>
        
        <div className="card bg-gradient-to-br from-purple-600/20 to-purple-600/5 border border-purple-500/30">
          <p className="text-sm text-purple-400 mb-1">التشغيل</p>
          <p className="text-2xl font-bold text-purple-400">{formatCurrency(totals.operations)}</p>
          <p className="text-xs text-slate-400">دولار</p>
        </div>
      </div>

      {/* Expenses Table */}
      {filteredExpenses.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400 mb-4">لا توجد مصروفات</p>
          <button onClick={() => handleOpenModal()} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            إضافة مصروف
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="text-right p-2 md:p-3 text-xs md:text-sm text-slate-400">الوصف</th>
                  <th className="text-right p-2 md:p-3 text-xs md:text-sm text-slate-400 hidden sm:table-cell">النوع</th>
                  <th className="text-right p-2 md:p-3 text-xs md:text-sm text-slate-400 hidden md:table-cell">المشروع</th>
                  <th className="text-right p-2 md:p-3 text-xs md:text-sm text-slate-400">التاريخ</th>
                  <th className="text-right p-2 md:p-3 text-xs md:text-sm text-slate-400">دولار</th>
                  <th className="text-right p-2 md:p-3 text-xs md:text-sm text-slate-400 hidden sm:table-cell">ل.س</th>
                  <th className="text-center p-2 md:p-3 text-xs md:text-sm text-slate-400">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-t border-slate-700 hover:bg-slate-700/30">
                    <td className="p-2 md:p-3 text-white text-sm">{expense.description}</td>
                    <td className="p-2 md:p-3 hidden sm:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${getCategoryColor(expense.category)}`}>
                        {getCategoryLabel(expense.category)}
                      </span>
                    </td>
                    <td className="p-2 md:p-3 text-slate-300 text-sm hidden md:table-cell">{getProjectName(expense.projectId)}</td>
                    <td className="p-2 md:p-3 text-slate-300 text-sm">{expense.date}</td>
                    <td className="p-2 md:p-3 text-green-400 font-medium text-sm">
                      {expense.amountUSD ? formatCurrency(expense.amountUSD) : '-'}
                    </td>
                    <td className="p-2 md:p-3 text-yellow-400 font-medium text-sm hidden sm:table-cell">
                      {expense.amountSYP ? formatCurrency(expense.amountSYP) : '-'}
                    </td>
                    <td className="p-2 md:p-3">
                      <div className="flex justify-center gap-1 md:gap-2">
                        <button 
                          onClick={() => handleOpenModal(expense)}
                          className="p-1.5 md:p-2 text-blue-500 hover:bg-slate-700 rounded"
                        >
                          <Edit className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 text-red-500 hover:bg-slate-700 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-800 font-bold">
                <tr>
                  <td colSpan={4} className="p-3 text-white text-left">الإجمالي</td>
                  <td className="p-3 text-green-400">
                    {formatCurrency(filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amountUSD || 0), 0))}
                  </td>
                  <td className="p-3 text-yellow-400">
                    {formatCurrency(filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amountSYP || 0), 0))}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {expenseModal.isOpen && (
        <ExpenseForm
          expense={expenseModal.expense}
          projects={projects}
          onClose={() => setExpenseModal({ isOpen: false, expense: null })}
          onSave={() => refreshData()}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={executeDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا المصروف؟"
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
      />
    </div>
  );
};

export default Expenses;

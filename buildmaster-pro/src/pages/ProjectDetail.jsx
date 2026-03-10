import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Edit, 
  Trash2, 
  Download, 
  FileText,
  Gavel,
  DollarSign,
  FileImage,
  Plus
} from 'lucide-react';
import { 
  getProject, 
  deleteProject, 
  getExpensesByProject,
  getDrawingsByProject,
  getReportsByProject,
  getDecisionsByProject,
  saveDrawing,
  deleteDrawing,
  saveReport,
  deleteReport,
  saveDecision,
  deleteDecision,
  saveExpense,
  deleteExpense
} from '../utils/storage';
import Modal from '../components/shared/Modal';
import ConfirmDialog from '../components/shared/ConfirmDialog';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('drawings');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Modals state
  const [drawingModal, setDrawingModal] = useState({ isOpen: false });
  const [reportModal, setReportModal] = useState({ isOpen: false });
  const [decisionModal, setDecisionModal] = useState({ isOpen: false });
  const [expenseModal, setExpenseModal] = useState({ isOpen: false });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: null, itemId: null });

  // Form states
  const [drawingForm, setDrawingForm] = useState({ name: '', type: '', description: '' });
  const [reportForm, setReportForm] = useState({ subject: '', date: '', engineer: '', description: '' });
  const [decisionForm, setDecisionForm] = useState({ subject: '', date: '', responsibleParty: '', description: '' });
  const [expenseForm, setExpenseForm] = useState({ category: '', description: '', amount: 0, date: '', notes: '' });

  const loadData = () => setRefreshKey(k => k + 1);

  const project = getProject(id);
  const expenses = getExpensesByProject(id);
  const drawings = getDrawingsByProject(id);
  const reports = getReportsByProject(id);
  const decisions = getDecisionsByProject(id);

  if (!project) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-400">المشروع غير موجود</p>
        <Link to="/projects" className="btn-primary inline-flex items-center gap-2 mt-4">
          <ArrowRight className="w-4 h-4" />
          العودة للمشاريع
        </Link>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'مكتمل': return 'bg-green-500';
      case 'قيد التنفيذ': return 'bg-blue-500';
      case 'متوقف': return 'bg-yellow-500';
      case 'ملغى': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  // Drawing handlers
  const handleOpenDrawingModal = (drawing = null) => {
    if (drawing) {
      setDrawingForm(drawing);
    } else {
      setDrawingForm({ name: '', type: '', description: '' });
    }
    setDrawingModal({ isOpen: true });
  };

  const handleSaveDrawing = (e) => {
    e.preventDefault();
    saveDrawing({ ...drawingForm, projectId: id });
    loadData();
    setDrawingModal({ isOpen: false });
  };

  const handleDeleteDrawing = (drawingId) => {
    setDeleteConfirm({ isOpen: true, type: 'drawing', itemId: drawingId });
  };

  // Report handlers
  const handleOpenReportModal = (report = null) => {
    if (report) {
      setReportForm(report);
    } else {
      setReportForm({ subject: '', date: '', engineer: '', description: '' });
    }
    setReportModal({ isOpen: true });
  };

  const handleSaveReport = (e) => {
    e.preventDefault();
    saveReport({ ...reportForm, projectId: id });
    loadData();
    setReportModal({ isOpen: false });
  };

  const handleDeleteReport = (reportId) => {
    setDeleteConfirm({ isOpen: true, type: 'report', itemId: reportId });
  };

  // Decision handlers
  const handleOpenDecisionModal = (decision = null) => {
    if (decision) {
      setDecisionForm(decision);
    } else {
      setDecisionForm({ subject: '', date: '', responsibleParty: '', description: '' });
    }
    setDecisionModal({ isOpen: true });
  };

  const handleSaveDecision = (e) => {
    e.preventDefault();
    saveDecision({ ...decisionForm, projectId: id });
    loadData();
    setDecisionModal({ isOpen: false });
  };

  const handleDeleteDecision = (decisionId) => {
    setDeleteConfirm({ isOpen: true, type: 'decision', itemId: decisionId });
  };

  // Expense handlers
  const handleOpenExpenseModal = (expense = null) => {
    if (expense) {
      setExpenseForm(expense);
    } else {
      setExpenseForm({ category: '', description: '', amount: 0, date: '', notes: '' });
    }
    setExpenseModal({ isOpen: true });
  };

  const handleSaveExpense = (e) => {
    e.preventDefault();
    saveExpense({ ...expenseForm, projectId: id, amount: parseFloat(expenseForm.amount) || 0 });
    loadData();
    setExpenseModal({ isOpen: false });
  };

  const handleDeleteExpense = (expenseId) => {
    setDeleteConfirm({ isOpen: true, type: 'expense', itemId: expenseId });
  };

  const handleConfirmDelete = () => {
    const { type, itemId } = deleteConfirm;
    if (type === 'drawing') deleteDrawing(itemId);
    else if (type === 'report') deleteReport(itemId);
    else if (type === 'decision') deleteDecision(itemId);
    else if (type === 'expense') deleteExpense(itemId);
    else if (type === 'project') {
      deleteProject(itemId);
      navigate('/projects');
    }
    loadData();
    setDeleteConfirm({ isOpen: false, type: null, itemId: null });
  };

  const handleDeleteProject = () => {
    setDeleteConfirm({ isOpen: true, type: 'project', itemId: id });
  };

  const tabs = [
    { id: 'drawings', label: 'المخططات', icon: FileImage },
    { id: 'reports', label: 'التقارير الهندسية', icon: FileText },
    { id: 'decisions', label: 'القرارات الهندسية', icon: Gavel },
    { id: 'expenses', label: 'المصاريف', icon: DollarSign },
  ];

  const drawingTypes = ['معماري', 'إنشائي', 'كهرباء', 'صرف', 'تكييف', 'ميكانيك', 'أخرى'];
  const expenseCategories = ['مواد بناء', 'معدات', 'عمالة', 'نقل', 'أخرى'];

  return (
    <div className="space-y-6 animate-fadeIn" key={refreshKey}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/projects" className="text-slate-400 hover:text-white text-sm mb-2 inline-flex items-center gap-1">
            <ArrowRight className="w-4 h-4" />
            العودة للمشاريع
          </Link>
          <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          <span className={`inline-block px-2 py-1 rounded-full text-xs text-white mt-2 ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
        <div className="flex gap-2">
          <Link to={`/projects/${id}/edit`} className="btn-primary flex items-center gap-2">
            <Edit className="w-4 h-4" />
            تعديل
          </Link>
          <button onClick={handleDeleteProject} className="btn-danger flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            حذف
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#3b82f6] text-[#3b82f6]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Drawings Tab */}
        {activeTab === 'drawings' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">المخططات</h3>
              <button onClick={() => handleOpenDrawingModal()} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                رفع مخطط
              </button>
            </div>
            
            {drawings.length === 0 ? (
              <div className="card text-center py-8">
                <FileImage className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">لا توجد مخططات بعد</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="text-right p-3 text-sm text-slate-400">اسم الملف</th>
                      <th className="text-right p-3 text-sm text-slate-400">النوع</th>
                      <th className="text-right p-3 text-sm text-slate-400">تاريخ الرفع</th>
                      <th className="text-center p-3 text-sm text-slate-400">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drawings.map(drawing => (
                      <tr key={drawing.id} className="border-t border-slate-700">
                        <td className="p-3 text-white">{drawing.name}</td>
                        <td className="p-3 text-slate-400">{drawing.type}</td>
                        <td className="p-3 text-slate-400">{drawing.uploadedAt?.split('T')[0] || '-'}</td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <button className="p-2 text-blue-500 hover:bg-slate-700 rounded">
                              <Download className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteDrawing(drawing.id)} className="p-2 text-red-500 hover:bg-slate-700 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">التقارير الهندسية</h3>
              <button onClick={() => handleOpenReportModal()} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                تقرير جديد
              </button>
            </div>
            
            {reports.length === 0 ? (
              <div className="card text-center py-8">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">لا توجد تقارير بعد</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="text-right p-3 text-sm text-slate-400">رقم التقرير</th>
                      <th className="text-right p-3 text-sm text-slate-400">الموضوع</th>
                      <th className="text-right p-3 text-sm text-slate-400">التاريخ</th>
                      <th className="text-right p-3 text-sm text-slate-400">المهندس</th>
                      <th className="text-center p-3 text-sm text-slate-400">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report.id} className="border-t border-slate-700">
                        <td className="p-3 text-white">{report.reportNumber}</td>
                        <td className="p-3 text-white">{report.subject}</td>
                        <td className="p-3 text-slate-400">{report.date}</td>
                        <td className="p-3 text-slate-400">{report.engineer}</td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleDeleteReport(report.id)} className="p-2 text-red-500 hover:bg-slate-700 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Decisions Tab */}
        {activeTab === 'decisions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">القرارات الهندسية</h3>
              <button onClick={() => handleOpenDecisionModal()} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                قرار جديد
              </button>
            </div>
            
            {decisions.length === 0 ? (
              <div className="card text-center py-8">
                <Gavel className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">لا توجد قرارات بعد</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="text-right p-3 text-sm text-slate-400">رقم القرار</th>
                      <th className="text-right p-3 text-sm text-slate-400">الموضوع</th>
                      <th className="text-right p-3 text-sm text-slate-400">التاريخ</th>
                      <th className="text-right p-3 text-sm text-slate-400">الجهة المسؤولة</th>
                      <th className="text-center p-3 text-sm text-slate-400">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {decisions.map(decision => (
                      <tr key={decision.id} className="border-t border-slate-700">
                        <td className="p-3 text-white">{decision.decisionNumber}</td>
                        <td className="p-3 text-white">{decision.subject}</td>
                        <td className="p-3 text-slate-400">{decision.date}</td>
                        <td className="p-3 text-slate-400">{decision.responsibleParty}</td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleDeleteDecision(decision.id)} className="p-2 text-red-500 hover:bg-slate-700 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">المصاريف</h3>
              <button onClick={() => handleOpenExpenseModal()} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                مصروف جديد
              </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <p className="text-slate-400 text-sm">إجمالي المصروفات</p>
                <p className="text-2xl font-bold text-[#ef4444]">{totalExpenses.toLocaleString('ar-SA')} ر.س</p>
              </div>
              <div className="card">
                <p className="text-slate-400 text-sm">الميزانية</p>
                <p className="text-2xl font-bold text-white">{parseFloat(project.budget || 0).toLocaleString('ar-SA')} ر.س</p>
              </div>
              <div className="card">
                <p className="text-slate-400 text-sm">المتبقي</p>
                <p className="text-2xl font-bold text-[#22c55e]">{(parseFloat(project.budget || 0) - totalExpenses).toLocaleString('ar-SA')} ر.س</p>
              </div>
            </div>
            
            {expenses.length === 0 ? (
              <div className="card text-center py-8">
                <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">لا توجد مصروفات بعد</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="text-right p-3 text-sm text-slate-400">الوصف</th>
                      <th className="text-right p-3 text-sm text-slate-400">الفئة</th>
                      <th className="text-right p-3 text-sm text-slate-400">التاريخ</th>
                      <th className="text-right p-3 text-sm text-slate-400">المبلغ</th>
                      <th className="text-center p-3 text-sm text-slate-400">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(expense => (
                      <tr key={expense.id} className="border-t border-slate-700">
                        <td className="p-3 text-white">{expense.description}</td>
                        <td className="p-3 text-slate-400">{expense.category}</td>
                        <td className="p-3 text-slate-400">{expense.date}</td>
                        <td className="p-3 text-[#ef4444] font-medium">{parseFloat(expense.amount || 0).toLocaleString('ar-SA')} ر.س</td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleOpenExpenseModal(expense)} className="p-2 text-blue-500 hover:bg-slate-700 rounded">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteExpense(expense.id)} className="p-2 text-red-500 hover:bg-slate-700 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawing Modal */}
      <Modal isOpen={drawingModal.isOpen} onClose={() => setDrawingModal({ isOpen: false })} title="رفع مخطط" size="md">
        <form onSubmit={handleSaveDrawing} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">اسم الملف *</label>
            <input type="text" required value={drawingForm.name} onChange={e => setDrawingForm({...drawingForm, name: e.target.value})} className="form-input" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">النوع</label>
            <select value={drawingForm.type} onChange={e => setDrawingForm({...drawingForm, type: e.target.value})} className="form-input">
              <option value="">اختر النوع</option>
              {drawingTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">الوصف</label>
            <textarea value={drawingForm.description} onChange={e => setDrawingForm({...drawingForm, description: e.target.value})} className="form-input" rows={3} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setDrawingModal({ isOpen: false })} className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg">إلغاء</button>
            <button type="submit" className="btn-primary">حفظ</button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={reportModal.isOpen} onClose={() => setReportModal({ isOpen: false })} title="تقرير هندسي جديد" size="md">
        <form onSubmit={handleSaveReport} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">الموضوع *</label>
            <input type="text" required value={reportForm.subject} onChange={e => setReportForm({...reportForm, subject: e.target.value})} className="form-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">التاريخ</label>
              <input type="date" value={reportForm.date} onChange={e => setReportForm({...reportForm, date: e.target.value})} className="form-input" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">المهندس</label>
              <input type="text" value={reportForm.engineer} onChange={e => setReportForm({...reportForm, engineer: e.target.value})} className="form-input" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">الوصف</label>
            <textarea value={reportForm.description} onChange={e => setReportForm({...reportForm, description: e.target.value})} className="form-input" rows={3} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setReportModal({ isOpen: false })} className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg">إلغاء</button>
            <button type="submit" className="btn-primary">حفظ</button>
          </div>
        </form>
      </Modal>

      {/* Decision Modal */}
      <Modal isOpen={decisionModal.isOpen} onClose={() => setDecisionModal({ isOpen: false })} title="قرار هندسي جديد" size="md">
        <form onSubmit={handleSaveDecision} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">الموضوع *</label>
            <input type="text" required value={decisionForm.subject} onChange={e => setDecisionForm({...decisionForm, subject: e.target.value})} className="form-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">التاريخ</label>
              <input type="date" value={decisionForm.date} onChange={e => setDecisionForm({...decisionForm, date: e.target.value})} className="form-input" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">الجهة المسؤولة</label>
              <input type="text" value={decisionForm.responsibleParty} onChange={e => setDecisionForm({...decisionForm, responsibleParty: e.target.value})} className="form-input" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">الوصف</label>
            <textarea value={decisionForm.description} onChange={e => setDecisionForm({...decisionForm, description: e.target.value})} className="form-input" rows={3} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setDecisionModal({ isOpen: false })} className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg">إلغاء</button>
            <button type="submit" className="btn-primary">حفظ</button>
          </div>
        </form>
      </Modal>

      {/* Expense Modal */}
      <Modal isOpen={expenseModal.isOpen} onClose={() => setExpenseModal({ isOpen: false })} title="مصروف جديد" size="md">
        <form onSubmit={handleSaveExpense} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">الوصف *</label>
            <input type="text" required value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} className="form-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">المبلغ (ر.س)</label>
              <input type="number" step="0.01" min="0" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} className="form-input" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">التاريخ</label>
              <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} className="form-input" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">الفئة</label>
            <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} className="form-input">
              <option value="">اختر الفئة</option>
              {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">ملاحظات</label>
            <textarea value={expenseForm.notes} onChange={e => setExpenseForm({...expenseForm, notes: e.target.value})} className="form-input" rows={2} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setExpenseModal({ isOpen: false })} className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg">إلغاء</button>
            <button type="submit" className="btn-primary">حفظ</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, type: null, itemId: null })}
        onConfirm={handleConfirmDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا العنصر؟"
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
      />
    </div>
  );
};

export default ProjectDetail;

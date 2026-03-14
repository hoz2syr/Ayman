import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, FileText, LayoutGrid, Table as TableIcon, Loader2 } from 'lucide-react';
import { getProjects, saveProject, deleteProject, getInvoicesByProject, getExpensesByProject, subscribeToTable } from '../utils/storage';
import Modal from '../components/shared/Modal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import DatePicker from '../components/shared/DatePicker';
import LocationPicker from '../components/shared/LocationPicker';
import { useToast } from '../components/shared/Toast';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const Projects = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, projectId: null });
  const [viewMode, setViewMode] = useState('table');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      showToast('خطأ في تحميل المشاريع', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();

    // Realtime subscription - تحديث تلقائي عند تغيير المشاريع
    const unsub = subscribeToTable('projects', () => {
      loadProjects();
    });

    return () => unsub();
  }, [loadProjects]);

  const filteredProjects = projects.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProjectStats = async (projectId) => {
    const invoices = await getInvoicesByProject(projectId);
    const expenses = await getExpensesByProject(projectId);
    return {
      invoiceCount: invoices.length,
      expenseCount: expenses.length,
      totalExpenses: expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
    };
  };

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'قيد التنفيذ',
    budget: 0,
    clientName: '',
    clientPhone: '',
    clientEmail: ''
  });

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name || '',
        location: project.location || '',
        description: project.description || '',
        startDate: project.start_date || '',
        endDate: project.end_date || '',
        status: project.status || 'قيد التنفيذ',
        budget: project.budget || 0,
        clientName: project.client_name || '',
        clientPhone: project.client_phone || '',
        clientEmail: project.client_email || ''
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        location: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'قيد التنفيذ',
        budget: 0,
        clientName: '',
        clientPhone: '',
        clientEmail: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const projectData = {
      ...formData,
      id: editingProject?.id || null,
      budget: parseFloat(formData.budget) || 0
    };

    const resultId = await saveProject(projectData);
    if (resultId) {
      showToast(editingProject ? 'تم تحديث المشروع بنجاح' : 'تم إضافة المشروع بنجاح', 'success');
      await loadProjects();
      handleCloseModal();
    } else {
      showToast('خطأ في حفظ المشروع', 'error');
    }
  };

  const handleDeleteClick = (projectId) => {
    setDeleteConfirm({ isOpen: true, projectId });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm.projectId) {
      const success = await deleteProject(deleteConfirm.projectId);
      if (success) {
        showToast('تم حذف المشروع بنجاح', 'success');
        await loadProjects();
      } else {
        showToast('خطأ في حذف المشروع', 'error');
      }
    }
    setDeleteConfirm({ isOpen: false, projectId: null });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'مكتمل': return 'bg-green-500';
      case 'قيد التنفيذ': return 'bg-blue-500';
      case 'متوقف': return 'bg-yellow-500';
      case 'ملغى': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const statusOptions = ['قيد التنفيذ', 'مكتمل', 'متوقف', 'ملغى'];

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'مكتمل': return 'success';
      case 'قيد التنفيذ': return 'info';
      case 'متوقف': return 'warning';
      case 'ملغى': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="mr-3 text-slate-400">جاري تحميل المشاريع...</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 z-10" />
              <input
                type="text"
                placeholder="البحث في المشاريع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-600 bg-slate-800/50 px-4 pr-10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  title="عرض جدولي"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  title="عرض بطاقات"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
              <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">مشروع جديد</span>
                <span className="sm:hidden">+</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Projects View */}
      {filteredProjects.length === 0 ? (
        <Card variant="default" className="text-center py-12">
          <p className="text-slate-400 mb-4">لا توجد مشاريع بعد</p>
          <Button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            إضافة مشروع جديد
          </Button>
        </Card>
      ) : viewMode === 'table' ? (
        /* Data Table View */
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="text-right p-3 text-sm text-slate-400">اسم المشروع</th>
                <th className="text-right p-3 text-sm text-slate-400 hidden md:table-cell">الموقع</th>
                <th className="text-right p-3 text-sm text-slate-400 hidden lg:table-cell">العميل</th>
                <th className="text-right p-3 text-sm text-slate-400">الحالة</th>
                <th className="text-right p-3 text-sm text-slate-400 hidden md:table-cell">الميزانية</th>
                <th className="text-center p-3 text-sm text-slate-400">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id} className="border-t border-slate-700 hover:bg-slate-700/30">
                  <td className="p-3">
                    <Link to={`/projects/${project.id}`} className="text-white font-medium hover:text-[#3b82f6]">
                      {project.name}
                    </Link>
                  </td>
                  <td className="p-3 text-slate-300 hidden md:table-cell">{project.location || '-'}</td>
                  <td className="p-3 text-slate-300 hidden lg:table-cell">{project.client_name || '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="p-3 text-green-400 hidden md:table-cell">
                    {parseFloat(project.budget || 0).toLocaleString('ar-SA')} ر.س
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-1">
                      <Link to={`/projects/${project.id}`} className="p-2 text-blue-500 hover:bg-slate-700 rounded" title="عرض">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleOpenModal(project)} className="p-2 text-slate-400 hover:text-[#3b82f6] hover:bg-slate-700 rounded" title="تعديل">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteClick(project.id)} className="p-2 text-red-500 hover:bg-slate-700 rounded" title="حذف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div key={project.id} className="card hover:ring-2 hover:ring-[#3b82f6] transition-all">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-white truncate flex-1">{project.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-slate-400 mb-4">
                <p>📍 {project.location || 'غير محدد'}</p>
                <p>👤 {project.client_name || 'غير محدد'}</p>
                <p>💰 {parseFloat(project.budget || 0).toLocaleString('ar-SA')} ر.س</p>
              </div>
              <div className="flex gap-2 pt-3 border-t border-slate-700">
                <Link to={`/projects/${project.id}`} className="flex-1 text-center py-2 text-[#3b82f6] hover:bg-slate-700 rounded-lg">عرض</Link>
                <button onClick={() => handleOpenModal(project)} className="flex-1 text-center py-2 text-slate-400 hover:bg-slate-700 rounded-lg">تعديل</button>
                <button onClick={() => handleDeleteClick(project.id)} className="flex-1 text-center py-2 text-red-500 hover:bg-slate-700 rounded-lg">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProject ? 'تعديل مشروع' : 'مشروع جديد'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">اسم المشروع *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                placeholder="أدخل اسم المشروع"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">الموقع</label>
              <LocationPicker
                value={formData.location}
                onChange={(location) => setFormData({ ...formData, location })}
                placeholder="اختر موقع المشروع (اختياري)"
                toast={showToast}
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">تاريخ البداية</label>
              <DatePicker
                value={formData.startDate}
                onChange={(date) => setFormData({ ...formData, startDate: date })}
                placeholder="اختر التاريخ"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">تاريخ النهاية المتوقعة</label>
              <DatePicker
                value={formData.endDate}
                onChange={(date) => setFormData({ ...formData, endDate: date })}
                placeholder="اختر التاريخ"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">الحالة</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-input"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">الميزانية (ر.س)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="form-input"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">اسم العميل</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="form-input"
                placeholder="أدخل اسم العميل"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">رقم هاتف العميل</label>
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                className="form-input"
                placeholder="05xxxxxxxx"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">بريد العميل الإلكتروني</label>
            <input
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              className="form-input"
              placeholder="email@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">الوصف</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-input min-h-[100px]"
              placeholder="أدخل وصف المشروع..."
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {editingProject ? 'حفظ التعديلات' : 'إضافة المشروع'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, projectId: null })}
        onConfirm={handleConfirmDelete}
        title="حذف المشروع"
        message="هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
      />
    </div>
  );
};

export default Projects;

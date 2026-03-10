import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, FileText } from 'lucide-react';
import { getProjects, saveProject, deleteProject, getInvoicesByProject, getExpensesByProject } from '../utils/storage';
import Modal from '../components/shared/Modal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import DatePicker from '../components/shared/DatePicker';
import LocationPicker from '../components/shared/LocationPicker';
import { useToast } from '../components/shared/Toast';

const Projects = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, projectId: null });
  const [refreshKey, setRefreshKey] = useState(0);

  const projects = getProjects();
  const loadProjects = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const filteredProjects = projects.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProjectStats = (projectId) => {
    const invoices = getInvoicesByProject(projectId);
    const expenses = getExpensesByProject(projectId);
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
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        status: project.status || 'قيد التنفيذ',
        budget: project.budget || 0,
        clientName: project.clientName || '',
        clientPhone: project.clientPhone || '',
        clientEmail: project.clientEmail || ''
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const projectData = {
      ...formData,
      id: editingProject?.id || null,
      budget: parseFloat(formData.budget) || 0
    };

    saveProject(projectData);
    loadProjects();
    handleCloseModal();
  };

  const handleDeleteClick = (projectId) => {
    setDeleteConfirm({ isOpen: true, projectId });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.projectId) {
      deleteProject(deleteConfirm.projectId);
      loadProjects();
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

  return (
    <div className="space-y-6 animate-fadeIn" key={refreshKey}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="البحث في المشاريع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pr-10"
          />
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          مشروع جديد
        </button>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400 mb-4">لا توجد مشاريع بعد</p>
          <button 
            onClick={() => handleOpenModal()} 
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة مشروع جديد
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project.id);
            return (
              <div key={project.id} className="card hover:ring-2 hover:ring-[#3b82f6] transition-all">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-slate-400 mb-4">
                  <p>📍 {project.location || 'غير محدد'}</p>
                  <p>👤 {project.clientName || 'غير محدد'}</p>
                  <p>📅 {project.startDate || 'غير محدد'} ← {project.endDate || 'غير محدد'}</p>
                  <p>💰 ميزانية: {parseFloat(project.budget || 0).toLocaleString('ar-SA')} ر.س</p>
                  <div className="flex items-center gap-2 pt-1">
                    <FileText className="w-4 h-4" />
                    <span>{stats.invoiceCount} فاتورة</span>
                    <span className="text-[#ef4444]">• {stats.totalExpenses.toLocaleString('ar-SA')} ر.س</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
                  <Link
                    to={`/projects/${project.id}`}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-[#3b82f6] hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    عرض
                  </Link>
                  <button
                    onClick={() => handleOpenModal(project)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-slate-400 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDeleteClick(project.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-[#ef4444] hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </button>
                </div>
              </div>
            );
          })}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

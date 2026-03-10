import { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Calendar, DollarSign, ArrowRight, X } from 'lucide-react';
import { getContractors, deleteContractor, getProjects, addContractorPayment, getContractor } from '../utils/storage';
import ContractorForm from '../components/forms/ContractorForm';
import Modal from '../components/shared/Modal';
import DatePicker from '../components/shared/DatePicker';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import { useToast } from '../components/shared/Toast';

const Contractors = () => {
  const { showToast } = useToast();
  const [contractors, setContractors] = useState(getContractors());
  const [projects] = useState(getProjects());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('مقاول'); // مقاول | مورد
  const [contractorModal, setContractorModal] = useState({ isOpen: false, contractor: null });
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, contractorId: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  const refreshData = () => {
    setContractors(getContractors());
  };

  // Filter by tab and search
  const filteredContractors = useMemo(() => {
    let filtered = contractors.filter(c => c.type === activeTab);
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name?.toLowerCase().includes(term) || 
        c.specialty?.toLowerCase().includes(term) ||
        c.phone?.includes(term)
      );
    }
    
    return filtered;
  }, [contractors, activeTab, searchTerm]);

  // Calculate totals for each contractor
  const getContractorStats = (contractor) => {
    const payments = contractor.payments || [];
    const paidUSD = payments.reduce((sum, p) => sum + (parseFloat(p.amountUSD) || 0), 0);
    const paidSYP = payments.reduce((sum, p) => sum + (parseFloat(p.amountSYP) || 0), 0);
    const agreedUSD = parseFloat(contractor.agreedAmountUSD) || 0;
    const agreedSYP = parseFloat(contractor.agreedAmountSYP) || 0;
    
    return {
      paidUSD,
      paidSYP,
      pendingUSD: Math.max(0, agreedUSD - paidUSD),
      pendingSYP: Math.max(0, agreedSYP - paidSYP),
    };
  };

  const getSpecialtyLabel = (specialty) => {
    const specialties = {
      'بناء': 'بناء',
      'تشطيب': 'تشطيب',
      'كهرباء': 'كهرباء',
      'صرف': 'صرف',
      'تكييف': 'تكييف',
      'نقل': 'نقل',
      'مواد بناء': 'مواد بناء',
      'معدات': 'معدات',
      'أدوات': 'أدوات',
      'دهانات': 'دهانات',
    };
    return specialties[specialty] || specialty || '-';
  };

  const getProjectName = (projectId) => {
    if (!projectId) return '-';
    const project = projects.find(p => p.id === projectId);
    return project?.name || '-';
  };

  const handleDelete = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const executeDelete = () => {
    deleteContractor(deleteConfirm.id);
    showToast('تم حذف المقاول بنجاح', 'success');
    refreshData();
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  // Payment Modal Component
  const PaymentModal = () => {
    const [formData, setFormData] = useState({
      date: new Date().toISOString().split('T')[0],
      amountUSD: 0,
      amountSYP: 0,
      projectId: '',
      notes: '',
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      
      addContractorPayment(paymentModal.contractorId, {
        date: formData.date,
        amountUSD: parseFloat(formData.amountUSD) || 0,
        amountSYP: parseFloat(formData.amountSYP) || 0,
        projectId: formData.projectId,
        notes: formData.notes,
      });
      
      setPaymentModal({ isOpen: false, contractorId: null });
      refreshData();
      // Update selected contractor if viewing details
      if (selectedContractor) {
        setSelectedContractor(getContractor(selectedContractor.id));
      }
    };

    return (
      <Modal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, contractorId: null })}
        title="تسجيل دفعة جديدة"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">التاريخ *</label>
            <DatePicker
              value={formData.date}
              onChange={(date) => setFormData(prev => ({ ...prev, date }))}
              placeholder="اختر التاريخ"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">المبلغ ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amountUSD}
                onChange={(e) => setFormData(prev => ({ ...prev, amountUSD: e.target.value }))}
                className="form-input"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">المبلغ (ل.س)</label>
              <input
                type="number"
                min="0"
                value={formData.amountSYP}
                onChange={(e) => setFormData(prev => ({ ...prev, amountSYP: e.target.value }))}
                className="form-input"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">المشروع</label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
              className="form-input"
            >
              <option value="">اختر المشروع</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">ملاحظات</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="form-input min-h-[60px]"
              placeholder="ملاحظات..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={() => setPaymentModal({ isOpen: false, contractorId: null })}
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
            >
              إلغاء
            </button>
            <button type="submit" className="btn-primary">
              حفظ الدفعة
            </button>
          </div>
        </form>
      </Modal>
    );
  };

  // Contractor Detail View
  const ContractorDetail = () => {
    if (!selectedContractor) return null;
    
    const stats = getContractorStats(selectedContractor);
    const payments = selectedContractor.payments || [];

    return (
      <div className="fixed inset-0 bg-slate-900 z-50 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedContractor(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white"
            >
              <ArrowRight className="w-5 h-5" />
              العودة للقائمة
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setContractorModal({ isOpen: true, contractor: selectedContractor })}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                تعديل
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedContractor.id);
                  setSelectedContractor(null);
                }}
                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                حذف
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="card mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedContractor.name}</h2>
                <span className="text-slate-400">{getSpecialtyLabel(selectedContractor.specialty)}</span>
                <div className="text-yellow-500 mt-1">{renderStars(selectedContractor.rating || 0)}</div>
              </div>
              <button
                onClick={() => setPaymentModal({ isOpen: true, contractorId: selectedContractor.id })}
                className="btn-primary flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                تسجيل دفعة
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {selectedContractor.phone && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {selectedContractor.phone}
                </div>
              )}
              {selectedContractor.email && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {selectedContractor.email}
                </div>
              )}
              {selectedContractor.address && (
                <div className="flex items-center gap-2 text-slate-300 col-span-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {selectedContractor.address}
                </div>
              )}
              {selectedContractor.contractStartDate && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {selectedContractor.contractStartDate} - {selectedContractor.contractEndDate || '-'}
                </div>
              )}
            </div>

            {selectedContractor.notes && (
              <div className="mt-4 p-3 bg-slate-700/50 rounded-lg text-slate-400 text-sm">
                {selectedContractor.notes}
              </div>
            )}
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card">
              <span className="text-slate-400 text-sm">المتفق عليه</span>
              <p className="text-xl font-bold text-white mt-1">
                ${(selectedContractor.agreedAmountUSD || 0).toFixed(2)}
              </p>
              <p className="text-sm text-slate-400">
                {(selectedContractor.agreedAmountSYP || 0).toLocaleString()} ل.س
              </p>
            </div>
            <div className="card">
              <span className="text-slate-400 text-sm">المدفوع</span>
              <p className="text-xl font-bold text-green-400 mt-1">
                ${stats.paidUSD.toFixed(2)}
              </p>
              <p className="text-sm text-slate-400">
                {stats.paidSYP.toLocaleString()} ل.س
              </p>
            </div>
            <div className="card">
              <span className="text-slate-400 text-sm">المتبقي</span>
              <p className="text-xl font-bold text-yellow-400 mt-1">
                ${stats.pendingUSD.toFixed(2)}
              </p>
              <p className="text-sm text-slate-400">
                {stats.pendingSYP.toLocaleString()} ل.س
              </p>
            </div>
          </div>

          {/* Payment History */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">سجل المدفوعات</h3>
            
            {payments.length === 0 ? (
              <p className="text-slate-400 text-center py-8">لا توجد مدفوعات بعد</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-right py-2 px-3 text-slate-400">التاريخ</th>
                      <th className="text-right py-2 px-3 text-slate-400">المبلغ ($)</th>
                      <th className="text-right py-2 px-3 text-slate-400">المبلغ (ل.س)</th>
                      <th className="text-right py-2 px-3 text-slate-400">المشروع</th>
                      <th className="text-right py-2 px-3 text-slate-400">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice().reverse().map((payment) => (
                      <tr key={payment.id} className="border-b border-slate-700/50">
                        <td className="py-2 px-3 text-slate-300">{payment.date}</td>
                        <td className="py-2 px-3 text-green-400">${(payment.amountUSD || 0).toFixed(2)}</td>
                        <td className="py-2 px-3 text-green-400">{(payment.amountSYP || 0).toLocaleString()}</td>
                        <td className="py-2 px-3 text-slate-300">{getProjectName(payment.projectId)}</td>
                        <td className="py-2 px-3 text-slate-400 text-sm">{payment.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('مقاول')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'مقاول'
              ? 'bg-[#3b82f6] text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          المقاولون
        </button>
        <button
          onClick={() => setActiveTab('مورد')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'مورد'
              ? 'bg-[#3b82f6] text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          الموردون
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={`البحث في ${activeTab === 'مقاول' ? 'المقاولين' : 'الموردين'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pr-10"
          />
        </div>
        <button 
          onClick={() => setContractorModal({ isOpen: true, contractor: null })}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {activeTab === 'مقاول' ? 'مقاول جديد' : 'مورد جديد'}
        </button>
      </div>

      {/* Contractors Grid */}
      {filteredContractors.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400 mb-4">
            لا يوجد {activeTab === 'مقاول' ? 'مقاولين' : 'موردين'} بعد
          </p>
          <button 
            onClick={() => setContractorModal({ isOpen: true, contractor: null })}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة {activeTab === 'مقاول' ? 'مقاول' : 'مورد'} جديد
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContractors.map((contractor) => {
            const stats = getContractorStats(contractor);
            
            return (
              <div 
                key={contractor.id} 
                className="card hover:ring-2 hover:ring-[#3b82f6] transition-all cursor-pointer"
                onClick={() => setSelectedContractor(contractor)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{contractor.name}</h3>
                    <span className="text-sm text-slate-400">
                      {getSpecialtyLabel(contractor.specialty)}
                    </span>
                  </div>
                  <div className="text-yellow-500 text-sm">
                    {renderStars(contractor.rating || 0)}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-slate-400 mb-4">
                  {contractor.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {contractor.phone}
                    </p>
                  )}
                  {contractor.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {contractor.email}
                    </p>
                  )}
                </div>

                {/* Financial Summary in Card */}
                <div className="grid grid-cols-2 gap-2 p-2 bg-slate-700/30 rounded-lg mb-3">
                  <div>
                    <span className="text-xs text-slate-500">المدفوع</span>
                    <p className="text-sm text-green-400">${stats.paidUSD.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">المتبقي</span>
                    <p className="text-sm text-yellow-400">${stats.pendingUSD.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-700" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => setContractorModal({ isOpen: true, contractor })}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-slate-400 hover:text-[#3b82f6] hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(contractor.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-slate-400 hover:text-[#ef4444] hover:bg-slate-700 rounded-lg transition-colors"
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

      {/* Contractor Modal */}
      {contractorModal.isOpen && (
        <ContractorForm
          contractor={contractorModal.contractor}
          onClose={() => setContractorModal({ isOpen: false, contractor: null })}
          onSave={refreshData}
        />
      )}

      {/* Payment Modal */}
      <PaymentModal />

      {/* Contractor Detail View */}
      {selectedContractor && <ContractorDetail />}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={executeDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا المقاول؟"
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
      />
    </div>
  );
};

export default Contractors;

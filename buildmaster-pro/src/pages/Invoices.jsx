import { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Download, FileText, CheckCircle, XCircle } from 'lucide-react';
import { getInvoices, deleteInvoice, getProjects, getContractors, saveInvoice, getSettings } from '../utils/storage';
import InvoiceForm from '../components/forms/InvoiceForm';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { exportToWord } from '../utils/exportWord';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import { useToast } from '../components/shared/Toast';

const Invoices = () => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState(getInvoices());
  const [projects, setProjects] = useState(getProjects());
  const [contractors, setContractors] = useState(getContractors());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [invoiceModal, setInvoiceModal] = useState({ isOpen: false, invoice: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  // Refresh data
  const refreshData = () => {
    setInvoices(getInvoices());
    setProjects(getProjects());
    setContractors(getContractors());
  };

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(i => 
        i.invoiceNumber?.toLowerCase().includes(term) || 
        i.clientName?.toLowerCase().includes(term) ||
        i.clientEmail?.toLowerCase().includes(term)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }
    
    return filtered;
  }, [invoices, searchTerm, statusFilter]);

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'غير محدد';
  };

  const getContractorName = (contractorId) => {
    const contractor = contractors.find(c => c.id === contractorId);
    return contractor?.name || 'غير محدد';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'مدفوع': return 'bg-green-500';
      case 'مفتوح': return 'bg-blue-500';
      case 'متأخر': return 'bg-red-500';
      case 'مسودة': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'مدفوع': return 'مدفوع';
      case 'مفتوح': return 'مفتوح';
      case 'متأخر': return 'متأخر';
      case 'مسودة': return 'مسودة';
      default: return status;
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const executeDelete = () => {
    deleteInvoice(deleteConfirm.id);
    showToast('تم حذف الفاتورة بنجاح', 'success');
    refreshData();
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const handleStatusChange = (invoice, newStatus) => {
    const updatedInvoice = {
      ...invoice,
      status: newStatus,
      paidAt: newStatus === 'مدفوع' ? new Date().toISOString() : null,
    };
    saveInvoice(updatedInvoice);
    refreshData();
  };

  // Prepare invoice data for PDF
  const prepareInvoiceData = (invoice) => {
    const exchangeRate = getSettings()?.exchangeRateUSD || 13000;
    const project = projects.find(p => p.id === invoice.projectId);
    
    return {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      status: invoice.status,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      clientPhone: invoice.clientPhone,
      clientAddress: invoice.clientAddress,
      projectName: project?.name,
      exchangeRate,
      items: invoice.items || [],
      notes: invoice.notes,
    };
  };

  // Get company info
  const companyInfo = getSettings();

  const handleExportWord = async (invoice) => {
    const content = generateInvoiceContent(invoice);
    content.docNumber = invoice.invoiceNumber;
    content.date = invoice.issueDate;
    await exportToWord(content, `فاتورة-${invoice.invoiceNumber}`);
  };

  const handleExportPDF = async (invoice) => {
    const invoiceData = prepareInvoiceData(invoice);
    const result = await generateInvoicePDF(invoiceData, companyInfo);
    
    if (!result) {
      showToast('حدث خطأ في إنشاء ملف PDF', 'error');
    }
  };

  const generateInvoiceContent = (invoice) => {
    const exchangeRate = getSettings()?.exchangeRateUSD || 13000;
    
    return {
      title: `فاتورة رقم ${invoice.invoiceNumber}`,
      docType: 'invoice',
      sections: [
        {
          title: 'معلومات الفاتورة',
          content: [
            { label: 'رقم الفاتورة', value: invoice.invoiceNumber },
            { label: 'التاريخ', value: invoice.issueDate },
            { label: 'الاستحقاق', value: invoice.dueDate || 'غير محدد' },
            { label: 'الحالة', value: getStatusText(invoice.status) },
          ],
        },
        {
          title: 'معلومات العميل',
          content: [
            { label: 'الاسم', value: invoice.clientName },
            { label: 'البريد', value: invoice.clientEmail || 'غير محدد' },
            { label: 'الهاتف', value: invoice.clientPhone || 'غير محدد' },
            { label: 'العنوان', value: invoice.clientAddress || 'غير محدد' },
          ],
        },
        {
          title: 'البنود',
          table: {
            headers: ['الصنف', 'الوحدة', 'الكمية', 'السعر ($)', 'الإجمالي ($)', 'الإجمالي (ل.س)'],
            rows: invoice.items?.map(item => {
              const qty = parseFloat(item.quantity) || 0;
              const priceUSD = parseFloat(item.unitPriceUSD) || 0;
              const totalUSD = qty * priceUSD;
              const totalSYP = totalUSD * exchangeRate;
              return [
                item.name || '-',
                item.unit || '-',
                qty,
                priceUSD.toFixed(2),
                totalUSD.toFixed(2),
                totalSYP.toLocaleString()
              ];
            }) || [],
          },
        },
        {
          title: 'الإجمالي',
          table: {
            headers: ['البيان', 'المبلغ ($)', 'المبلغ (ل.س)'],
            rows: [
              ['المجموع', (invoice.subtotalUSD || 0).toFixed(2), (invoice.subtotalUSD * exchangeRate || 0).toLocaleString()],
              [`الضريبة (${invoice.taxRate || 15}%)`, (invoice.taxAmountUSD || 0).toFixed(2), (invoice.taxAmountUSD * exchangeRate || 0).toLocaleString()],
            ],
            isTotalRow: false,
          },
        },
        {
          title: '',
          table: {
            headers: ['الإجمالي المطلوب', 'الإجمالي (ل.س)'],
            rows: [
              [`${(invoice.totalUSD || 0).toFixed(2)} $`, (invoice.totalUSD * exchangeRate || 0).toLocaleString()],
            ],
            isTotalRow: true,
          },
        },
      ],
    };
  };

  const totalAmountUSD = filteredInvoices.reduce((sum, i) => sum + parseFloat(i.totalUSD || 0), 0);
  const totalAmountSYP = filteredInvoices.reduce((sum, i) => sum + parseFloat(i.totalSYP || 0), 0);
  const paidAmount = filteredInvoices
    .filter(i => i.status === 'مدفوع')
    .reduce((sum, i) => sum + parseFloat(i.totalUSD || 0), 0);

  const statusOptions = [
    { value: 'all', label: 'الكل' },
    { value: 'مسودة', label: 'مسودة' },
    { value: 'مفتوح', label: 'مفتوح' },
    { value: 'مدفوع', label: 'مدفوع' },
    { value: 'متأخر', label: 'متأخر' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="البحث في الفواتير..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pr-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input w-40"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={() => setInvoiceModal({ isOpen: true, invoice: null })}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          فاتورة جديدة
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <span className="text-slate-400 text-sm">إجمالي الفواتير</span>
          <p className="text-2xl font-bold text-[#3b82f6] mt-1">
            ${totalAmountUSD.toFixed(2)}
          </p>
          <p className="text-sm text-slate-400">
            {totalAmountSYP.toLocaleString()} ل.س
          </p>
        </div>
        <div className="card">
          <span className="text-slate-400 text-sm">المدفوع</span>
          <p className="text-2xl font-bold text-[#22c55e] mt-1">
            ${paidAmount.toFixed(2)}
          </p>
        </div>
        <div className="card">
          <span className="text-slate-400 text-sm">المتبقي</span>
          <p className="text-2xl font-bold text-[#f59e0b] mt-1">
            ${(totalAmountUSD - paidAmount).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400 mb-4">لا توجد فواتير بعد</p>
          <button 
            onClick={() => setInvoiceModal({ isOpen: true, invoice: null })}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة فاتورة جديدة
          </button>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-right py-3 px-4 text-slate-400 font-medium">رقم الفاتورة</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">العميل</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">المشروع</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">التاريخ</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">الحالة</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">المبلغ</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 px-4 text-white font-medium">{invoice.invoiceNumber}</td>
                  <td className="py-3 px-4 text-slate-300">{invoice.clientName}</td>
                  <td className="py-3 px-4 text-slate-300">
                    {invoice.projectId ? getProjectName(invoice.projectId) : 
                     invoice.contractorId ? getContractorName(invoice.contractorId) : '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{invoice.issueDate}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                      {invoice.status !== 'مدفوع' && (
                        <button
                          onClick={() => handleStatusChange(invoice, 'مدفوع')}
                          className="p-1 text-green-400 hover:text-green-300"
                          title="تحديد كمدفوع"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-[#3b82f6] font-semibold">
                      ${(invoice.totalUSD || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {(invoice.totalSYP || 0).toLocaleString()} ل.س
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleExportPDF(invoice)}
                        className="p-2 text-slate-400 hover:text-[#3b82f6] hover:bg-slate-700 rounded"
                        title="تصدير PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleExportWord(invoice)}
                        className="p-2 text-slate-400 hover:text-[#3b82f6] hover:bg-slate-700 rounded"
                        title="تصدير Word"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setInvoiceModal({ isOpen: true, invoice })}
                        className="p-2 text-slate-400 hover:text-[#3b82f6] hover:bg-slate-700 rounded"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(invoice.id)}
                        className="p-2 text-slate-400 hover:text-[#ef4444] hover:bg-slate-700 rounded"
                        title="حذف"
                      >
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

      {/* Invoice Modal */}
      {invoiceModal.isOpen && (
        <InvoiceForm
          invoice={invoiceModal.invoice}
          projects={projects}
          contractors={contractors}
          onClose={() => setInvoiceModal({ isOpen: false, invoice: null })}
          onSave={refreshData}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={executeDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذه الفاتورة؟"
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
      />
    </div>
  );
};

export default Invoices;

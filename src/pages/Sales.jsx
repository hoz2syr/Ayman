import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Grid3X3, List, Trash2, Edit, Eye, 
  X, Search, Building2, Home, Store, Building, Warehouse,
  Phone, Mail, User, Calendar, DollarSign, FileText,
  Download, FileCheck, AlertCircle, TrendingUp
} from 'lucide-react';
import { 
  getProjects, getUnits, saveUnit, deleteUnit, updateUnitStatus,
  getLeads, saveLead, deleteLead, updateLeadStage,
  getContracts, saveContract, deleteContract, getContractNumber,
  getSettings, saveInvoice, getCompanyInfo
} from '../utils/storage';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '../components/shared/Toast';
import ConfirmDialog from '../components/shared/ConfirmDialog';

const Sales = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const contractRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('units');
  const [unitsViewMode, setUnitsViewMode] = useState('grid');
  const [showUnitPanel, setShowUnitPanel] = useState(false);
  const [showLeadPanel, setShowLeadPanel] = useState(false);
  const [showContractPanel, setShowContractPanel] = useState(false);
  const [showContractPDF, setShowContractPDF] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [editingContract, setEditingContract] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [leadStageFilter, setLeadStageFilter] = useState('');
  const [showCreateContractConfirm, setShowCreateContractConfirm] = useState(false);
  const [leadForContract, setLeadForContract] = useState(null);
  const [selectedLeadForContract, setSelectedLeadForContract] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: '', id: null });

  const projects = useMemo(() => getProjects(), []);
  const units = useMemo(() => getUnits(), []);
  const leads = useMemo(() => getLeads(), []);
  const contracts = useMemo(() => getContracts(), []);
  const settings = useMemo(() => getSettings(), []);
  const company = useMemo(() => getCompanyInfo(), []);

  const exchangeRate = settings.exchangeRateUSD || 13000;

  const filteredUnits = useMemo(() => {
    return units.filter(unit => {
      if (selectedProject && unit.projectId !== selectedProject) return false;
      if (statusFilter && unit.status !== statusFilter) return false;
      return true;
    });
  }, [units, selectedProject, statusFilter]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (selectedProject && lead.projectId !== selectedProject) return false;
      if (leadStageFilter && lead.stage !== leadStageFilter) return false;
      return true;
    });
  }, [leads, selectedProject, leadStageFilter]);

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || '-';
  };

  const getLeadName = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    return lead?.fullName || '-';
  };

  const getUnitName = (unitId) => {
    const unit = units.find(u => u.id === unitId);
    return unit ? `${unit.type === 'apartment' ? 'شقة' : unit.type === 'shop' ? 'محل' : unit.type === 'office' ? 'مكتب' : 'مستودع'} ${unit.unitNumber}` : '-';
  };

  const handleSaveUnit = (unitData) => {
    saveUnit(unitData);
    setShowUnitPanel(false);
    setEditingUnit(null);
  };

  const handleDeleteUnit = (id) => {
    setDeleteConfirm({ isOpen: true, type: 'unit', id });
  };

  const handleDeleteLead = (id) => {
    setDeleteConfirm({ isOpen: true, type: 'lead', id });
  };

  const handleDeleteContract = (id) => {
    setDeleteConfirm({ isOpen: true, type: 'contract', id });
  };

  const executeDelete = () => {
    const { type, id } = deleteConfirm;
    if (type === 'unit') {
      deleteUnit(id);
      showToast('تم حذف الوحدة بنجاح', 'success');
    } else if (type === 'lead') {
      deleteLead(id);
      showToast('تم حذف المهتم بنجاح', 'success');
    } else if (type === 'contract') {
      deleteContract(id);
      showToast('تم حذف العقد بنجاح', 'success');
    }
    setDeleteConfirm({ isOpen: false, type: '', id: null });
  };

  const handleStageChange = (leadId, newStage) => {
    updateLeadStage(leadId, newStage);
    
    if (newStage === 'sold') {
      const lead = leads.find(l => l.id === leadId);
      setLeadForContract(lead);
      setShowCreateContractConfirm(true);
    }
  };

  const handleCreateContractFromLead = () => {
    if (leadForContract) {
      if (leadForContract.unitId) {
        updateUnitStatus(leadForContract.unitId, 'sold', leadForContract.id);
      }
      setSelectedLeadForContract(leadForContract);
      setActiveTab('contracts');
      setShowContractPanel(true);
      setShowCreateContractConfirm(false);
      setLeadForContract(null);
    }
  };

  const handleSaveContract = (contractData) => {
    const contractId = saveContract(contractData);
    
    if (contractData.unitId) {
      updateUnitStatus(contractData.unitId, 'sold', contractData.buyerId);
    }

    setShowContractPanel(false);
    setEditingContract(null);
    setSelectedLeadForContract(null);
  };

  const handleCreateInvoice = (contract) => {
    const unit = units.find(u => u.id === contract.unitId);
    const project = unit ? projects.find(p => p.id === unit.projectId) : null;
    
    const invoice = {
      projectId: unit?.projectId || null,
      clientName: contract.buyerName,
      clientPhone: '',
      clientEmail: '',
      clientAddress: '',
      items: [{
        name: `وحدة سكنية — ${getUnitName(contract.unitId)}`,
        unit: 'وحدة',
        quantity: 1,
        unitPriceUSD: contract.totalUSD,
        unitPriceSYP: contract.totalUSD * exchangeRate,
        totalUSD: contract.totalUSD,
        totalSYP: contract.totalUSD * exchangeRate,
      }],
      subtotalUSD: contract.totalUSD,
      subtotalSYP: contract.totalUSD * exchangeRate,
      taxRate: 0,
      taxAmountUSD: 0,
      taxAmountSYP: 0,
      totalUSD: contract.totalUSD,
      totalSYP: contract.totalUSD * exchangeRate,
      status: 'مفتوح',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      notes: `فاتورة بيع وحدة سكنية — عقد ${contract.contractNumber}`,
    };
    
    saveInvoice(invoice);
    navigate('/invoices');
  };

  const exportContractPDF = async (contract) => {
    const element = contractRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`عقد_${contract.contractNumber}.pdf`);
  };

  const unitTypes = [
    { value: 'apartment', label: 'شقة' },
    { value: 'shop', label: 'محل' },
    { value: 'office', label: 'مكتب' },
    { value: 'storage', label: 'مستودع' },
  ];

  const unitStatus = [
    { value: 'available', label: 'متاحة', color: 'bg-green-500' },
    { value: 'reserved', label: 'محجوزة', color: 'bg-orange-500' },
    { value: 'sold', label: 'مباعة', color: 'bg-gray-500' },
  ];

  const leadStages = [
    { value: 'interested', label: 'مهتم', color: 'bg-blue-500' },
    { value: 'visited', label: 'زيارة', color: 'bg-yellow-500' },
    { value: 'offered', label: 'عرض سعر', color: 'bg-orange-500' },
    { value: 'negotiating', label: 'تفاوض', color: 'bg-purple-500' },
    { value: 'reserved', label: 'حجز', color: 'bg-green-500' },
    { value: 'sold', label: 'مباع', color: 'bg-green-600' },
    { value: 'cancelled', label: 'ملغي', color: 'bg-red-500' },
  ];

  const tabs = [
    { id: 'units', label: 'الوحدات السكنية', icon: Home },
    { id: 'leads', label: 'المهتمون', icon: User },
    { id: 'contracts', label: 'العقود', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">إدارة المبيعات</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'units' && (
        <div className="space-y-4">
          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
            >
              <option value="">كل المشاريع</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
            >
              <option value="">كل الحالات</option>
              {unitStatus.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <div className="flex-1" />

            <div className="flex gap-2">
              <button
                onClick={() => setUnitsViewMode('grid')}
                className={`p-2 rounded-lg ${unitsViewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setUnitsViewMode('table')}
                className={`p-2 rounded-lg ${unitsViewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => { setEditingUnit(null); setShowUnitPanel(true); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              وحدة جديدة
            </button>
          </div>

          {/* Units Grid View */}
          {unitsViewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredUnits.map(unit => (
                <div key={unit.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {unit.type === 'apartment' && <Home className="w-5 h-5 text-blue-400" />}
                      {unit.type === 'shop' && <Store className="w-5 h-5 text-green-400" />}
                      {unit.type === 'office' && <Building className="w-5 h-5 text-purple-400" />}
                      {unit.type === 'storage' && <Warehouse className="w-5 h-5 text-orange-400" />}
                      <span className="font-semibold text-white">
                        {unit.type === 'apartment' ? 'شقة' : unit.type === 'shop' ? 'محل' : unit.type === 'office' ? 'مكتب' : 'مستودع'} {unit.unitNumber}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs text-white ${unit.status === 'available' ? 'bg-green-500' : unit.status === 'reserved' ? 'bg-orange-500' : 'bg-gray-500'}`}>
                      {unit.status === 'available' ? 'متاحة' : unit.status === 'reserved' ? 'محجوزة' : 'مباعة'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">المشروع:</span>
                      <span className="text-white">{getProjectName(unit.projectId)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">المساحة:</span>
                      <span className="text-white">{unit.area} م²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">الغرف:</span>
                      <span className="text-white">{unit.rooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">الطابق:</span>
                      <span className="text-white">{unit.floor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">السعر:</span>
                      <span className="text-white">${unit.priceUSD?.toLocaleString()}</span>
                    </div>
                    {unit.buyerId && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">المشتري:</span>
                        <span className="text-white">{getLeadName(unit.buyerId)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-slate-700">
                    <button
                      onClick={() => { setEditingUnit(unit); setShowUnitPanel(true); }}
                      className="flex-1 flex items-center justify-center gap-1 bg-slate-700 text-white py-1.5 rounded hover:bg-slate-600"
                    >
                      <Edit className="w-4 h-4" />
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDeleteUnit(unit.id)}
                      className="px-3 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Units Table View */}
          {unitsViewMode === 'table' && (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-right text-slate-400">رقم الوحدة</th>
                    <th className="px-4 py-3 text-right text-slate-400">النوع</th>
                    <th className="px-4 py-3 text-right text-slate-400">المشروع</th>
                    <th className="px-4 py-3 text-right text-slate-400">المساحة</th>
                    <th className="px-4 py-3 text-right text-slate-400">الغرف</th>
                    <th className="px-4 py-3 text-right text-slate-400">الطابق</th>
                    <th className="px-4 py-3 text-right text-slate-400">السعر$</th>
                    <th className="px-4 py-3 text-right text-slate-400">الحالة</th>
                    <th className="px-4 py-3 text-right text-slate-400">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnits.map(unit => (
                    <tr key={unit.id} className="border-t border-slate-700 hover:bg-slate-800/50">
                      <td className="px-4 py-3 text-white">{unit.unitNumber}</td>
                      <td className="px-4 py-3 text-white">
                        {unit.type === 'apartment' ? 'شقة' : unit.type === 'shop' ? 'محل' : unit.type === 'office' ? 'مكتب' : 'مستودع'}
                      </td>
                      <td className="px-4 py-3 text-white">{getProjectName(unit.projectId)}</td>
                      <td className="px-4 py-3 text-white">{unit.area} م²</td>
                      <td className="px-4 py-3 text-white">{unit.rooms}</td>
                      <td className="px-4 py-3 text-white">{unit.floor}</td>
                      <td className="px-4 py-3 text-white">${unit.priceUSD?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs text-white ${unit.status === 'available' ? 'bg-green-500' : unit.status === 'reserved' ? 'bg-orange-500' : 'bg-gray-500'}`}>
                          {unit.status === 'available' ? 'متاحة' : unit.status === 'reserved' ? 'محجوزة' : 'مباعة'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditingUnit(unit); setShowUnitPanel(true); }}
                            className="p-1.5 bg-slate-700 text-white rounded hover:bg-slate-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUnit(unit.id)}
                            className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
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
        </div>
      )}

      {/* Tab 2: Leads */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
            >
              <option value="">كل المشاريع</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select
              value={leadStageFilter}
              onChange={(e) => setLeadStageFilter(e.target.value)}
              className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
            >
              <option value="">كل المراحل</option>
              {leadStages.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <div className="flex-1" />

            <button
              onClick={() => { setEditingLead(null); setShowLeadPanel(true); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              مهتم جديد
            </button>
          </div>

          {/* Leads Table */}
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-right text-slate-400">الاسم</th>
                  <th className="px-4 py-3 text-right text-slate-400">الهاتف</th>
                  <th className="px-4 py-3 text-right text-slate-400">المشروع</th>
                  <th className="px-4 py-3 text-right text-slate-400">الوحدة</th>
                  <th className="px-4 py-3 text-right text-slate-400">المرحلة</th>
                  <th className="px-4 py-3 text-right text-slate-400">تاريخ التواصل</th>
                  <th className="px-4 py-3 text-right text-slate-400">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="border-t border-slate-700 hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-white">{lead.fullName}</td>
                    <td className="px-4 py-3 text-white">{lead.phone}</td>
                    <td className="px-4 py-3 text-white">{getProjectName(lead.projectId)}</td>
                    <td className="px-4 py-3 text-white">{getUnitName(lead.unitId)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.stage}
                        onChange={(e) => handleStageChange(lead.id, e.target.value)}
                        className={`px-2 py-1 rounded text-xs text-white border-0 cursor-pointer ${
                          lead.stage === 'interested' ? 'bg-blue-500' :
                          lead.stage === 'visited' ? 'bg-yellow-500' :
                          lead.stage === 'offered' ? 'bg-orange-500' :
                          lead.stage === 'negotiating' ? 'bg-purple-500' :
                          lead.stage === 'reserved' ? 'bg-green-500' :
                          lead.stage === 'sold' ? 'bg-green-600' : 'bg-red-500'
                        }`}
                      >
                        {leadStages.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-white">{lead.contactDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingLead(lead); setShowLeadPanel(true); }}
                          className="p-1.5 bg-slate-700 text-white rounded hover:bg-slate-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
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
        </div>
      )}

      {/* Tab 3: Contracts */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={() => { setEditingContract(null); setSelectedLeadForContract(null); setShowContractPanel(true); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              عقد جديد
            </button>
          </div>

          {/* Contracts Table */}
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-right text-slate-400">رقم العقد</th>
                  <th className="px-4 py-3 text-right text-slate-400">التاريخ</th>
                  <th className="px-4 py-3 text-right text-slate-400">المشتري</th>
                  <th className="px-4 py-3 text-right text-slate-400">الوحدة</th>
                  <th className="px-4 py-3 text-right text-slate-400">المشروع</th>
                  <th className="px-4 py-3 text-right text-slate-400">المبلغ$</th>
                  <th className="px-4 py-3 text-right text-slate-400">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map(contract => {
                  const unit = units.find(u => u.id === contract.unitId);
                  return (
                    <tr key={contract.id} className="border-t border-slate-700 hover:bg-slate-800/50">
                      <td className="px-4 py-3 text-white">{contract.contractNumber}</td>
                      <td className="px-4 py-3 text-white">{contract.date}</td>
                      <td className="px-4 py-3 text-white">{contract.buyerName}</td>
                      <td className="px-4 py-3 text-white">{getUnitName(contract.unitId)}</td>
                      <td className="px-4 py-3 text-white">{unit ? getProjectName(unit.projectId) : '-'}</td>
                      <td className="px-4 py-3 text-white">${contract.totalUSD?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditingContract(contract); setShowContractPanel(true); }}
                            className="p-1.5 bg-slate-700 text-white rounded hover:bg-slate-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => exportContractPDF(contract)}
                            className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCreateInvoice(contract)}
                            className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                            title="إنشاء فاتورة"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteContract(contract.id)}
                            className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unit Side Panel */}
      {showUnitPanel && (
        <UnitPanel
          unit={editingUnit}
          projects={projects}
          onSave={handleSaveUnit}
          onClose={() => { setShowUnitPanel(false); setEditingUnit(null); }}
          exchangeRate={exchangeRate}
        />
      )}

      {/* Lead Side Panel */}
      {showLeadPanel && (
        <LeadPanel
          lead={editingLead}
          projects={projects}
          units={units}
          onSave={handleSaveLead}
          onClose={() => { setShowLeadPanel(false); setEditingLead(null); }}
        />
      )}

      {/* Contract Side Panel */}
      {showContractPanel && (
        <ContractPanel
          contract={editingContract}
          selectedLead={selectedLeadForContract}
          leads={leads}
          units={units}
          projects={projects}
          company={company}
          exchangeRate={exchangeRate}
          onSave={handleSaveContract}
          onClose={() => { setShowContractPanel(false); setEditingContract(null); setSelectedLeadForContract(null); }}
        />
      )}

      {/* Create Contract Confirm Modal */}
      {showCreateContractConfirm && leadForContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">تم البيع!</h3>
                <p className="text-slate-400 text-sm">تم تغيير مرحلة {leadForContract.fullName} إلى "مباع"</p>
              </div>
            </div>
            <p className="text-white mb-6">هل تريد إنشاء عقد بيع الآن؟</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateContractConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
              >
                لاحقاً
              </button>
              <button
                onClick={handleCreateContractFromLead}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                نعم — إنشاء العقد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contract PDF Preview */}
      {showContractPDF && editingContract && (
        <ContractPDFPreview
          contract={editingContract}
          company={company}
          onClose={() => { setShowContractPDF(false); }}
          contractRef={contractRef}
        />
      )}
    </div>
  );
};

// Unit Panel Component
const UnitPanel = ({ unit, projects, onSave, onClose, exchangeRate }) => {
  const [formData, setFormData] = useState({
    id: unit?.id || null,
    unitNumber: unit?.unitNumber || '',
    type: unit?.type || 'apartment',
    projectId: unit?.projectId || '',
    floor: unit?.floor || '',
    area: unit?.area || 0,
    rooms: unit?.rooms || 0,
    bathrooms: unit?.bathrooms || 0,
    priceUSD: unit?.priceUSD || 0,
    description: unit?.description || '',
    notes: unit?.notes || '',
    status: unit?.status || 'available',
  });

  const priceSYP = (formData.priceUSD || 0) * exchangeRate;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.unitNumber || !formData.projectId || !formData.priceUSD) {
      showToast('الرجاء تعبئة جميع الحقول المطلوبة', 'error');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
      <div className="bg-slate-800 w-full max-w-lg h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {unit ? 'تعديل وحدة' : 'إضافة وحدة جديدة'}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 mb-1">رقم الوحدة *</label>
              <input
                type="text"
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                placeholder="مثال: 101"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">النوع</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
              >
                <option value="apartment">شقة</option>
                <option value="shop">محل</option>
                <option value="office">مكتب</option>
                <option value="storage">مستودع</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">المشروع المرتبط *</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                required
              >
                <option value="">اختر المشروع</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">الطابق</label>
                <input
                  type="text"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                  placeholder="مثال: الأرضي"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">المساحة (م²) *</label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">عدد الغرف</label>
                <input
                  type="number"
                  value={formData.rooms}
                  onChange={(e) => setFormData({ ...formData, rooms: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">عدد الحمامات</label>
                <input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">السعر بالدولار *</label>
              <input
                type="number"
                value={formData.priceUSD}
                onChange={(e) => setFormData({ ...formData, priceUSD: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">السعر بالليرة السورية</label>
              <input
                type="text"
                value={priceSYP.toLocaleString()}
                readOnly
                className="w-full bg-slate-900 text-slate-400 px-4 py-2 rounded-lg border border-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">الحالة</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
              >
                <option value="available">متاحة</option>
                <option value="reserved">محجوزة</option>
                <option value="sold">مباعة</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">الوصف</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">ملاحظات</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                حفظ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Lead Panel Component
const LeadPanel = ({ lead, projects, units, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    id: lead?.id || null,
    fullName: lead?.fullName || '',
    phone: lead?.phone || '',
    nationalId: lead?.nationalId || '',
    idIssueDate: lead?.idIssueDate || '',
    email: lead?.email || '',
    projectId: lead?.projectId || '',
    unitId: lead?.unitId || '',
    stage: lead?.stage || 'interested',
    budget: lead?.budget || 0,
    notes: lead?.notes || '',
    contactDate: lead?.contactDate || new Date().toISOString().split('T')[0],
  });

  const availableUnits = useMemo(() => {
    return units.filter(u => u.status === 'available' && u.projectId === formData.projectId);
  }, [units, formData.projectId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      showToast('الرجاء تعبئة الحقول المطلوبة', 'error');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
      <div className="bg-slate-800 w-full max-w-lg h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {lead ? 'تعديل مهتم' : 'إضافة مهتم جديد'}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 mb-1">الاسم الكامل *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">رقم الهاتف *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">رقم الهوية</label>
                <input
                  type="text"
                  value={formData.nationalId}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">تاريخ الإصدار</label>
                <input
                  type="date"
                  value={formData.idIssueDate}
                  onChange={(e) => setFormData({ ...formData, idIssueDate: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">المشروع المهتم به</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value, unitId: '' })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
              >
                <option value="">اختر المشروع</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">الوحدة المهتم بها</label>
              <select
                value={formData.unitId}
                onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                disabled={!formData.projectId}
              >
                <option value="">اختر الوحدة</option>
                {availableUnits.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.type === 'apartment' ? 'شقة' : u.type === 'shop' ? 'محل' : u.type === 'office' ? 'مكتب' : 'مستودع'} {u.unitNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">مرحلة التفاوض</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
              >
                <option value="interested">مهتم</option>
                <option value="visited">زيارة</option>
                <option value="offered">عرض سعر</option>
                <option value="negotiating">تفاوض</option>
                <option value="reserved">حجز</option>
                <option value="sold">مباع</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">الميزانية المتوقعة</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">ملاحظات</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">تاريخ التواصل الأول</label>
              <input
                type="date"
                value={formData.contactDate}
                onChange={(e) => setFormData({ ...formData, contactDate: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                حفظ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Contract Panel Component
const ContractPanel = ({ contract, selectedLead, leads, units, projects, company, exchangeRate, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    id: contract?.id || null,
    contractNumber: contract?.contractNumber || getContractNumber(),
    date: contract?.date || new Date().toISOString().split('T')[0],
    sellerName: contract?.sellerName || company?.name || '',
    sellerLicense: contract?.sellerLicense || '',
    buyerId: contract?.buyerId || selectedLead?.id || '',
    buyerName: contract?.buyerName || selectedLead?.fullName || '',
    buyerNationalId: contract?.buyerNationalId || selectedLead?.nationalId || '',
    buyerIdIssueDate: contract?.buyerIdIssueDate || selectedLead?.idIssueDate || '',
    unitId: contract?.unitId || selectedLead?.unitId || '',
    propertyNumber: contract?.propertyNumber || '',
    region: contract?.region || '',
    unitDescription: contract?.unitDescription || '',
    area: contract?.area || 0,
    floor: contract?.floor || '',
    totalUSD: contract?.totalUSD || 0,
    witness1: contract?.witness1 || '',
    witness2: contract?.witness2 || '',
    notes: contract?.notes || '',
  });

  const totalSYP = (formData.totalUSD || 0) * exchangeRate;
  const pricePerMeter = formData.area > 0 ? formData.totalUSD / formData.area : 0;

  const selectedUnit = units.find(u => u.id === formData.unitId);

  const handleLeadChange = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setFormData({
        ...formData,
        buyerId: lead.id,
        buyerName: lead.fullName,
        buyerNationalId: lead.nationalId || '',
        buyerIdIssueDate: lead.idIssueDate || '',
        unitId: lead.unitId || '',
      });
    }
  };

  const handleUnitChange = (unitId) => {
    const unit = units.find(u => u.id === unitId);
    if (unit) {
      setFormData({
        ...formData,
        unitId: unit.id,
        unitDescription: `${unit.type === 'apartment' ? 'شقة' : unit.type === 'shop' ? 'محل' : unit.type === 'office' ? 'مكتب' : 'مستودع'} رقم ${unit.unitNumber}`,
        area: unit.area || 0,
        floor: unit.floor || '',
        totalUSD: unit.priceUSD || 0,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.buyerName || !formData.buyerNationalId || !formData.unitId) {
      showToast('الرجاء تعبئة الحقول المطلوبة', 'error');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
      <div className="bg-slate-800 w-full max-w-2xl h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {contract ? 'تعديل عقد' : 'عقد جديد'}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">رقم العقد</label>
                <input
                  type="text"
                  value={formData.contractNumber}
                  readOnly
                  className="w-full bg-slate-900 text-slate-400 px-4 py-2 rounded-lg border border-slate-700"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">تاريخ العقد</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                />
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <h3 className="text-lg font-semibold text-white mb-3">الفريق الأول (البائع)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">اسم الشركة</label>
                  <input
                    type="text"
                    value={formData.sellerName}
                    onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم الترخيص</label>
                  <input
                    type="text"
                    value={formData.sellerLicense}
                    onChange={(e) => setFormData({ ...formData, sellerLicense: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <h3 className="text-lg font-semibold text-white mb-3">الفريق الثاني (المشتري)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 mb-1">اختر من المهتمين</label>
                  <select
                    value={formData.buyerId}
                    onChange={(e) => handleLeadChange(e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                  >
                    <option value="">اختر مهتم أو أدخل يدوياً</option>
                    {leads.filter(l => !['sold', 'cancelled'].includes(l.stage)).map(l => (
                      <option key={l.id} value={l.id}>{l.fullName}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">الاسم الكامل *</label>
                    <input
                      type="text"
                      value={formData.buyerName}
                      onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">رقم الهوية *</label>
                    <input
                      type="text"
                      value={formData.buyerNationalId}
                      onChange={(e) => setFormData({ ...formData, buyerNationalId: e.target.value })}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">تاريخ إصدار الهوية</label>
                  <input
                    type="date"
                    value={formData.buyerIdIssueDate}
                    onChange={(e) => setFormData({ ...formData, buyerIdIssueDate: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <h3 className="text-lg font-semibold text-white mb-3">العقار</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 mb-1">اختر الوحدة</label>
                  <select
                    value={formData.unitId}
                    onChange={(e) => handleUnitChange(e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                    required
                  >
                    <option value="">اختر الوحدة</option>
                    {units.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.type === 'apartment' ? 'شقة' : u.type === 'shop' ? 'محل' : u.type === 'office' ? 'مكتب' : 'مستودع'} {u.unitNumber} - {projects.find(p => p.id === u.projectId)?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">رقم العقار</label>
                    <input
                      type="text"
                      value={formData.propertyNumber}
                      onChange={(e) => setFormData({ ...formData, propertyNumber: e.target.value })}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">المنطقة العقارية</label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">وصف الوحدة</label>
                  <input
                    type="text"
                    value={formData.unitDescription}
                    onChange={(e) => setFormData({ ...formData, unitDescription: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">المساحة (م²)</label>
                    <input
                      type="number"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">الطابق</label>
                    <input
                      type="text"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <h3 className="text-lg font-semibold text-white mb-3">المبلغ</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">السعر الإجمالي ($)</label>
                  <input
                    type="number"
                    value={formData.totalUSD}
                    onChange={(e) => setFormData({ ...formData, totalUSD: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">سعر المتر ($)</label>
                  <input
                    type="text"
                    value={pricePerMeter.toFixed(2)}
                    readOnly
                    className="w-full bg-slate-900 text-slate-400 px-4 py-2 rounded-lg border border-slate-700"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-slate-400 mb-1">المبلغ بالليرة السورية</label>
                <input
                  type="text"
                  value={totalSYP.toLocaleString()}
                  readOnly
                  className="w-full bg-slate-900 text-slate-400 px-4 py-2 rounded-lg border border-slate-700"
                />
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <h3 className="text-lg font-semibold text-white mb-3">الشهود</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">اسم الشاهد الأول</label>
                  <input
                    type="text"
                    value={formData.witness1}
                    onChange={(e) => setFormData({ ...formData, witness1: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">اسم الشاهد الثاني</label>
                  <input
                    type="text"
                    value={formData.witness2}
                    onChange={(e) => setFormData({ ...formData, witness2: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">ملاحظات إضافية</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                حفظ العقد
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Contract PDF Preview Component
const ContractPDFPreview = ({ contract, company, onClose, contractRef }) => {
  const exchangeRate = 13000;
  const totalSYP = (contract.totalUSD || 0) * exchangeRate;

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const getFatherName = (fullName) => {
    const parts = fullName.split(' ');
    return parts.length > 1 ? parts[0] : '';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">معاينة العقد</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 bg-white" ref={contractRef}>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">بسم الله الرحمن الرحيم</h1>
            <h2 className="text-xl font-bold">( عقد بيع قطعي )</h2>
          </div>

          <div className="mb-6">
            <p className="mb-2">
              الفريق الأول: <strong>{contract.sellerName}</strong> بن {getFatherName(contract.buyerName || '')} تواد {getFatherName(contract.buyerName || '')}
            </p>
            <p className="mb-2">
              والذي في تاريخ {contract.date} أحمل الهوية رقم {contract.buyerNationalId || '......'} صادرة عن {contract.buyerIdIssueDate || '......'}
            </p>
          </div>

          <div className="mb-6">
            <p className="mb-2">
              الفريق الثاني: <strong>{contract.buyerName}</strong> بن ______ تواد ______
            </p>
            <p className="mb-2">
              والذي في تاريخ ....../..../.... أحمل الهوية رقم {contract.buyerNationalId || '......'} صادرة عن {contract.region || '......'}
            </p>
          </div>

          <div className="mb-6">
            <p className="mb-2 font-bold">اتفق الفريقان وهما بكامل الأوصاف المطلوبة شرعاً وقانوناً على ما يلي:</p>
          </div>

          <div className="mb-6">
            <p className="mb-2">
              1- نحن الفريق الأول نبيع ملكيتي للعقار (المقدم) من الحقار رقم {contract.propertyNumber || '......'} من المنطقة العقارية {contract.region || '......'}
            </p>
            <p className="mb-2">
              الذي هو عبارة عن {contract.unitDescription || '......'}
            </p>
            <p className="mb-2">
              والبالغة مساحته {contract.area || '......'} متراً مربعاً والمظل على {contract.floor || '......'}
            </p>
          </div>

          <div className="mb-6">
            <p className="mb-2">
              قد بعت الفريق الأول (المقدم) المذكور بيعاً قطعياً بالمبلغ المذكور لا تكول فيه ولا رجوع إلى السيد الفريق الثاني المذكور
            </p>
          </div>

          <div className="mb-6">
            <p className="mb-2">
              <strong>المبلغ الواحد: {contract.totalUSD?.toLocaleString() || '......'} دولار أمريكي</strong>
            </p>
            <p className="mb-2">
              وقد قبضت من أصل القيمة حتى التوقيع على هذا العقد وأمام الشهود الموقعين ذيلاً مبلغاً وقدره رقماً {formatNumber(totalSYP)} ليرة سورية كتابة {convertToArabic(totalSYP)} ليرة سورية
            </p>
            <p className="mb-2">
              والرصيد الباقي ومقداره رقماً {formatNumber(totalSYP)} ليرة叙利亚 لا غير
            </p>
          </div>

          <div className="mb-6">
            <p className="mb-2">
              علماً أن جميع المصاريف والذمم المترتبة على العقار (المقدم) المذكور حتى تاريخ التوقيع في السجل العقاري تقع على عاتق الفريق الأول
            </p>
            <p className="mb-2">
              والتي تلتزم الفريق الثاني بتسليم العقار (المقدم) المذكور خالياً من الشواغل بمدة أقصاها من تاريخ هذا العقد
            </p>
          </div>

          <div className="mt-12 pt-8 border-t-2 border-black">
            <div className="flex justify-between">
              <div className="text-center">
                <p className="border-t-2 border-black pt-2 w-32">الشاهد</p>
              </div>
              <div className="text-center">
                <p className="border-t-2 border-black pt-2 w-32">الشاهد</p>
              </div>
              <div className="text-center">
                <p className="border-t-2 border-black pt-2 w-32">الفريق الثاني</p>
              </div>
              <div className="text-center">
                <p className="border-t-2 border-black pt-2 w-32">الفريق الأول</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
          >
            إغلاق
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, type: '', id: null })}
        onConfirm={executeDelete}
        title="تأكيد الحذف"
        message={
          deleteConfirm.type === 'unit' ? 'هل أنت متأكد من حذف هذه الوحدة؟' :
          deleteConfirm.type === 'lead' ? 'هل أنت متأكد من حذف هذا المهتم؟' :
          deleteConfirm.type === 'contract' ? 'هل أنت متأكد من حذف هذا العقد؟' :
          'هل أنت متأكد من الحذف؟'
        }
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
      />
    </div>
  );
};

// Helper function to convert numbers to Arabic
const convertToArabic = (num) => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(d => arabicNumerals[parseInt(d)]).join('');
};

export default Sales;

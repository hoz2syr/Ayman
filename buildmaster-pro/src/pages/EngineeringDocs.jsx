import { useState, useMemo, useEffect } from 'react';
import { 
  FileImage, 
  FileText, 
  Gavel, 
  Plus, 
  Search, 
  Download, 
  Edit, 
  Trash2, 
  X,
  FileStack,
  Filter,
  Loader2
} from 'lucide-react';
import { 
  getDrawings, 
  getReports, 
  getDecisions, 
  getProjects,
  saveDrawing, 
  deleteDrawing,
  saveReport, 
  deleteReport,
  saveDecision, 
  deleteDecision,
  getCompanyInfo,
  subscribeToTable
} from '../utils/storage';
import { generateDecisionPDF, generateReportPDF } from '../utils/PDFService';
import Modal from '../components/shared/Modal';
import ConfirmDialog from '../components/shared/ConfirmDialog';

const EngineeringDocs = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('drawings');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Data states
  const [projects, setProjects] = useState([]);
  const [allDrawings, setAllDrawings] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [allDecisions, setAllDecisions] = useState([]);

  // Form states
  const [drawingForm, setDrawingForm] = useState({
    name: '',
    type: '',
    projectId: '',
    notes: '',
    file: null,
    fileName: '',
    fileType: '',
    relatedReports: [],
    relatedDecisions: []
  });

  // Modal states
  const [drawingModal, setDrawingModal] = useState({ isOpen: false, edit: null });
  const [reportModal, setReportModal] = useState({ isOpen: false, edit: null });
  const [decisionModal, setDecisionModal] = useState({ isOpen: false, edit: null });
  const [viewModal, setViewModal] = useState({ isOpen: false, item: null, type: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: null, itemId: null });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [drawingsData, reportsData, decisionsData, projectsData] = await Promise.all([
          getDrawings(),
          getReports(),
          getDecisions(),
          getProjects()
        ]);
        
        setAllDrawings(drawingsData || []);
        setAllReports(reportsData || []);
        setAllDecisions(decisionsData || []);
        setProjects(projectsData || []);
      } catch (error) {
        console.error('Error loading engineering docs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Realtime subscription للجداول الثلاثة
    const unsubscribes = [
      subscribeToTable('drawings', loadData),
      subscribeToTable('reports', loadData),
      subscribeToTable('decisions', loadData)
    ];

    return () => unsubscribes.forEach(unsub => unsub());
  }, [refreshKey]);

  const loadData = () => setRefreshKey(k => k + 1);

  // Handle file change
  const handleDrawingFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setDrawingForm({
        ...drawingForm,
        file: base64,
        fileName: file.name,
        fileType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  // Download file
  const handleDownloadFile = (fileData, fileName) => {
    if (!fileData) return;
    const link = document.createElement('a');
    link.href = fileData;
    link.download = fileName || 'file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const [reportForm, setReportForm] = useState({ 
    subject: '', 
    date: '', 
    engineer: '', 
    projectId: '',
    description: '',
    notes: '',
    recommendations: '',
    relatedDrawings: [],
    relatedDecisions: []
  });
  const [decisionForm, setDecisionForm] = useState({ 
    subject: '', 
    date: '', 
    responsibleParty: '', 
    projectId: '',
    description: '',
    decision: '',
    status: 'معلق',
    dueDate: '',
    notes: '',
    relatedDrawings: [],
    relatedReports: []
  });

  // Filtered data (must be before early return - React hooks rule)
  const drawings = useMemo(() => {
    return allDrawings.filter(d => {
      const matchProject = !selectedProject || d.projectId === selectedProject;
      const matchSearch = !searchQuery || 
        d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.drawingNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchProject && matchSearch;
    });
  }, [allDrawings, selectedProject, searchQuery]);

  const reports = useMemo(() => {
    return allReports.filter(r => {
      const matchProject = !selectedProject || r.projectId === selectedProject;
      const matchSearch = !searchQuery || 
        r.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reportNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchProject && matchSearch;
    });
  }, [allReports, selectedProject, searchQuery]);

  const decisions = useMemo(() => {
    return allDecisions.filter(d => {
      const matchProject = !selectedProject || d.projectId === selectedProject;
      const matchSearch = !searchQuery || 
        d.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.decisionNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchProject && matchSearch;
    });
  }, [allDecisions, selectedProject, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const drawingTypes = ['معماري', 'إنشائي', 'كهربائي', 'ميكانيكي', 'صحي'];
  const decisionStatuses = ['معلق', 'منفذ', 'ملغي'];

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || '-';
  };

  // Handlers - Drawings
  const handleOpenDrawingModal = (drawing = null) => {
    if (drawing) {
      setDrawingForm({
        name: drawing.name || '',
        type: drawing.type || '',
        projectId: drawing.projectId || '',
        relatedReports: drawing.relatedReports || [],
        relatedDecisions: drawing.relatedDecisions || [],
        file: drawing.file || null,
        fileName: drawing.fileName || '',
        notes: drawing.notes || ''
      });
    } else {
      setDrawingForm({
        name: '',
        type: '',
        projectId: '',
        relatedReports: [],
        relatedDecisions: [],
        file: null,
        fileName: '',
        notes: ''
      });
    }
    setDrawingModal({ isOpen: true, edit: drawing });
  };

  const handleSaveDrawing = (e) => {
    e.preventDefault();
    if (drawingModal.edit) {
      saveDrawing({ ...drawingModal.edit, ...drawingForm });
    } else {
      saveDrawing(drawingForm);
    }
    loadData();
    setDrawingModal({ isOpen: false, edit: null });
  };

  const handleDeleteDrawing = (id) => {
    setDeleteConfirm({ isOpen: true, type: 'drawing', itemId: id });
  };

  // Handlers - Reports
  const handleOpenReportModal = (report = null) => {
    if (report) {
      setReportForm({
        subject: report.subject || '',
        date: report.date || '',
        engineer: report.engineer || '',
        projectId: report.projectId || '',
        description: report.description || '',
        notes: report.notes || '',
        recommendations: report.recommendations || '',
        relatedDrawings: report.relatedDrawings || [],
        relatedDecisions: report.relatedDecisions || []
      });
    } else {
      setReportForm({
        subject: '',
        date: new Date().toISOString().split('T')[0],
        engineer: '',
        projectId: '',
        description: '',
        notes: '',
        recommendations: '',
        relatedDrawings: [],
        relatedDecisions: []
      });
    }
    setReportModal({ isOpen: true, edit: report });
  };

  const handleSaveReport = (e) => {
    e.preventDefault();
    if (reportModal.edit) {
      saveReport({ ...reportModal.edit, ...reportForm });
    } else {
      saveReport(reportForm);
    }
    loadData();
    setReportModal({ isOpen: false, edit: null });
  };

  const handleDeleteReport = (id) => {
    setDeleteConfirm({ isOpen: true, type: 'report', itemId: id });
  };

  // Handlers - Decisions
  const handleOpenDecisionModal = (decision = null) => {
    if (decision) {
      setDecisionForm({
        subject: decision.subject || '',
        date: decision.date || '',
        responsibleParty: decision.responsibleParty || '',
        projectId: decision.projectId || '',
        description: decision.description || '',
        decision: decision.decision || '',
        status: decision.status || 'معلق',
        dueDate: decision.dueDate || '',
        notes: decision.notes || '',
        relatedDrawings: decision.relatedDrawings || [],
        relatedReports: decision.relatedReports || []
      });
    } else {
      setDecisionForm({
        subject: '',
        date: new Date().toISOString().split('T')[0],
        responsibleParty: '',
        projectId: '',
        description: '',
        decision: '',
        status: 'معلق',
        dueDate: '',
        notes: '',
        relatedDrawings: [],
        relatedReports: []
      });
    }
    setDecisionModal({ isOpen: true, edit: decision });
  };

  const handleSaveDecision = (e) => {
    e.preventDefault();
    if (decisionModal.edit) {
      saveDecision({ ...decisionModal.edit, ...decisionForm });
    } else {
      saveDecision(decisionForm);
    }
    loadData();
    setDecisionModal({ isOpen: false, edit: null });
  };

  const handleDeleteDecision = (id) => {
    setDeleteConfirm({ isOpen: true, type: 'decision', itemId: id });
  };

  const handleConfirmDelete = () => {
    const { type, itemId } = deleteConfirm;
    if (type === 'drawing') deleteDrawing(itemId);
    else if (type === 'report') deleteReport(itemId);
    else if (type === 'decision') deleteDecision(itemId);
    loadData();
    setDeleteConfirm({ isOpen: false, type: null, itemId: null });
  };

  const handleViewDocument = (item, type) => {
    setViewModal({ isOpen: true, item, type });
  };

  const handleExportDecisionPDF = async (decision) => {
    const companyInfo = getCompanyInfo();
    const decisionData = {
      decisionNumber: decision.decisionNumber,
      date: decision.date,
      subject: decision.subject,
      status: decision.status,
      responsibleParty: decision.responsibleParty,
      dueDate: decision.dueDate,
      projectName: getProjectName(decision.projectId),
      description: decision.description,
      decision: decision.decision,
      notes: decision.notes,
    };
    await generateDecisionPDF(decisionData, companyInfo);
  };

  const handleExportReportPDF = async (report) => {
    const companyInfo = getCompanyInfo();
    const reportData = {
      reportNumber: report.reportNumber,
      date: report.date,
      subject: report.subject,
      status: report.status,
      engineerName: report.engineer,
      projectName: getProjectName(report.projectId),
      description: report.description,
      recommendations: report.recommendations,
      notes: report.notes,
    };
    await generateReportPDF(reportData, companyInfo);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'منفذ': return 'bg-green-500';
      case 'معلق': return 'bg-yellow-500';
      case 'ملغي': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      'معماري': 'معماري',
      'إنشائي': 'إنشائي',
      'كهربائي': 'كهربائي',
      'ميكانيكي': 'ميكانيكي',
      'صحي': 'صحي'
    };
    return types[type] || type;
  };

  const tabs = [
    { id: 'drawings', label: '📐 المخططات', icon: FileImage, count: drawings.length },
    { id: 'reports', label: '📋 التقارير الهندسية', icon: FileText, count: reports.length },
    { id: 'decisions', label: '⚖️ القرارات الهندسية', icon: Gavel, count: decisions.length },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">الوثائق الهندسية</h1>
          <p className="text-slate-400 text-sm mt-1">إدارة المخططات والتقارير والقرارات الهندسية</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Project Filter */}
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="form-input pr-10 appearance-none bg-slate-800 min-w-[180px]"
            >
              <option value="">كل المشاريع</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pr-10 w-64"
            />
          </div>
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
              <span className="bg-slate-700 px-2 py-0.5 rounded-full text-xs">{tab.count}</span>
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
                مخطط جديد
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
                      <th className="text-right p-3 text-sm text-slate-400">الرقم</th>
                      <th className="text-right p-3 text-sm text-slate-400">اسم المخطط</th>
                      <th className="text-right p-3 text-sm text-slate-400">النوع</th>
                      <th className="text-right p-3 text-sm text-slate-400">المشروع</th>
                      <th className="text-right p-3 text-sm text-slate-400">المرتبطات</th>
                      <th className="text-right p-3 text-sm text-slate-400">التاريخ</th>
                      <th className="text-center p-3 text-sm text-slate-400">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drawings.map(drawing => (
                      <tr key={drawing.id} className="border-t border-slate-700">
                        <td className="p-3 text-white font-mono text-sm">{drawing.drawingNumber}</td>
                        <td className="p-3 text-white">{drawing.name}</td>
                        <td className="p-3 text-slate-400">{getTypeLabel(drawing.type)}</td>
                        <td className="p-3 text-slate-400">{getProjectName(drawing.projectId)}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {(drawing.relatedReports || []).map(r => (
                              <button 
                                key={r} 
                                onClick={() => {
                                  const report = allReports.find(rpt => rpt.reportNumber === r);
                                  if (report) handleViewDocument(report, 'report');
                                }}
                                className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded hover:bg-blue-500/30"
                              >
                                {r}
                              </button>
                            ))}
                            {(drawing.relatedDecisions || []).map(d => (
                              <button 
                                key={d} 
                                onClick={() => {
                                  const decision = allDecisions.find(dec => dec.decisionNumber === d);
                                  if (decision) handleViewDocument(decision, 'decision');
                                }}
                                className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded hover:bg-purple-500/30"
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-slate-400">{drawing.createdAt?.split('T')[0] || '-'}</td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleViewDocument(drawing, 'drawing')} className="p-2 text-blue-500 hover:bg-slate-700 rounded">
                              <FileStack className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleOpenDrawingModal(drawing)} className="p-2 text-yellow-500 hover:bg-slate-700 rounded">
                              <Edit className="w-4 h-4" />
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
                      <th className="text-right p-3 text-sm text-slate-400">الرقم</th>
                      <th className="text-right p-3 text-sm text-slate-400">الموضوع</th>
                      <th className="text-right p-3 text-sm text-slate-400">المهندس</th>
                      <th className="text-right p-3 text-sm text-slate-400">المشروع</th>
                      <th className="text-right p-3 text-sm text-slate-400">المرتبطات</th>
                      <th className="text-right p-3 text-sm text-slate-400">التاريخ</th>
                      <th className="text-center p-3 text-sm text-slate-400">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report.id} className="border-t border-slate-700">
                        <td className="p-3 text-white font-mono text-sm">{report.reportNumber}</td>
                        <td className="p-3 text-white">{report.subject}</td>
                        <td className="p-3 text-slate-400">{report.engineer || '-'}</td>
                        <td className="p-3 text-slate-400">{getProjectName(report.projectId)}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {(report.relatedDrawings || []).map(d => (
                              <button 
                                key={d} 
                                onClick={() => {
                                  const drawing = allDrawings.find(drw => drw.drawingNumber === d);
                                  if (drawing) handleViewDocument(drawing, 'drawing');
                                }}
                                className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded hover:bg-green-500/30"
                              >
                                {d}
                              </button>
                            ))}
                            {(report.relatedDecisions || []).map(d => (
                              <button 
                                key={d} 
                                onClick={() => {
                                  const decision = allDecisions.find(dec => dec.decisionNumber === d);
                                  if (decision) handleViewDocument(decision, 'decision');
                                }}
                                className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded hover:bg-purple-500/30"
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-slate-400">{report.date || '-'}</td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleExportReportPDF(report)} className="p-2 text-red-500 hover:bg-slate-700 rounded" title="تصدير PDF">
                              <FileText className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleViewDocument(report, 'report')} className="p-2 text-blue-500 hover:bg-slate-700 rounded">
                              <FileStack className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleOpenReportModal(report)} className="p-2 text-yellow-500 hover:bg-slate-700 rounded">
                              <Edit className="w-4 h-4" />
                            </button>
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
                      <th className="text-right p-3 text-sm text-slate-400">الرقم</th>
                      <th className="text-right p-3 text-sm text-slate-400">الموضوع</th>
                      <th className="text-right p-3 text-sm text-slate-400">الجهة المسؤولة</th>
                      <th className="text-right p-3 text-sm text-slate-400">المشروع</th>
                      <th className="text-right p-3 text-sm text-slate-400">المرتبطات</th>
                      <th className="text-right p-3 text-sm text-slate-400">الموعد النهائي</th>
                      <th className="text-right p-3 text-sm text-slate-400">الحالة</th>
                      <th className="text-center p-3 text-sm text-slate-400">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {decisions.map(decision => (
                      <tr key={decision.id} className="border-t border-slate-700">
                        <td className="p-3 text-white font-mono text-sm">{decision.decisionNumber}</td>
                        <td className="p-3 text-white">{decision.subject}</td>
                        <td className="p-3 text-slate-400">{decision.responsibleParty || '-'}</td>
                        <td className="p-3 text-slate-400">{getProjectName(decision.projectId)}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {(decision.relatedDrawings || []).map(d => (
                              <button 
                                key={d} 
                                onClick={() => {
                                  const drawing = allDrawings.find(drw => drw.drawingNumber === d);
                                  if (drawing) handleViewDocument(drawing, 'drawing');
                                }}
                                className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded hover:bg-green-500/30"
                              >
                                {d}
                              </button>
                            ))}
                            {(decision.relatedReports || []).map(r => (
                              <button 
                                key={r} 
                                onClick={() => {
                                  const report = allReports.find(rpt => rpt.reportNumber === r);
                                  if (report) handleViewDocument(report, 'report');
                                }}
                                className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded hover:bg-blue-500/30"
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-slate-400">{decision.dueDate || '-'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(decision.status)}`}>
                            {decision.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleExportDecisionPDF(decision)} className="p-2 text-red-500 hover:bg-slate-700 rounded" title="تصدير PDF">
                              <FileText className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleViewDocument(decision, 'decision')} className="p-2 text-blue-500 hover:bg-slate-700 rounded">
                              <FileStack className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleOpenDecisionModal(decision)} className="p-2 text-yellow-500 hover:bg-slate-700 rounded">
                              <Edit className="w-4 h-4" />
                            </button>
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
      </div>

      {/* Drawing Modal */}
      <Modal 
        isOpen={drawingModal.isOpen} 
        onClose={() => setDrawingModal({ isOpen: false, edit: null })} 
        title={drawingModal.edit ? "تعديل مخطط" : "مخطط جديد"} 
        size="lg"
      >
        <form onSubmit={handleSaveDrawing} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">اسم المخطط *</label>
              <input 
                type="text" 
                required 
                value={drawingForm.name} 
                onChange={e => setDrawingForm({...drawingForm, name: e.target.value})} 
                className="form-input" 
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">النوع</label>
              <select 
                value={drawingForm.type} 
                onChange={e => setDrawingForm({...drawingForm, type: e.target.value})} 
                className="form-input"
              >
                <option value="">اختر النوع</option>
                {drawingTypes.map(t => <option key={t} value={t}>{getTypeLabel(t)}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">المشروع</label>
            <select 
              value={drawingForm.projectId} 
              onChange={e => setDrawingForm({...drawingForm, projectId: e.target.value})} 
              className="form-input"
            >
              <option value="">اختر المشروع (اختياري)</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">المرتبطات - التقارير</label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-800 rounded-lg max-h-32 overflow-y-auto">
              {allReports.length === 0 && <span className="text-slate-500 text-sm">لا توجد تقارير</span>}
              {allReports.map(r => (
                <label key={r.id} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={drawingForm.relatedReports.includes(r.reportNumber)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDrawingForm({...drawingForm, relatedReports: [...drawingForm.relatedReports, r.reportNumber]});
                      } else {
                        setDrawingForm({...drawingForm, relatedReports: drawingForm.relatedReports.filter(x => x !== r.reportNumber)});
                      }
                    }}
                    className="rounded bg-slate-700 border-slate-600"
                  />
                  <span className="text-white text-sm">{r.reportNumber}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">المرتبطات - القرارات</label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-800 rounded-lg max-h-32 overflow-y-auto">
              {allDecisions.length === 0 && <span className="text-slate-500 text-sm">لا توجد قرارات</span>}
              {allDecisions.map(d => (
                <label key={d.id} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={drawingForm.relatedDecisions.includes(d.decisionNumber)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDrawingForm({...drawingForm, relatedDecisions: [...drawingForm.relatedDecisions, d.decisionNumber]});
                      } else {
                        setDrawingForm({...drawingForm, relatedDecisions: drawingForm.relatedDecisions.filter(x => x !== d.decisionNumber)});
                      }
                    }}
                    className="rounded bg-slate-700 border-slate-600"
                  />
                  <span className="text-white text-sm">{d.decisionNumber}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">ملاحظات</label>
            <textarea 
              value={drawingForm.notes} 
              onChange={e => setDrawingForm({...drawingForm, notes: e.target.value})} 
              className="form-input" 
              rows={3} 
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">ملف المخطط</label>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center hover:border-slate-500 transition-colors">
              {drawingForm.file ? (
                <div className="flex items-center justify-between bg-slate-800 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <FileImage className="w-8 h-8 text-green-400" />
                    <div className="text-right">
                      <p className="text-white text-sm">{drawingForm.fileName}</p>
                      <p className="text-slate-500 text-xs">{drawingForm.fileType}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setDrawingForm({...drawingForm, file: null, fileName: '', fileType: ''})}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
                    onChange={handleDrawingFileChange}
                    className="hidden"
                  />
                  <FileImage className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">اضغط لرفع ملف</p>
                  <p className="text-slate-500 text-xs mt-1">PDF، صورة، أو ملف CAD</p>
                </label>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setDrawingModal({ isOpen: false, edit: null })} className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg">إلغاء</button>
            <button type="submit" className="btn-primary">حفظ</button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal 
        isOpen={reportModal.isOpen} 
        onClose={() => setReportModal({ isOpen: false, edit: null })} 
        title={reportModal.edit ? "تعديل تقرير" : "تقرير جديد"} 
        size="lg"
      >
        <form onSubmit={handleSaveReport} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">الموضوع *</label>
              <input 
                type="text" 
                required 
                value={reportForm.subject} 
                onChange={e => setReportForm({...reportForm, subject: e.target.value})} 
                className="form-input" 
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">التاريخ</label>
              <input 
                type="date" 
                value={reportForm.date} 
                onChange={e => setReportForm({...reportForm, date: e.target.value})} 
                className="form-input" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">المهندس المسؤول</label>
              <input 
                type="text" 
                value={reportForm.engineer} 
                onChange={e => setReportForm({...reportForm, engineer: e.target.value})} 
                className="form-input" 
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">المشروع</label>
              <select 
                value={reportForm.projectId} 
                onChange={e => setReportForm({...reportForm, projectId: e.target.value})} 
                className="form-input"
              >
                <option value="">اختر المشروع (اختياري)</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">الوصف التفصيلي</label>
            <textarea 
              value={reportForm.description} 
              onChange={e => setReportForm({...reportForm, description: e.target.value})} 
              className="form-input" 
              rows={4} 
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">التوصيات</label>
            <textarea 
              value={reportForm.recommendations} 
              onChange={e => setReportForm({...reportForm, recommendations: e.target.value})} 
              className="form-input" 
              rows={3} 
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">المرتبطات - المخططات</label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-800 rounded-lg max-h-32 overflow-y-auto">
              {allDrawings.length === 0 && <span className="text-slate-500 text-sm">لا توجد مخططات</span>}
              {allDrawings.map(d => (
                <label key={d.id} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={reportForm.relatedDrawings.includes(d.drawingNumber)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setReportForm({...reportForm, relatedDrawings: [...reportForm.relatedDrawings, d.drawingNumber]});
                      } else {
                        setReportForm({...reportForm, relatedDrawings: reportForm.relatedDrawings.filter(x => x !== d.drawingNumber)});
                      }
                    }}
                    className="rounded bg-slate-700 border-slate-600"
                  />
                  <span className="text-white text-sm">{d.drawingNumber}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">المرتبطات - القرارات</label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-800 rounded-lg max-h-32 overflow-y-auto">
              {allDecisions.length === 0 && <span className="text-slate-500 text-sm">لا توجد قرارات</span>}
              {allDecisions.map(d => (
                <label key={d.id} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={reportForm.relatedDecisions.includes(d.decisionNumber)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setReportForm({...reportForm, relatedDecisions: [...reportForm.relatedDecisions, d.decisionNumber]});
                      } else {
                        setReportForm({...reportForm, relatedDecisions: reportForm.relatedDecisions.filter(x => x !== d.decisionNumber)});
                      }
                    }}
                    className="rounded bg-slate-700 border-slate-600"
                  />
                  <span className="text-white text-sm">{d.decisionNumber}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">ملاحظات</label>
            <textarea 
              value={reportForm.notes} 
              onChange={e => setReportForm({...reportForm, notes: e.target.value})} 
              className="form-input" 
              rows={2} 
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setReportModal({ isOpen: false, edit: null })} className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg">إلغاء</button>
            <button type="submit" className="btn-primary">حفظ</button>
          </div>
        </form>
      </Modal>

      {/* Decision Modal */}
      <Modal 
        isOpen={decisionModal.isOpen} 
        onClose={() => setDecisionModal({ isOpen: false, edit: null })} 
        title={decisionModal.edit ? "تعديل قرار" : "قرار جديد"} 
        size="lg"
      >
        <form onSubmit={handleSaveDecision} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">الموضوع *</label>
            <input 
              type="text" 
              required 
              value={decisionForm.subject} 
              onChange={e => setDecisionForm({...decisionForm, subject: e.target.value})} 
              className="form-input" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">التاريخ</label>
              <input 
                type="date" 
                value={decisionForm.date} 
                onChange={e => setDecisionForm({...decisionForm, date: e.target.value})} 
                className="form-input" 
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">الموعد النهائي</label>
              <input 
                type="date" 
                value={decisionForm.dueDate} 
                onChange={e => setDecisionForm({...decisionForm, dueDate: e.target.value})} 
                className="form-input" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">الجهة المسؤولة</label>
              <input 
                type="text" 
                value={decisionForm.responsibleParty} 
                onChange={e => setDecisionForm({...decisionForm, responsibleParty: e.target.value})} 
                className="form-input" 
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">الحالة</label>
              <select 
                value={decisionForm.status} 
                onChange={e => setDecisionForm({...decisionForm, status: e.target.value})} 
                className="form-input"
              >
                {decisionStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">المشروع</label>
            <select 
              value={decisionForm.projectId} 
              onChange={e => setDecisionForm({...decisionForm, projectId: e.target.value})} 
              className="form-input"
            >
              <option value="">اختر المشروع (اختياري)</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">وصف المشكلة</label>
            <textarea 
              value={decisionForm.description} 
              onChange={e => setDecisionForm({...decisionForm, description: e.target.value})} 
              className="form-input" 
              rows={3} 
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">القرار المتخذ</label>
            <textarea 
              value={decisionForm.decision} 
              onChange={e => setDecisionForm({...decisionForm, decision: e.target.value})} 
              className="form-input" 
              rows={3} 
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">المرتبطات - المخططات</label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-800 rounded-lg max-h-32 overflow-y-auto">
              {allDrawings.length === 0 && <span className="text-slate-500 text-sm">لا توجد مخططات</span>}
              {allDrawings.map(d => (
                <label key={d.id} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={decisionForm.relatedDrawings.includes(d.drawingNumber)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDecisionForm({...decisionForm, relatedDrawings: [...decisionForm.relatedDrawings, d.drawingNumber]});
                      } else {
                        setDecisionForm({...decisionForm, relatedDrawings: decisionForm.relatedDrawings.filter(x => x !== d.drawingNumber)});
                      }
                    }}
                    className="rounded bg-slate-700 border-slate-600"
                  />
                  <span className="text-white text-sm">{d.drawingNumber}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">المرتبطات - التقارير</label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-800 rounded-lg max-h-32 overflow-y-auto">
              {allReports.length === 0 && <span className="text-slate-500 text-sm">لا توجد تقارير</span>}
              {allReports.map(r => (
                <label key={r.id} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={decisionForm.relatedReports.includes(r.reportNumber)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDecisionForm({...decisionForm, relatedReports: [...decisionForm.relatedReports, r.reportNumber]});
                      } else {
                        setDecisionForm({...decisionForm, relatedReports: decisionForm.relatedReports.filter(x => x !== r.reportNumber)});
                      }
                    }}
                    className="rounded bg-slate-700 border-slate-600"
                  />
                  <span className="text-white text-sm">{r.reportNumber}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">ملاحظات</label>
            <textarea 
              value={decisionForm.notes} 
              onChange={e => setDecisionForm({...decisionForm, notes: e.target.value})} 
              className="form-input" 
              rows={2} 
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setDecisionModal({ isOpen: false, edit: null })} className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg">إلغاء</button>
            <button type="submit" className="btn-primary">حفظ</button>
          </div>
        </form>
      </Modal>

      {/* View Document Side Panel */}
      {viewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setViewModal({ isOpen: false, item: null, type: null })} />
          <div className="relative w-[520px] bg-[#1e293b] h-full shadow-2xl overflow-y-auto animate-slideInRight">
            {/* Header */}
            <div className="sticky top-0 bg-[#1e293b] border-b border-slate-700 p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                {viewModal.type === 'drawing' && <FileImage className="w-5 h-5 text-green-400" />}
                {viewModal.type === 'report' && <FileText className="w-5 h-5 text-blue-400" />}
                {viewModal.type === 'decision' && <Gavel className="w-5 h-5 text-purple-400" />}
                <h3 className="text-lg font-bold text-white">
                  {viewModal.item?.drawingNumber || viewModal.item?.reportNumber || viewModal.item?.decisionNumber}
                </h3>
              </div>
              <button 
                onClick={() => setViewModal({ isOpen: false, item: null, type: null })}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400">الاسم/الموضوع</label>
                  <p className="text-white font-medium mt-1">
                    {viewModal.item?.name || viewModal.item?.subject}
                  </p>
                </div>

                {viewModal.type === 'drawing' && (
                  <div>
                    <label className="text-sm text-slate-400">النوع</label>
                    <p className="text-white mt-1">{getTypeLabel(viewModal.item?.type)}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">المشروع</label>
                    <p className="text-white mt-1">{getProjectName(viewModal.item?.projectId)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">التاريخ</label>
                    <p className="text-white mt-1">{viewModal.item?.date || viewModal.item?.createdAt?.split('T')[0] || '-'}</p>
                  </div>
                </div>

                {viewModal.type === 'report' && (
                  <>
                    <div>
                      <label className="text-sm text-slate-400">المهندس المسؤول</label>
                      <p className="text-white mt-1">{viewModal.item?.engineer || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">الوصف التفصيلي</label>
                      <p className="text-white mt-1 whitespace-pre-wrap">{viewModal.item?.description || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">التوصيات</label>
                      <p className="text-white mt-1 whitespace-pre-wrap">{viewModal.item?.recommendations || '-'}</p>
                    </div>
                  </>
                )}

                {viewModal.type === 'decision' && (
                  <>
                    <div>
                      <label className="text-sm text-slate-400">الجهة المسؤولة</label>
                      <p className="text-white mt-1">{viewModal.item?.responsibleParty || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">الحالة</label>
                      <p className="mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(viewModal.item?.status)}`}>
                          {viewModal.item?.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">الموعد النهائي</label>
                      <p className="text-white mt-1">{viewModal.item?.dueDate || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">وصف المشكلة</label>
                      <p className="text-white mt-1 whitespace-pre-wrap">{viewModal.item?.description || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">القرار المتخذ</label>
                      <p className="text-white mt-1 whitespace-pre-wrap">{viewModal.item?.decision || '-'}</p>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm text-slate-400">ملاحظات</label>
                  <p className="text-white mt-1 whitespace-pre-wrap">{viewModal.item?.notes || '-'}</p>
                </div>
              </div>

              {/* Related Documents */}
              <div className="border-t border-slate-700 pt-4">
                <label className="text-sm text-slate-400 mb-3 block">المستندات المرتبطة</label>
                <div className="flex flex-wrap gap-2">
                  {viewModal.type === 'drawing' && (
                    <>
                      {(viewModal.item?.relatedReports || []).map(r => (
                        <button 
                          key={r} 
                          onClick={() => {
                            const report = allReports.find(rpt => rpt.reportNumber === r);
                            if (report) setViewModal({ isOpen: true, item: report, type: 'report' });
                          }}
                          className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-sm rounded-lg hover:bg-blue-500/30"
                        >
                          {r}
                        </button>
                      ))}
                      {(viewModal.item?.relatedDecisions || []).map(d => (
                        <button 
                          key={d} 
                          onClick={() => {
                            const decision = allDecisions.find(dec => dec.decisionNumber === d);
                            if (decision) setViewModal({ isOpen: true, item: decision, type: 'decision' });
                          }}
                          className="px-3 py-1.5 bg-purple-500/20 text-purple-400 text-sm rounded-lg hover:bg-purple-500/30"
                        >
                          {d}
                        </button>
                      ))}
                    </>
                  )}
                  {viewModal.type === 'report' && (
                    <>
                      {(viewModal.item?.relatedDrawings || []).map(d => (
                        <button 
                          key={d} 
                          onClick={() => {
                            const drawing = allDrawings.find(drw => drw.drawingNumber === d);
                            if (drawing) setViewModal({ isOpen: true, item: drawing, type: 'drawing' });
                          }}
                          className="px-3 py-1.5 bg-green-500/20 text-green-400 text-sm rounded-lg hover:bg-green-500/30"
                        >
                          {d}
                        </button>
                      ))}
                      {(viewModal.item?.relatedDecisions || []).map(d => (
                        <button 
                          key={d} 
                          onClick={() => {
                            const decision = allDecisions.find(dec => dec.decisionNumber === d);
                            if (decision) setViewModal({ isOpen: true, item: decision, type: 'decision' });
                          }}
                          className="px-3 py-1.5 bg-purple-500/20 text-purple-400 text-sm rounded-lg hover:bg-purple-500/30"
                        >
                          {d}
                        </button>
                      ))}
                    </>
                  )}
                  {viewModal.type === 'decision' && (
                    <>
                      {(viewModal.item?.relatedDrawings || []).map(d => (
                        <button 
                          key={d} 
                          onClick={() => {
                            const drawing = allDrawings.find(drw => drw.drawingNumber === d);
                            if (drawing) setViewModal({ isOpen: true, item: drawing, type: 'drawing' });
                          }}
                          className="px-3 py-1.5 bg-green-500/20 text-green-400 text-sm rounded-lg hover:bg-green-500/30"
                        >
                          {d}
                        </button>
                      ))}
                      {(viewModal.item?.relatedReports || []).map(r => (
                        <button 
                          key={r} 
                          onClick={() => {
                            const report = allReports.find(rpt => rpt.reportNumber === r);
                            if (report) setViewModal({ isOpen: true, item: report, type: 'report' });
                          }}
                          className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-sm rounded-lg hover:bg-blue-500/30"
                        >
                          {r}
                        </button>
                      ))}
                    </>
                  )}
                  {((viewModal.type === 'drawing' && !viewModal.item?.relatedReports?.length && !viewModal.item?.relatedDecisions?.length) ||
                    (viewModal.type === 'report' && !viewModal.item?.relatedDrawings?.length && !viewModal.item?.relatedDecisions?.length) ||
                    (viewModal.type === 'decision' && !viewModal.item?.relatedDrawings?.length && !viewModal.item?.relatedReports?.length)) && (
                    <span className="text-slate-500 text-sm">لا توجد مستندات مرتبطة</span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-[#1e293b] border-t border-slate-700 p-4 flex justify-between">
              {viewModal.type === 'drawing' && viewModal.item?.file ? (
                <button 
                  onClick={() => handleDownloadFile(viewModal.item.file, viewModal.item.fileName, viewModal.item.fileType)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  تحميل الملف
                </button>
              ) : (
                <button className="btn-secondary flex items-center gap-2 opacity-50 cursor-not-allowed">
                  <Download className="w-4 h-4" />
                  تحميل الملف
                </button>
              )}
              <button 
                onClick={() => setViewModal({ isOpen: false, item: null, type: null })}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

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

export default EngineeringDocs;

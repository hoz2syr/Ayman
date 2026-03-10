import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, Download, FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import { getReports, getDecisions, getDrawings, getExpenses, getInvoices, getLeads, getSettings } from '../utils/storage';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const DocViewer = () => {
  const { docType, docNumber } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDocument = () => {
      setLoading(true);
      setError(null);

      try {
        let doc = null;
        let title = '';
        let date = '';

        switch (docType) {
          case 'report':
            const reports = getReports();
            doc = reports.find(r => r.reportNumber === docNumber);
            title = 'تقرير هندسي';
            date = doc?.date;
            break;
          case 'decision':
            const decisions = getDecisions();
            doc = decisions.find(d => d.decisionNumber === docNumber);
            title = 'قرار هندسي';
            date = doc?.date;
            break;
          case 'drawing':
            const drawings = getDrawings();
            doc = drawings.find(d => d.drawingNumber === docNumber);
            title = 'مخطط هندسي';
            date = doc?.createdAt;
            break;
          case 'expense':
            const expenses = getExpenses();
            doc = expenses.find(e => e.id === docNumber);
            title = 'تقرير مصاريف';
            date = doc?.date;
            break;
          case 'invoice':
            const invoices = getInvoices();
            doc = invoices.find(i => i.invoiceNumber === docNumber);
            title = 'فاتورة';
            date = doc?.issueDate;
            break;
          case 'leads':
            title = 'قائمة المهتمين';
            date = new Date().toISOString();
            break;
          default:
            setError('نوع الوثيقة غير معروف');
            setLoading(false);
            return;
        }

        if (doc || docType === 'leads') {
          setDocument({ doc, title, date, docType, docNumber });
        } else {
          setError('هذه الوثيقة غير متوفرة أو انتهت صلاحيتها');
        }
      } catch (err) {
        setError('حدث خطأ في تحميل الوثيقة');
      }

      setLoading(false);
    };

    loadDocument();
  }, [docType, docNumber]);

  const settings = useMemo(() => getSettings(), []);
  const exchangeRate = settings?.exchangeRateUSD || 13000;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount) return '0';
    if (currency === 'SYP') {
      return amount.toLocaleString('ar-SA');
    }
    return amount.toLocaleString('en-US');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = document.getElementById('document-content');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;
    const imgPrintWidth = imgWidth * ratio;
    const imgPrintHeight = imgHeight * ratio;

    if (imgPrintHeight <= pdfHeight) {
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgPrintWidth, imgPrintHeight);
    } else {
      let heightLeft = imgPrintHeight;
      let position = 0;
      let pageNum = 0;
      const pageHeight = pdfHeight;

      while (heightLeft > 0) {
        if (pageNum > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', imgX, position, imgPrintWidth, imgPrintHeight);
        heightLeft -= pageHeight;
        position = -((pageNum + 1) * pageHeight) + pageHeight;
        pageNum++;
      }
    }

    pdf.save(`${docNumber}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f] mx-auto mb-4"></div>
          <p className="text-gray-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-700 mb-2">الوثيقة غير متوفرة</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>رجوع</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Printer className="w-5 h-5" />
            طباعة
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f]"
          >
            <Download className="w-5 h-5" />
            تحميل PDF
          </button>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex justify-center p-4 md:p-8">
        <div 
          id="document-content"
          className="bg-white shadow-lg max-w-[210mm] w-full"
          style={{ minHeight: '297mm' }}
        >
          {docType === 'report' && document?.doc && (
            <ReportContent document={document} formatDate={formatDate} formatCurrency={formatCurrency} />
          )}
          {docType === 'decision' && document?.doc && (
            <DecisionContent document={document} formatDate={formatDate} formatCurrency={formatCurrency} />
          )}
          {docType === 'expense' && document?.doc && (
            <ExpenseContent document={document} formatDate={formatDate} formatCurrency={formatCurrency} exchangeRate={exchangeRate} />
          )}
          {docType === 'invoice' && document?.doc && (
            <InvoiceContent document={document} formatDate={formatDate} formatCurrency={formatCurrency} exchangeRate={exchangeRate} />
          )}
          {docType === 'leads' && (
            <LeadsContent document={document} formatDate={formatDate} />
          )}
        </div>
      </div>
    </div>
  );
};

// Report Content Component
const ReportContent = ({ document, formatDate, formatCurrency }) => {
  const { doc, title, date, docNumber } = document;
  const settings = getSettings();
  const exchangeRate = settings?.exchangeRateUSD || 13000;

  return (
    <div className="p-8" dir="rtl">
      {/* Header */}
      <div className="border-b-4 border-[#b8960c] pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="w-20 h-20">
            <div className="w-20 h-20 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
          </div>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-[#1e3a5f]">{docNumber}</h1>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#1e3a5f]">{title}</h2>
        <p className="text-gray-500">{formatDate(date)}</p>
      </div>

      {/* Report Data */}
      <div className="space-y-4">
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f] w-1/3">رقم التقرير</td>
              <td className="py-2 text-gray-700">{doc.reportNumber}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f]">الموضوع</td>
              <td className="py-2 text-gray-700">{doc.subject}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f]">التاريخ</td>
              <td className="py-2 text-gray-700">{formatDate(doc.date)}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f]">المهندس</td>
              <td className="py-2 text-gray-700">{doc.engineer}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f]">الوصف</td>
              <td className="py-2 text-gray-700">{doc.description}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f]">التوصيات</td>
              <td className="py-2 text-gray-700">{doc.recommendations}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="flex justify-between">
          <div className="text-center">
            <p className="font-semibold text-[#1e3a5f]">التوقيع</p>
            <div className="w-32 h-16 border-2 border-dashed border-gray-300 mt-2"></div>
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#1e3a5f]">الختم</p>
            <div className="w-32 h-16 border-2 border-dashed border-gray-300 mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Decision Content Component
const DecisionContent = ({ document, formatDate, formatCurrency }) => {
  const { doc, title, date, docNumber } = document;

  return (
    <div className="p-8" dir="rtl">
      {/* Header */}
      <div className="border-b-4 border-[#b8960c] pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="w-20 h-20">
            <div className="w-20 h-20 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
          </div>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-[#1e3a5f]">{docNumber}</h1>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#1e3a5f]">{title}</h2>
        <p className="text-gray-500">{formatDate(date)}</p>
      </div>

      {/* Decision Data */}
      <div className="space-y-4">
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f] w-1/3">رقم القرار</td>
              <td className="py-2 text-gray-700">{doc.decisionNumber}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f]">الموضوع</td>
              <td className="py-2 text-gray-700">{doc.subject}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f]">التاريخ</td>
              <td className="py-2 text-gray-700">{formatDate(doc.date)}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f]">الجهة المسؤولة</td>
              <td className="py-2 text-gray-700">{doc.responsibleParty}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f]">الوصف</td>
              <td className="py-2 text-gray-700">{doc.description}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f]">القرار</td>
              <td className="py-2 text-gray-700">{doc.decision}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f]">الحالة</td>
              <td className="py-2 text-gray-700">{doc.status}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="flex justify-between">
          <div className="text-center">
            <p className="font-semibold text-[#1e3a5f]">التوقيع</p>
            <div className="w-32 h-16 border-2 border-dashed border-gray-300 mt-2"></div>
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#1e3a5f]">الختم</p>
            <div className="w-32 h-16 border-2 border-dashed border-gray-300 mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Expense Content Component
const ExpenseContent = ({ document, formatDate, formatCurrency, exchangeRate }) => {
  const { doc, title, date, docNumber } = document;

  return (
    <div className="p-8" dir="rtl">
      {/* Header */}
      <div className="border-b-4 border-[#b8960c] pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="w-20 h-20">
            <div className="w-20 h-20 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
          </div>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-[#1e3a5f]">{docNumber}</h1>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#1e3a5f]">{title}</h2>
        <p className="text-gray-500">{formatDate(date)}</p>
      </div>

      {/* Expense Data */}
      <div className="space-y-4">
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f] w-1/3">التصنيف</td>
              <td className="py-2 text-gray-700">{doc.category}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f]">الوصف</td>
              <td className="py-2 text-gray-700">{doc.description}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f]">المبلغ</td>
              <td className="py-2 text-gray-700">
                {formatCurrency(doc.amountUSD)} دولار / {formatCurrency(doc.amount * exchangeRate)} ل.س
              </td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f]">التاريخ</td>
              <td className="py-2 text-gray-700">{formatDate(doc.date)}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f]">ملاحظات</td>
              <td className="py-2 text-gray-700">{doc.notes}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="flex justify-between">
          <div className="text-center">
            <p className="font-semibold text-[#1e3a5f]">التوقيع</p>
            <div className="w-32 h-16 border-2 border-dashed border-gray-300 mt-2"></div>
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#1e3a5f]">الختم</p>
            <div className="w-32 h-16 border-2 border-dashed border-gray-300 mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Invoice Content Component
const InvoiceContent = ({ document, formatDate, formatCurrency, exchangeRate }) => {
  const { doc, title, date, docNumber } = document;

  return (
    <div className="p-8" dir="rtl">
      {/* Header */}
      <div className="border-b-4 border-[#b8960c] pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="w-20 h-20">
            <div className="w-20 h-20 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
          </div>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-[#1e3a5f]">{docNumber}</h1>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#1e3a5f]">{title}</h2>
        <p className="text-gray-500">{formatDate(date)}</p>
      </div>

      {/* Invoice Data */}
      <div className="space-y-4">
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f] w-1/3">اسم العميل</td>
              <td className="py-2 text-gray-700">{doc.clientName}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f]">الحالة</td>
              <td className="py-2 text-gray-700">{doc.status}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f]">تاريخ الإصدار</td>
              <td className="py-2 text-gray-700">{formatDate(doc.issueDate)}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 font-semibold text-[#1e3a5f]">المجموع</td>
              <td className="py-2 text-gray-700">
                {formatCurrency(doc.totalUSD)} دولار / {formatCurrency(doc.totalSYP)} ل.س
              </td>
            </tr>
          </tbody>
        </table>

        {/* Items Table */}
        {doc.items && doc.items.length > 0 && (
          <table className="w-full border-collapse mt-4">
            <thead>
              <tr className="bg-[#1e3a5f] text-white">
                <th className="p-2 text-right">البند</th>
                <th className="p-2 text-right">الكمية</th>
                <th className="p-2 text-right">السعر</th>
                <th className="p-2 text-right">المجموع</th>
              </tr>
            </thead>
            <tbody>
              {doc.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="p-2 text-gray-700">{item.name}</td>
                  <td className="p-2 text-gray-700">{item.quantity}</td>
                  <td className="p-2 text-gray-700">{formatCurrency(item.unitPriceUSD)} $</td>
                  <td className="p-2 text-gray-700">{formatCurrency(item.totalUSD)} $</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="flex justify-between">
          <div className="text-center">
            <p className="font-semibold text-[#1e3a5f]">التوقيع</p>
            <div className="w-32 h-16 border-2 border-dashed border-gray-300 mt-2"></div>
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#1e3a5f]">الختم</p>
            <div className="w-32 h-16 border-2 border-dashed border-gray-300 mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Leads Content Component
const LeadsContent = ({ document, formatDate }) => {
  const leads = getLeads();

  return (
    <div className="p-8" dir="rtl">
      {/* Header */}
      <div className="border-b-4 border-[#b8960c] pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="w-20 h-20">
            <div className="w-20 h-20 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
          </div>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-[#1e3a5f]">{document.docNumber}</h1>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#1e3a5f]">{document.title}</h2>
        <p className="text-gray-500">{formatDate(document.date)}</p>
      </div>

      {/* Leads Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#1e3a5f] text-white">
            <th className="p-2 text-right">الاسم</th>
            <th className="p-2 text-right">الهاتف</th>
            <th className="p-2 text-right">المرحلة</th>
            <th className="p-2 text-right">تاريخ التواصل</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, index) => (
            <tr key={lead.id} className="border-b border-gray-200">
              <td className="p-2 text-gray-700">{lead.fullName}</td>
              <td className="p-2 text-gray-700">{lead.phone}</td>
              <td className="p-2 text-gray-700">{lead.stage}</td>
              <td className="p-2 text-gray-700">{formatDate(lead.contactDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocViewer;

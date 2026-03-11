import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, Font, PDFDownloadLink, pdf } from '@react-pdf/renderer';

// تسجيل خط Cairo العربي
Font.register({
  family: 'Cairo',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hGA-W1ToLQ-HmkA.woff2',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOC-W1ToLQ-HmkA.woff2',
      fontWeight: 'bold',
    },
  ],
});

// الستايلات الموحدة
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Cairo',
    direction: 'rtl',
    padding: 30,
    backgroundColor: '#ffffff',
    fontSize: 10,
  },
  // الترويسة
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#b8960c',
  },
  logo: {
    width: 70,
    height: 70,
    objectFit: 'contain',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 3,
  },
  companyInfo: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
  },
  headerLeft: {
    alignItems: 'flex-end',
  },
  docNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 4,
  },
  phone: {
    fontSize: 9,
    color: '#444',
  },
  qrCode: {
    width: 60,
    height: 60,
    marginTop: 5,
  },
  // عنوان الوثيقة
  titleSection: {
    textAlign: 'center',
    marginVertical: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  date: {
    fontSize: 9,
    color: '#666',
    marginTop: 4,
  },
  projectInfo: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 4,
    marginVertical: 8,
    flexDirection: 'row-reverse',
  },
  projectLabel: {
    color: '#666',
    marginLeft: 5,
  },
  projectName: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  // الأقسام
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  infoGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    marginBottom: 6,
    flexDirection: 'row-reverse',
  },
  infoLabel: {
    color: '#666',
    marginLeft: 4,
    minWidth: 80,
  },
  infoValue: {
    color: '#1e293b',
    fontWeight: 'bold',
    flex: 1,
  },
  // الجداول
  table: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tableHeader: {
    flexDirection: 'row-reverse',
    backgroundColor: '#2d5a8e',
    padding: 8,
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 9,
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 7,
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    fontSize: 8,
    flex: 1,
    textAlign: 'center',
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row-reverse',
    backgroundColor: '#1e3a5f',
    padding: 10,
  },
  totalCell: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 10,
    flex: 1,
    textAlign: 'center',
  },
  // النصوص
  textBlock: {
    marginVertical: 8,
    lineHeight: 1.6,
    textAlign: 'justify',
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
  },
  // الذيل
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
  },
  signatureBox: {
    alignItems: 'center',
    width: 150,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#666',
    marginBottom: 8,
  },
  signatureImage: {
    width: 120,
    height: 50,
    objectFit: 'contain',
  },
  signatureLine: {
    width: 120,
    height: 1,
    backgroundColor: '#333',
    marginTop: 20,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 9,
    color: '#999',
  },
});

// ==================== مكونات مساعدة ====================

// الترويسة الموحدة
export const PDFHeader = ({ docNumber, title, date, company, qrBase64, projectName }) => (
  <>
    <View style={styles.header}>
      {/* شعار يمين */}
      {company?.logo ? (
        <Image src={company.logo} style={styles.logo} />
      ) : (
        <View style={{ width: 70, height: 70 }} />
      )}
      
      {/* وسط: اسم الشركة ومعلوماتها */}
      <View style={styles.headerCenter}>
        <Text style={styles.companyName}>{company?.name || 'اسم الشركة'}</Text>
        {company?.commercialRecord && (
          <Text style={styles.companyInfo}>سجل تجاري: {company.commercialRecord}</Text>
        )}
        {company?.taxNumber && (
          <Text style={styles.companyInfo}>الضريبة: {company.taxNumber}</Text>
        )}
      </View>
      
      {/* يسار: رقم الوثيقة وQR */}
      <View style={styles.headerLeft}>
        <Text style={styles.docNumber}>{docNumber}</Text>
        {company?.phone && (
          <Text style={styles.phone}>📞 {company.phone}</Text>
        )}
        {qrBase64 && (
          <Image src={qrBase64} style={styles.qrCode} />
        )}
      </View>
    </View>
    
    {/* عنوان الوثيقة */}
    <View style={styles.titleSection}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.date}>{date}</Text>
    </View>

    {/* اسم المشروع */}
    {projectName && (
      <View style={styles.projectInfo}>
        <Text style={styles.projectLabel}>المشروع:</Text>
        <Text style={styles.projectName}>{projectName}</Text>
      </View>
    )}
  </>
);

// الذيل الموحد
export const PDFFooter = ({ company }) => (
  <View style={styles.footer} fixed>
    <View style={styles.signatureBox}>
      <Text style={styles.signatureLabel}>التوقيع المعتمد</Text>
      {company?.signature ? (
        <Image src={company.signature} style={styles.signatureImage} />
      ) : (
        <View style={styles.signatureLine} />
      )}
      <Text style={styles.signatureLabel}>{company?.owner || 'المدير العام'}</Text>
    </View>
    <View style={styles.signatureBox}>
      <Text style={styles.signatureLabel}>الختم الرسمي</Text>
      {company?.stamp ? (
        <Image src={company.stamp} style={styles.signatureImage} />
      ) : (
        <View style={{ width: 50, height: 50, borderWidth: 2, borderColor: '#b8960c', borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#b8960c', fontSize: 8 }}>ختم</Text>
        </View>
      )}
    </View>
  </View>
);

// ==================== قالب الفاتورة ====================
export const InvoicePDF = ({ data, company, qrBase64 }) => {
  const exchangeRate = data.exchangeRate || 13000;
  
  // حساب الإجماليات
  const subtotal = data.items?.reduce((sum, item) => {
    return sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPriceUSD) || 0));
  }, 0) || 0;

  const totalSYP = subtotal * exchangeRate;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          docNumber={data.invoiceNumber}
          title={`فاتورة رقم ${data.invoiceNumber}`}
          date={data.issueDate}
          company={company}
          qrBase64={qrBase64}
          projectName={data.projectName}
        />

        {/* معلومات العميل */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات العميل</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>الاسم:</Text>
              <Text style={styles.infoValue}>{data.clientName}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>الهاتف:</Text>
              <Text style={styles.infoValue}>{data.clientPhone || '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>البريد:</Text>
              <Text style={styles.infoValue}>{data.clientEmail || '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>العنوان:</Text>
              <Text style={styles.infoValue}>{data.clientAddress || '-'}</Text>
            </View>
          </View>
        </View>

        {/* البنود */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>البنود</Text>
          <View style={styles.table}>
            {/* رأس الجدول */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>الصنف</Text>
              <Text style={styles.tableHeaderCell}>الوحدة</Text>
              <Text style={styles.tableHeaderCell}>الكمية</Text>
              <Text style={styles.tableHeaderCell}>السعر $</Text>
              <Text style={styles.tableHeaderCell}>الإجمالي $</Text>
              <Text style={styles.tableHeaderCell}>الإجمالي ل.س</Text>
            </View>
            
            {/* صفوف البيانات */}
            {data.items?.map((item, index) => {
              const totalUSD = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPriceUSD) || 0);
              const totalSYPItem = totalUSD * exchangeRate;
              
              return (
                <View
                  key={index}
                  style={[
                    styles.tableRow,
                    index % 2 === 1 && styles.tableRowAlt
                  ]}
                >
                  <Text style={styles.tableCell}>{item.description || item.name}</Text>
                  <Text style={styles.tableCell}>{item.unit || '-'}</Text>
                  <Text style={styles.tableCell}>{item.quantity}</Text>
                  <Text style={styles.tableCell}>{item.unitPriceUSD?.toLocaleString() || 0}</Text>
                  <Text style={styles.tableCell}>{totalUSD.toLocaleString()}</Text>
                  <Text style={styles.tableCell}>{totalSYPItem.toLocaleString()}</Text>
                </View>
              );
            })}
            
            {/* صف الإجمالي */}
            <View style={styles.totalRow}>
              <Text style={styles.totalCell}></Text>
              <Text style={styles.totalCell}></Text>
              <Text style={styles.totalCell}></Text>
              <Text style={styles.totalCell}>الإجمالي:</Text>
              <Text style={styles.totalCell}>{subtotal.toLocaleString()}</Text>
              <Text style={styles.totalCell}>{totalSYP.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* ملاحظات */}
        {data.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ملاحظات</Text>
            <Text style={styles.textBlock}>{data.notes}</Text>
          </View>
        )}

        <PDFFooter company={company} />
        
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `صفحة ${pageNumber} من ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

// ==================== قالب تقرير المصاريف ====================
export const ExpensePDF = ({ data, company, qrBase64 }) => {
  const { expenses = [], totals = {}, projectName, dateRange } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          docNumber={dateRange || new Date().toLocaleDateString('ar-SA')}
          title="تقرير المصاريف"
          date={new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
          company={company}
          qrBase64={qrBase64}
          projectName={projectName}
        />

        {/* ملخص الإجماليات */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ملخص الإجماليات</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>الفئة</Text>
              <Text style={styles.tableHeaderCell}>الإجمالي (د.أ)</Text>
              <Text style={styles.tableHeaderCell}>النسبة</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>أجور عمال</Text>
              <Text style={styles.tableCell}>{(totals.wages || 0).toLocaleString()}</Text>
              <Text style={styles.tableCell}>{totals.total ? ((totals.wages / totals.total) * 100).toFixed(1) : 0}%</Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={styles.tableCell}>مواد بناء</Text>
              <Text style={styles.tableCell}>{(totals.materials || 0).toLocaleString()}</Text>
              <Text style={styles.tableCell}>{totals.total ? ((totals.materials / totals.total) * 100).toFixed(1) : 0}%</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>معدات</Text>
              <Text style={styles.tableCell}>{(totals.equipment || 0).toLocaleString()}</Text>
              <Text style={styles.tableCell}>{totals.total ? ((totals.equipment / totals.total) * 100).toFixed(1) : 0}%</Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={styles.tableCell}>تشغيل وأخرى</Text>
              <Text style={styles.tableCell}>{(totals.operations || 0).toLocaleString()}</Text>
              <Text style={styles.tableCell}>{totals.total ? ((totals.operations / totals.total) * 100).toFixed(1) : 0}%</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalCell}>الإجمالي الكلي</Text>
              <Text style={styles.totalCell}>{(totals.total || 0).toLocaleString()}</Text>
              <Text style={styles.totalCell}>100%</Text>
            </View>
          </View>
        </View>

        {/* تفاصيل المصاريف */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفاصيل المصاريف</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>التاريخ</Text>
              <Text style={styles.tableHeaderCell}>الوصف</Text>
              <Text style={styles.tableHeaderCell}>الفئة</Text>
              <Text style={styles.tableHeaderCell}>المشروع</Text>
              <Text style={styles.tableHeaderCell}>المبلغ</Text>
            </View>
            
            {expenses.map((expense, index) => (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  index % 2 === 1 && styles.tableRowAlt
                ]}
              >
                <Text style={styles.tableCell}>{expense.date}</Text>
                <Text style={styles.tableCell}>{expense.description}</Text>
                <Text style={styles.tableCell}>{expense.category}</Text>
                <Text style={styles.tableCell}>{expense.projectName || 'عام'}</Text>
                <Text style={styles.tableCell}>{parseFloat(expense.amount || 0).toLocaleString()}</Text>
              </View>
            ))}
          </View>
        </View>

        <PDFFooter company={company} />
        
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `صفحة ${pageNumber} من ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

// ==================== قالب القرار الهندسي ====================
export const DecisionPDF = ({ data, company, qrBase64 }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          docNumber={data.decisionNumber}
          title={`قرار هندسي رقم ${data.decisionNumber}`}
          date={data.date}
          company={company}
          qrBase64={qrBase64}
          projectName={data.projectName}
        />

        {/* معلومات القرار */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات القرار</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>نوع القرار:</Text>
              <Text style={styles.infoValue}>{data.type || '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>الحالة:</Text>
              <Text style={styles.infoValue}>{data.status || '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>الجهة المسؤولة:</Text>
              <Text style={styles.infoValue}>{data.responsibleParty || '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>تاريخ الاستجابة:</Text>
              <Text style={styles.infoValue}>{data.responseDate || '-'}</Text>
            </View>
          </View>
        </View>

        {/* وصف المشكلة */}
        {data.problemDescription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>وصف المشكلة</Text>
            <Text style={styles.textBlock}>{data.problemDescription}</Text>
          </View>
        )}

        {/* القرار المتخذ */}
        {data.decision && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>القرار المتخذ</Text>
            <Text style={styles.textBlock}>{data.decision}</Text>
          </View>
        )}

        {/* التوصيات */}
        {data.recommendations && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>التوصيات</Text>
            <Text style={styles.textBlock}>{data.recommendations}</Text>
          </View>
        )}

        <PDFFooter company={company} />
        
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `صفحة ${pageNumber} من ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

// ==================== قالب التقرير الهندسي ====================
export const ReportPDF = ({ data, company, qrBase64 }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          docNumber={data.reportNumber}
          title={`تقرير هندسي رقم ${data.reportNumber}`}
          date={data.date}
          company={company}
          qrBase64={qrBase64}
          projectName={data.projectName}
        />

        {/* معلومات التقرير */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات التقرير</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>نوع التقرير:</Text>
              <Text style={styles.infoValue}>{data.type || '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>مهندس المتابعة:</Text>
              <Text style={styles.infoValue}>{data.engineerName || '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>الحالة:</Text>
              <Text style={styles.infoValue}>{data.status || '-'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>تاريخ المتابعة:</Text>
              <Text style={styles.infoValue}>{data.followUpDate || '-'}</Text>
            </View>
          </View>
        </View>

        {/* وصف العمل المنجز */}
        {data.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>وصف العمل المنجز</Text>
            <Text style={styles.textBlock}>{data.description}</Text>
          </View>
        )}

        {/* الملاحظات */}
        {data.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الملاحظات</Text>
            <Text style={styles.textBlock}>{data.notes}</Text>
          </View>
        )}

        {/* التوصيات */}
        {data.recommendations && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>التوصيات</Text>
            <Text style={styles.textBlock}>{data.recommendations}</Text>
          </View>
        )}

        {/* المستندات المرتبطة */}
        {data.attachments && data.attachments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المستندات المرفقة</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>اسم الملف</Text>
                <Text style={styles.tableHeaderCell}>النوع</Text>
              </View>
              {data.attachments.map((file, index) => (
                <View
                  key={index}
                  style={[
                    styles.tableRow,
                    index % 2 === 1 && styles.tableRowAlt
                  ]}
                >
                  <Text style={styles.tableCell}>{file.name}</Text>
                  <Text style={styles.tableCell}>{file.type}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <PDFFooter company={company} />
        
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `صفحة ${pageNumber} من ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

// ==================== قالب قائمة المهتمين ====================
export const LeadsPDF = ({ data, company, qrBase64 }) => {
  const { leads = [], title = 'قائمة المهتمين' } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          docNumber={new Date().toLocaleDateString('ar-SA')}
          title={title}
          date={new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
          company={company}
          qrBase64={qrBase64}
        />

        {/* قائمة المهتمين */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>قائمة المهتمين</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>الاسم</Text>
              <Text style={styles.tableHeaderCell}>الهاتف</Text>
              <Text style={styles.tableHeaderCell}>المشروع</Text>
              <Text style={styles.tableHeaderCell}>الوحدة</Text>
              <Text style={styles.tableHeaderCell}>الحالة</Text>
              <Text style={styles.tableHeaderCell}>التاريخ</Text>
            </View>
            
            {leads.map((lead, index) => (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  index % 2 === 1 && styles.tableRowAlt
                ]}
              >
                <Text style={styles.tableCell}>{lead.name}</Text>
                <Text style={styles.tableCell}>{lead.phone}</Text>
                <Text style={styles.tableCell}>{lead.projectName || '-'}</Text>
                <Text style={styles.tableCell}>{lead.unit || '-'}</Text>
                <Text style={styles.tableCell}>{lead.status || '-'}</Text>
                <Text style={styles.tableCell}>{lead.date || '-'}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ملخص */}
        <View style={styles.section}>
          <Text style={styles.textBlock}>
            <Text style={styles.bold}>الإجمالي:</Text> {leads.length} مهتم
          </Text>
        </View>
        
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `صفحة ${pageNumber} من ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

// ==================== تصدير Components ====================

// مكون زر التحميل للفاتورة
export const InvoicePDFDownloadLink = ({ data, company, children, fileName }) => (
  <PDFDownloadLink
    document={<InvoicePDF data={data} company={company} />}
    fileName={fileName || `فاتورة-${data?.invoiceNumber || 'document'}.pdf`}
    style={{ textDecoration: 'none' }}
  >
    {({ loading, blob, url, error }) => {
      if (error) {
        console.error('PDF Error:', error);
        return children(true);
      }
      return children(loading);
    }}
  </PDFDownloadLink>
);

// مكون زر التحميل لتقرير المصاريف
export const ExpensePDFDownloadLink = ({ data, company, children, fileName }) => (
  <PDFDownloadLink
    document={<ExpensePDF data={data} company={company} />}
    fileName={fileName || 'تقرير_المصاريف.pdf'}
    style={{ textDecoration: 'none' }}
  >
    {({ loading, blob, url, error }) => {
      if (error) {
        console.error('PDF Error:', error);
        return children(true);
      }
      return children(loading);
    }}
  </PDFDownloadLink>
);

// مكون زر التحميل للقرار
export const DecisionPDFDownloadLink = ({ data, company, children, fileName }) => (
  <PDFDownloadLink
    document={<DecisionPDF data={data} company={company} />}
    fileName={fileName || `قرار-${data?.decisionNumber || 'document'}.pdf`}
    style={{ textDecoration: 'none' }}
  >
    {({ loading, blob, url, error }) => {
      if (error) {
        console.error('PDF Error:', error);
        return children(true);
      }
      return children(loading);
    }}
  </PDFDownloadLink>
);

// مكون زر التحميل للتقرير
export const ReportPDFDownloadLink = ({ data, company, children, fileName }) => (
  <PDFDownloadLink
    document={<ReportPDF data={data} company={company} />}
    fileName={fileName || `تقرير-${data?.reportNumber || 'document'}.pdf`}
    style={{ textDecoration: 'none' }}
  >
    {({ loading, blob, url, error }) => {
      if (error) {
        console.error('PDF Error:', error);
        return children(true);
      }
      return children(loading);
    }}
  </PDFDownloadLink>
);

// مكون زر التحميل للمهتمين
export const LeadsPDFDownloadLink = ({ data, company, children, fileName }) => (
  <PDFDownloadLink
    document={<LeadsPDF data={data} company={company} />}
    fileName={fileName || 'قائمة_المهتمين.pdf'}
    style={{ textDecoration: 'none' }}
  >
    {({ loading, blob, url, error }) => {
      if (error) {
        console.error('PDF Error:', error);
        return children(true);
      }
      return children(loading);
    }}
  </PDFDownloadLink>
);

// ==================== أزرار التحميل اليدوي ====================

// دالة مساعدة لتحميل PDF
const downloadPDF = async (docComponent, defaultFileName) => {
  try {
    // إنشاء PDF - الطريقة الصحيحة في @react-pdf/renderer
    const pdfDoc = await pdf(docComponent);
    const blob = await pdfDoc.toBlob();
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = defaultFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

// زر تحميل الفاتورة
export const InvoicePDFButton = ({ data, company, children, fileName }) => {
  const [loading, setLoading] = React.useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    const doc = <InvoicePDF data={data} company={company} />;
    await downloadPDF(doc, fileName || `فاتورة-${data?.invoiceNumber || 'document'}.pdf`);
    setLoading(false);
  };
  
  if (typeof children === 'function') {
    return children({ loading, handleClick });
  }
  
  return (
    <button type="button" onClick={handleClick} disabled={loading} className="btn-primary">
      {children || (loading ? 'جارٍ التحميل...' : 'تحميل PDF')}
    </button>
  );
};

// زر تحميل تقرير المصاريف
export const ExpensePDFButton = ({ data, company, children, fileName }) => {
  const [loading, setLoading] = React.useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    const doc = <ExpensePDF data={data} company={company} />;
    await downloadPDF(doc, fileName || 'تقرير_المصاريف.pdf');
    setLoading(false);
  };
  
  if (typeof children === 'function') {
    return children({ loading, handleClick });
  }
  
  return (
    <button type="button" onClick={handleClick} disabled={loading} className="btn-primary">
      {children || (loading ? 'جارٍ التحميل...' : 'تحميل PDF')}
    </button>
  );
};

// زر تحميل القرار الهندسي
export const DecisionPDFButton = ({ data, company, children, fileName }) => {
  const [loading, setLoading] = React.useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    const doc = <DecisionPDF data={data} company={company} />;
    await downloadPDF(doc, fileName || `قرار-${data?.decisionNumber || 'document'}.pdf`);
    setLoading(false);
  };
  
  if (typeof children === 'function') {
    return children({ loading, handleClick });
  }
  
  return (
    <button type="button" onClick={handleClick} disabled={loading} className="btn-primary">
      {children || (loading ? 'جارٍ التحميل...' : 'تحميل PDF')}
    </button>
  );
};

// زر تحميل التقرير الهندسي
export const ReportPDFButton = ({ data, company, children, fileName }) => {
  const [loading, setLoading] = React.useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    const doc = <ReportPDF data={data} company={company} />;
    await downloadPDF(doc, fileName || `تقرير-${data?.reportNumber || 'document'}.pdf`);
    setLoading(false);
  };
  
  if (typeof children === 'function') {
    return children({ loading, handleClick });
  }
  
  return (
    <button type="button" onClick={handleClick} disabled={loading} className="btn-primary">
      {children || (loading ? 'جارٍ التحميل...' : 'تحميل PDF')}
    </button>
  );
};

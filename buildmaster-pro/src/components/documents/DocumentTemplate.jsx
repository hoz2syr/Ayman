import { forwardRef } from 'react';
import { useMemo } from 'react';
import { getCompanyInfo } from '../../utils/storage';

/**
 * DocumentTemplate - قالب الوثيقة الاحترافي
 * @param {string} title - عنوان الوثيقة
 * @param {string} docNumber - رقم الوثيقة
 * @param {string} date - تاريخ الوثيقة
 * @param {string} projectName - اسم المشروع المرتبط
 * @param {ReactNode} children - محتوى الوثيقة (مكون React)
 * @param {object} content - محتوى الوثيقة (كائنsections)
 * @param {boolean} showFooter - إظهار الذيل (توقيع وختم)
 */
const DocumentTemplate = forwardRef(({ 
  title, 
  docNumber, 
  date, 
  projectName, 
  children, 
  content,
  showFooter = true 
}, ref) => {
  const companyInfo = useMemo(() => getCompanyInfo(), []);

  const formattedDate = date || new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // دالة مساعدة لعرض المحتوى
  const renderContent = () => {
    // إذا كان هناك children (مكون React)، استخدمه
    if (children) return children;
    
    // إذا كان هناك content (كائن)، اعرض الـ sections
    if (content?.sections) {
      return content.sections.map((section, idx) => (
        <div key={idx} className="mb-6">
          {section.title && (
            <h3 className="text-lg font-bold text-[#1e293b] mb-3 pb-2 border-b border-gray-200">
              {section.title}
            </h3>
          )}
          
          {section.content && Array.isArray(section.content) && (
            <div className="space-y-2">
              {section.content.map((item, i) => (
                <div key={i} className="flex">
                  <span className="text-gray-500 ml-2">{item.label}:</span>
                  <span className="font-medium">{item.value || '-'}</span>
                </div>
              ))}
            </div>
          )}

          {section.table && (
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    {section.table.headers?.map((header, h) => (
                      <th key={h} className="border px-3 py-2 text-right font-bold">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows?.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => (
                        <td key={c} className="border px-3 py-2">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ));
    }
    
    return null;
  };

  return (
    <div 
      ref={ref}
      className="bg-white p-8 min-h-[1123px] text-right"
      dir="rtl"
      style={{ 
        fontFamily: 'Tahoma, Arial, sans-serif',
        fontSize: '12pt'
      }}
    >
      {/* الترويسة */}
      <div className="mb-6">
        {/* الصف العلوي ثلاثي الأعمدة */}
        <div className="flex justify-between items-start mb-4">
          {/* يمين: شعار الشركة */}
          <div className="w-1/3">
            {companyInfo?.logo ? (
              <img 
                src={companyInfo.logo} 
                alt={companyInfo.name}
                className="h-20 object-contain"
              />
            ) : (
              <div className="h-20 w-20 bg-[#b8960c] rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {companyInfo?.name?.charAt(0) || 'ش'}
                </span>
              </div>
            )}
          </div>

          {/* وسط: اسم الشركة + رقم الترخيص */}
          <div className="w-1/3 text-center">
            <h1 className="text-2xl font-bold text-[#1e293b] mb-1">
              {companyInfo?.name || 'اسم الشركة'}
            </h1>
            {companyInfo?.commercialRecord && (
              <p className="text-xs text-gray-500">
                سجل تجاري رقم: {companyInfo.commercialRecord}
              </p>
            )}
            {companyInfo?.taxNumber && (
              <p className="text-xs text-gray-500">
                رقم الضريبة: {companyInfo.taxNumber}
              </p>
            )}
          </div>

          {/* يسار: معلومات الاتصال */}
          <div className="w-1/3 text-left text-xs text-gray-600">
            {companyInfo?.phone && (
              <p>📞 {companyInfo.phone}</p>
            )}
            {companyInfo?.email && (
              <p>✉️ {companyInfo.email}</p>
            )}
            {companyInfo?.address && (
              <p>📍 {companyInfo.address}</p>
            )}
          </div>
        </div>

        {/* خط فاصل مزدوج ذهبي */}
        <div className="border-t-4 border-b-2 border-[#b8960c] my-4"></div>

        {/* الصف الثاني: عنوان الوثيقة | رقم | التاريخ */}
        <div className="flex justify-between items-center mb-4">
          <div className="w-1/3">
            <p className="text-sm text-gray-500">التاريخ:</p>
            <p className="font-medium">{formattedDate}</p>
          </div>
          
          <div className="w-1/3 text-center">
            <h2 className="text-xl font-bold text-[#1e293b]">{title}</h2>
          </div>
          
          <div className="w-1/3 text-left">
            <p className="text-sm text-gray-500">رقم الوثيقة:</p>
            <p className="font-medium">{docNumber}</p>
          </div>
        </div>

        {/* المشروع المرتبط */}
        {projectName && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-500">المشروع: </span>
            <span className="font-medium">{projectName}</span>
          </div>
        )}

        {/* خط فاصل رفيع */}
        <div className="border-t border-gray-300 my-4"></div>
      </div>

      {/* المحتوى */}
      <div className="mb-8">
        {renderContent()}
      </div>

      {/* ذيل الوثيقة */}
      {showFooter && (
        <div className="mt-auto pt-4">
          {/* خط فاصل */}
          <div className="border-t border-gray-300 my-4"></div>

          {/* صف التوقيع والختم */}
          <div className="flex justify-between items-end mt-8">
            {/* يمين: التوقيع المعتمد */}
            <div className="w-1/2 text-center pl-8">
              <p className="font-bold text-[#1e293b] mb-4">التوقيع المعتمد</p>
              <div className="h-16 flex items-end justify-center">
                {companyInfo?.signature ? (
                  <img 
                    src={companyInfo.signature} 
                    alt="التوقيع"
                    className="h-16 object-contain"
                  />
                ) : (
                  <div className="border-b-2 border-[#1e293b] w-48 h-12"></div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {companyInfo?.owner || 'المدير العام'}
              </p>
            </div>

            {/* يسار: الختم الرسمي */}
            <div className="w-1/2 text-center pr-8">
              <p className="font-bold text-[#1e293b] mb-4">الختم الرسمي</p>
              <div className="h-16 flex items-center justify-center">
                {companyInfo?.stamp ? (
                  <img 
                    src={companyInfo.stamp} 
                    alt="الختم"
                    className="h-16 object-contain"
                  />
                ) : (
                  <div className="w-20 h-20 border-4 border-[#b8960c] rounded-full flex items-center justify-center opacity-50">
                    <span className="text-[#b8960c] text-xs">ختم</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* رقم الصفحة في المنتصف السفلي */}
          <div className="text-center mt-8 text-xs text-gray-400">
            {/* سيتم إضافة رقم الصفحة ديناميكياً عند التصدير */}
            صفحة 1
          </div>
        </div>
      )}
    </div>
  );
});

DocumentTemplate.displayName = 'DocumentTemplate';

export default DocumentTemplate;

/**
 * أدوات التصدير المشتركة
 * يحتوي على الدوال المشتركة بين PDFService و exportExcel و exportWord
 */
import { getSettings } from './storage';

/**
 * الحصول على سعر الصرف
 * @returns {number} سعر الصرف USD إلى SYP
 */
export const getExchangeRate = () => {
  try {
    const settings = getSettings();
    return settings?.exchangeRateUSD || 13000;
  } catch {
    return 13000;
  }
};

/**
 * تحويل سعر USD إلى SYP
 * @param {number|string} usdAmount - المبلغ بالدولار
 * @returns {number} المبلغ بالليرة السورية
 */
export const toSYP = (usdAmount) => {
  const rate = getExchangeRate();
  return (parseFloat(usdAmount) || 0) * rate;
};

/**
 * تنسيق التاريخ بالعربية
 * @param {Date|string|null} date - التاريخ
 * @returns {string} التاريخ منسق
 */
export const formatDate = (date) => {
  if (!date) return new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return String(date);
    }
    return dateObj.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return String(date);
  }
};

/**
 * تنسيق التاريخ القصير
 * @param {Date|string|null} date - التاريخ
 * @returns {string} التاريخ منسق
 */
export const formatDateShort = (date) => {
  if (!date) return '-';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return String(date);
    }
    return dateObj.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return String(date);
  }
};

/**
 * تنسيق رقم بعلامة آلاف
 * @param {number|string|null|undefined} num - الرقم
 * @param {number} decimals - عدد المنازل العشرية
 * @returns {string} الرقم منسق
 */
export const formatNumber = (num, decimals = 0) => {
  const n = parseFloat(num || 0);
  if (isNaN(n)) return '0';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * تنسيق رقم مع العملة
 * @param {number|string|null|undefined} num - الرقم
 * @param {string} currency - العملة ($ أو ل.س)
 * @returns {string} الرقم منسق مع العملة
 */
export const formatCurrency = (num, currency = '$') => {
  const formatted = formatNumber(num);
  return currency === '$' ? `${formatted} $` : `${formatted} ل.س`;
};

/**
 * التحقق من صحة البيانات للتصدير
 * @param {any} data - البيانات
 * @param {string} type - نوع البيانات
 * @returns {object} Result object with isValid and error message
 */
export const validateExportData = (data, type) => {
  if (data === null || data === undefined) {
    return { isValid: false, error: `بيانات ${type} مطلوبة` };
  }

  if (Array.isArray(data) && data.length === 0) {
    return { isValid: false, error: `لا توجد ${type} للتصدير` };
  }

  return { isValid: true, error: null };
};

/**
 * رسالة خطأ موحدة للتصدير
 * @param {string} operation - اسم العملية
 * @param {Error} error - الخطأ
 * @returns {string} رسالة الخطأ
 */
export const getExportErrorMessage = (operation, error) => {
  console.error(`${operation} Error:`, error);
  return `حدث خطأ أثناء ${operation}. يرجى المحاولة مرة أخرى.`;
};

export default {
  getExchangeRate,
  toSYP,
  formatDate,
  formatDateShort,
  formatNumber,
  formatCurrency,
  validateExportData,
  getExportErrorMessage,
};

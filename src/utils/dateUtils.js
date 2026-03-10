/**
 * Arabic Date Formatting Utilities
 * تنسيق التواريخ بالعربية
 */

// Arabic month names
const arabicMonths = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

// Arabic day names
const arabicDays = [
  'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
];

/**
 * Format date in Arabic
 * @param {string|Date} date - التاريخ
 * @param {object} options - خيارات التنسيق
 * @returns {string} التاريخ المنسق
 */
export const formatArabicDate = (date, options = {}) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const {
    includeDay = false,
    includeTime = false,
    format = 'full' // full, short, numeric
  } = options;
  
  const day = d.getDate();
  const month = arabicMonths[d.getMonth()];
  const year = d.getFullYear();
  const dayName = arabicDays[d.getDay()];
  
  let result;
  
  switch (format) {
    case 'short':
      result = `${day} ${month} ${year}`;
      break;
    case 'numeric':
      result = `${day}/${d.getMonth() + 1}/${year}`;
      break;
    case 'full':
    default:
      result = `${day} ${month} ${year}`;
      break;
  }
  
  if (includeDay) {
    result = `${dayName}، ${result}`;
  }
  
  if (includeTime) {
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    result += ` - ${hours}:${minutes}`;
  }
  
  return result;
};

/**
 * Convert Western numbers to Arabic-Indic numbers
 * @param {string|number} num - الرقم
 * @returns {string} الرقم بالعربي
 */
export const toArabicNumerals = (num) => {
  const str = String(num);
  const western = '0123456789';
  const arabic = '٠١٢٣٤٥٦٧٨٩';
  
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const index = western.indexOf(str[i]);
    result += index >= 0 ? arabic[index] : str[i];
  }
  
  return result;
};

/**
 * Format currency in Arabic
 * @param {number} amount - المبلغ
 * @param {string} currency - العملة
 * @returns {string} المبلغ المنسق
 */
export const formatArabicCurrency = (amount, currency = 'ر.س') => {
  const formatted = parseFloat(amount).toLocaleString('ar-SA');
  return `${formatted} ${currency}`;
};

export default {
  formatArabicDate,
  toArabicNumerals,
  formatArabicCurrency,
};

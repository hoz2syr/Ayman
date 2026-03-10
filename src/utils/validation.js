/**
 * Input Validation Utilities
 * أدوات التحقق من صحة المدخلات
 */

/**
 * Allow only numbers in input
 * @param {string} value - القيمة
 * @returns {string} القيمة المقبولة
 */
export const allowNumbersOnly = (value) => {
  return value.replace(/[^0-9.]/g, '');
};

/**
 * Allow numbers and decimals
 * @param {string} value - القيمة
 * @returns {string} القيمة المقبولة
 */
export const allowNumbersDecimalsOnly = (value) => {
  // Allow only numbers and one decimal point
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  return cleaned;
};

/**
 * Allow numbers only (no decimals)
 * @param {string} value - القيمة
 * @returns {string} القيمة المقبولة
 */
export const allowIntegersOnly = (value) => {
  return value.replace(/[^0-9]/g, '');
};

/**
 * Format phone number
 * @param {string} phone - رقم الهاتف
 * @returns {string} الرقم المنسق
 */
export const formatPhoneNumber = (phone) => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format as Syrian phone number
  if (digits.startsWith('963')) {
    return `+963 ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  } else if (digits.startsWith('0')) {
    return `+963 ${digits.slice(1, 4)} ${digits.slice(4, 7)}`;
  }
  
  return phone;
};

/**
 * Validate email
 * @param {string} email - البريد
 * @returns {boolean} صحيح أم لا
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default {
  allowNumbersOnly,
  allowNumbersDecimalsOnly,
  allowIntegersOnly,
  formatPhoneNumber,
  isValidEmail,
};

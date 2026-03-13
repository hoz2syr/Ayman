/**
 * أدوات التنزيل المشتركة
 */

/**
 * تنزيل Blob كملف
 * @param {Blob} blob - محتوى الملف
 * @param {string} filename - اسم الملف
 */
export const downloadBlob = (blob, filename) => {
  try {
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = filename;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
  }
};

/**
 * تنزيل نص كملف
 * @param {string} content - محتوى الملف
 * @param {string} filename - اسم الملف
 * @param {string} mimeType - نوع الملف
 */
export const downloadText = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
};

/**
 * تنزيل JSON كملف
 * @param {object} data - البيانات
 * @param {string} filename - اسم الملف
 */
export const downloadJSON = (data, filename) => {
  const json = JSON.stringify(data, null, 2);
  downloadText(json, filename, 'application/json');
};

/**
 * تنزيل ArrayBuffer كملف
 * @param {ArrayBuffer} buffer - محتوى الملف
 * @param {string} filename - اسم الملف
 * @param {string} mimeType - نوع الملف
 */
export const downloadBuffer = (buffer, filename, mimeType = 'application/octet-stream') => {
  const blob = new Blob([buffer], { type: mimeType });
  downloadBlob(blob, filename);
};

export default {
  downloadBlob,
  downloadText,
  downloadJSON,
  downloadBuffer,
};

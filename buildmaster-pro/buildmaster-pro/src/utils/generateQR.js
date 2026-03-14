import QRCode from 'qrcode';

/**
 * توليد QR Code كـ base64
 * @param {string} docType - نوع الوثيقة (invoice, expense, decision, report)
 * @param {string} docNumber - رقم الوثيقة
 * @returns {Promise<string>} QR Code كـ base64
 */
export async function generateQRBase64(docType, docNumber) {
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/view/${docType}/${docNumber}`;
    
    const qrBase64 = await QRCode.toDataURL(url, {
      width: 150,
      margin: 1,
      color: {
        dark: '#1e3a5f',
        light: '#ffffff'
      }
    });
    
    return qrBase64;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
}

export default { generateQRBase64 };

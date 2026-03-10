/**
 * IndexedDB Helper for Image Storage
 * تخزين الصور باستخدام IndexedDB بدلاً من localStorage
 */

const DB_NAME = 'BuildMasterImages';
const DB_VERSION = 1;
const STORE_NAME = 'images';

/**
 * Open IndexedDB database
 */
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Save image to IndexedDB
 * @param {string} id - معرف الصورة
 * @param {string} base64Data - البيانات Base64
 * @param {string} type - نوع الصورة (image/png, image/jpeg, etc)
 * @returns {Promise}
 */
export const saveImage = async (id, base64Data, type = 'image/png') => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.put({
      id,
      data: base64Data,
      type,
      createdAt: new Date().toISOString(),
    });

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Get image from IndexedDB
 * @param {string} id - معرف الصورة
 * @returns {Promise<string|null>}
 */
export const getImage = async (id) => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result.data);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

/**
 * Delete image from IndexedDB
 * @param {string} id - معرف الصورة
 * @returns {Promise}
 */
export const deleteImage = async (id) => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Get all images
 * @returns {Promise<Array>}
 */
export const getAllImages = async () => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Clear all images
 * @returns {Promise}
 */
export const clearAllImages = async () => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Get storage usage estimate
 * @returns {Promise<{usage: number, quota: number}>}
 */
export const getStorageUsage = async () => {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
    };
  }
  return { usage: 0, quota: 0 };
};

/**
 * Convert file to base64
 * @param {File} file - الملف
 * @returns {Promise<string>}
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

export default {
  saveImage,
  getImage,
  deleteImage,
  getAllImages,
  clearAllImages,
  getStorageUsage,
  fileToBase64,
};

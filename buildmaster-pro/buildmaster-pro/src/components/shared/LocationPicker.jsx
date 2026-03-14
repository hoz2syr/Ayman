import { useState, useRef, useEffect } from 'react';
import { MapPin, Search, X, Check } from 'lucide-react';

/**
 * LocationPicker - مكون اختيار الموقع على الخريطة
 * @param {string} value - الإحداثيات الحالية (lat,lng)
 * @param {function} onChange - دالة التغيير
 * @param {string} placeholder - نص الت placeholder
 * @param {function} toast - دالة Toast (اختياري)
 */
const LocationPicker = ({ value, onChange, placeholder = 'اختر الموقع', className = '', toast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const wrapperRef = useRef(null);

  // Parse initial coordinates
  useEffect(() => {
    if (value) {
      const [lat, lng] = value.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        setSelectedLocation({ lat, lng });
        setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01}%2C${lat-0.01}%2C${lng+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lng}`);
      }
    }
  }, []);

  // إغلاق النافذة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Use Nominatim for geocoding (OpenStreetMap)
      const encoded = encodeURIComponent(searchTerm);
      window.open(`https://www.openstreetmap.org/search?query=${encoded}`, '_blank');
    }
  };

  const handleManualInput = () => {
    const coords = prompt('أدخل الإحداثيات بالتنسيق: lat,lng\nمثال: 24.7136,46.6753');
    if (coords) {
      const [lat, lng] = coords.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        const newValue = `${lat},${lng}`;
        onChange?.(newValue);
        setSelectedLocation({ lat, lng });
        setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01}%2C${lat-0.01}%2C${lng+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lng}`);
      } else {
        if (toast) {
          toast('إحداثيات غير صالحة!', 'error');
        } else {
          alert('إحداثيات غير صالحة!');
        }
      }
    }
  };

  const handleClear = () => {
    onChange?.('');
    setSelectedLocation(null);
    setMapUrl('');
  };

  const formatDisplayLocation = () => {
    if (!selectedLocation) return '';
    return `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`;
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="form-input cursor-pointer flex items-center justify-between hover:border-[#3b82f6] transition-colors min-h-[46px]"
      >
        <span className={selectedLocation ? 'text-white text-sm' : 'text-slate-400'}>
          {selectedLocation ? formatDisplayLocation() : placeholder}
        </span>
        <div className="flex items-center gap-2">
          {selectedLocation && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1 text-slate-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <MapPin className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[60] mt-2 w-96 bg-[#1e293b] rounded-xl shadow-2xl border border-slate-700 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-3 border-b border-slate-700">
            <h4 className="text-white font-semibold mb-2">تحديد الموقع</h4>
            
            {/* Search */}
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن موقع..."
                className="form-input flex-1 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="p-2 bg-[#3b82f6] text-white rounded-lg hover:bg-blue-600"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Map iframe */}
          <div className="h-64 bg-slate-800">
            {selectedLocation ? (
              <iframe
                title="Selected Location"
                width="100%"
                height="100%"
                frameBorder="0"
                src={mapUrl}
                style={{ border: 0 }}
                allowFullScreen
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-4">
                <MapPin className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm text-center">اضغط على زر البحث لإيجاد موقع على الخريطة</p>
                <p className="text-xs text-slate-500 mt-2">أو أدخل الإحداثيات يدوياً</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-700 flex gap-2">
            <button
              onClick={handleManualInput}
              className="flex-1 py-2 text-sm text-[#3b82f6] hover:bg-slate-700 rounded-lg transition-colors"
            >
              إدخال إحداثيات
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2 text-sm bg-[#3b82f6] text-white hover:bg-blue-600 rounded-lg transition-colors"
            >
              تم
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;

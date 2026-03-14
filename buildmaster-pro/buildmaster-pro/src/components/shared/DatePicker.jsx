import { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay } from 'date-fns';
import { ar } from 'date-fns/locale';

/**
 * DatePicker - مكون اختيار التاريخ مخصص مع دعم العربية
 * @param {string|Date} value - التاريخ المحدد
 * @param {function} onChange - دالة التغيير
 * @param {string} placeholder - نص الت Placeholder
 * @param {string} className - Classes إضافية
 */
const DatePicker = ({ value, onChange, placeholder = 'اختر التاريخ', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const wrapperRef = useRef(null);

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

  // أيام الأسبوع بالعربية
  const weekDays = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
  
  // الحصول على أيام الشهر
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  //days to fill before first day
  const startDay = getDay(monthStart);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    onChange?.(format(date, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const formatDisplayDate = (date) => {
    if (!date) return '';
    return format(date, 'yyyy/MM/dd', { locale: ar });
  };

  const formatMonthYear = (date) => {
    return format(date, 'MMMM yyyy', { locale: ar });
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="form-input cursor-pointer flex items-center justify-between hover:border-[#3b82f6] transition-colors"
      >
        <span className={selectedDate ? 'text-white' : 'text-slate-400'}>
          {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
        </span>
        <Calendar className="w-5 h-5 text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute z-[60] mt-2 w-80 bg-[#1e293b] rounded-xl shadow-2xl border border-slate-700 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-[#0f172a] border-b border-slate-700">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-white font-semibold">{formatMonthYear(currentMonth)}</span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 p-2 border-b border-slate-700">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs text-slate-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {/* Empty cells for days before month start */}
            {Array.from({ length: startDay }).map((_, index) => (
              <div key={`empty-${index}`} className="p-1" />
            ))}
            {/* Days */}
            {days.map((day) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentDay = isToday(day);
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateSelect(day)}
                  className={`
                    p-2 rounded-lg text-sm transition-colors
                    ${isSelected 
                      ? 'bg-[#3b82f6] text-white' 
                      : isCurrentDay 
                        ? 'bg-slate-700 text-[#3b82f6] hover:bg-slate-600' 
                        : 'text-slate-300 hover:bg-slate-700'
                    }
                  `}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          {/* Footer with today button */}
          <div className="p-2 border-t border-slate-700">
            <button
              onClick={() => {
                const today = new Date();
                setCurrentMonth(today);
                handleDateSelect(today);
              }}
              className="w-full py-2 text-sm text-[#3b82f6] hover:bg-slate-700 rounded-lg transition-colors"
            >
              اليوم
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../../lib/utils";

const Select = ({
  value,
  onValueChange,
  options = [],
  placeholder = "اختر...",
  label,
  error,
  className,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn("space-y-2", className)} ref={selectRef}>
      {label && (
        <label className="text-sm font-medium text-slate-300">{label}</label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
            "transition-all duration-300",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:ring-red-500/50 focus:border-red-500",
            isOpen && "ring-2 ring-blue-500/50 border-blue-500"
          )}
        >
          <span className={selectedOption ? "text-white" : "text-slate-500"}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-400 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 shadow-xl animate-fadeIn">
            <div className="max-h-60 overflow-auto p-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onValueChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                    value === option.value
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-slate-300 hover:bg-slate-700/50"
                  )}
                >
                  <span>{option.label}</span>
                  {value === option.value && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export { Select };

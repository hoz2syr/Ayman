import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = "blue",
  trend,
  trendValue,
  delay = 0,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [countedValue, setCountedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;
    
    const numericValue = typeof value === 'string' 
      ? parseFloat(value.replace(/[^0-9.-]/g, '')) 
      : value;
    
    if (isNaN(numericValue)) {
      setCountedValue(value);
      return;
    }

    const duration = 1000;
    const steps = 30;
    const increment = numericValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCountedValue(value);
        clearInterval(timer);
      } else {
        setCountedValue(typeof value === 'string' && value.includes('$') 
          ? `$${Math.floor(current).toLocaleString()}`
          : typeof value === 'string' && value.includes('ر.س')
            ? `${Math.floor(current).toLocaleString()} ر.س`
            : Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [isVisible, value]);

  const colorMap = {
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      icon: "bg-blue-500",
      text: "text-blue-400",
      glow: "hover:shadow-blue-500/20",
    },
    red: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      icon: "bg-red-500",
      text: "text-red-400",
      glow: "hover:shadow-red-500/20",
    },
    green: {
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      icon: "bg-green-500",
      text: "text-green-400",
      glow: "hover:shadow-green-500/20",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      icon: "bg-amber-500",
      text: "text-amber-400",
      glow: "hover:shadow-amber-500/20",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      icon: "bg-emerald-500",
      text: "text-emerald-400",
      glow: "hover:shadow-emerald-500/20",
    },
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      icon: "bg-purple-500",
      text: "text-purple-400",
      glow: "hover:shadow-purple-500/20",
    },
    indigo: {
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/30",
      icon: "bg-indigo-500",
      text: "text-indigo-400",
      glow: "hover:shadow-indigo-500/20",
    },
    cyan: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      icon: "bg-cyan-500",
      text: "text-cyan-400",
      glow: "hover:shadow-cyan-500/20",
    },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <div
      className={cn(
        "bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50",
        "transition-all duration-500 hover:shadow-lg",
        colors.glow,
        "hover:border-slate-600 hover:-translate-y-1",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">{countedValue}</p>
          {trend && (
            <div className={cn("flex items-center gap-1 mt-2 text-xs", trend === 'up' ? 'text-emerald-400' : 'text-red-400')}>
              <span>{trend === 'up' ? '↑' : '↓'}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-lg", colors.icon)}>
          {Icon && <Icon className="w-6 h-6 text-white" />}
        </div>
      </div>
    </div>
  );
};

export { StatCard };

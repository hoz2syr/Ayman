import { cn } from "../../lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Table = ({ className, children, ...props }) => (
  <div className={cn("w-full overflow-auto", className)}>
    <table className="w-full" {...props}>
      {children}
    </table>
  </div>
);

const TableHeader = ({ className, children, ...props }) => (
  <thead className={cn("", className)} {...props}>
    {children}
  </thead>
);

const TableBody = ({ className, children, ...props }) => (
  <tbody className={cn("", className)} {...props}>
    {children}
  </tbody>
);

const TableRow = ({ className, children, ...props }) => (
  <tr
    className={cn(
      "border-b border-slate-700/50 transition-colors hover:bg-slate-800/30",
      className
    )}
    {...props}
  >
    {children}
  </tr>
);

const TableHead = ({ className, children, ...props }) => (
  <th
    className={cn(
      "px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider",
      className
    )}
    {...props}
  >
    {children}
  </th>
);

const TableCell = ({ className, children, ...props }) => (
  <td
    className={cn("px-4 py-3 text-sm text-slate-300", className)}
    {...props}
  >
    {children}
  </td>
);

const TableCaption = ({ className, children, ...props }) => (
  <caption
    className={cn("mt-4 text-sm text-slate-500", className)}
    {...props}
  >
    {children}
  </caption>
);

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className={cn("flex items-center justify-between px-4 py-3", className)}>
      <div className="text-sm text-slate-400">
        صفحة {currentPage} من {totalPages}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-8 h-8 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              1
            </button>
            {startPage > 2 && <span className="text-slate-600">...</span>}
          </>
        )}
        
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "w-8 h-8 rounded-lg text-sm transition-colors",
              page === currentPage
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            {page}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-slate-600">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-8 h-8 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption, Pagination };

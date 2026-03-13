// Skeleton components for loading states

const SkeletonCard = ({ className = '' }) => (
  <div className={`card animate-pulse ${className}`}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-3 bg-slate-600 rounded w-1/3 mb-3"></div>
        <div className="h-6 bg-slate-600 rounded w-1/2"></div>
      </div>
      <div className="w-12 h-12 bg-slate-600 rounded-lg ml-4"></div>
    </div>
  </div>
);

const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3">
    <div className="flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-600 rounded flex-1"></div>
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <div key={colIndex} className="h-8 bg-slate-700 rounded flex-1"></div>
        ))}
      </div>
    ))}
  </div>
);

const SkeletonForm = ({ fields = 4 }) => (
  <div className="space-y-4">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i}>
        <div className="h-3 bg-slate-600 rounded w-1/4 mb-2"></div>
        <div className="h-12 bg-slate-700 rounded"></div>
      </div>
    ))}
    <div className="h-12 bg-slate-600 rounded w-1/3 mt-6"></div>
  </div>
);

const SkeletonStats = ({ count = 4 }) => (
  <div className={`grid grid-cols-2 md:grid-cols-${Math.min(count, 4)} gap-4`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-3 bg-slate-600 rounded w-2/3 mb-3"></div>
            <div className="h-8 bg-slate-600 rounded w-1/2"></div>
          </div>
          <div className="w-10 h-10 bg-slate-600 rounded-lg"></div>
        </div>
      </div>
    ))}
  </div>
);

const SkeletonList = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-600 rounded-lg flex-shrink-0"></div>
          <div className="flex-1">
            <div className="h-4 bg-slate-600 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-slate-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const SkeletonPage = () => (
  <div className="space-y-4 animate-fadeIn">
    <SkeletonCard className="max-w-md" />
    <SkeletonStats count={4} />
    <SkeletonStats count={4} />
    <SkeletonTable rows={5} cols={4} />
  </div>
);

export {
  SkeletonCard,
  SkeletonTable,
  SkeletonForm,
  SkeletonStats,
  SkeletonList,
  SkeletonPage
};

export default SkeletonCard;

import { cn } from "../../lib/utils";

const Avatar = ({
  src,
  alt,
  fallback,
  size = "default",
  className,
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    default: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const initial = fallback || alt?.charAt(0)?.toUpperCase() || "?";

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          "rounded-full object-cover",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium",
        sizeClasses[size],
        className
      )}
    >
      {initial}
    </div>
  );
};

const AvatarGroup = ({ avatars = [], max = 4, size = "default" }) => {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          alt={avatar.alt}
          size={size}
          className="ring-2 ring-slate-900"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "rounded-full bg-slate-700 flex items-center justify-center text-white font-medium ring-2 ring-slate-900",
            sizeClasses[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

export { Avatar, AvatarGroup };

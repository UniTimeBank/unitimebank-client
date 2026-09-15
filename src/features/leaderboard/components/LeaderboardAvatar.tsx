import React, { useState, useEffect } from 'react';

export interface LeaderboardAvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'podium';
  variant?: 'primary' | 'blue' | 'amber' | 'slate';
  className?: string;
}

export const LeaderboardAvatar: React.FC<LeaderboardAvatarProps> = ({
  src,
  name = 'U',
  size = 'md',
  variant = 'primary',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initial = (name.trim().charAt(0) || 'U').toUpperCase();

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs font-bold',
    md: 'w-12 h-12 text-sm font-bold',
    lg: 'w-16 h-16 text-lg font-black',
    podium: 'w-20 h-20 text-2xl font-black',
  }[size];

  const variantGradients = {
    primary: 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-md',
    blue: 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md',
    amber: 'bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md',
    slate: 'bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-md',
  }[variant];

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setHasError(true)}
        className={`rounded-full object-cover border-4 border-white shadow-md ${sizeClasses} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center border-4 border-white shadow-md select-none ${sizeClasses} ${variantGradients} ${className}`}
    >
      <span>{initial}</span>
    </div>
  );
};

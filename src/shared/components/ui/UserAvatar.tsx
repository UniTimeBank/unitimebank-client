import React, { useState, useEffect } from 'react';

export interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const BG_GRADIENTS = [
  'from-emerald-600 to-teal-600',
  'from-blue-600 to-indigo-600',
  'from-violet-600 to-purple-600',
  'from-amber-600 to-orange-600',
  'from-rose-600 to-pink-600',
  'from-teal-600 to-cyan-600',
];

const getGradientForName = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BG_GRADIENTS.length;
  return BG_GRADIENTS[index];
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = 'User',
  size = 'sm',
  className = '',
  alt,
}) => {
  const [hasError, setHasError] = useState(false);

  // Tự động reset trạng thái lỗi khi đường dẫn ảnh thay đổi
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const cleanName = (name || 'User').trim();
  const initial = cleanName.charAt(0).toUpperCase() || 'U';
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm;
  const gradient = getGradientForName(cleanName);

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={alt || cleanName}
        onError={() => setHasError(true)}
        className={`${sizeClass} rounded-full object-cover border border-slate-200/80 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-tr ${gradient} text-white font-bold flex items-center justify-center shrink-0 select-none shadow-2xs ${className}`}
      title={cleanName}
    >
      {initial}
    </div>
  );
};

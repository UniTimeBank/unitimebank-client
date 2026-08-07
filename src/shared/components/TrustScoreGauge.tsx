import React from 'react';

interface TrustScoreGaugeProps {
  score: number; // e.g. 9.2 or 98
  maxScore?: number; // 10 or 100
  size?: number; // e.g. 140
  strokeWidth?: number; // e.g. 10
  label?: string; // e.g. 'XUẤT SẮC'
  subtitle?: string; // e.g. 'Dựa trên 24 lượt đánh giá từ bạn học'
}

export const TrustScoreGauge: React.FC<TrustScoreGaugeProps> = ({
  score,
  maxScore = score > 10 ? 100 : 10,
  size = 140,
  strokeWidth = 10,
  label = score >= (maxScore * 0.9) ? 'XUẤT SẮC' : score >= (maxScore * 0.7) ? 'TỐT' : 'TRUNG BÌNH',
  subtitle,
}) => {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getGaugeColor = () => {
    if (percentage >= 90) return '#006B58'; // Primary-500
    if (percentage >= 70) return '#3B82F6'; // Blue
    if (percentage >= 50) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 text-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getGaugeColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold tracking-tight text-gray-900">
            {score % 1 === 0 ? score : score.toFixed(1)}
          </span>
          {label && (
            <span className="text-[10px] font-bold tracking-wider text-primary-500 uppercase">
              {label}
            </span>
          )}
        </div>
      </div>

      {subtitle && (
        <p className="mt-3 text-xs font-medium text-gray-500 max-w-[200px]">
          {subtitle}
        </p>
      )}
    </div>
  );
};

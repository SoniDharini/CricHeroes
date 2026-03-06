import { motion } from 'motion/react';

interface ImpactMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ImpactMeter({ score, size = 'md' }: ImpactMeterProps) {
  const sizeClasses = {
    sm: { width: 120, stroke: 8, fontSize: 'text-xl' },
    md: { width: 180, stroke: 12, fontSize: 'text-3xl' },
    lg: { width: 240, stroke: 16, fontSize: 'text-5xl' },
  };
  
  const config = sizeClasses[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const getColor = (score: number) => {
    if (score >= 90) return '#166534';
    if (score >= 70) return '#16a34a';
    if (score >= 50) return '#eab308';
    if (score >= 30) return '#f59e0b';
    return '#ef4444'; // red
  };
  
  const getTier = (score: number) => {
    if (score >= 90) return 'Match Winning';
    if (score >= 70) return 'High';
    if (score > 50) return 'Positive';
    if (score === 50) return 'Neutral';
    if (score >= 30) return 'Below Average';
    return 'Low';
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg className="transform -rotate-90" width={config.width} height={config.width}>
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="rgba(209, 213, 219, 0.3)"
            className="dark:stroke-slate-700/30"
            strokeWidth={config.stroke}
          />
          
          {/* Neutral baseline marker at 50 */}
          <line
            x1={config.width / 2}
            y1={config.stroke / 2}
            x2={config.width / 2}
            y2={config.stroke * 1.5}
            stroke="rgba(251, 191, 36, 0.6)"
            strokeWidth="2"
            className="transform rotate-[108deg]"
            style={{ transformOrigin: `${config.width / 2}px ${config.width / 2}px` }}
          />
          
          {/* Progress circle */}
          <motion.circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke={getColor(score)}
            strokeWidth={config.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`${config.fontSize} font-bold text-gray-900 dark:text-white`}
          >
            {score.toFixed(1)}
          </motion.div>
          <div className="text-gray-600 dark:text-slate-400 text-sm mt-1">Impact Score</div>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 px-4 py-2 rounded-full text-sm"
        style={{ 
          backgroundColor: `${getColor(score)}20`,
          color: getColor(score),
          border: `1px solid ${getColor(score)}40`
        }}
      >
        {getTier(score)} Impact
      </motion.div>
      
      <div className="mt-2 text-xs text-gray-500 dark:text-slate-500 text-center">
        Baseline: 50.0
      </div>
    </div>
  );
}

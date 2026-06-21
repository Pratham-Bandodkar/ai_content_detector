import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressRing({ 
  percent = 0, 
  size = 120, 
  strokeWidth = 10, 
  color = 'from-blue-500 to-purple-600', 
  label = 'AI Probability',
  showText = true 
}) {
  const isAI = percent > 50;
  const displayPercent = isAI ? percent : (100 - percent);
  const displayLabel = isAI ? 'AI Risk' : 'Human';

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (displayPercent / 100) * circumference;

  // Generate color mapping based on percentage if not explicitly custom
  let ringColor = color;
  if (color === 'dynamic') {
    if (percent < 30) {
      ringColor = 'from-green-500 to-emerald-400';
    } else if (percent < 50) {
      ringColor = 'from-green-500 to-emerald-400';
    } else if (percent < 70) {
      ringColor = 'from-yellow-500 to-orange-400';
    } else {
      ringColor = 'from-red-600 to-rose-500';
    }
  }

  // Set the dynamic label below the ring if using default
  const dynamicLabel = label === 'AI Probability' 
    ? (isAI ? 'AI Probability' : 'Human Probability')
    : label;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Track circle (backring) */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-gray-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-blue-500 transition-all duration-1000 ease-out"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            strokeLinecap="round"
            fill="transparent"
            style={{
              stroke: 'url(#gradient-' + percent + ')',
              filter: 'drop-shadow(0 0 6px var(--tw-shadow-color, rgba(59,130,246,0.3)))'
            }}
          />
          {/* Gradient definitions for SVG */}
          <defs>
            <linearGradient id={`gradient-${percent}`} x1="0%" y1="0%" x2="100%" y2="100%">
              {(ringColor.includes('green') || ringColor.includes('emerald')) && (
                <>
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#34D399" />
                </>
              )}
              {ringColor.includes('yellow') && (
                <>
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#FB7185" />
                </>
              )}
              {ringColor.includes('red') && (
                <>
                  <stop offset="0%" stopColor="#DC2626" />
                  <stop offset="100%" stopColor="#F43F5E" />
                </>
              )}
              {ringColor.includes('blue') && (
                <>
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </>
              )}
            </linearGradient>
          </defs>
        </svg>
        
        {/* Centered text */}
        {showText && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {Math.round(displayPercent)}%
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mt-0.5">
              {displayLabel}
            </span>
          </div>
        )}
      </div>
      {dynamicLabel && <span className="text-xs font-semibold text-gray-400 mt-1">{dynamicLabel}</span>}
    </div>
  );
}

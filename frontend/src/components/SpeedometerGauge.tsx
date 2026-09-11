'use client';

import React from 'react';
import { SalaryPercentiles } from '@/types';

interface SpeedometerGaugeProps {
  value: number;
  formattedValue: string;
  percentiles: SalaryPercentiles;
  currencySymbol: string;
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  value,
  formattedValue,
  percentiles,
  currencySymbol,
}) => {
  const minVal = percentiles.p25 * 0.75;
  const maxVal = percentiles.p90 * 1.25;
  const clampedVal = Math.min(Math.max(value, minVal), maxVal);

  // Map value to angle (-90deg to +90deg)
  const ratio = (clampedVal - minVal) / Math.max(maxVal - minVal, 1);
  const angle = -90 + ratio * 180;

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* SVG Semi-Circle Dial */}
      <div className="relative w-64 h-36 flex items-end justify-center overflow-hidden">
        <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="35%" stopColor="#10b981" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Colored Gradient Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            filter="url(#glow)"
            strokeDasharray="251.2"
            strokeDashoffset={251.2 * (1 - ratio)}
            className="transition-all duration-700 ease-out"
          />

          {/* Needle Base Pin */}
          <circle cx="100" cy="100" r="7" fill="#ffffff" filter="url(#glow)" />
          <circle cx="100" cy="100" r="3" fill="#ff6b6b" />

          {/* Needle Pointer */}
          <g
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: '100px 100px',
              transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="30"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <polygon points="96,40 104,40 100,24" fill="#ff6b6b" />
          </g>
        </svg>
      </div>

      {/* Salary Value Badge */}
      <div className="mt-1 text-center">
        <div className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-orange-100 to-orange-400 bg-clip-text text-transparent">
          {formattedValue}
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mt-0.5">
          Estimated Base Compensation
        </p>
      </div>

      {/* Benchmark Ticks */}
      <div className="mt-4 grid grid-cols-3 gap-2 w-full max-w-xs text-center text-[11px]">
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-1.5">
          <div className="text-white/40 font-medium">25th %ile</div>
          <div className="font-bold text-white/80">
            {currencySymbol}
            {(percentiles.p25 / (currencySymbol === '₹' ? 100000 : 1000)).toFixed(1)}
            {currencySymbol === '₹' ? ' L' : 'k'}
          </div>
        </div>
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-1.5 shadow-sm">
          <div className="text-orange-400 font-medium">Median (50th)</div>
          <div className="font-bold text-orange-200">
            {currencySymbol}
            {(percentiles.median / (currencySymbol === '₹' ? 100000 : 1000)).toFixed(1)}
            {currencySymbol === '₹' ? ' L' : 'k'}
          </div>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-1.5">
          <div className="text-white/40 font-medium">90th %ile</div>
          <div className="font-bold text-emerald-400">
            {currencySymbol}
            {(percentiles.p90 / (currencySymbol === '₹' ? 100000 : 1000)).toFixed(1)}
            {currencySymbol === '₹' ? ' L' : 'k'}
          </div>
        </div>
      </div>
    </div>
  );
};

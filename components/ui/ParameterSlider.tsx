'use client';

import React, { memo, useCallback } from 'react';

interface ParameterSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

/**
 * Custom slider component with Glass Morphism style
 */
const ParameterSlider: React.FC<ParameterSliderProps> = memo(({
  label,
  value,
  min,
  max,
  step,
  onChange,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  }, [onChange]);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{label}</label>
        <span className="text-xs font-mono" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          {value.toFixed(step < 1 ? Math.abs(Math.floor(Math.log10(step))) : 0)}
        </span>
      </div>
      <div className="relative h-2 flex items-center">
        {/* Background track */}
        <div 
          className="absolute w-full h-2 rounded-full"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        />
        {/* Progress fill */}
        <div 
          className="absolute h-2 rounded-full pointer-events-none"
          style={{
            width: `${percentage}%`,
            background: 'rgba(255, 255, 255, 0.3)',
          }}
        />
        {/* Actual input range */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="relative w-full h-2 rounded-full appearance-none cursor-pointer bg-transparent z-10
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-4 
            [&::-webkit-slider-thumb]:h-4 
            [&::-webkit-slider-thumb]:bg-white 
            [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:cursor-pointer 
            [&::-webkit-slider-thumb]:shadow-lg 
            [&::-webkit-slider-thumb]:transition-transform 
            [&::-webkit-slider-thumb]:hover:scale-125
            [&::-webkit-slider-thumb]:relative
            [&::-webkit-slider-thumb]:z-20
            [&::-moz-range-thumb]:w-4 
            [&::-moz-range-thumb]:h-4 
            [&::-moz-range-thumb]:bg-white 
            [&::-moz-range-thumb]:rounded-full 
            [&::-moz-range-thumb]:cursor-pointer 
            [&::-moz-range-thumb]:shadow-lg 
            [&::-moz-range-thumb]:transition-transform 
            [&::-moz-range-thumb]:hover:scale-125
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:relative
            [&::-moz-range-thumb]:z-20"
        />
      </div>
    </div>
  );
});

ParameterSlider.displayName = 'ParameterSlider';

export default ParameterSlider;
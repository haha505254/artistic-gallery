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
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full h-2 rounded-full appearance-none cursor-pointer 
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-4 
            [&::-webkit-slider-thumb]:h-4 
            [&::-webkit-slider-thumb]:bg-white 
            [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:cursor-pointer 
            [&::-webkit-slider-thumb]:shadow-lg 
            [&::-webkit-slider-thumb]:transition-transform 
            [&::-webkit-slider-thumb]:hover:scale-125
            [&::-moz-range-thumb]:w-4 
            [&::-moz-range-thumb]:h-4 
            [&::-moz-range-thumb]:bg-white 
            [&::-moz-range-thumb]:rounded-full 
            [&::-moz-range-thumb]:cursor-pointer 
            [&::-moz-range-thumb]:shadow-lg 
            [&::-moz-range-thumb]:transition-transform 
            [&::-moz-range-thumb]:hover:scale-125
            [&::-moz-range-thumb]:border-0"
          style={{
            background: `linear-gradient(to right, 
              rgba(255, 255, 255, 0.3) 0%, 
              rgba(255, 255, 255, 0.3) ${percentage}%, 
              rgba(255, 255, 255, 0.1) ${percentage}%, 
              rgba(255, 255, 255, 0.1) 100%)`
          }}
        />
      </div>
    </div>
  );
});

ParameterSlider.displayName = 'ParameterSlider';

export default ParameterSlider;
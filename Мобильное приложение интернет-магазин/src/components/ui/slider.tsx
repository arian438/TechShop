import React, { useState } from 'react';

interface SliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function Slider({ 
  value = [0], 
  onValueChange, 
  min = 0, 
  max = 100, 
  step = 1,
  className = ''
}: SliderProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (index: number, newValue: string) => {
    const numValue = Number(newValue);
    const newValues = [...localValue];
    newValues[index] = numValue;
    setLocalValue(newValues);
    onValueChange?.(newValues);
  };

  return (
    <div className={`relative flex w-full touch-none select-none items-center ${className}`}>
      <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
        <div 
          className="absolute h-full bg-primary"
          style={{ 
            width: `${((localValue[0] - min) / (max - min)) * 100}%` 
          }}
        />
      </div>
      {localValue.map((val, index) => (
        <input
          key={index}
          type="range"
          min={min}
          max={max}
          step={step}
          value={val}
          onChange={(e) => handleChange(index, e.target.value)}
          className="absolute h-1.5 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow"
        />
      ))}
    </div>
  );
}
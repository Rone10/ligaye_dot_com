'use client';

import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SalaryRangeFilterProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  onApply: () => void;
  min: number;
  max: number;
}

export function SalaryRangeFilter({
  value,
  onChange,
  onApply,
  min,
  max
}: SalaryRangeFilterProps) {
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  const [minInput, setMinInput] = useState(value[0].toString());
  const [maxInput, setMaxInput] = useState(value[1].toString());

  // Update local state when parent value changes
  useEffect(() => {
    setLocalValue(value);
    setMinInput(value[0].toString());
    setMaxInput(value[1].toString());
  }, [value]);

  const handleSliderChange = (newValue: number[]) => {
    const typedValue: [number, number] = [newValue[0], newValue[1]];
    setLocalValue(typedValue);
    setMinInput(typedValue[0].toString());
    setMaxInput(typedValue[1].toString());
    onChange(typedValue);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setMinInput(inputValue);
    
    const numValue = parseInt(inputValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= localValue[1]) {
      setLocalValue([numValue, localValue[1]]);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setMaxInput(inputValue);
    
    const numValue = parseInt(inputValue);
    if (!isNaN(numValue) && numValue <= max && numValue >= localValue[0]) {
      setLocalValue([localValue[0], numValue]);
    }
  };

  const handleMinInputBlur = () => {
    const numValue = parseInt(minInput);
    if (isNaN(numValue) || numValue < min) {
      setMinInput(min.toString());
      setLocalValue([min, localValue[1]]);
    } else if (numValue > localValue[1]) {
      setMinInput(localValue[1].toString());
      setLocalValue([localValue[1], localValue[1]]);
    } else {
      setLocalValue([numValue, localValue[1]]);
    }
  };

  const handleMaxInputBlur = () => {
    const numValue = parseInt(maxInput);
    if (isNaN(numValue) || numValue > max) {
      setMaxInput(max.toString());
      setLocalValue([localValue[0], max]);
    } else if (numValue < localValue[0]) {
      setMaxInput(localValue[0].toString());
      setLocalValue([localValue[0], localValue[0]]);
    } else {
      setLocalValue([localValue[0], numValue]);
    }
  };

  const handleApply = () => {
    onChange(localValue);
    onApply();
  };

  return (
    <div className="space-y-6">
      <Slider
        defaultValue={[min, max]}
        value={localValue}
        min={min}
        max={max}
        step={1000}
        onValueChange={handleSliderChange}
        className="py-4"
      />
      
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-xs text-[#9aa3bc] mb-1 block">Min (GMD)</label>
          <Input
            type="text"
            value={minInput}
            onChange={handleMinInputChange}
            onBlur={handleMinInputBlur}
            className="bg-white/70 border border-[rgba(255,255,255,0.5)] rounded-[10px]"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-[#9aa3bc] mb-1 block">Max (GMD)</label>
          <Input
            type="text"
            value={maxInput}
            onChange={handleMaxInputChange}
            onBlur={handleMaxInputBlur}
            className="bg-white/70 border border-[rgba(255,255,255,0.5)] rounded-[10px]"
          />
        </div>
      </div>
      
      <Button 
        onClick={handleApply}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
      >
        Apply Range
      </Button>
    </div>
  );
} 
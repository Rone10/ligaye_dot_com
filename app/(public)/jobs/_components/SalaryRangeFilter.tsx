'use client';

import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '../_utils/constants';

interface SalaryRangeFilterProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  onApply: () => void;
  min: number;
  max: number;
  includeNegotiable?: boolean;
  onIncludeNegotiableChange?: (include: boolean) => void;
}

// Predefined salary ranges for quick selection (in GMD annually)
const SALARY_PRESETS = [
  { label: 'Entry Level', min: 0, max: 150000, description: 'Up to 150K' },
  { label: 'Junior', min: 150000, max: 300000, description: '150K - 300K' },
  { label: 'Mid-Level', min: 300000, max: 600000, description: '300K - 600K' },
  { label: 'Senior', min: 600000, max: 1000000, description: '600K - 1M' },
  { label: 'Executive', min: 1000000, max: 2000000, description: '1M+' },
];

// Common salary amounts for quick input
const QUICK_AMOUNTS = [
  50000, 100000, 150000, 200000, 250000, 300000, 400000, 500000, 
  600000, 750000, 1000000, 1500000, 2000000
];

export function SalaryRangeFilter({
  value,
  onChange,
  onApply,
  min,
  max,
  includeNegotiable = true,
  onIncludeNegotiableChange
}: SalaryRangeFilterProps) {
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  const [minInput, setMinInput] = useState('');
  const [maxInput, setMaxInput] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);

  // Update local state when parent value changes
  useEffect(() => {
    setLocalValue(value);
    setMinInput(value[0] > 0 ? value[0].toString() : '');
    setMaxInput(value[1] < max ? value[1].toString() : '');
    setHasUnappliedChanges(false);
    
    // Check if current value matches any preset
    const matchingPreset = SALARY_PRESETS.find(
      preset => preset.min === value[0] && preset.max === value[1]
    );
    setSelectedPreset(matchingPreset?.label || null);
  }, [value, max]);

  const handlePresetSelect = (preset: typeof SALARY_PRESETS[0]) => {
    const newValue: [number, number] = [preset.min, preset.max];
    setLocalValue(newValue);
    setSelectedPreset(preset.label);
    setMinInput(preset.min.toString());
    setMaxInput(preset.max.toString());
    onChange(newValue);
    setShowCustomRange(false);
    // Auto-apply preset selections immediately
    onApply();
    setHasUnappliedChanges(false);
  };

  const handleSliderChange = (newValue: number[]) => {
    const typedValue: [number, number] = [newValue[0], newValue[1]];
    setLocalValue(typedValue);
    setMinInput(typedValue[0].toString());
    setMaxInput(typedValue[1].toString());
    onChange(typedValue);
    setSelectedPreset(null);
    setHasUnappliedChanges(true);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^0-9]/g, '');
    setMinInput(inputValue);
    
    const numValue = parseInt(inputValue) || 0;
    if (numValue >= min && numValue <= localValue[1]) {
      const newValue: [number, number] = [numValue, localValue[1]];
      setLocalValue(newValue);
      onChange(newValue);
      setSelectedPreset(null);
      setHasUnappliedChanges(true);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^0-9]/g, '');
    setMaxInput(inputValue);
    
    const numValue = parseInt(inputValue) || max;
    if (numValue <= max && numValue >= localValue[0]) {
      const newValue: [number, number] = [localValue[0], numValue];
      setLocalValue(newValue);
      onChange(newValue);
      setSelectedPreset(null);
      setHasUnappliedChanges(true);
    }
  };

  const handleQuickAmountSelect = (amount: number, isMin: boolean) => {
    if (isMin) {
      const newValue: [number, number] = [amount, Math.max(amount, localValue[1])];
      setLocalValue(newValue);
      setMinInput(amount.toString());
      onChange(newValue);
    } else {
      const newValue: [number, number] = [Math.min(amount, localValue[0]), amount];
      setLocalValue(newValue);
      setMaxInput(amount.toString());
      onChange(newValue);
    }
    setSelectedPreset(null);
    setHasUnappliedChanges(true);
  };

  const handleClearRange = () => {
    const newValue: [number, number] = [0, max];
    setLocalValue(newValue);
    setMinInput('');
    setMaxInput('');
    setSelectedPreset(null);
    onChange(newValue);
    setHasUnappliedChanges(true);
  };

  const handleApply = () => {
    onApply();
    setHasUnappliedChanges(false);
  };

  const formatDisplayValue = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  const hasActiveRange = localValue[0] > 0 || localValue[1] < max;

  return (
    <div className="space-y-4">
      {/* Include Negotiable Option */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="include-negotiable"
          checked={includeNegotiable}
          onCheckedChange={(checked) => {
            onIncludeNegotiableChange?.(checked as boolean);
          }}
        />
        <label 
          htmlFor="include-negotiable" 
          className="text-sm font-medium text-theme-dark cursor-pointer"
        >
          Include "Negotiable" salaries
        </label>
      </div>

      {/* Salary Range Presets */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-theme-dark">Quick Ranges</h4>
        <div className="grid grid-cols-1 gap-2">
          {SALARY_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetSelect(preset)}
              className={`flex items-center justify-between p-3 rounded-md border text-left transition-all duration-standard ${
                selectedPreset === preset.label
                  ? 'bg-primary-blue text-white border-primary-blue'
                  : 'bg-theme-light/50 border-theme-gray/30 hover:border-primary-blue/50 hover:bg-primary-blue/5'
              }`}
            >
              <div>
                <div className="font-medium text-sm">{preset.label}</div>
                <div className={`text-xs ${
                  selectedPreset === preset.label ? 'text-white/80' : 'text-theme-gray-dark'
                }`}>
                  GMD {preset.description}
                </div>
              </div>
              {selectedPreset === preset.label && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Range Toggle */}
      <div className="border-t border-theme-gray/20 pt-4">
        <button
          onClick={() => setShowCustomRange(!showCustomRange)}
          className="flex items-center justify-between w-full p-3 rounded-md border border-theme-gray/30 hover:border-primary-blue/50 hover:bg-primary-blue/5 transition-all duration-standard"
        >
          <span className="font-medium text-sm text-theme-dark">Custom Range</span>
          <span className={`text-xs transition-transform duration-standard ${showCustomRange ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {showCustomRange && (
          <div className="mt-4 space-y-4 p-4 bg-theme-light/30 rounded-md border border-theme-gray/20">
            {/* Current Range Display */}
            {hasActiveRange && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-theme-gray-dark">
                  Current: GMD {formatDisplayValue(localValue[0])} - {formatDisplayValue(localValue[1])}
                </span>
                <button
                  onClick={handleClearRange}
                  className="text-xs text-primary-blue hover:text-primary-blue-light"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Slider */}
            <div className="space-y-3">
              <Slider
                value={localValue}
                min={min}
                max={max}
                step={10000}
                onValueChange={handleSliderChange}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-theme-gray-dark">
                <span>GMD 0</span>
                <span>GMD {formatDisplayValue(max)}</span>
              </div>
            </div>

            {/* Manual Input */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-theme-gray-dark mb-1 block">Minimum (GMD)</label>
                <Input
                  type="text"
                  placeholder="0"
                  value={minInput}
                  onChange={handleMinInputChange}
                  className="bg-theme-light/50 border-theme-gray/30 focus:border-primary-blue focus:shadow-focus duration-standard"
                />
                {/* Quick amounts for min */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {QUICK_AMOUNTS.slice(0, 6).map((amount) => (
                    <button
                      key={`min-${amount}`}
                      onClick={() => handleQuickAmountSelect(amount, true)}
                      className="text-xs px-2 py-1 bg-theme-gray/10 hover:bg-primary-blue/10 text-theme-gray-dark hover:text-primary-blue rounded border border-theme-gray/20 hover:border-primary-blue/30 transition-all duration-fast"
                    >
                      {formatDisplayValue(amount)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-theme-gray-dark mb-1 block">Maximum (GMD)</label>
                <Input
                  type="text"
                  placeholder="No limit"
                  value={maxInput}
                  onChange={handleMaxInputChange}
                  className="bg-theme-light/50 border-theme-gray/30 focus:border-primary-blue focus:shadow-focus duration-standard"
                />
                {/* Quick amounts for max */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {QUICK_AMOUNTS.slice(6).map((amount) => (
                    <button
                      key={`max-${amount}`}
                      onClick={() => handleQuickAmountSelect(amount, false)}
                      className="text-xs px-2 py-1 bg-theme-gray/10 hover:bg-primary-blue/10 text-theme-gray-dark hover:text-primary-blue rounded border border-theme-gray/20 hover:border-primary-blue/30 transition-all duration-fast"
                    >
                      {formatDisplayValue(amount)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Apply Button - Always visible and prominent */}
      <div className="sticky bottom-0 bg-theme-light/95 backdrop-blur-sm border-t border-theme-gray/20 pt-4 mt-6">
        <Button 
          onClick={handleApply}
          className={`w-full font-semibold py-3 rounded-md shadow-level-2 hover:shadow-level-3 duration-standard ${
            hasUnappliedChanges 
              ? 'bg-primary-blue hover:bg-primary-blue-light text-white' 
              : 'bg-theme-gray/20 hover:bg-theme-gray/30 text-theme-gray-dark'
          }`}
          disabled={!hasUnappliedChanges}
        >
          {hasUnappliedChanges ? 'Apply Salary Filter' : 'Filter Applied'}
        </Button>
        
        {hasUnappliedChanges && (
          <p className="text-xs text-theme-gray-dark text-center mt-2">
            Click to apply your salary range changes
          </p>
        )}
      </div>

      {/* Info Note */}
      <div className="text-xs text-theme-gray-dark bg-theme-light/30 p-3 rounded-md border border-theme-gray/20">
        <strong>Note:</strong> All amounts are in Gambian Dalasi (GMD) per year. Jobs with different pay frequencies are automatically converted for comparison.
      </div>
    </div>
  );
} 
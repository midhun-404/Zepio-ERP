import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

const RANGES = [
    {
        label: 'Today', getValue: () => {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            return { start, end };
        }
    },
    {
        label: 'Yesterday', getValue: () => {
            const start = new Date();
            start.setDate(start.getDate() - 1);
            start.setHours(0, 0, 0, 0);
            const end = new Date();
            end.setDate(end.getDate() - 1);
            end.setHours(23, 59, 59, 999);
            return { start, end };
        }
    },
    {
        label: 'This Month', getValue: () => {
            const start = new Date();
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            return { start, end };
        }
    },
    {
        label: 'Last Month', getValue: () => {
            const start = new Date();
            start.setMonth(start.getMonth() - 1);
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            const end = new Date(); // last day of prev month
            end.setDate(0);
            end.setHours(23, 59, 59, 999);
            return { start, end };
        }
    },
    { label: 'Custom', getValue: () => null }
];

export default function DateRangePicker({ onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRange, setSelectedRange] = useState(RANGES[0]);
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    // Removed auto-trigger on mount to prevent parent re-render loops.
    // Parent components should initialize their own state.

    const handleRangeSelect = (range) => {
        if (range.label === 'Custom') {
            setSelectedRange(range);
            // Don't trigger onChange yet, wait for dates
        } else {
            setSelectedRange(range);
            const { start, end } = range.getValue();
            onChange(start, end, range.label);
            setIsOpen(false);
        }
    };

    const handleCustomApply = () => {
        if (customStart && customEnd) {
            const start = new Date(customStart);
            start.setHours(0, 0, 0, 0);
            const end = new Date(customEnd);
            end.setHours(23, 59, 59, 999);
            onChange(start, end, 'Custom');
            setIsOpen(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 bg-white border border-border px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-gray-50 transition-colors"
            >
                <Calendar className="h-4 w-4 text-muted" />
                <span>
                    {selectedRange.label === 'Custom'
                        ? `${customStart} - ${customEnd}`
                        : selectedRange.label}
                </span>
                <ChevronDown className="h-4 w-4 text-muted" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-border rounded-lg shadow-lg z-50 p-2">
                    <div className="space-y-1">
                        {RANGES.map((range) => (
                            <button
                                key={range.label}
                                onClick={() => handleRangeSelect(range)}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${selectedRange.label === range.label
                                    ? 'bg-primary/5 text-primary font-bold'
                                    : 'text-primary hover:bg-gray-50'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>

                    {selectedRange.label === 'Custom' && (
                        <div className="mt-3 pt-3 border-t border-border space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-muted mb-1 block">Start</label>
                                    <input
                                        type="date"
                                        value={customStart}
                                        onChange={(e) => setCustomStart(e.target.value)}
                                        className="w-full text-xs p-2 border border-border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted mb-1 block">End</label>
                                    <input
                                        type="date"
                                        value={customEnd}
                                        onChange={(e) => setCustomEnd(e.target.value)}
                                        className="w-full text-xs p-2 border border-border rounded-md"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleCustomApply}
                                disabled={!customStart || !customEnd}
                                className="w-full bg-primary text-white text-xs font-bold py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
                            >
                                Apply Range
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface InlineStatusSelectProps {
  value: string | null;
  options: string[];
  onChange: (newValue: string) => Promise<void>;
  colorClass?: string;
}

export default function InlineStatusSelect({ value, options, onChange, colorClass }: InlineStatusSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  async function handleSelect(option: string) {
    if (option === value) {
      setIsOpen(false);
      return;
    }
    setIsUpdating(true);
    try {
      await onChange(option);
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  }

  const displayValue = value || '—';
  const baseColorClass = colorClass || 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => !isUpdating && setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${baseColorClass} ${
          isUpdating ? 'opacity-50 cursor-wait' : 'hover:opacity-80 cursor-pointer'
        }`}
      >
        {isUpdating ? 'Updating...' : displayValue}
        {!isUpdating && <ChevronDown size={12} />}
      </button>

      {isOpen && !isUpdating && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-stone-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className={`block w-full px-3 py-2 text-left text-xs font-medium transition-colors ${
                option === value
                  ? 'bg-stone-100 text-zinc-900 dark:bg-zinc-700 dark:text-white'
                  : 'text-zinc-600 hover:bg-stone-50 dark:text-zinc-300 dark:hover:bg-zinc-700/50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

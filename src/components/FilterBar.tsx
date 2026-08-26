import { X } from 'lucide-react';

interface FilterBarProps {
  open: boolean;

  /** Status / stage dropdown */
  statusOptions?: string[];
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  statusLabel?: string;

  /** Second dropdown (e.g. country, hiringManager) */
  status2Options?: string[];
  status2Value?: string;
  onStatus2Change?: (value: string) => void;
  status2Label?: string;

  /** Date range */
  dateFromValue?: string;
  dateToValue?: string;
  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
  dateLabel?: string;

  onClear: () => void;
  hasActiveFilters: boolean;
}

const selectClass =
  'rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-500/30';

const inputClass =
  'rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-500/30';

const labelClass = 'mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400';

export default function FilterBar({
  open,
  statusOptions,
  statusValue = '',
  onStatusChange,
  statusLabel = 'Status',
  status2Options,
  status2Value = '',
  onStatus2Change,
  status2Label = 'Filter',
  dateFromValue = '',
  dateToValue = '',
  onDateFromChange,
  onDateToChange,
  dateLabel = 'Date',
  onClear,
  hasActiveFilters,
}: FilterBarProps) {
  if (!open) return null;

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Primary status/stage dropdown */}
      {statusOptions && onStatusChange && (
        <div className="flex flex-col">
          <span className={labelClass}>{statusLabel}</span>
          <select
            value={statusValue}
            onChange={(e) => onStatusChange(e.target.value)}
            className={selectClass}
          >
            <option value="">All</option>
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      )}

      {/* Secondary dropdown */}
      {status2Options && onStatus2Change && (
        <div className="flex flex-col">
          <span className={labelClass}>{status2Label}</span>
          <select
            value={status2Value}
            onChange={(e) => onStatus2Change(e.target.value)}
            className={selectClass}
          >
            <option value="">All</option>
            {status2Options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      )}

      {/* Date range */}
      {(onDateFromChange || onDateToChange) && (
        <div className="flex flex-col">
          <span className={labelClass}>{dateLabel}</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFromValue}
              onChange={(e) => onDateFromChange?.(e.target.value)}
              className={inputClass}
              title="From"
            />
            <span className="text-xs text-zinc-400 dark:text-zinc-500">→</span>
            <input
              type="date"
              value={dateToValue}
              onChange={(e) => onDateToChange?.(e.target.value)}
              className={inputClass}
              title="To"
            />
          </div>
        </div>
      )}

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 self-end rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-zinc-500 transition-all duration-150 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-300"
        >
          <X size={13} />
          Clear
        </button>
      )}
    </div>
  );
}

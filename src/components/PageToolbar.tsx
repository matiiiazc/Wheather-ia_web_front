import { Search, Filter, Pencil, Plus } from 'lucide-react';

interface PageToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilterClick?: () => void;
  filterOpen?: boolean;
  onEditModeClick?: () => void;
  editModeActive?: boolean;
  primaryLabel: string;
  onPrimaryClick: () => void;
}

export default function PageToolbar({
  searchValue,
  onSearchChange,
  onFilterClick,
  filterOpen,
  onEditModeClick,
  editModeActive,
  primaryLabel,
  onPrimaryClick,
}: PageToolbarProps) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <div className="relative min-w-0 flex-1">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search all fields..."
          className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 transition-colors focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-teal-500 dark:focus:ring-teal-500/30"
        />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={onFilterClick}
          title="Filter"
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
            filterOpen
              ? 'border-zinc-900 bg-zinc-900 text-white dark:border-teal-500 dark:bg-teal-500 dark:text-zinc-950'
              : 'border-stone-200 bg-white text-zinc-500 hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5'
          }`}
        >
          <Filter size={16} />
        </button>

        <button
          onClick={onEditModeClick}
          title="Quick edit"
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
            editModeActive
              ? 'border-zinc-900 bg-zinc-900 text-white dark:border-teal-500 dark:bg-teal-500 dark:text-zinc-950'
              : 'border-stone-200 bg-white text-zinc-500 hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5'
          }`}
        >
          <Pencil size={16} />
        </button>

        <button
          onClick={onPrimaryClick}
          className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-zinc-700 hover:scale-[1.02] hover:shadow-md sm:px-4 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">{primaryLabel}</span>
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ChevronUp, ChevronDown, Search, Inbox, ChevronLeft, ChevronRight, Download, ArrowUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKeys?: string[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  pageSize?: number;
  exportable?: boolean;
  exportFilename?: string;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-border/40 last:border-0">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-4 rounded-md bg-muted animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

function exportToCsv<T extends Record<string, any>>(columns: Column<T>[], data: T[], filename: string) {
  const exportCols = columns.filter((c) => c.key !== 'actions');
  const header = exportCols.map((c) => c.header).join(',');
  const rows = data.map((row) =>
    exportCols.map((c) => {
      const val = String(row[c.key] ?? '').replace(/"/g, '""');
      return `"${val}"`;
    }).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  onRowClick,
  emptyMessage = 'No data found',
  loading = false,
  pageSize = 10,
  exportable = false,
  exportFilename = 'export',
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);

  const filtered = data.filter((row) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const keys = searchKeys.length > 0 ? searchKeys : columns.map((c) => c.key);
    return keys.some((k) => String(row[k] ?? '').toLowerCase().includes(q));
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey] ?? '';
    const bVal = b[sortKey] ?? '';
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const paged = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200 placeholder:text-muted-foreground/50"
          />
        </div>
        {exportable && filtered.length > 0 && (
          <button
            onClick={() => exportToCsv(columns, filtered, exportFilename)}
            className="inline-flex items-center gap-2 rounded-xl border border-border/60 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:border-border transition-all duration-200"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        )}
      </div>
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 ${col.sortable !== false ? 'cursor-pointer select-none hover:text-foreground group' : ''} ${col.className || ''}`}
                    onClick={() => col.sortable !== false && toggleSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.header}
                      {col.sortable !== false && (
                        sortKey === col.key ? (
                          sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-primary" /> : <ChevronDown className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={columns.length} />)
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-2xl bg-muted/50 p-4">
                        <Inbox className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{emptyMessage}</p>
                        {search && (
                          <button onClick={() => setSearch('')} className="mt-1 text-xs text-primary hover:underline">
                            Clear search
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((row, i) => (
                  <tr
                    key={row.id || i}
                    className={`border-b border-border/30 last:border-0 transition-colors hover:bg-muted/20 ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={`px-4 py-3.5 ${col.className || ''}`}>
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-between px-1">
        <div className="text-xs text-muted-foreground">
          {loading ? (
            <span className="animate-pulse">{t('common.loading')}</span>
          ) : (
            `${t('common.showing')} ${safePage * pageSize + 1}–${Math.min((safePage + 1) * pageSize, sorted.length)} ${t('common.of')} ${sorted.length}`
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(0, safePage - 1))}
              disabled={safePage === 0}
              className="rounded-lg p-1.5 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all duration-200 ${safePage === i ? 'gradient-primary text-white shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
              disabled={safePage === totalPages - 1}
              className="rounded-lg p-1.5 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

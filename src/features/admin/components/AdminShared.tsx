import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';

export function PageHeader({ title, action, backTo }: { title: string; action?: React.ReactNode; backTo?: string }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {backTo && (
          <NavLink to={backTo} className="text-gray-400 hover:text-white text-sm">← Back</NavLink>
        )}
        <h1 className="text-xl font-bold text-white">{title}</h1>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, sub }: { label: string; value: string | number | undefined; sub?: string }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export function MiniCard({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-semibold text-white">{value ?? '—'}</p>
    </div>
  );
}

export function Toggle({
  checked, onChange, disabled = false,
}: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={clsx(
        'relative h-5 w-9 rounded-full transition-colors focus:outline-none',
        checked ? 'bg-green-600' : 'bg-gray-700',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      <span
        className={clsx(
          'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
          checked && 'translate-x-4',
        )}
      />
    </button>
  );
}

export function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    free: 'bg-gray-700 text-gray-300',
    pro:  'bg-purple-900 text-purple-300',
    team: 'bg-blue-900 text-blue-300',
  };
  return (
    <span className={clsx('rounded px-2 py-0.5 text-xs font-semibold uppercase', colors[plan] ?? colors.free)}>
      {plan}
    </span>
  );
}

export function Pagination({
  meta, onChange,
}: { meta?: { current_page: number; total: number; per_page: number }; onChange: (page: number) => void }) {
  if (!meta || meta.total <= meta.per_page) return null;
  const totalPages = Math.ceil(meta.total / meta.per_page);
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
      <span>{meta.total} total</span>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(meta.current_page - 1)}
          disabled={meta.current_page <= 1}
          className="rounded px-2 py-1 hover:bg-gray-800 disabled:opacity-40"
        >
          ← Prev
        </button>
        <span className="px-2 py-1">{meta.current_page} / {totalPages}</span>
        <button
          onClick={() => onChange(meta.current_page + 1)}
          disabled={meta.current_page >= totalPages}
          className="rounded px-2 py-1 hover:bg-gray-800 disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export function AuditDiffViewer({
  old: oldVal, next,
}: { old: Record<string, unknown> | null; next: Record<string, unknown> | null }) {
  if (!oldVal && !next) return <span className="text-gray-600 text-xs">—</span>;
  const keys = Array.from(new Set([...Object.keys(oldVal ?? {}), ...Object.keys(next ?? {})])).filter(
    (k) => (oldVal?.[k]) !== (next?.[k]),
  );
  if (!keys.length) return <span className="text-gray-600 text-xs">no change</span>;
  return (
    <div className="space-y-0.5">
      {keys.map((k) => (
        <div key={k} className="text-xs">
          <span className="text-gray-500">{k}: </span>
          <span className="text-red-400 line-through">{String(oldVal?.[k] ?? '—')}</span>
          {' → '}
          <span className="text-green-400">{String(next?.[k] ?? '—')}</span>
        </div>
      ))}
    </div>
  );
}

export function AdminTable({ headers, children, empty }: {
  headers: string[];
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="w-full text-sm">
        <thead className="bg-gray-900 text-xs text-gray-500 uppercase tracking-widest">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 bg-gray-950">
          {empty ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-gray-600">
                No data
              </td>
            </tr>
          ) : children}
        </tbody>
      </table>
    </div>
  );
}

export function Skeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-800" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function AdminNavLink({ to, icon, label, end }: { to: string; icon: string; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
          isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
        )
      }
    >
      <span>{icon}</span>
      {label}
    </NavLink>
  );
}

export function formatDate(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString();
}

export function formatDateTime(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleString();
}

export function formatRelativeTime(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

/**
 * Postgres numerics arrive as JSON strings, both from Laravel's `decimal:n`
 * casts and from raw SUM() aliases (where casts don't apply at all). Calling
 * .toFixed() on those throws, so coerce at the render boundary.
 */
export function num(v: number | string | null | undefined): number {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}

/** num() + toFixed, returning an em-dash for absent values rather than "0.00". */
export function formatNumeric(v: number | string | null | undefined, digits = 2): string {
  if (v === null || v === undefined || v === '') return '—';
  return num(v).toFixed(digits);
}

const isBlank = (v: unknown): boolean => v === null || v === undefined || v === '';

/**
 * One cost cell that covers both kinds of model: `credits/1K in – out` for a
 * token-rated row, `credits/image` for an image-rated one.
 *
 * It reads the pricing row rather than the model's `type` on purpose — the row
 * itself is what says which rating applies, so this stays correct for a model
 * whose `type` is missing (older API) or being changed.
 */
export function formatPricingCost(p?: {
  credit_per_input_1k?:  number | string | null;
  credit_per_output_1k?: number | string | null;
  credit_per_image?:     number | string | null;
} | null): string {
  if (!p) return '—';
  if (!isBlank(p.credit_per_image)) return `${formatNumeric(p.credit_per_image, 4)} / image`;
  if (isBlank(p.credit_per_input_1k) && isBlank(p.credit_per_output_1k)) return '—';
  return `${formatNumeric(p.credit_per_input_1k, 4)} – ${formatNumeric(p.credit_per_output_1k, 4)} / 1K`;
}

/** Thousands-grouped integer, tolerant of numeric strings. */
export function formatCount(v: number | string | null | undefined): string {
  if (v === null || v === undefined || v === '') return '—';
  return num(v).toLocaleString();
}

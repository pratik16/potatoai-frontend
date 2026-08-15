import { Outlet } from 'react-router-dom';
import { useGetDashboardQuery } from './adminApi';

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-purple-500" />
    </div>
  );
}

export function AdminGuard() {
  const { isLoading, isError, error } = useGetDashboardQuery();

  if (isLoading) return <Spinner />;

  if (isError) {
    // Only a 403 means the IP whitelist rejected us. Anything else — a 500 from
    // the dashboard query, a network drop — was previously reported as "your IP
    // is not whitelisted", which sent debugging down the wrong path entirely.
    const err = error as { status?: number | string; data?: { code?: string; message?: string; detail?: string } };
    const denied = err?.status === 403;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-6 text-center">
        <p className="text-6xl mb-4">{denied ? '🔒' : '⚠️'}</p>
        <h1 className="text-2xl font-bold text-red-400">
          {denied ? '403 — Access Denied' : 'Admin API unavailable'}
        </h1>
        <p className="mt-2 text-gray-500">
          {denied
            ? 'Your IP address is not whitelisted.'
            : (err?.data?.message ?? err?.data?.detail ?? 'The admin dashboard endpoint failed to respond.')}
        </p>
        {!denied && (
          <p className="mt-1 font-mono text-xs text-gray-600">
            GET /api/admin/ → {String(err?.status ?? 'network error')}
            {err?.data?.code ? ` (${err.data.code})` : ''}
          </p>
        )}
      </div>
    );
  }

  return <Outlet />;
}

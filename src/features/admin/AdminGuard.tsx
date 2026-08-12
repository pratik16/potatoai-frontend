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
    const status = (error as { status?: number } | undefined)?.status;
    const isForbidden = status === 403;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950">
        <p className="text-6xl mb-4">🔒</p>
        <h1 className="text-2xl font-bold text-red-400">
          {isForbidden ? '403 — Access Denied' : 'Admin unavailable'}
        </h1>
        <p className="mt-2 text-gray-500">
          {isForbidden
            ? 'Your IP address is not whitelisted.'
            : 'The admin API failed. Check server logs (this is not always an IP block).'}
        </p>
      </div>
    );
  }

  return <Outlet />;
}

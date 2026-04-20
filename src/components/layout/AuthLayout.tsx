import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-surface-0">
      <Outlet />
    </div>
  );
}

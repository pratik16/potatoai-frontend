import { Outlet } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

export function AuthLayout() {
  useTheme();

  return (
    <div className="flex min-h-screen bg-surface-0">
      <Outlet />
    </div>
  );
}

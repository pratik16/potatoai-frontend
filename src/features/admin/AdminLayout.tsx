import { Outlet } from 'react-router-dom';
import { AdminNavLink } from './components/AdminShared';

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      <aside className="flex w-56 flex-col border-r border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 p-4">
          <p className="text-xs uppercase tracking-widest text-gray-500">Admin Panel</p>
          <h1 className="mt-1 text-lg font-bold text-white">🥔 PotatoChat</h1>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          <AdminNavLink to="/admin"              icon="📊" label="Dashboard"     end />
          <AdminNavLink to="/admin/models"       icon="🤖" label="Models"            />
          <AdminNavLink to="/admin/pricing"      icon="💰" label="Pricing"           />
          <AdminNavLink to="/admin/credits-config" icon="⚙️" label="Credits Config" />
          <AdminNavLink to="/admin/ips"          icon="🔒" label="IP Whitelist"      />
          <AdminNavLink to="/admin/audit"        icon="📋" label="Audit Log"         />
          <AdminNavLink to="/admin/users"        icon="👥" label="Users"             />
          <AdminNavLink to="/admin/analytics"    icon="📈" label="Analytics"         />
        </nav>

        <div className="border-t border-gray-800 p-4 text-xs text-gray-600">
          Auto-refresh: 60s
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Shield, CreditCard, Bot, Palette, Bell, Trash2, Users, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { ProfileSection }        from '../features/settings/components/ProfileSection';
import { SecuritySection }       from '../features/settings/components/SecuritySection';
import { BillingSection }        from '../features/settings/components/BillingSection';
import { AIPreferencesSection }  from '../features/settings/components/AIPreferencesSection';
import { AppearanceSection }     from '../features/settings/components/AppearanceSection';
import { NotificationsSection }  from '../features/settings/components/NotificationsSection';
import { isLocalDev } from '../utils/env';

const NAV = [
  { id: 'profile',      label: 'Profile',         icon: User,       group: 'ACCOUNT'      },
  { id: 'security',     label: 'Security',         icon: Shield,     group: 'ACCOUNT'      },
  { id: 'billing',      label: 'Billing',          icon: CreditCard, group: 'ACCOUNT'      },
  { id: 'ai',           label: 'AI Models',        icon: Bot,        group: 'PREFERENCES'  },
  { id: 'appearance',   label: 'Appearance',       icon: Palette,    group: 'PREFERENCES'  },
  { id: 'notifications',label: 'Notifications',    icon: Bell,       group: 'PREFERENCES'  },
] as const;

type NavId = typeof NAV[number]['id'];

export default function SettingsPage() {
  const [active, setActive] = useState<NavId>('profile');

  const groups = [...new Set(NAV.map((n) => n.group))];

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Settings nav */}
      <aside className="w-52 shrink-0 border-r border-surface-3 p-4">
        {groups.map((group) => (
          <div key={group} className="mb-4">
            <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-widest text-gray-600">{group}</p>
            {NAV.filter((n) => n.group === group).map((n) => (
              <button
                key={n.id}
                onClick={() => setActive(n.id)}
                className={clsx(
                  'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors',
                  active === n.id ? 'bg-surface-3 text-white' : 'text-gray-400 hover:bg-surface-2 hover:text-white',
                )}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </button>
            ))}
          </div>
        ))}
        {isLocalDev && (
          <div className="mt-2 border-t border-surface-3 pt-2">
            <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-widest text-gray-600">DEVELOPER</p>
            <Link
              to="/team/agents"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-400 transition-colors hover:bg-surface-2 hover:text-white"
            >
              <Users className="h-4 w-4" />
              Cursor AI team
            </Link>
          </div>
        )}
        <div className="mt-2 border-t border-surface-3 pt-2">
          <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-widest text-gray-600">DATA</p>
          <Link
            to="/privacy"
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-400 transition-colors hover:bg-surface-2 hover:text-white"
          >
            <FileText className="h-4 w-4" /> Privacy Policy
          </Link>
          <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-400 hover:bg-surface-2 hover:text-white">
            <Trash2 className="h-4 w-4" /> Delete account
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {active === 'profile'       && <ProfileSection />}
        {active === 'security'      && <SecuritySection />}
        {active === 'billing'       && <BillingSection />}
        {active === 'ai'            && <AIPreferencesSection />}
        {active === 'appearance'    && <AppearanceSection />}
        {active === 'notifications' && <NotificationsSection />}
      </div>
    </div>
  );
}

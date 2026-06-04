import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { useGetProjectsQuery } from '../projectsApi';
import { ProjectFormModal } from './ProjectFormModal';
import { Badge } from '../../../components/ui/Badge';

const SIDEBAR_LIMIT = 5;

export function ProjectSidebarSection() {
  const location = useLocation();
  const { data: projects = [] } = useGetProjectsQuery({ sort: 'last_activity' });
  const [modalOpen, setModalOpen] = useState(false);

  const visible = projects.slice(0, SIDEBAR_LIMIT);
  const hasMore = projects.length > SIDEBAR_LIMIT;

  return (
    <>
      <div className="mt-1 space-y-0.5 pl-1">
            {visible.length === 0 ? (
              <p className="px-2 py-1 text-xs text-gray-500">No projects yet</p>
            ) : (
              visible.map((p) => {
                const id   = p.id ?? p._id;
                const path = `/projects/${id}`;
                const active = location.pathname === path || location.pathname.startsWith(`${path}/`);
                return (
                  <Link
                    key={id}
                    to={path}
                    className={clsx(
                      'flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors',
                      active
                        ? 'bg-surface-2 text-white'
                        : 'text-gray-400 hover:bg-surface-2 hover:text-white',
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0">{p.emoji ?? '📁'}</span>
                      <span className="truncate">{p.name}</span>
                    </span>
                    {(p.chat_count ?? 0) > 0 && (
                      <Badge className="ml-1 shrink-0 bg-surface-3 text-gray-500">{p.chat_count}</Badge>
                    )}
                  </Link>
                );
              })
            )}

            {hasMore && (
              <Link
                to="/projects"
                className="block rounded-lg px-2 py-1 text-xs text-gray-500 hover:text-gray-300"
              >
                See all ({projects.length})
              </Link>
            )}

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-gray-500 hover:bg-surface-2 hover:text-gray-300"
            >
              <Plus className="h-3 w-3" />
              New project
            </button>
      </div>

      <ProjectFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

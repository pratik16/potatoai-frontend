import { useState } from 'react';
import { useGetIpsQuery, useAddIpMutation, useUpdateIpMutation, useDeleteIpMutation } from '../adminApi';
import { PageHeader, Toggle, AdminTable, Skeleton, formatDate, formatRelativeTime } from '../components/AdminShared';
import type { IpEntry } from '../../../types/admin.types';

function InlineLabel({ entry, onSave }: { entry: IpEntry; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(entry.label ?? '');

  if (editing) {
    return (
      <div className="flex gap-1">
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { onSave(val); setEditing(false); } if (e.key === 'Escape') setEditing(false); }}
          className="rounded border border-gray-700 bg-gray-900 px-2 py-0.5 text-xs text-white focus:outline-none"
        />
        <button onClick={() => { onSave(val); setEditing(false); }} className="text-xs text-green-400">✓</button>
      </div>
    );
  }
  return (
    <button onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-white">
      {entry.label ?? <span className="italic text-gray-600">add label</span>}
    </button>
  );
}

export default function AdminIpsPage() {
  const { data, isLoading }    = useGetIpsQuery();
  const [addIp, { isLoading: isAdding }] = useAddIpMutation();
  const [updateIp]             = useUpdateIpMutation();
  const [deleteIp]             = useDeleteIpMutation();
  const [newIp, setNewIp]      = useState({ ip_address: '', label: '' });
  const [addError, setAddError] = useState('');

  const handleAdd = async () => {
    setAddError('');
    try {
      await addIp(newIp).unwrap();
      setNewIp({ ip_address: '', label: '' });
    } catch (e: unknown) {
      setAddError((e as { data?: { message?: string } }).data?.message ?? 'Failed to add IP');
    }
  };

  const handleToggle = (entry: IpEntry) => {
    if (entry.is_current) return;
    updateIp({ id: entry.id, patch: { is_active: !entry.is_active } });
  };

  const handleDelete = (entry: IpEntry) => {
    if (entry.is_current) return;
    if (window.confirm(`Remove ${entry.ip_address}?`)) deleteIp(entry.id);
  };

  return (
    <div>
      <PageHeader title="IP Whitelist" />

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">IP Address</label>
          <input
            placeholder="192.168.1.1"
            value={newIp.ip_address}
            onChange={(e) => setNewIp((f) => ({ ...f, ip_address: e.target.value }))}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Label</label>
          <input
            placeholder="e.g. Home VPN"
            value={newIp.label}
            onChange={(e) => setNewIp((f) => ({ ...f, label: e.target.value }))}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={isAdding || !newIp.ip_address}
          className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600 disabled:opacity-50"
        >
          {isAdding ? 'Adding…' : 'Add IP'}
        </button>
        {addError && <p className="text-sm text-red-400">{addError}</p>}
      </div>

      {data?.current_ip && (
        <p className="mb-3 text-xs text-gray-600">Your current IP: <span className="text-gray-400">{data.current_ip}</span></p>
      )}

      <AdminTable
        headers={['IP Address', 'Label', 'Status', 'Last Accessed', 'Added', 'Actions']}
        empty={!isLoading && !data?.data.length}
      >
        {isLoading ? (
          <Skeleton rows={3} cols={6} />
        ) : (
          data?.data.map((entry) => (
            <tr key={entry.id} className={entry.is_current ? 'bg-purple-950/20' : 'hover:bg-gray-900/50'}>
              <td className="px-4 py-3 font-mono text-sm text-white">
                {entry.ip_address}
                {entry.is_current && (
                  <span className="ml-2 rounded bg-purple-800 px-1.5 py-0.5 text-xs text-purple-200">You</span>
                )}
              </td>
              <td className="px-4 py-3">
                <InlineLabel entry={entry} onSave={(label) => updateIp({ id: entry.id, patch: { label } })} />
              </td>
              <td className="px-4 py-3">
                <Toggle
                  checked={entry.is_active}
                  disabled={entry.is_current}
                  onChange={() => handleToggle(entry)}
                />
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {entry.last_accessed_at ? formatRelativeTime(entry.last_accessed_at) : 'Never'}
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">{formatDate(entry.created_at)}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleDelete(entry)}
                  disabled={entry.is_current}
                  title={entry.is_current ? 'Cannot remove your own IP' : undefined}
                  className="text-xs text-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetAdminUserQuery, useAdjustCreditsMutation, useSuspendUserMutation } from '../adminApi';
import { PageHeader, PlanBadge, formatDate } from '../components/AdminShared';

export default function AdminUserDetailPage() {
  const { id }              = useParams<{ id: string }>();
  const { data: user, isLoading } = useGetAdminUserQuery(Number(id));
  const [adjustCredits, { isLoading: isAdjusting }] = useAdjustCreditsMutation();
  const [suspendUser,   { isLoading: isSuspending }] = useSuspendUserMutation();

  const [creditForm, setCreditForm] = useState({ amount: 0, type: 'bonus', description: '' });
  const [creditMsg, setCreditMsg]   = useState('');
  const [creditErr, setCreditErr]   = useState('');

  const handleAdjust = async () => {
    setCreditMsg(''); setCreditErr('');
    try {
      await adjustCredits({ userId: Number(id), data: creditForm }).unwrap();
      setCreditMsg('Credits adjusted successfully');
      setCreditForm({ amount: 0, type: 'bonus', description: '' });
    } catch {
      setCreditErr('Failed to adjust credits');
    }
  };

  const handleSuspend = async () => {
    if (!user) return;
    const action = user.is_suspended ? 'unsuspend' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    await suspendUser({ userId: Number(id), suspended: !user.is_suspended });
  };

  if (isLoading) {
    return (
      <div>
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-gray-900" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-900" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return <p className="text-gray-500">User not found.</p>;

  return (
    <div>
      <PageHeader title={user.name} backTo="/admin/users" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile */}
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-5">
          <h2 className="mb-4 font-semibold text-white">Profile</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Email"   value={user.email} />
            <Row label="Plan"    value={<PlanBadge plan={user.plan} />} />
            <Row label="Status"  value={
              <span className={user.is_suspended ? 'text-red-400' : 'text-green-400'}>
                {user.is_suspended ? 'Suspended' : 'Active'}
              </span>
            } />
            <Row label="Joined"  value={formatDate(user.created_at)} />
            <Row label="Balance" value={`${(user.credit_balance ?? 0).toFixed(2)} credits`} />
          </dl>

          <button
            onClick={handleSuspend}
            disabled={isSuspending}
            className={`mt-5 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
              user.is_suspended
                ? 'bg-green-800 text-green-200 hover:bg-green-700'
                : 'bg-red-900 text-red-200 hover:bg-red-800'
            }`}
          >
            {isSuspending ? '…' : user.is_suspended ? 'Unsuspend User' : 'Suspend User'}
          </button>
        </div>

        {/* Credit Adjustment */}
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-5">
          <h2 className="mb-4 font-semibold text-white">Adjust Credits</h2>

          <div className="mb-3">
            <label className="mb-1 block text-xs text-gray-500">Amount (negative to deduct)</label>
            <input
              type="number"
              step="0.01"
              value={creditForm.amount}
              onChange={(e) => setCreditForm((f) => ({ ...f, amount: +e.target.value }))}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-xs text-gray-500">Type</label>
            <select
              value={creditForm.type}
              onChange={(e) => setCreditForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="bonus">Bonus</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-xs text-gray-500">Description (optional)</label>
            <input
              value={creditForm.description}
              onChange={(e) => setCreditForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          {creditMsg && <p className="mb-3 text-sm text-green-400">✓ {creditMsg}</p>}
          {creditErr && <p className="mb-3 text-sm text-red-400">{creditErr}</p>}

          <button
            onClick={handleAdjust}
            disabled={isAdjusting || creditForm.amount === 0}
            className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600 disabled:opacity-50"
          >
            {isAdjusting ? 'Adjusting…' : 'Apply Adjustment'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-200">{value}</dd>
    </div>
  );
}

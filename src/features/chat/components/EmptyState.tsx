import { Sparkles } from 'lucide-react';
import { useAppSelector } from '../../../app/hooks';

export function EmptyState() {
  const user = useAppSelector((s) => s.auth.user);
  const fullName = user?.full_name ?? user?.username ?? user?.name;
  const firstName = fullName?.trim().split(/\s+/)[0];

  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <h1 className="flex items-center gap-3 font-serif text-4xl text-white">
        <Sparkles className="h-8 w-8 text-potato-500" />
        {firstName ? `What's cooking, ${firstName}?` : "What's cooking?"}
      </h1>
    </div>
  );
}

import { useGetCreditsQuery } from '../features/settings/settingsApi';
import { useAppSelector } from '../app/hooks';

export function useCredits() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { data } = useGetCreditsQuery(undefined, { skip: !isAuthenticated });

  return {
    balance: data?.balance ?? 0,
    plan:    data?.plan ?? 'free',
  };
}

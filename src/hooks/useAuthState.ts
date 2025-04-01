
import { useSession } from './useSession';
import { useSignOut } from './useSignOut';

/**
 * Hook to manage authentication state
 */
export const useAuthState = () => {
  const { session, user, loading, setLoading } = useSession();
  const { signOut } = useSignOut(setLoading, user);

  return {
    session,
    user,
    signOut,
    loading
  };
};

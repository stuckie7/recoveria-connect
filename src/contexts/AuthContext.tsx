
import React, { createContext, useContext, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useAuthState } from '@/hooks/useAuthState';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { performWithRetry } from '@/utils/retryUtil';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authState = useAuthState();

  // Add token refresh logic
  useEffect(() => {
    // Check token validity periodically
    const checkTokenInterval = setInterval(async () => {
      try {
        // Use retry mechanism for getting the session
        const session = await performWithRetry(async () => {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }
          
          return data.session;
        });
        
        if (session) {
          // If session exists but is about to expire (e.g., within 5 minutes)
          const expiresAt = new Date((session.expires_at || 0) * 1000);
          const now = new Date();
          const fiveMinutes = 5 * 60 * 1000;
          
          if (expiresAt.getTime() - now.getTime() < fiveMinutes) {
            console.log('Session about to expire, refreshing...');
            
            // Refresh the session with retry
            const refreshResult = await performWithRetry(async () => {
              const { data, error } = await supabase.auth.refreshSession();
              
              if (error) {
                throw error;
              }
              
              return data;
            });
            
            if (refreshResult) {
              console.log('Session successfully refreshed');
            }
          }
        }
      } catch (error) {
        console.error('Error in token refresh cycle:', error);
        toast({
          title: "Session Error",
          description: "There was a problem with your session. Please sign in again.",
          variant: "destructive",
        });
      }
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(checkTokenInterval);
    };
  }, []);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

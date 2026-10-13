import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { createElement } from 'react';
import type { User } from 'firebase/auth';
import { clearProviderSecrets } from '../services/secureSettings';
import { clearCurrentAnalysis, invalidateIdentity } from '../services/currentAnalysis';
import { changed } from './useSettings';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle as authSignInWithGoogle,
  signInWithApple as authSignInWithApple,
  signOut as authSignOut,
  resetPassword as authResetPassword,
  deleteAccount as authDeleteAccount,
  onAuthStateChanged,
} from '../services/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let previousUid: string | null = null;
    const unsubscribe = onAuthStateChanged((firebaseUser) => {
      if (previousUid !== (firebaseUser?.uid ?? null)) {
        invalidateIdentity();
        void clearCurrentAnalysis();
        if (previousUid) void clearProviderSecrets().then(changed);
      }
      previousUid = firebaseUser?.uid ?? null;
      setUser(firebaseUser);
      setLoading(false);
    });
    // If Firebase isn't configured, stop loading
    if (!unsubscribe) setLoading(false);
    return () => unsubscribe?.();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    await signUpWithEmail(email, password);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmail(email, password);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await authSignInWithGoogle();
  }, []);

  const signInWithApple = useCallback(async()=>{await authSignInWithApple();},[]);

  const signOut = useCallback(async () => {
    await authSignOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await authResetPassword(email);
  }, []);

  const deleteAccount = useCallback(async (password?: string) => {
    await authDeleteAccount(password);
  }, []);

  return createElement(
    AuthContext.Provider,
    { value: { user, loading, signUp, signIn, signInWithGoogle, signInWithApple, signOut, resetPassword, deleteAccount } },
    children
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

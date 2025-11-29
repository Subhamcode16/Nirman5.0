import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
    session: Session | null;
    user: User | null;
    loading: boolean;
    showLoginAnimation: boolean;
    showLogoutAnimation: boolean;
    isNewUser: boolean;
    setSession: (session: Session | null) => void;
    setUser: (user: User | null) => void;
    signOut: () => Promise<void>;
    triggerLoginAnimation: (isNewUser?: boolean) => void;
    triggerLogoutAnimation: () => void;
    hideLoginAnimation: () => void;
    hideLogoutAnimation: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    session: null,
    user: null,
    loading: true,
    showLoginAnimation: false,
    showLogoutAnimation: false,
    isNewUser: false,
    setSession: (session) => set({ session, user: session?.user ?? null, loading: false }),
    setUser: (user) => set({ user }),
    signOut: async () => {
        set({ showLogoutAnimation: true });
        await supabase.auth.signOut();
        set({ session: null, user: null });
    },
    triggerLoginAnimation: (isNewUser = false) => set({ showLoginAnimation: true, isNewUser }),
    triggerLogoutAnimation: () => set({ showLogoutAnimation: true }),
    hideLoginAnimation: () => set({ showLoginAnimation: false }),
    hideLogoutAnimation: () => set({ showLogoutAnimation: false }),
}));

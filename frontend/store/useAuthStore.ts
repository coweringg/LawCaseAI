import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'lawyer' | 'client' | 'paralegal';
    plan: 'none' | 'basic' | 'professional' | 'elite' | 'enterprise';
    avatar?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setAuth: (user: User) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            setAuth: (user) => {
                set({ user, isAuthenticated: true });
            },
            logout: () => {
                set({ user: null, isAuthenticated: false });
            },
            updateUser: (updatedFields) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updatedFields } : null,
                })),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user }),
        }
    )
);

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { User } from '@/types/auth'

interface AuthStore {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    setUser: (user: User | null) => void
    setAuthenticated: (isAuthenticated: boolean) => void
    setLoading: (isLoading: boolean) => void
    reset: () => void
}

export const useAuthStore = create<AuthStore>()(
    devtools(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,
            setUser: (user) => set({ user }),
            setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
            setLoading: (isLoading) => set({ isLoading }),
            reset: () => set({ user: null, isAuthenticated: false, isLoading: false }),
        }),
        {
            name: 'auth-store',
        }
    )
)
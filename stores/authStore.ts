import { create } from 'zustand'
import { Session } from '@supabase/supabase-js'

interface User {
  id: string
  full_name: string
  username: string
  email: string
  role: string
  is_active: boolean
}

interface AuthState {
  session: Session | null
  user: User | null
  setSession: (session: Session | null) => void
  setUser: (user: User) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  clearAuth: () => set({ session: null, user: null }),
}))

export const getRoleRoute = (role: string): string => {
  const routes: Record<string, string> = {
    admin: '/(admin)',
    owner: '/(owner)',
    teknik_sipil: '/(teknik-sipil)',
    kepala_wh: '/(kepala-wh)',
    sopir: '/(sopir)',
    mandor: '/(mandor)',
    tukang: '/(tukang)',
  }
  return routes[role] ?? '/(auth)/login'
}
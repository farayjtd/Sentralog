import { useEffect, useState, useRef } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { View, ActivityIndicator, AppState } from 'react-native'

const INACTIVE_TIMEOUT = 20 * 60 * 1000 // 20 menit

export default function RootLayout() {
  const { session, setSession, setUser, clearAuth } = useAuthStore()
  const router = useRouter()
  const segments = useSegments()
  const [loading, setLoading] = useState(true)
  const inactiveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetTimer = () => {
    if (inactiveTimer.current) clearTimeout(inactiveTimer.current)
    if (session) {
      inactiveTimer.current = setTimeout(async () => {
        await supabase.auth.signOut()
        clearAuth()
        router.replace('/(auth)/login')
      }, INACTIVE_TIMEOUT)
    }
  }

  useEffect(() => {
    // Cek session saat app buka
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (data) setUser(data)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (data) setUser(data)
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Auto logout saat tidak aktif
  useEffect(() => {
    resetTimer()
    return () => {
      if (inactiveTimer.current) clearTimeout(inactiveTimer.current)
    }
  }, [session])

  // Reset timer saat app kembali ke foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') resetTimer()
      if (state === 'background') {
        if (inactiveTimer.current) clearTimeout(inactiveTimer.current)
      }
    })
    return () => subscription.remove()
  }, [session])

  useEffect(() => {
    if (loading) return
    const inAuthGroup = segments[0] === '(auth)'
    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (session && inAuthGroup) {
      import('../stores/authStore').then(({ getRoleRoute, useAuthStore }) => {
        const user = useAuthStore.getState().user
        if (user) router.replace(getRoleRoute(user.role) as any)
      })
    }
  }, [session, segments, loading])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' }}>
        <ActivityIndicator size="large" color="#1a1a2e" />
      </View>
    )
  }

  return <Slot />
}
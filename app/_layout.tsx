import { useEffect } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

export default function RootLayout() {
  const { session, setSession, setUser } = useAuthStore()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)

      if (session) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (data) setUser(data)
      }
    })
  }, [])

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)'

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login')
    }
  }, [session, segments])

  return <Slot />
}
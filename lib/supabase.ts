import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const supabaseUrl = 'https://epynoopvlibfrjunkula.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVweW5vb3B2bGliZnJqdW5rdWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNjgxNjUsImV4cCI6MjA5NTk0NDE2NX0.sFVqIrJZaUD4OryWHhWrsZdWJTWV9YJLnfMXOgSInqk'

const storage = Platform.OS === 'web'
  ? {
      getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key: string, value: string) => {
        localStorage.setItem(key, value)
        return Promise.resolve()
      },
      removeItem: (key: string) => {
        localStorage.removeItem(key)
        return Promise.resolve()
      },
    }
  : {
      getItem: (key: string) => SecureStore.getItemAsync(key),
      setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    }

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export const manageUser = async (action: string, payload: any) => {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(
    'https://epynoopvlibfrjunkula.supabase.co/functions/v1/manage-user',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ action, payload }),
    }
  )

  return response.json()
}
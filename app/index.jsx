import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './screens/Auth'
import Boards from './screens/Boards'
import { View } from 'react-native'
import { Session } from '@supabase/supabase-js'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <View>
      {session && session.user ? <Boards key={session.user.id} session={session} /> : <Auth />}
    </View>
  )
}

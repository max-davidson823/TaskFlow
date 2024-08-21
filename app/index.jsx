import { useState, useEffect } from 'react';
import { supabase } from './(auth)/lib/supabase';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession()
      .then((response) => {
        if (response && response.data) {
          setSession(response.data.session);
        }
      })
      .catch(error => {
        console.error('Error fetching session:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (session) {
      router.replace({ pathname: '/boards', params: { session: JSON.stringify(session) } });
    } else if (!loading) {
      // If there's no session and loading is complete, navigate to the sign-in page
      router.replace({ pathname: '/(auth)/sign_in' });
    }
  }, [session, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <View />;
}

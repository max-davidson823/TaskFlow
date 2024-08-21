import { useState, useEffect } from 'react';
import { supabase } from './(auth)/lib/supabase';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
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
    
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-pblack">TaskFlow</Text>
      <StatusBar style="auto" />
      <TouchableOpacity onPress={() => router.push({ pathname: '/boards', params: { session: JSON.stringify(session) } })}>
        <Text style={{ color: 'blue' }}>Go to Boards</Text>
      </TouchableOpacity>
    </View>
  );
}



// import { useState, useEffect } from 'react';
// import { supabase } from './(auth)/lib/supabase'; // Updated path to the new location
// import SignIn from './(auth)/sign_in'; // Updated path for SignIn component
// import Boards from './(tabs)/boards'; // Updated path for Boards component
// import { View } from 'react-native';
// import { Session } from '@supabase/supabase-js';

// export default function App() {
//   const [session, setSession] = useState<Session | null>(null);

//   useEffect(() => {
//     supabase.auth.getSession()
//       .then((response) => {
//         console.log('Session response:', response);
//         if (response && response.data) {
//           setSession(response.data.session);
//         }
//       })
//       .catch(error => {
//         console.error('Error fetching session:', error);
//       });
//   }, []);
    
//   return (
//     <View>
//       {session && session.user ? <Boards key={session.user.id} session={session} /> : <SignIn />}
//     </View>
//   );
// }

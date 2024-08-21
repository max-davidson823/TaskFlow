import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet, Text } from 'react-native';
import { supabase } from '../(auth)/lib/supabase';
import { useRouter } from 'expo-router';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    setLoading(true);
    try {
      let data, error;

      if (isSignUp) {
        // Handle sign up
        ({ data, error } = await supabase.auth.signUp({ email, password }));
        if (error) throw error;
        Alert.alert('Sign-up successful!', 'Please check your email for confirmation.');
      } else {
        // Handle sign in
        ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
        if (error) throw error;

        const session = data?.session;
        if (session) {
          // Navigate to Boards screen
          router.replace({ pathname: '/boards', params: { session: JSON.stringify(session) } });
        } else {
          Alert.alert('Sign-in failed', 'No session returned');
        }
      }
    } catch (error) {
      Alert.alert(isSignUp ? 'Sign-up failed' : 'Sign-in failed', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity onPress={handleAuth} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? (isSignUp ? 'Signing Up...' : 'Signing In...') : (isSignUp ? 'Sign Up' : 'Sign In')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} disabled={loading}>
        <Text style={styles.toggleText}>
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  buttonText: {
    textAlign: 'center',
    color: 'blue',
  },
  toggleText: {
    marginTop: 20,
    textAlign: 'center',
    color: 'gray',
  },
});

import { View, Text, Button } from 'react-native';
import React from 'react';
import { supabase } from '../(auth)/lib/supabase';
import { useRouter } from 'expo-router';

const Profile = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      router.replace('/(auth)/sign_in'); // Navigate to the sign-in screen after logging out
    }
  };

  return (
    <View>
      <Text>Profile</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
};

export default Profile;

import React from 'react';
import { View, Image } from 'react-native';
import { Tabs } from 'expo-router';

// Import the image
import homeIcon from '../../assets/icons/home.png';

const TabIcon = ({ icon, color, focused }) => {
  return (
    <View>
      <Image
        source={icon}
        style={{ 
          width: 24, 
          height: 24, 
          ...(focused ? { tintColor: color } : {}) // Apply tintColor only when focused
        }}
        resizeMode="contain"
      />
    </View>
  );
}

const TabsLayout = () => {
  return (
    <>
      <Tabs>
        <Tabs.Screen
          name="boards"
          options={{
            title: 'Boards',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={homeIcon} 
                color={color} 
                name="boards" 
                focused={focused} 
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

export default TabsLayout;

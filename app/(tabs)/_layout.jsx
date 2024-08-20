import { View, Image, Text } from 'react-native';
import { Tabs, Redirect } from 'expo-router';

// Import the image
import homeIcon from '../../assets/icons/home.png';
import checkIcon from '../../assets/icons/check.png';
import calendarIcon from '../../assets/icons/calendar.png';
import profileIcon from '../../assets/icons/profile.png';

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="items-center justify-center gap-1">
      <Image
        source={icon}
        resizeMode="contain"
        style={{ tintColor: color }}
        className="w-6 h-6"
      />
      <Text
        className={`${focused ? 'font-semibold' : 'font-regular'} text-xs`}
        style={{ color: focused ? 'white' : color }}
      >
        {name}
      </Text>
    </View>
  );
}

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: null,
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#0D0D0D',
            boarderTopWidth: 1,
            height: 60,
          },
        }}
      >
        <Tabs.Screen
          name="boards"
          options={{
            title: 'Boards',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={homeIcon} 
                color={color} 
                name="Boards" 
                focused={focused} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="todo"
          options={{
            title: 'Todo',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={checkIcon} 
                color={color} 
                name="To-Do" 
                focused={focused} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={calendarIcon} 
                color={color} 
                name="Calendar" 
                focused={focused} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={profileIcon} 
                color={color} 
                name="Profile" 
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

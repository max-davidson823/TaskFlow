import { View, Text, Image } from 'react-native';
import { Tabs, Redirect } from 'expo-router';

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View>
      <Image
        source={icon}
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
        />
      </Tabs>
    </>
  );
}

export default TabsLayout;

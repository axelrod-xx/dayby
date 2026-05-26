import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuth } from '@/src/features/auth/AuthProvider';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const themeName = colorScheme === 'dark' ? 'dark' : 'light';
  const { status } = useAuth();
  const isSignedIn = status === 'signed-in';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[themeName].tint,
        tabBarInactiveTintColor: '#8E877E',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
        },
        tabBarStyle: isSignedIn
          ? {
              height: 86,
              borderTopWidth: 1,
              borderTopColor: '#E5E1DA',
              paddingBottom: 24,
              paddingTop: 8,
              backgroundColor: '#FFFEFB',
            }
          : { display: 'none' },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, false),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[themeName].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
        }}
      />
    </Tabs>
  );
}

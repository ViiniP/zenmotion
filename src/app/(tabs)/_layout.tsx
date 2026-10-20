import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts } from "../../constants/theme";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 64 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 6),
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          lineHeight: 18,
          fontFamily: fonts.bold,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="home-outline"
              size={25}
              color={color}
              accessible={false}
              aria-hidden
            />
          ),
        }}
      />
      <Tabs.Screen
        name="atividades"
        options={{
          title: "Atividades",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="radio-button-on-outline"
              size={26}
              color={color}
              accessible={false}
              aria-hidden
            />
          ),
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: "Histórico",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="time-outline"
              size={26}
              color={color}
              accessible={false}
              aria-hidden
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="person-outline"
              size={25}
              color={color}
              accessible={false}
              aria-hidden
            />
          ),
        }}
      />
    </Tabs>
  );
}

import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cores, fontes } from "../../constants/theme";

export default function TabsLayout() {
  const margensSeguras = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: cores.fundo,
        },
        headerTintColor: cores.texto,
        sceneStyle: {
          backgroundColor: cores.fundo,
        },
        tabBarStyle: {
          backgroundColor: cores.fundo,
          borderTopColor: cores.borda,
          height: 64 + margensSeguras.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(margensSeguras.bottom, 6),
        },
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSecundario,
        tabBarLabelStyle: {
          fontSize: 12,
          lineHeight: 18,
          fontFamily: fontes.negrito,
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

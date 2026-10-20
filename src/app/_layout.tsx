import Ionicons from "@expo/vector-icons/Ionicons";
import { Nunito_400Regular } from "@expo-google-fonts/nunito/400Regular";
import { Nunito_600SemiBold } from "@expo-google-fonts/nunito/600SemiBold";
import { Nunito_700Bold } from "@expo-google-fonts/nunito/700Bold";
import { Nunito_800ExtraBold } from "@expo-google-fonts/nunito/800ExtraBold";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppButton } from "../components/AppButton";
import { colors } from "../constants/theme";
import { ApiProvider } from "../providers/ApiProvider";
import { useZenStore } from "../stores/useZenStore";
import { useSessionStore } from "../stores/useSessionStore";

function RootContent() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    ...Ionicons.font,
  });
  const loadProfile = useZenStore((state) => state.loadProfile);
  const loadStatus = useZenStore((state) => state.loadStatus);
  const storageError = useZenStore((state) => state.storageError);
  const loadSessions = useSessionStore((state) => state.loadSessions);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  // As telas só montam depois da leitura, já com o perfil recuperado.
  if (loadStatus !== "ready" || (!fontsLoaded && !fontError)) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar style="light" />
        {loadStatus === "error" ? (
          <>
            <Text
              accessibilityRole="alert"
              style={styles.message}
            >
              {storageError}
            </Text>
            <AppButton
              title="Tentar novamente"
              onPress={loadProfile}
            />
          </>
        ) : (
          <>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
            <Text style={styles.message}>
              Preparando seu momento de calma...
            </Text>
          </>
        )}
      </View>
    );
  }

  return (
    <ApiProvider>
      <StatusBar style="light" />
      {/* A pilha permite abrir a sessão por cima das abas. */}
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="sessao/[atividade]"
          options={{
            title: "Sessão",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="resultado/[id]"
          options={{
            title: "Resultado",
            headerShown: false,
          }}
        />
      </Stack>
    </ApiProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    gap: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    color: colors.text,
    fontSize: 18,
    textAlign: "center",
    lineHeight: 26,
  },
});

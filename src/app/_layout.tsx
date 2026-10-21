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
import { cores } from "../constants/theme";
import { ApiProvider } from "../providers/ApiProvider";
import { useZenStore } from "../stores/useZenStore";
import { useSessionStore } from "../stores/useSessionStore";

function RootContent() {
  const [fontesCarregadas, erroFonte] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    ...Ionicons.font,
  });
  const carregarPerfil = useZenStore((estado) => estado.loadProfile);
  const estadoCarregamento = useZenStore((estado) => estado.loadStatus);
  const erroArmazenamento = useZenStore((estado) => estado.storageError);
  const carregarSessoes = useSessionStore((estado) => estado.loadSessions);

  useEffect(() => {
    void carregarPerfil();
  }, [carregarPerfil]);

  useEffect(() => {
    void carregarSessoes();
  }, [carregarSessoes]);

  // As telas só montam depois da leitura, já com o perfil recuperado.
  if (estadoCarregamento !== "ready" || (!fontesCarregadas && !erroFonte)) {
    return (
      <View style={estilos.telaCarregamento}>
        <StatusBar style="light" />
        {estadoCarregamento === "error" ? (
          <>
            <Text
              accessibilityRole="alert"
              style={estilos.mensagem}
            >
              {erroArmazenamento}
            </Text>
            <AppButton
              title="Tentar novamente"
              onPress={carregarPerfil}
            />
          </>
        ) : (
          <>
            <ActivityIndicator
              size="large"
              color={cores.primaria}
            />
            <Text style={estilos.mensagem}>
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
            backgroundColor: cores.fundo,
          },
          headerTintColor: cores.texto,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: cores.fundo,
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

const estilos = StyleSheet.create({
  telaCarregamento: {
    flex: 1,
    backgroundColor: cores.fundo,
    padding: 24,
    gap: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  mensagem: {
    color: cores.texto,
    fontSize: 18,
    textAlign: "center",
    lineHeight: 26,
  },
});

import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text } from "react-native";

import { AppButton } from "../../components/AppButton";
import { ZenSession } from "../../components/ZenSession";
import { Screen } from "../../components/Screen";
import { colors, fonts } from "../../constants/theme";

export default function SessionScreen() {
  // Os nomes correspondem aos parâmetros enviados em openSession.
  const { atividade, duracao } = useLocalSearchParams<{
    atividade: string;
    duracao?: string;
  }>();

  const isValidSession =
    atividade === "equilibrio-zen" &&
    (duracao === "30" || duracao === "45" || duracao === "60");

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/atividades");
    }
  }

  if (isValidSession) {
    return (
      <ZenSession
        key={`${atividade}-${duracao}`}
        duration={Number(duracao)}
        onExit={goBack}
        onSaved={(id) =>
          router.replace({
            pathname: "/resultado/[id]",
            params: {
              id,
            },
          })
        }
      />
    );
  }

  return (
    <Screen edges={["top", "left", "right", "bottom"]}>
      <Text style={styles.title}>Sessão indisponível</Text>
      <Text style={styles.description}>
        Escolha uma atividade e uma duração válidas para continuar.
      </Text>
      <AppButton
        title="Voltar"
        onPress={goBack}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 20,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontFamily: fonts.heading,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 18,
    lineHeight: 26,
    fontFamily: fonts.regular,
  },
});

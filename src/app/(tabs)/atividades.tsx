import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ActivityCard } from "../../components/ActivityCard";
import { OptionSelector } from "../../components/OptionSelector";
import { Screen } from "../../components/Screen";
import { durationOptions } from "../../constants/profile";
import { colors, fonts } from "../../constants/theme";
import { useZenStore } from "../../stores/useZenStore";

export default function ActivitiesScreen() {
  // O seletor acompanha a preferência salva no Perfil. O padrão inicial é 60 s.
  const defaultDuration = useZenStore(
    (state) => state.profile?.duration ?? "60",
  );
  const [duration, setDuration] = useState(defaultDuration);
  useFocusEffect(
    useCallback(() => {
      setDuration(defaultDuration);
    }, [defaultDuration]),
  );

  function openSession(duration: number) {
    // O nome da atividade e a duração são enviados para a próxima tela.
    router.push({
      pathname: "/sessao/[atividade]",
      params: {
        atividade: "equilibrio-zen",
        duracao: String(duration),
      },
    });
  }

  return (
    <Screen>
      <View style={styles.heading}>
        <Text style={styles.title}>Atividades</Text>
        <Text style={styles.description}>
          Uma pausa para encontrar seu equilíbrio.
        </Text>
      </View>
      <OptionSelector
        label="Duração da sessão"
        options={durationOptions}
        value={duration}
        onChange={setDuration}
        variant="segmented"
      />
      <ActivityCard
        large
        duration={Number(duration)}
        onPress={() => openSession(Number(duration))}
      />
      <View style={styles.instructions}>
        <Text style={styles.sectionTitle}>Como praticar</Text>
        <View style={styles.step}>
          <Ionicons
            name="phone-portrait-outline"
            color={colors.purple}
            size={23}
            accessible={false}
            aria-hidden
          />
          <Text style={styles.stepText}>
            Segure o celular deitado, com a tela para cima.
          </Text>
        </View>
        <View style={styles.step}>
          <Ionicons
            name="compass-outline"
            color={colors.primary}
            size={23}
            accessible={false}
            aria-hidden
          />
          <Text style={styles.stepText}>
            Ajuste a inclinação e mantenha a esfera no centro.
          </Text>
        </View>
        <View style={styles.step}>
          <Ionicons
            name="leaf-outline"
            color={colors.success}
            size={23}
            accessible={false}
            aria-hidden
          />
          <Text style={styles.stepText}>
            Movimente-se devagar. Você pode pausar quando quiser.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: 6,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontFamily: fonts.heading,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 16,
    fontFamily: fonts.regular,
    lineHeight: 24,
  },
  instructions: {
    padding: 22,
    borderRadius: 24,
    backgroundColor: colors.surface,
    gap: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  step: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  stepText: {
    flex: 1,
    color: "#C9C3DE",
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
});

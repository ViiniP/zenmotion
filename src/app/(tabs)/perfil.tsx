import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "../../components/AppButton";
import { FormField } from "../../components/FormField";
import { OptionSelector } from "../../components/OptionSelector";
import { screenContent } from "../../components/Screen";
import { durationOptions, goalOptions } from "../../constants/profile";
import { colors, fonts } from "../../constants/theme";
import { useZenStore } from "../../stores/useZenStore";
import { useSessionStore } from "../../stores/useSessionStore";
import { sessionStats } from "../../utils/sessionStats";
import type { ProfileForm } from "../../types/profile";
import { validateProfile } from "../../utils/validators";

export default function ProfileScreen() {
  const savedProfile = useZenStore((state) => state.profile);
  const saveProfile = useZenStore((state) => state.saveProfile);
  const isSaving = useZenStore((state) => state.isSaving);
  const storageError = useZenStore((state) => state.storageError);
  const sessions = useSessionStore((state) => state.sessions);
  const points = sessionStats(sessions).points;

  // O formulário é um rascunho local. A store só muda quando ele é salvo.
  const [form, setForm] = useState<ProfileForm>(() =>
    savedProfile
      ? { ...savedProfile }
      : { name: "", email: "", goal: "", duration: "60" },
  );
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    goal: false,
    duration: false,
  });
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Recalcular as regras a cada alteração mantém o feedback atualizado.
  const errors = validateProfile(form);

  function updateField(field: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setTouched((current) => ({ ...current, [field]: true }));
    setShowConfirmation(false);
  }

  function markTouched(field: keyof ProfileForm) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function handleSave() {
    setTouched({ name: true, email: true, goal: true, duration: true });
    setShowConfirmation(false);

    // Dados inválidos não são confirmados.
    if (Object.keys(errors).length > 0) {
      return;
    }

    const profile = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
    };

    const didSave = await saveProfile(profile);
    if (didSave) {
      setForm(profile);
      setShowConfirmation(true);
      Keyboard.dismiss();
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.container}
        >
          <Text style={styles.title}>Perfil</Text>
          <View style={styles.identity}>
            <ImageBackground source={require("../../../assets/images/zen-landscape.png")} style={styles.avatar} imageStyle={styles.avatarImage}>
              <Text style={styles.initials}>{savedProfile?.name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("") || "Z"}</Text>
            </ImageBackground>
            <View style={styles.identityCopy}>
              <Text style={styles.name}>{savedProfile?.name ?? "Seu momento de calma"}</Text>
              <Text style={styles.description}>{points} pontos</Text>
            </View>
          </View>
          <Text style={styles.sectionLabel}>SUAS PREFERÊNCIAS</Text>
          <View style={styles.formCard}>

            <FormField
              label="Nome"
              placeholder="Seu nome"
              value={form.name}
              editable={!isSaving}
              onChangeText={(value) => updateField("name", value)}
              onBlur={() => markTouched("name")}
              autoCapitalize="words"
              autoComplete="name"
              error={touched.name ? errors.name : undefined}
            />
            <FormField
              label="E-mail"
              placeholder="voce@exemplo.com"
              value={form.email}
              editable={!isSaving}
              onChangeText={(value) => updateField("email", value)}
              onBlur={() => markTouched("email")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              error={touched.email ? errors.email : undefined}
            />
            <OptionSelector
              label="Objetivo"
              options={goalOptions}
              value={form.goal}
              disabled={isSaving}
              onChange={(value) => updateField("goal", value)}
              error={touched.goal ? errors.goal : undefined}
            />
            <OptionSelector
              label="Duração padrão"
              variant="segmented"
              options={durationOptions}
              value={form.duration}
              disabled={isSaving}
              onChange={(value) => updateField("duration", value)}
              error={touched.duration ? errors.duration : undefined}
            />
          </View>

          {storageError && (
            <Text accessibilityRole="alert" style={styles.error}>
              {storageError}
            </Text>
          )}
          <AppButton
            title={isSaving ? "Salvando..." : "Salvar"}
            onPress={handleSave}
            disabled={isSaving}
          />
          <Text style={styles.note}>
            Seu perfil e suas preferências ficam salvos neste aparelho, mesmo sem
            internet.
          </Text>

          {showConfirmation && savedProfile && (
            <View style={styles.confirmation}>
              <Text accessibilityRole="alert" style={styles.success}>
                Perfil salvo no aparelho.
              </Text>
              <Text style={styles.summary}>{savedProfile.name}</Text>
              <Text style={styles.summary}>{savedProfile.email}</Text>
              <Text style={styles.summary}>
                {
                  goalOptions.find((option) => option.value === savedProfile.goal)
                    ?.label
                }
                {" · "}
                {savedProfile.duration} segundos
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { ...screenContent, gap: 18 },
  title: { color: colors.text, fontSize: 34, fontFamily: fonts.heading },
  description: { color: colors.textSecondary, fontSize: 16, lineHeight: 24, fontFamily: fonts.regular },
  note: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, fontFamily: fonts.regular, textAlign: "center" },
  error: { color: colors.error, fontSize: 14, lineHeight: 20, fontFamily: fonts.regular },
  identity: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 4 },
  identityCopy: { flex: 1, gap: 4 },
  name: { color: colors.text, fontFamily: fonts.heading, fontSize: 23 },
  avatar: { width: 70, height: 70, alignItems: "center", justifyContent: "center" },
  avatarImage: { borderRadius: 25 },
  initials: { fontFamily: fonts.heading, fontSize: 26, color: colors.text },
  sectionLabel: { color: colors.textSecondary, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.2 },
  formCard: { gap: 18, padding: 18, backgroundColor: colors.surface, borderRadius: 24 },
  confirmation: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  success: { color: colors.success, fontSize: 16, fontFamily: fonts.bold },
  summary: { color: colors.text, fontSize: 16, lineHeight: 24, fontFamily: fonts.regular },
});

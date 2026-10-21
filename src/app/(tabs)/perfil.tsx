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
import { conteudoTela } from "../../components/Screen";
import { durationOptions, goalOptions } from "../../constants/profile";
import { cores, fontes } from "../../constants/theme";
import { useZenStore } from "../../stores/useZenStore";
import { useSessionStore } from "../../stores/useSessionStore";
import { sessionStats } from "../../utils/sessionStats";
import type { ProfileForm } from "../../types/profile";
import { validateProfile } from "../../utils/validators";

export default function ProfileScreen() {
  const perfilSalvo = useZenStore((estado) => estado.profile);
  const salvarPerfil = useZenStore((estado) => estado.saveProfile);
  const salvando = useZenStore((estado) => estado.isSaving);
  const erroArmazenamento = useZenStore((estado) => estado.storageError);
  const sessoes = useSessionStore((estado) => estado.sessions);
  const pontos = sessionStats(sessoes).points;

  // O formulário é um rascunho local. A store só muda quando ele é salvo.
  const [formulario, definirFormulario] = useState<ProfileForm>(() =>
    perfilSalvo
      ? {
          ...perfilSalvo,
        }
      : {
          name: "",
          email: "",
          goal: "",
          duration: "60",
        },
  );
  const [camposVisitados, definirCamposVisitados] = useState({
    name: false,
    email: false,
    goal: false,
    duration: false,
  });
  const [mostrarConfirmacao, definirMostrarConfirmacao] = useState(false);

  // Recalcular as regras a cada alteração mantém o feedback atualizado.
  const erros = validateProfile(formulario);

  function atualizarCampo(campo: keyof ProfileForm, valor: string) {
    definirFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }));
    definirCamposVisitados((atual) => ({
      ...atual,
      [campo]: true,
    }));
    definirMostrarConfirmacao(false);
  }

  function marcarCampoVisitado(campo: keyof ProfileForm) {
    definirCamposVisitados((atual) => ({
      ...atual,
      [campo]: true,
    }));
  }

  async function confirmarPerfil() {
    definirCamposVisitados({
      name: true,
      email: true,
      goal: true,
      duration: true,
    });
    definirMostrarConfirmacao(false);

    // Dados inválidos não são confirmados.
    if (Object.keys(erros).length > 0) {
      return;
    }

    const perfil = {
      ...formulario,
      name: formulario.name.trim(),
      email: formulario.email.trim(),
    };

    const salvou = await salvarPerfil(perfil);
    if (salvou) {
      definirFormulario(perfil);
      definirMostrarConfirmacao(true);
      Keyboard.dismiss();
    }
  }

  return (
    <SafeAreaView
      style={estilos.tela}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={estilos.tela}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={estilos.conteiner}
        >
          <Text style={estilos.titulo}>Perfil</Text>
          <View style={estilos.identificacao}>
            <ImageBackground
              source={require("../../../assets/images/zen-landscape.png")}
              style={estilos.avatar}
              imageStyle={estilos.imagemAvatar}
            >
              <Text style={estilos.iniciais}>
                {perfilSalvo?.name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((parte) => parte[0])
                  .join("") || "Z"}
              </Text>
            </ImageBackground>
            <View style={estilos.textosIdentificacao}>
              <Text style={estilos.nome}>
                {perfilSalvo?.name ?? "Seu momento de calma"}
              </Text>
              <Text style={estilos.descricao}>{pontos} pontos</Text>
            </View>
          </View>
          <Text style={estilos.rotuloSecao}>SUAS PREFERÊNCIAS</Text>
          <View style={estilos.cartaoFormulario}>
            <FormField
              label="Nome"
              placeholder="Seu nome"
              value={formulario.name}
              editable={!salvando}
              onChangeText={(valor) => atualizarCampo("name", valor)}
              onBlur={() => marcarCampoVisitado("name")}
              autoCapitalize="words"
              autoComplete="name"
              error={camposVisitados.name ? erros.name : undefined}
            />
            <FormField
              label="E-mail"
              placeholder="voce@exemplo.com"
              value={formulario.email}
              editable={!salvando}
              onChangeText={(valor) => atualizarCampo("email", valor)}
              onBlur={() => marcarCampoVisitado("email")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              error={camposVisitados.email ? erros.email : undefined}
            />
            <OptionSelector
              label="Objetivo"
              options={goalOptions}
              value={formulario.goal}
              disabled={salvando}
              onChange={(valor) => atualizarCampo("goal", valor)}
              error={camposVisitados.goal ? erros.goal : undefined}
            />
            <OptionSelector
              label="Duração padrão"
              variant="segmented"
              options={durationOptions}
              value={formulario.duration}
              disabled={salvando}
              onChange={(valor) => atualizarCampo("duration", valor)}
              error={camposVisitados.duration ? erros.duration : undefined}
            />
          </View>

          {erroArmazenamento && (
            <Text
              accessibilityRole="alert"
              style={estilos.erro}
            >
              {erroArmazenamento}
            </Text>
          )}
          <AppButton
            title={salvando ? "Salvando..." : "Salvar"}
            onPress={confirmarPerfil}
            disabled={salvando}
          />
          <Text style={estilos.observacao}>
            Seu perfil e suas preferências ficam salvos neste aparelho, mesmo
            sem internet.
          </Text>

          {mostrarConfirmacao && perfilSalvo && (
            <View style={estilos.confirmacao}>
              <Text
                accessibilityRole="alert"
                style={estilos.sucesso}
              >
                Perfil salvo no aparelho.
              </Text>
              <Text style={estilos.resumo}>{perfilSalvo.name}</Text>
              <Text style={estilos.resumo}>{perfilSalvo.email}</Text>
              <Text style={estilos.resumo}>
                {
                  goalOptions.find(
                    (opcao) => opcao.value === perfilSalvo.goal,
                  )?.label
                }
                {" · "}
                {perfilSalvo.duration} segundos
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  conteiner: {
    ...conteudoTela,
    gap: 18,
  },
  titulo: {
    color: cores.texto,
    fontSize: 34,
    fontFamily: fontes.titulo,
  },
  descricao: {
    color: cores.textoSecundario,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fontes.regular,
  },
  observacao: {
    color: cores.textoSecundario,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fontes.regular,
    textAlign: "center",
  },
  erro: {
    color: cores.erro,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontes.regular,
  },
  identificacao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 4,
  },
  textosIdentificacao: {
    flex: 1,
    gap: 4,
  },
  nome: {
    color: cores.texto,
    fontFamily: fontes.titulo,
    fontSize: 23,
  },
  avatar: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  imagemAvatar: {
    borderRadius: 25,
  },
  iniciais: {
    fontFamily: fontes.titulo,
    fontSize: 26,
    color: cores.texto,
  },
  rotuloSecao: {
    color: cores.textoSecundario,
    fontFamily: fontes.negrito,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  cartaoFormulario: {
    gap: 18,
    padding: 18,
    backgroundColor: cores.superficie,
    borderRadius: 24,
  },
  confirmacao: {
    backgroundColor: cores.superficie,
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  sucesso: {
    color: cores.sucesso,
    fontSize: 16,
    fontFamily: fontes.negrito,
  },
  resumo: {
    color: cores.texto,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fontes.regular,
  },
});

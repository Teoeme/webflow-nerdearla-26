import type { OnboardingMessages } from "./onboarding.en";

export const onboardingEs: OnboardingMessages = {
  trigger: "Cómo funciona",
  modalTitle: "Cómo funciona Racebook",
  closeLabel: "Cerrar",
  skip: "Omitir",
  start: "Empezar",
  scene1: {
    eyebrow: "1",
    heading: "Tu libro de carreras",
    summary: "Cada carrera que terminás se convierte en una medalla en tu libro.",
    medalGold: "Oro",
    medalSilver: "Plata",
    medalBronze: "Bronce",
  },
  scene2: {
    eyebrow: "2",
    heading: "Cada foto termina con quien sale en ella",
    summary: "Mandá una foto o etiquetá a un amigo — también llega a su galería.",
    fromChip: "Vos",
    toChip: "Amigo",
    tagBadge: "Etiquetada",
  },
  scene3: {
    eyebrow: "3",
    heading: "Cargá métricas desde una captura",
    summary: "Soltá una captura de pantalla y los campos se completan solos.",
    aiBadge: "IA",
    fieldTime: "Tiempo",
    fieldPace: "Ritmo",
    fieldDistance: "Distancia",
    fieldPlace: "Puesto",
  },
  tour: {
    title: "Probalo en dos minutos",
    steps: [
      "Usá \"Ver como\" en la barra lateral para actuar como Lucía, Tomás o Sofía (cuentas de demo, sin login).",
      "Como Lucía, abrí una carrera, sumá fotos y usá Compartir en una foto para mandársela a Tomás o etiquetar a Sofía.",
      "Cambiá a Tomás y abrí la Bandeja: aceptá la foto en una de sus carreras o en una nueva.",
      "Abrí una carrera, elegí \"Cargá tu resultado\" y \"Completá desde una captura\" para que la IA lea el resumen de tu reloj.",
    ],
    samplesIntro: "¿No tenés una captura a mano? Descargá una de ejemplo:",
    sampleLabel: "Ejemplo",
  },
};

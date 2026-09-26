import type { AiCaptureMessages } from "./ai-capture.en";

export const aiCaptureEs: AiCaptureMessages = {
  screenshotCapture: {
    button: "Completá desde una captura",
    reading: "Leyendo tu captura con IA…",
    filledTemplate: "Completamos {count} de 4 campos. Revisalos antes de guardar.",
    filledByAi: "Completado con IA",
    errors: {
      type: "Usá una captura en JPEG, PNG o WEBP.",
      size: "Esa captura pesa demasiado — usá una de menos de 5 MB.",
      missing: "Elegí una captura primero.",
      unreadable: "No pudimos leer métricas en esa imagen — probá con una captura más clara de la pantalla de resumen.",
      unavailable: "Leer capturas no está disponible en este momento.",
    },
  },
};

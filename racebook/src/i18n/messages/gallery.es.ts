import type { GalleryMessages } from "./gallery.en";

export const galleryEs: GalleryMessages = {
  eventGallery: {
    heading: "Mis fotos",
    photoAlt: (eventName) => `Foto de ${eventName}`,
    taggedBy: (athleteName) => `Etiquetada por ${athleteName}`,
    emptyState: "Todavía no tenés fotos — subí la primera de este evento.",
    upload: {
      button: "Subir fotos",
      waiting: "Esperando…",
      uploading: "Subiendo…",
      done: "Subida",
      rejected: {
        type: "Rechazada — usá un JPEG, PNG o WEBP",
        size: "Rechazada — tiene que pesar menos de 10 MB",
        missing: "Rechazada — no se pudo subir",
      },
    },
    transfer: {
      fieldLabel: "Enviar a…",
      placeholder: "Elegí a un amigo",
      button: "Transferir",
      outcomes: {
        not_owner: "Ya no sos el dueño de esta foto.",
        already_pending: "Esta foto ya tiene una transferencia pendiente.",
        same_athlete: "No podés enviarte una foto a vos mismo.",
      },
    },
    tag: {
      fieldLabel: "Etiquetar a un amigo…",
      placeholder: "Elegí a un amigo",
      button: "Etiquetar",
      outcomes: {
        not_owner: "Ya no sos el dueño de esta foto.",
        already_tagged: "Ya etiquetaste a ese amigo en esta foto.",
        same_athlete: "No podés etiquetarte a vos mismo.",
      },
    },
    pendingWith: (recipientName) => `Pendiente — ${recipientName}`,
    tagPill: (athleteName) => `Etiqueta: ${athleteName}`,
    lightbox: {
      previous: "Anterior",
      next: "Siguiente",
      close: "Cerrar",
      counterSeparator: "de",
    },
  },
  inbox: {
    title: "Bandeja",
    empty: "No tenés fotos pendientes",
    transfersHeading: "Fotos que te mandaron",
    tagsHeading: "Te etiquetaron",
    sentFrom: (fromAthleteName, eventName) => `${fromAthleteName} te mandó una foto de ${eventName}`,
    taggedFrom: (taggedByName, eventName) => `${taggedByName} te etiquetó en una foto de ${eventName}`,
    destinationFieldLabel: "Agregar a…",
    newEventOption: (sourceEventName) => `Evento nuevo: ${sourceEventName}`,
    accept: "Aceptá la foto",
    reject: "Rechazar",
    viewInEvent: (eventName) => `Verla en ${eventName}`,
  },
};

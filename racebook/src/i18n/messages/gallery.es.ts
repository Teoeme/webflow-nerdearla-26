import type { GalleryMessages } from "./gallery.en";

export const galleryEs: GalleryMessages = {
  eventGallery: {
    heading: "Mis fotos",
    photoAlt: (eventName) => `Foto de ${eventName}`,
    emptyState: "Todavía no tenés fotos — subí la primera de este evento.",
    uploadFieldLabel: "Foto",
    uploadButton: "Subí una foto",
    uploadInvalid: "No pudimos subir ese archivo. Usá un JPEG, PNG o WEBP de menos de 10 MB.",
    transferFieldLabel: "Enviar a…",
    transferPlaceholder: "Elegí a un amigo",
    transferButton: "Transferir",
    pendingWith: (recipientName) => `Pendiente — ${recipientName}`,
  },
  inbox: {
    title: "Bandeja",
    empty: "No tenés fotos pendientes",
    sentFrom: (fromAthleteName, eventName) => `${fromAthleteName} te mandó una foto de ${eventName}`,
    accept: "Aceptá la foto",
    reject: "Rechazar",
    viewInEvent: (eventName) => `Verla en ${eventName}`,
  },
};

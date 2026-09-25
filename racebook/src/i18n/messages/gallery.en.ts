export const galleryEn = {
  eventGallery: {
    heading: "My photos",
    photoAlt: (eventName: string) => `Photo from ${eventName}`,
    emptyState: "No photos yet — upload the first one from this event.",
    uploadFieldLabel: "Photo",
    uploadButton: "Upload photo",
    uploadInvalid: "That file couldn't be uploaded. Use a JPEG, PNG or WEBP under 10 MB.",
    transferFieldLabel: "Send to…",
    transferPlaceholder: "Choose a friend",
    transferButton: "Transfer",
    pendingWith: (recipientName: string) => `Pending — ${recipientName}`,
  },
  inbox: {
    title: "Inbox",
    empty: "No photos waiting for you",
    sentFrom: (fromAthleteName: string, eventName: string) =>
      `${fromAthleteName} sent you a photo from ${eventName}`,
    accept: "Accept",
    reject: "Reject",
    viewInEvent: (eventName: string) => `See it in ${eventName}`,
  },
};

export type GalleryMessages = typeof galleryEn;

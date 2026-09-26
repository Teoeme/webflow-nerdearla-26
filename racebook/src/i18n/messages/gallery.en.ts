export const galleryEn = {
  eventGallery: {
    heading: "My photos",
    photoAlt: (eventName: string) => `Photo from ${eventName}`,
    taggedBy: (athleteName: string) => `Tagged by ${athleteName}`,
    emptyState: "No photos yet — upload the first one from this event.",
    upload: {
      button: "Upload photos",
      dropZone: "Drop photos here, or",
      browseFiles: "browse files",
      // A template, not a function: UploadForm is a client component, and a function
      // can't cross the server/client boundary as a prop (only the messages it needs
      // to render live progress client-side can).
      progressTemplate: "{done} of {total} uploaded",
      waiting: "Waiting…",
      uploading: "Uploading…",
      done: "Uploaded",
      rejected: {
        type: "Rejected — use a JPEG, PNG or WEBP",
        size: "Rejected — must be under 10 MB",
        missing: "Rejected — couldn't upload",
      },
      close: "Close",
    },
    transfer: {
      fieldLabel: "Send to…",
      placeholder: "Choose a friend",
      button: "Transfer",
      outcomes: {
        not_owner: "You're no longer the owner of this photo.",
        already_pending: "This photo already has a pending transfer.",
        same_athlete: "You can't send a photo to yourself.",
      },
    },
    tag: {
      fieldLabel: "Tag a friend…",
      placeholder: "Choose a friend",
      button: "Tag",
      outcomes: {
        not_owner: "You're no longer the owner of this photo.",
        already_tagged: "You already tagged that friend on this photo.",
        same_athlete: "You can't tag yourself.",
      },
    },
    pendingWith: (recipientName: string) => `Pending — ${recipientName}`,
    tagPill: (athleteName: string) => `Tag: ${athleteName}`,
    lightbox: {
      previous: "Previous",
      next: "Next",
      close: "Close",
      counterSeparator: "of",
    },
  },
  inbox: {
    title: "Inbox",
    empty: "No photos waiting for you",
    transfersHeading: "Photos sent to you",
    tagsHeading: "You were tagged",
    sentFrom: (fromAthleteName: string, eventName: string) =>
      `${fromAthleteName} sent you a photo from ${eventName}`,
    taggedFrom: (taggedByName: string, eventName: string) =>
      `${taggedByName} tagged you in a photo from ${eventName}`,
    destinationFieldLabel: "Add to…",
    newEventOption: (sourceEventName: string) => `New event: ${sourceEventName}`,
    accept: "Accept",
    reject: "Reject",
    viewInEvent: (eventName: string) => `See it in ${eventName}`,
    itemKindTransfer: "Transfer",
    itemKindTag: "Tag",
  },
};

export type GalleryMessages = typeof galleryEn;

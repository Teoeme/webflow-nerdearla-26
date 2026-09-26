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
    actionsLabel: "Photo actions",
    transfer: {
      fieldLabel: "Send to…",
      placeholder: "Choose a friend",
      button: "Send photo",
      menuLabel: "Transfer…",
      modalTitle: "Send this photo",
      closeLabel: "Close",
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
      menuLabel: "Tag…",
      modalTitle: "Tag a friend",
      closeLabel: "Close",
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
    newEventHint: "\"New event\" prefills name, date and location from the sender's event, editable before creating.",
    newEventFields: {
      name: "Name",
      date: "Date",
      location: "Location",
      discipline: "Discipline",
    },
    newEventErrors: {
      required: "This field is required.",
      invalidDate: "Enter a date as YYYY-MM-DD.",
    },
    disciplines: {
      road_running: "Road running",
      trail_running: "Trail running",
      triathlon: "Triathlon",
      cycling: "Cycling",
      swimming: "Swimming",
    },
    accept: "Accept",
    reject: "Reject",
    viewInEvent: (eventName: string) => `See it in ${eventName}`,
    itemKindTransfer: "Transfer",
    itemKindTag: "Tag",
  },
};

export type GalleryMessages = typeof galleryEn;

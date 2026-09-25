export const resultsEn = {
  medalBoard: {
    stats: {
      racesLogged: "Races logged",
      medals: "Medals",
      gold: "Gold",
      silver: "Silver",
      bronze: "Bronze",
    },
    logRace: "Log a race",
    emptyState: {
      message: "No races logged yet.",
      cta: "Log a race",
    },
    card: {
      noResultYet: "No result yet",
      logResultCta: "Log my result",
    },
  },
  eventDetail: {
    myResult: {
      title: "My result",
      editCta: "Edit my result",
      logCta: "Log my result",
    },
    stats: {
      time: "Time",
      place: "Place",
      distance: "Distance",
      pace: "Pace",
      avgHeartRate: "Avg. heart rate (bpm)",
      elevation: "Elevation (m)",
    },
  },
  resultForm: {
    title: (eventName: string) => `Your result for ${eventName}`,
    fields: {
      place: "Place",
      time: "Time",
      medal: "Medal",
      distance: "Distance (km)",
      avgHeartRate: "Avg. heart rate (bpm)",
      elevation: "Elevation (m)",
    },
    hints: {
      time: "h:mm:ss or mm:ss",
    },
    medalNoneOption: "None",
    submit: "Save result",
  },
  newEventForm: {
    title: "Add an event",
    fields: {
      name: "Name",
      date: "Date",
      location: "Location",
      discipline: "Discipline",
    },
    submit: "Create event",
  },
  disciplines: {
    road_running: "Road running",
    trail_running: "Trail running",
    triathlon: "Triathlon",
    cycling: "Cycling",
    swimming: "Swimming",
  },
  medals: {
    gold: "Gold",
    silver: "Silver",
    bronze: "Bronze",
  },
  errors: {
    required: "This field is required.",
    invalidNumber: "Enter a valid number.",
    invalidDuration: "Enter a time as h:mm:ss or mm:ss.",
    atLeastOneField: "Fill in at least one field.",
  },
};

export type ResultsMessages = typeof resultsEn;

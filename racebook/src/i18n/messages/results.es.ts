import type { ResultsMessages } from "./results.en";

export const resultsEs: ResultsMessages = {
  medalBoard: {
    stats: {
      racesLogged: "Carreras cargadas",
      medals: "Medallas",
      gold: "Oro",
      silver: "Plata",
      bronze: "Bronce",
    },
    logRace: "Cargá una carrera",
    emptyState: {
      message: "Todavía no cargaste ninguna carrera.",
      cta: "Cargá una carrera",
    },
    otherEvents: {
      title: "Otros eventos",
    },
  },
  eventDetail: {
    myResult: {
      title: "Mi resultado",
      editCta: "Editá tu resultado",
      logCta: "Cargá tu resultado",
    },
    stats: {
      time: "Tiempo",
      place: "Puesto",
      distance: "Distancia",
      pace: "Ritmo",
      avgHeartRate: "Frecuencia cardíaca (lpm)",
      elevation: "Desnivel (m)",
    },
    resultsTable: {
      title: "Resultados",
      place: "Puesto",
      athlete: "Atleta",
      time: "Tiempo",
      pace: "Ritmo",
      medal: "Medalla",
      noResult: "—",
    },
  },
  resultForm: {
    title: (eventName: string) => `Tu resultado en ${eventName}`,
    fields: {
      place: "Puesto",
      time: "Tiempo",
      medal: "Medalla",
      distance: "Distancia (km)",
      avgHeartRate: "Frecuencia cardíaca (lpm)",
      elevation: "Desnivel (m)",
    },
    hints: {
      time: "h:mm:ss o mm:ss",
    },
    medalNoneOption: "Ninguna",
    submit: "Guardá el resultado",
  },
  newEventForm: {
    title: "Agregar evento",
    fields: {
      name: "Nombre",
      date: "Fecha",
      location: "Lugar",
      discipline: "Disciplina",
    },
    submit: "Creá el evento",
  },
  disciplines: {
    road_running: "Running en ruta",
    trail_running: "Trail running",
    triathlon: "Triatlón",
    cycling: "Ciclismo",
    swimming: "Natación",
  },
  medals: {
    gold: "Oro",
    silver: "Plata",
    bronze: "Bronce",
  },
  errors: {
    required: "Este campo es obligatorio.",
    invalidNumber: "Ingresá un número válido.",
    invalidDuration: "Ingresá un tiempo como h:mm:ss o mm:ss.",
    atLeastOneField: "Completá al menos un campo.",
  },
};

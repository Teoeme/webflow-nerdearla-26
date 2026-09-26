import type { Dictionary } from "@/i18n/dictionary";

// Every value in ResultsMessages is a plain, serializable string (or a
// nested object of them), so the whole dictionary slice can cross the
// server/client boundary as a prop as-is.
export type ClientResultsMessages = Dictionary["results"];

export function toClientResultsMessages(messages: Dictionary["results"]): ClientResultsMessages {
  return messages;
}

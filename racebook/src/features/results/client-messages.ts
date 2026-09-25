import type { Dictionary } from "@/i18n/dictionary";

// `dictionary.results.resultForm.title` is a function (it takes the event
// name), so it can't cross the server/client boundary as a prop — React
// only allows plain, serializable values there. The page renders that title
// itself; the client form only needs the rest of the messages.
export type ClientResultsMessages = Omit<Dictionary["results"], "resultForm"> & {
  resultForm: Omit<Dictionary["results"]["resultForm"], "title">;
};

export function toClientResultsMessages(messages: Dictionary["results"]): ClientResultsMessages {
  const { fields, hints, medalNoneOption, submit } = messages.resultForm;
  return { ...messages, resultForm: { fields, hints, medalNoneOption, submit } };
}

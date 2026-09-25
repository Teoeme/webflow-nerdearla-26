export const commonEn = {
  nav: {
    medalBoard: "Medal board",
    inbox: "Inbox",
  },
  viewAsLabel: "View as",
  languageSwitcherLabel: "Language",
  greeting: (athleteName: string) => `Welcome back, ${athleteName}`,
};

export type CommonMessages = typeof commonEn;

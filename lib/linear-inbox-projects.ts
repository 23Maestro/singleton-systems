export const linearInboxProjects = [
  { name: "Singleton Systems", icon: "hierarchy" },
  { name: "Command + Ideas", icon: "lightbulb" },
  { name: "K. Macro Builds", icon: "keyboard" },
  { name: "Personal Ops", icon: "house" },
  { name: "XSpoon", icon: "wrench" },
] as const;

export const linearInboxProjectNames = linearInboxProjects.map((project) => project.name) as [
  (typeof linearInboxProjects)[number]["name"],
  ...(typeof linearInboxProjects)[number]["name"][],
];

export type LinearInboxProjectName = (typeof linearInboxProjects)[number]["name"];
export type LinearInboxProjectIcon = (typeof linearInboxProjects)[number]["icon"];

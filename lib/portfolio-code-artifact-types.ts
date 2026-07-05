export type CodeArtifactLanguage = "json" | "typescript";

export type HighlightedCodeArtifact = {
  key: string;
  title: string;
  language: CodeArtifactLanguage;
  html: string;
};

export type HighlightedCodeArtifactMap = Partial<Record<string, HighlightedCodeArtifact>>;

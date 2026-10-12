export type ThemeId = "clean" | "dark" | "serif";

export interface DocTheme {
  id: ThemeId;
  name: string;
  /** Small swatch shown in the theme dropdown. */
  swatch: string;
  /** Background color baked into PDF / image exports. */
  exportBackground: string;
  /** CSS class prefix used by the scoped preview stylesheet in globals.css. */
  cssClass: string;
}

export const THEMES: Record<ThemeId, DocTheme> = {
  clean: {
    id: "clean",
    name: "Clean Light",
    swatch: "#ffffff",
    exportBackground: "#ffffff",
    cssClass: "theme-clean",
  },
  dark: {
    id: "dark",
    name: "Dark Mode",
    swatch: "#18181b",
    exportBackground: "#18181b",
    cssClass: "theme-dark",
  },
  serif: {
    id: "serif",
    name: "Minimalist Serif",
    swatch: "#faf6ec",
    exportBackground: "#faf6ec",
    cssClass: "theme-serif",
  },
};

export const THEME_LIST: DocTheme[] = Object.values(THEMES);

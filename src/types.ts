/**
 * @file types.ts
 * @description Defines the core data structures and types used throughout the OpenSlides application.
 * @offers
 * - Slide: Interface for individual code slides.
 * - ThemeName: List of supported Shiki code themes.
 * - PresentationState: Interface for the global application state and actions.
 * @flow
 * This file serves as the source of truth for TypeScript types, ensuring consistency between components and the store.
 */
export type FontSize = 12 | 14 | 16 | 18 | 20 | 24 | 28 | 32;

/**
 * Special language mode that allows mixed languages across slides.
 * When selected, each slide can have its own language.
 */
export const DYNAMIC_LANGUAGE = 'dynamic';

/**
 * List of supported programming languages for code highlighting.
 */
export const SUPPORTED_LANGUAGES = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'tsx', label: 'React (TSX)' },
  { value: 'jsx', label: 'React (JSX)' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash/Shell' },
  { value: 'markdown', label: 'Markdown' },
] as const;

export interface Slide {
  id: string;
  code: string;
  /**
   * Language for this slide.
   * - If project uses dynamic mode (first slide is 'dynamic'), each slide can have its own language.
   * - Otherwise, all slides use the language from the first slide (this value is ignored).
   */
  language: string;
  duration: number;
  transitionDuration: number;
  stagger: number;
}

export type ThemeName =
  | 'dark-plus'
  | 'dracula'
  | 'github-dark'
  | 'github-light'
  | 'nord'
  | 'poimandres'
  | 'min-light'
  | 'min-dark'
  | 'monokai'
  | 'solarized-dark'
  | 'solarized-light'
  | 'andromeeda'
  | 'aurora-x'
  | 'catppuccin-latte'
  | 'catppuccin-mocha'
  | 'night-owl';

export interface PresentationState {
  slides: Slide[];
  currentSlideId: string | null;
  activeProjectId: string | null;
  theme: ThemeName;
  isPlaying: boolean;
  uiMode: 'light' | 'dark';

  // Global Settings
  showLineNumbers: boolean;
  fontSize: FontSize;
  lineHeight: number;
  editorFontSize: number;

  // Global Animation Settings
  useGlobalTransition: boolean;
  globalTransitionDuration: number;
  useGlobalStagger: boolean;
  globalStagger: number;

  addSlide: () => void;
  updateSlide: (id: string, updates: Partial<Slide>) => void;
  removeSlide: (id: string) => void;
  setCurrentSlide: (id: string) => void;
  setTheme: (theme: ThemeName) => void;
  setUiMode: (mode: 'light' | 'dark') => void;
  setShowLineNumbers: (show: boolean) => void;
  setFontSize: (size: FontSize) => void;
  setLineHeight: (height: number) => void;
  setEditorFontSize: (size: number) => void;
  setUseGlobalTransition: (use: boolean) => void;
  setGlobalTransitionDuration: (duration: number) => void;
  setUseGlobalStagger: (use: boolean) => void;
  setGlobalStagger: (stagger: number) => void;
  reorderSlides: (startIndex: number, endIndex: number) => void;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  slides: Slide[];
  currentSlideId: string | null;
  theme: ThemeName;
  showLineNumbers: boolean;
  fontSize: FontSize;
  lineHeight: number;
  editorFontSize: number;
  useGlobalTransition: boolean;
  globalTransitionDuration: number;
  useGlobalStagger: boolean;
  globalStagger: number;
}

export interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  
  createProject: (name?: string) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;
  loadProject: (id: string) => Project | null;
  clearAllProjects: () => void;
}

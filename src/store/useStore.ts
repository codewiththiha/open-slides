/**
 * @file useStore.ts
 * @description Centralized state management for OpenSlides using Zustand.
 * @offers
 * - Slide CRUD operations (add, update, remove, reorder).
 * - Global settings management (theme, font size, animations).
 * - Persistent or reactive state accessible across all components.
 * @flow
 * Components subscribe to this store to get and set application state.
 * Any change here triggers re-renders in the UI (e.g., SlidePreview updating after code edits).
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { v4 as uuidv4 } from "uuid";
import type { PresentationState, Slide, ThemeName } from "../types";

const INITIAL_CODE = `// Welcome to OpenSlides
// Feedbacks on @codewiththiha
function greet() {
  console.log("Hi, Mom!");
}`;

const DEFAULT_SLIDE: Slide = {
  id: uuidv4(),
  code: INITIAL_CODE,
  language: "typescript",
  transitionDuration: 750,
  stagger: 5,
  duration: 3000,
};

const createDefaultState = (): Omit<PresentationState, keyof ZustandStore> => ({
  slides: [DEFAULT_SLIDE],
  currentSlideId: DEFAULT_SLIDE.id,
  theme: "dark-plus",
  isPlaying: false,
  uiMode: "dark",
  showLineNumbers: true,
  fontSize: 16,
  lineHeight: 1.5,
  editorFontSize: 14,
  useGlobalTransition: false,
  globalTransitionDuration: 750,
  useGlobalStagger: false,
  globalStagger: 5,
});

type ZustandStore = Pick<PresentationState,
  | 'addSlide' | 'updateSlide' | 'removeSlide' | 'setCurrentSlide'
  | 'setTheme' | 'setUiMode' | 'setShowLineNumbers' | 'setFontSize'
  | 'setLineHeight' | 'setEditorFontSize' | 'setUseGlobalTransition' | 'setGlobalTransitionDuration'
  | 'setUseGlobalStagger' | 'setGlobalStagger' | 'reorderSlides'
>;

export const useStore = create<PresentationState>()(
  persist(
    (set) => ({
      ...createDefaultState(),

      addSlide: () =>
        set((state) => {
          const newSlide: Slide = {
            id: uuidv4(),
            code: "// New Slide\n// Edit me!",
            language: "typescript",
            transitionDuration: 750,
            stagger: 5,
            duration: 3000,
          };
          return {
            slides: [...state.slides, newSlide],
            currentSlideId: newSlide.id,
          };
        }),

      updateSlide: (id, updates) =>
        set((state) => ({
          slides: state.slides.map((slide) =>
            slide.id === id ? { ...slide, ...updates } : slide,
          ),
        })),

      removeSlide: (id) =>
        set((state) => {
          if (state.slides.length <= 1) return state;
          const newSlides = state.slides.filter((s) => s.id !== id);
          const newCurrentId =
            state.currentSlideId === id ? newSlides[0].id : state.currentSlideId;
          return {
            slides: newSlides,
            currentSlideId: newCurrentId,
          };
        }),

      setCurrentSlide: (id) => set({ currentSlideId: id }),

      setTheme: (theme: ThemeName) => set({ theme }),

      setUiMode: (mode) => set({ uiMode: mode }),

      setShowLineNumbers: (show) => set({ showLineNumbers: show }),

      setFontSize: (size) => set({ fontSize: size }),

      setLineHeight: (height) => set({ lineHeight: height }),

      setEditorFontSize: (size) => set({ editorFontSize: size }),

      setUseGlobalTransition: (use) => set({ useGlobalTransition: use }),
      setGlobalTransitionDuration: (duration) =>
        set({ globalTransitionDuration: duration }),
      setUseGlobalStagger: (use) => set({ useGlobalStagger: use }),
      setGlobalStagger: (stagger) => set({ globalStagger: stagger }),

      reorderSlides: (startIndex, endIndex) =>
        set((state) => {
          const result = Array.from(state.slides);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          return { slides: result };
        }),
    }),
    {
      name: 'openslides-presentation',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        slides: state.slides,
        currentSlideId: state.currentSlideId,
        theme: state.theme,
        showLineNumbers: state.showLineNumbers,
        fontSize: state.fontSize,
        lineHeight: state.lineHeight,
        editorFontSize: state.editorFontSize,
        useGlobalTransition: state.useGlobalTransition,
        globalTransitionDuration: state.globalTransitionDuration,
        useGlobalStagger: state.useGlobalStagger,
        globalStagger: state.globalStagger,
      }),
    }
  )
);

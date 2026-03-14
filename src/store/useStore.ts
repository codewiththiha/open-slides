/**
 * @file useStore.ts
 * @description Centralized state management for OpenSlides using Zustand.
 * IMPORTANT: This store is ONLY for the currently active project's working state.
 * All persistence is handled by useProjectStore - this store is NOT persisted.
 * Each time you switch projects, this store is completely reset with that project's data.
 */
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { PresentationState, Slide, ThemeName } from "../types";
import { DYNAMIC_LANGUAGE } from "../types";

/**
 * Helper function to synchronize all slides' language with the first slide.
 * If first slide is 'dynamic', each slide keeps its own language.
 * Otherwise, all slides use the first slide's language.
 */
const syncSlideLanguages = (slides: Slide[]): Slide[] => {
  if (slides.length === 0) return slides;
  
  const firstSlideLanguage = slides[0].language;
  
  // If first slide is dynamic mode, keep each slide's individual language
  // But ensure no slide has "dynamic" as language - default to typescript
  if (firstSlideLanguage === DYNAMIC_LANGUAGE) {
    return slides.map((slide, index) => 
      index === 0 
        ? slide // Keep first slide as-is (it might be "dynamic" as a marker)
        : { ...slide, language: slide.language === DYNAMIC_LANGUAGE ? 'typescript' : slide.language }
    );
  }
  
  // Otherwise, force all slides to use the first slide's language
  return slides.map((slide, index) => 
    index === 0 
      ? slide 
      : { ...slide, language: firstSlideLanguage }
  );
};

// This creates the store with proper typing
export const useStore = create<PresentationState>((set) => ({
  slides: [],
  currentSlideId: null,
  activeProjectId: null,
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

  addSlide: () => {
    set((state) => {
      const firstSlideLanguage = state.slides.length > 0 
        ? state.slides[0].language 
        : "typescript";
      
      // In dynamic mode, new slides default to typescript but can be changed
      // In normal mode, new slides inherit the first slide's language
      const newSlideLanguage = firstSlideLanguage === DYNAMIC_LANGUAGE 
        ? 'typescript' 
        : firstSlideLanguage;
      
      const newSlide: Slide = {
        id: uuidv4(),
        code: "// New Slide\n// Edit me!",
        language: newSlideLanguage,
        transitionDuration: 750,
        stagger: 5,
        duration: 3000,
      };
      
      const newSlides = [...state.slides, newSlide];
      
      return {
        slides: syncSlideLanguages(newSlides),
        currentSlideId: newSlide.id,
      };
    });
  },

  updateSlide: (id, updates) =>
    set((state) => {
      const newSlides = state.slides.map((slide) =>
        slide.id === id ? { ...slide, ...updates } : slide,
      );
      
      // If updating the first slide's language, sync all slides
      if (updates.language && state.slides[0]?.id === id) {
        return {
          slides: syncSlideLanguages(newSlides),
        };
      }
      
      return {
        slides: newSlides,
      };
    }),

  removeSlide: (id) =>
    set((state) => {
      if (state.slides.length <= 1) return state;
      const deletedIndex = state.slides.findIndex((s) => s.id === id);
      const newSlides = state.slides.filter((s) => s.id !== id);
      let newCurrentId = state.currentSlideId;

      if (state.currentSlideId === id) {
        // Fall back to previous slide if possible, otherwise next slide, or first slide
        const fallbackIndex = Math.max(0, deletedIndex - 1);
        newCurrentId = newSlides[fallbackIndex]?.id || newSlides[0].id;
      }

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
}));

/**
 * Initialize the store with project data
 * This COMPLETELY REPLACES the store state - ensuring isolation between projects
 */
export const initializeStoreWithProject = (project: any, projectId: string) => {
  useStore.setState({
    slides: JSON.parse(JSON.stringify(project.slides)), // Deep clone to prevent reference sharing
    currentSlideId: project.currentSlideId,
    activeProjectId: projectId,
    theme: project.theme,
    showLineNumbers: project.showLineNumbers,
    fontSize: project.fontSize,
    lineHeight: project.lineHeight,
    editorFontSize: project.editorFontSize || 14,
    useGlobalTransition: project.useGlobalTransition,
    globalTransitionDuration: project.globalTransitionDuration,
    useGlobalStagger: project.useGlobalStagger,
    globalStagger: project.globalStagger,
    isPlaying: false,
    uiMode: 'dark',
  });
};

/**
 * Clear the store (when navigating away from editor)
 */
export const clearStore = () => {
  useStore.setState({
    slides: [],
    currentSlideId: null,
    activeProjectId: null,
  });
};

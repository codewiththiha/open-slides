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
    const newSlide: Slide = {
      id: uuidv4(),
      code: "// New Slide\n// Edit me!",
      language: "typescript",
      transitionDuration: 750,
      stagger: 5,
      duration: 3000,
    };
    set((state) => ({
      slides: [...state.slides, newSlide],
      currentSlideId: newSlide.id,
    }));
  },

  updateSlide: (id, updates) =>
    set((state) => ({
      slides: state.slides.map((slide) =>
        slide.id === id ? { ...slide, ...updates } : slide,
      ),
    })),

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

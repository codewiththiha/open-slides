import { create } from "zustand";
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

export const useStore = create<PresentationState>((set) => ({
  slides: [DEFAULT_SLIDE],
  currentSlideId: DEFAULT_SLIDE.id,
  theme: "dark-plus",
  isPlaying: false,
  uiMode: "dark",
  showLineNumbers: true,
  fontSize: 16,
  lineHeight: 1.5,

  useGlobalTransition: false,
  globalTransitionDuration: 750,
  useGlobalStagger: false,
  globalStagger: 5,

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
      if (state.slides.length <= 1) return state; // Don't verify removing the last slide
      const newSlides = state.slides.filter((s) => s.id !== id);
      // If we removed the current slide, switch to the first one (or adjacent)
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

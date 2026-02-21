/**
 * @file useProjectStore.ts
 * @description Project management store with localStorage persistence.
 * Handles creating, loading, updating, and deleting projects.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { ProjectState, Project, Slide } from "../types";

const INITIAL_CODE = `// Welcome to OpenSlides
// Feedbacks on @codewiththiha
function greet() {
  console.log("Hi, Mom!");
}`;

const createDefaultSlide = (): Slide => ({
  id: uuidv4(),
  code: INITIAL_CODE,
  language: "typescript",
  transitionDuration: 750,
  stagger: 5,
  duration: 3000,
});

const createDefaultProject = (name: string = "Untitled Deck"): Project => {
  const defaultSlide = createDefaultSlide();
  const now = Date.now();
  return {
    id: uuidv4(),
    name,
    createdAt: now,
    updatedAt: now,
    slides: [defaultSlide],
    currentSlideId: defaultSlide.id,
    theme: "dark-plus",
    showLineNumbers: true,
    fontSize: 16,
    lineHeight: 1.5,
    editorFontSize: 14,
    useGlobalTransition: false,
    globalTransitionDuration: 750,
    useGlobalStagger: false,
    globalStagger: 5,
  };
};

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,

      createProject: (name?: string) => {
        const newProject = createDefaultProject(name);
        set((state) => ({
          projects: [...state.projects, newProject],
          currentProjectId: newProject.id,
        }));
        return newProject.id;
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, ...updates, updatedAt: Date.now() }
              : project
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => {
          const newProjects = state.projects.filter((p) => p.id !== id);
          const newCurrentId =
            state.currentProjectId === id
              ? newProjects.length > 0
                ? newProjects[0].id
                : null
              : state.currentProjectId;
          return {
            projects: newProjects,
            currentProjectId: newCurrentId,
          };
        });
      },

      setCurrentProject: (id) => {
        set({ currentProjectId: id });
      },

      loadProject: (id) => {
        const project = get().projects.find((p) => p.id === id);
        return project || null;
      },

      clearAllProjects: () => {
        set({ projects: [], currentProjectId: null });
      },
    }),
    {
      name: 'openslides-projects',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

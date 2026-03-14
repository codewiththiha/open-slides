/**
 * @file Editor.tsx
 * @description Editor page component that loads project data and provides the editing interface.
 */
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useCallback, useState } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { useStore, initializeStoreWithProject, clearStore } from '../store/useStore';
import { Sidebar } from '@/components/Sidebar';
import { SlidePreview } from '@/components/SlidePreview';
import { CodeEditor } from '@/components/CodeEditor';
import { Moon, Sun, MonitorPlay } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from "next-themes";

export function Editor() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const {
    loadProject,
    updateProject,
    setCurrentProject,
  } = useProjectStore();

  const {
    slides,
    currentSlideId,
    setCurrentSlide,
    activeProjectId,
    theme,
    showLineNumbers,
    fontSize,
    lineHeight,
    useGlobalTransition,
    globalTransitionDuration,
    useGlobalStagger,
    globalStagger,
  } = useStore();

  const { theme: systemTheme, setTheme: setSystemTheme } = useTheme();
  const [isPresenting, setIsPresenting] = useState(false);
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Calculate current slide index
  const currentIndex = slides.findIndex(s => s.id === currentSlideId);

  // Keyboard navigation for presentation and editor expand mode
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isPresenting) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsPresenting(false);
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (currentIndex < slides.length - 1) {
          setCurrentSlide(slides[currentIndex + 1].id);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentSlide(slides[currentIndex - 1].id);
        }
      }
    } else if (isEditorExpanded) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsEditorExpanded(false);
      }
    }
  }, [isPresenting, isEditorExpanded, currentIndex, slides, setCurrentSlide]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Load project data when component mounts or projectId changes
  useEffect(() => {
    if (!projectId) {
      navigate('/');
      return;
    }

    const project = loadProject(projectId);
    if (project) {
      // CRITICAL: This completely replaces the store state with DEEP CLONED project data
      // Using JSON parse/stringify to ensure NO reference sharing between projects
      initializeStoreWithProject(project, projectId);
      setCurrentProject(projectId);
    } else {
      navigate('/');
    }

    // Cleanup: clear store when component unmounts to prevent old data from flashing
    return () => {
      clearStore();
    };
  }, [projectId, loadProject, setCurrentProject, navigate]);

  // Sync presentation store changes back to project
  useEffect(() => {
    if (!projectId || activeProjectId !== projectId) return;

    // Deep clone slides to prevent any reference sharing
    const slidesClone = JSON.parse(JSON.stringify(slides));

    updateProject(projectId, {
      slides: slidesClone,
      currentSlideId,
      theme,
      showLineNumbers,
      fontSize,
      lineHeight,
      useGlobalTransition,
      globalTransitionDuration,
      useGlobalStagger,
      globalStagger,
    });
  }, [
    projectId,
    slides,
    currentSlideId,
    theme,
    showLineNumbers,
    fontSize,
    lineHeight,
    useGlobalTransition,
    globalTransitionDuration,
    useGlobalStagger,
    globalStagger,
    updateProject,
  ]);

  const currentProject = projectId ? loadProject(projectId) : null;

  return (
    <div className="flex h-screen w-full bg-background text-foreground transition-colors">
      {/* Full Screen Presentation Mode */}
      {isPresenting && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
          <button
            className="absolute top-4 right-4 z-[110] text-white/70 hover:text-white text-sm flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md transition-all"
            onClick={() => setIsPresenting(false)}
          >
            <span>Press</span>
            <kbd className="font-mono bg-white/20 px-2 py-0.5 rounded text-xs">ESC</kbd>
            <span>to exit</span>
          </button>
          <div className="w-full h-full max-w-[90vw] max-h-[90vh] aspect-video">
            <SlidePreview isPresenting={true} />
          </div>
        </div>
      )}

      {/* Expanded Editor Mode Overlay */}
      {isEditorExpanded && (
        <div className="fixed inset-0 z-[100] bg-background/98 backdrop-blur-xl flex items-center justify-center">
          <div className="w-full h-full p-4">
            <CodeEditor
              isExpanded={true}
              onExpand={() => setIsEditorExpanded(false)}
              onCollapse={() => setIsEditorExpanded(false)}
            />
          </div>
        </div>
      )}

      {(!isPresenting && !isEditorExpanded) && (
        <Sidebar
          onNavigateBack={() => navigate('/')}
          projectName={currentProject?.name || 'Untitled Deck'}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      )}

      <main className="flex flex-1 flex-col overflow-hidden relative">
        <header className="flex h-12 items-center justify-between border-b bg-card/50 backdrop-blur-sm px-4 flex-shrink-0">
          <div className="font-medium text-xs text-muted-foreground truncate">
            {currentProject?.name || 'Untitled Deck'}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSystemTheme(systemTheme === 'dark' ? 'light' : 'dark')}
              title={`Switch to ${systemTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {systemTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <div className="h-4 w-px bg-border mx-1" />

            <Button
              onClick={() => setIsPresenting(true)}
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
            >
              <MonitorPlay className="h-3.5 w-3.5" />
              Present
            </Button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 items-center justify-center bg-muted/20 p-4 min-h-0">
            <div className="aspect-video w-full max-w-5xl shadow-2xl rounded-lg overflow-hidden">
              <SlidePreview />
            </div>
          </div>

          <div className="w-[400px] flex-shrink-0 border-l">
            <CodeEditor onExpand={() => setIsEditorExpanded(true)} />
          </div>
        </div>
      </main>
    </div>
  );
}

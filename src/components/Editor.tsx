/**
 * @file Editor.tsx
 * @description Editor page component that loads project data and provides the editing interface.
 * Features bottom slide navigation panel with responsive design for mobile devices.
 */
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useCallback, useState } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { useStore, initializeStoreWithProject, clearStore } from '../store/useStore';
import { SlidePreview } from '@/components/SlidePreview';
import { CodeEditor } from '@/components/CodeEditor';
import { BottomSlidesPanel } from '@/components/BottomSlidesPanel';
import { Moon, Sun, MonitorPlay } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from "next-themes";
import { cn } from '@/lib/utils';

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
  const [isBottomPanelCollapsed, setIsBottomPanelCollapsed] = useState(false);

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
    <div className="flex h-screen w-full flex-col bg-background text-foreground transition-colors">
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

      {/* Header */}
      <header className="flex h-12 items-center justify-between border-b bg-card/50 backdrop-blur-sm px-4 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 -ml-1.5 flex-shrink-0"
            onClick={() => navigate('/')}
            title="Back to Dashboard"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Button>
          <div className="font-medium text-xs text-muted-foreground truncate">
            {currentProject?.name || 'Untitled Deck'}
          </div>
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
            <span className="hidden sm:inline">Present</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Preview and Editor */}
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          {/* Preview Area */}
          <div className="flex flex-1 items-center justify-center bg-muted/20 p-4 min-h-0">
            <div className="aspect-video w-full max-w-5xl shadow-2xl rounded-lg overflow-hidden">
              <SlidePreview />
            </div>
          </div>

          {/* Editor Panel - Collapsible on mobile */}
          <div className={cn(
            "border-l bg-card/50 backdrop-blur-sm flex flex-col",
            "w-full lg:w-[400px] lg:flex-shrink-0",
            "h-[40vh] lg:h-auto"
          )}>
            <CodeEditor onExpand={() => setIsEditorExpanded(true)} />
          </div>
        </div>

        {/* Bottom Slides Panel */}
        <BottomSlidesPanel
          isCollapsed={isBottomPanelCollapsed}
          onToggleCollapse={() => setIsBottomPanelCollapsed(!isBottomPanelCollapsed)}
        />
      </div>
    </div>
  );
}

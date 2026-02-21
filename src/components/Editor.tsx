/**
 * @file Editor.tsx
 * @description Editor page component that loads project data and provides the editing interface.
 */
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useCallback } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { useStore } from '../store/useStore';
import { Sidebar } from '@/components/Sidebar';
import { SlidePreview } from '@/components/SlidePreview';
import { CodeEditor } from '@/components/CodeEditor';
import { Play, Download, Moon, Sun, MonitorPlay, Loader2, X } from 'lucide-react';
import { Player } from '@remotion/player';
import { RemotionVideo } from '@/remotion/RemotionVideo';
import { useState } from 'react';
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
  const [isExporting, setIsExporting] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [isProcessing] = useState(false);
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Keyboard navigation for presentation and editor expand mode
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isPresenting) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsPresenting(false);
      }
    } else if (isEditorExpanded) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsEditorExpanded(false);
      }
    }
  }, [isPresenting, isEditorExpanded]);

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
      // Sync project data to presentation store
      useStore.setState({
        slides: project.slides,
        currentSlideId: project.currentSlideId,
        theme: project.theme,
        showLineNumbers: project.showLineNumbers,
        fontSize: project.fontSize,
        lineHeight: project.lineHeight,
        useGlobalTransition: project.useGlobalTransition,
        globalTransitionDuration: project.globalTransitionDuration,
        useGlobalStagger: project.useGlobalStagger,
        globalStagger: project.globalStagger,
      });
      setCurrentProject(projectId);
    } else {
      navigate('/');
    }
  }, [projectId, loadProject, setCurrentProject, navigate]);

  // Sync presentation store changes back to project
  useEffect(() => {
    if (!projectId) return;
    
    updateProject(projectId, {
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

  const durationInFrames = Math.max(1, Math.ceil(slides.reduce((acc, slide) => {
    const duration = slide.duration || 3000;
    return acc + (duration / 1000 * 30);
  }, 0)));

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

            <Button
              onClick={() => setIsExporting(true)}
              size="sm"
              className="h-8 gap-1.5 text-xs"
            >
              <Play className="h-3.5 w-3.5" />
              Export
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

        {isExporting && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
            <div className="relative w-full max-w-4xl rounded-xl border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExporting(false)}
                className="absolute right-4 top-4"
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-bold">Export Video</h2>
                  <p className="text-sm text-muted-foreground">Preview your video before exploring.</p>
                </div>

                <div className="aspect-video w-full overflow-hidden rounded-lg border bg-black relative flex items-center justify-center">
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-2 text-white">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-sm font-medium">Generating Preview...</span>
                    </div>
                  ) : (
                    <Player
                      component={RemotionVideo}
                      inputProps={{
                        slides, theme, showLineNumbers, fontSize, lineHeight,
                        useGlobalTransition, globalTransitionDuration, useGlobalStagger, globalStagger
                      }}
                      durationInFrames={durationInFrames}
                      fps={30}
                      compositionWidth={1920}
                      compositionHeight={1080}
                      style={{ width: '100%', height: '100%' }}
                      controls
                      autoPlay
                      loop
                    />
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    Total Duration: {(durationInFrames / 30).toFixed(1)}s
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setIsExporting(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => alert("Rendering full MP4 requires a backend or ffmpeg.wasm implementation. This preview confirms the animation logic works!")}
                      disabled={isProcessing}
                    >
                      {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                      Download MP4
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

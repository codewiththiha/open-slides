/**
 * @file App.tsx
 * @description The main dashboard and layout controller for OpenSlides.
 * @offers
 * - Responsive 3-panel layout (Sidebar, SlidePreview, CodeEditor).
 * - Full-screen presentation mode with keyboard navigation.
 * - Video export preview using Remotion Player.
 * @flow
 * The main app component orchestrates the overall UI state, switching between editor view, 
 * presentation overlay, and export modal.
 */
import { Sidebar } from '@/components/Sidebar';

import { SlidePreview } from '@/components/SlidePreview';
import { CodeEditor } from '@/components/CodeEditor';
import { useStore } from '@/store/useStore';
import { Play, X, Download, Moon, Sun, MonitorPlay, Loader2 } from 'lucide-react';
import { Player } from '@remotion/player';
import { RemotionVideo } from '@/remotion/RemotionVideo';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';


import { useTheme } from "next-themes"

function App() {
  const { 
    slides, 
    currentSlideId, 
    setCurrentSlide, 
    theme, 
    showLineNumbers, 
    fontSize, 
    lineHeight,
    useGlobalTransition,
    globalTransitionDuration,
    useGlobalStagger,
    globalStagger
  } = useStore();
  const { theme: systemTheme, setTheme: setSystemTheme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Fake processing state

  // Calculate total duration safely
  const durationInFrames = Math.max(1, Math.ceil(slides.reduce((acc, slide) => {
     const duration = slide.duration || 3000;
     return acc + (duration / 1000 * 30);
  }, 0)));

  // Keyboard navigation for presentation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isPresenting) return;
    
    const currentIndex = slides.findIndex(s => s.id === currentSlideId);
    
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      if (currentIndex < slides.length - 1) {
         setCurrentSlide(slides[currentIndex + 1].id);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentIndex > 0) {
        setCurrentSlide(slides[currentIndex - 1].id);
      }
    } else if (e.key === 'Escape') {
      setIsPresenting(false);
    }
  }, [isPresenting, slides, currentSlideId, setCurrentSlide]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Fake processing effect for "Export"
  useEffect(() => {
    if (isExporting) {
        setIsProcessing(true);
        const timer = setTimeout(() => setIsProcessing(false), 2000); // Fake 2s load
        return () => clearTimeout(timer);
    }
  }, [isExporting]);

  return (
    <div className="flex h-screen w-full bg-background text-foreground transition-colors">
      {/* Full Screen Presentation Mode Overlay */}
      {isPresenting && (
         <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            <div className="absolute top-4 right-4 z-[110] text-muted-foreground/50 text-sm">
               Press <kbd className="font-mono bg-muted/20 px-1 rounded">ESC</kbd> to exit
            </div>
            <div className="w-full h-full max-w-[90vw] max-h-[90vh] aspect-video">
                <SlidePreview isPresenting={true} />
            </div>
         </div>
      )}

      {(!isPresenting) && <Sidebar />}
      
      <main className="flex flex-1 flex-col overflow-hidden relative">
        {/* Toolbar */}
        <header className="flex h-14 items-center justify-between border-b bg-card px-6">
           <div className="font-medium text-sm text-muted-foreground">
             Project: Untitled Deck
           </div>
           <div className="flex items-center gap-3">
             <Button
               variant="ghost"
               size="icon"
               onClick={() => setSystemTheme(systemTheme === 'dark' ? 'light' : 'dark')}
               className="h-8 w-8"
               title={`Switch to ${systemTheme === 'dark' ? 'Light' : 'Dark'} Mode (System UI)`}
             >
                {systemTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
             </Button>

             <div className="h-4 w-px bg-border mx-1" />

             <Button 
                onClick={() => setIsPresenting(true)}
                variant="outline"
                size="sm"
                className="h-8 gap-2"
             >
               <MonitorPlay className="h-3.5 w-3.5" />
               Present
             </Button>

             <Button 
                onClick={() => setIsExporting(true)}
                size="sm"
                className="h-8 gap-2"
             >
               <Play className="h-3.5 w-3.5" />
               Export
             </Button>
           </div>
        </header>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
           {/* Center Preview */}
           <div className="flex flex-1 items-center justify-center bg-muted/20 p-8">
              <div className="aspect-video w-full max-w-4xl shadow-2xl">
                <SlidePreview />
              </div>
           </div>

           {/* Right Editor Panel */}
           <div className="w-96">
             <CodeEditor />
           </div>
        </div>

        {/* Export Modal Overlay */}
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

export default App;

/**
 * @file CodeEditor.tsx
 * @description Modern code editor with syntax highlighting, collapsible panels, and slide navigation.
 */
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent, Label, Slider, Switch } from './ui/all';
import { Button } from './ui/button';
import { Maximize2, ChevronLeft, ChevronRight, PanelLeftClose } from 'lucide-react';
import type { ThemeName } from '../types';
import { useEffect, useState, useRef, useCallback } from 'react';
import { createHighlighter, type Highlighter } from 'shiki';

interface CodeEditorProps {
  isExpanded?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
}

export function CodeEditor({ isExpanded = false, onExpand, onCollapse }: CodeEditorProps) {
  const {
    slides,
    currentSlideId,
    setCurrentSlide,
    updateSlide,
    theme,
    setTheme,
    showLineNumbers,
    setShowLineNumbers,
    fontSize,
    setFontSize,
    lineHeight,
    setLineHeight,
    editorFontSize,
    setEditorFontSize,
    useGlobalTransition, setUseGlobalTransition,
    globalTransitionDuration, setGlobalTransitionDuration,
    useGlobalStagger, setUseGlobalStagger,
    globalStagger, setGlobalStagger
  } = useStore();
  
  const currentSlide = slides.find((s) => s.id === currentSlideId);
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);
  const [highlightedCode, setHighlightedCode] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [activeTab, setActiveTab] = useState('code');

  const currentIndex = slides.findIndex(s => s.id === currentSlideId);

  useEffect(() => {
    async function loadHighlighter() {
      const h = await createHighlighter({
        themes: [
          'dark-plus', 'dracula', 'github-dark', 'github-light', 'nord', 'poimandres',
          'min-light', 'min-dark', 'monokai', 'solarized-dark', 'solarized-light',
          'andromeeda', 'aurora-x', 'catppuccin-latte', 'catppuccin-mocha', 'night-owl'
        ],
        langs: ['javascript', 'typescript', 'jsx', 'tsx', 'css', 'html', 'json', 'python', 'java', 'go', 'rust', 'php'],
      });
      setHighlighter(h);
    }
    loadHighlighter();
  }, []);

  useEffect(() => {
    if (highlighter && currentSlide) {
      const html = highlighter.codeToHtml(currentSlide.code, {
        lang: currentSlide.language,
        theme: theme,
      });
      const codeMatch = html.match(/<code[^>]*>([\s\S]*?)<\/code>/);
      if (codeMatch) {
        setHighlightedCode(codeMatch[1]);
      }
    }
  }, [highlighter, currentSlide?.code, currentSlide?.language, theme]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handlePreviousSlide = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentSlide(slides[currentIndex - 1].id);
    }
  }, [currentIndex, slides, setCurrentSlide]);

  const handleNextSlide = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setCurrentSlide(slides[currentIndex + 1].id);
    }
  }, [currentIndex, slides, setCurrentSlide]);

  if (!currentSlide) return null;

  return (
    <div className={cn(
      "flex h-full flex-col border-l bg-card/50 backdrop-blur-sm transition-all duration-300",
      isExpanded && "border-0 bg-card"
    )}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
        {/* Header Bar */}
        <div className="border-b px-3 py-2 flex items-center justify-between gap-2">
          <TabsList className="grid grid-cols-2 h-8 bg-muted/50">
            <TabsTrigger value="code" className="text-xs px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">Code</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">Settings</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-1">
            {activeTab === 'code' && (
              <>
                {isExpanded && (
                  <div className="flex items-center gap-1 mr-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handlePreviousSlide}
                      disabled={currentIndex === 0}
                      title="Previous Slide"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <span className="text-xs text-muted-foreground min-w-[60px] text-center font-mono">
                      {currentIndex + 1} / {slides.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleNextSlide}
                      disabled={currentIndex === slides.length - 1}
                      title="Next Slide"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
                {!isExpanded && onExpand && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onExpand}
                    title="Expand Editor (ESC to collapse)"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </Button>
                )}
                {isExpanded && onCollapse && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onCollapse}
                    title="Collapse (ESC)"
                  >
                    <PanelLeftClose className="h-3.5 w-3.5" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <TabsContent value="code" className="flex-1 flex flex-col p-3 gap-3 data-[state=inactive]:hidden min-h-0">
          {/* Slide Settings - Compact */}
          <div className="space-y-2 flex-shrink-0">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-medium">Transition</Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {useGlobalTransition ? "Global" : `${currentSlide.transitionDuration}ms`}
                </span>
              </div>
              <Slider
                defaultValue={[currentSlide.transitionDuration]}
                max={2000}
                step={50}
                disabled={useGlobalTransition}
                className={cn("h-1.5", useGlobalTransition && "opacity-50")}
                onValueChange={(v) => updateSlide(currentSlide.id, { transitionDuration: v[0] })}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-medium">Stagger</Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {useGlobalStagger ? "Global" : `${currentSlide.stagger}ms`}
                </span>
              </div>
              <Slider
                defaultValue={[currentSlide.stagger]}
                max={100}
                step={1}
                disabled={useGlobalStagger}
                className={cn("h-1.5", useGlobalStagger && "opacity-50")}
                onValueChange={(v) => updateSlide(currentSlide.id, { stagger: v[0] })}
              />
            </div>
            <div className="space-y-1.5 pt-1.5 border-t">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-medium">Editor Font Size</Label>
                <span className="text-[10px] text-muted-foreground font-mono">{editorFontSize}px</span>
              </div>
              <Slider
                min={10}
                max={24}
                step={1}
                value={[editorFontSize]}
                onValueChange={(v) => setEditorFontSize(v[0])}
                className="h-1.5"
              />
            </div>
          </div>

          {/* Syntax Highlighted Editor */}
          <div className="flex-1 flex flex-col gap-1.5 min-h-0">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Code</Label>
              <span className="text-[10px] text-muted-foreground font-mono uppercase px-1.5 py-0.5 rounded bg-muted">
                {currentSlide.language}
              </span>
            </div>
            <div className="relative flex-1 rounded-md border bg-muted/10 overflow-hidden shadow-inner">
              {/* Line Numbers */}
              {showLineNumbers && (
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-muted/30 border-r text-right pr-2 pt-3 text-xs font-mono text-muted-foreground select-none overflow-hidden">
                  {currentSlide.code.split('\n').map((_, i) => (
                    <div key={i} style={{ lineHeight: '1.6' }}>{i + 1}</div>
                  ))}
                </div>
              )}
              
              {/* Syntax Highlighted Display */}
              <pre
                ref={preRef}
                className={cn(
                  "absolute inset-0 h-full w-full overflow-auto pointer-events-none",
                  "p-3 font-mono leading-relaxed",
                  "whitespace-pre-wrap break-words",
                  showLineNumbers && "pl-14"
                )}
                style={{
                  fontSize: `${editorFontSize}px`,
                  lineHeight: '1.6',
                }}
                dangerouslySetInnerHTML={{ __html: highlightedCode || '&nbsp;' }}
              />
              
              {/* Transparent Textarea for Editing */}
              <textarea
                ref={textareaRef}
                onScroll={handleScroll}
                className={cn(
                  "absolute inset-0 h-full w-full resize-none",
                  "bg-transparent p-3 font-mono leading-relaxed outline-none",
                  "text-transparent caret-primary selection:bg-primary/20",
                  "whitespace-pre-wrap break-words",
                  "scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent",
                  showLineNumbers && "pl-14"
                )}
                style={{
                  fontSize: `${editorFontSize}px`,
                  lineHeight: '1.6',
                  caretColor: 'hsl(var(--primary))',
                }}
                value={currentSlide.code}
                onChange={(e) => updateSlide(currentSlide.id, { code: e.target.value })}
                spellCheck={false}
                placeholder="// Start typing your code..."
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 p-3 gap-4 flex flex-col data-[state=inactive]:hidden overflow-y-auto">
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-semibold">Appearance</Label>
              </div>
              
              <div className="space-y-2.5">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Theme</Label>
                  <select
                    className="flex h-8 w-full rounded-md border border-input bg-background/50 px-2.5 py-1 text-xs shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as ThemeName)}
                  >
                    <option value="dark-plus">Dark Plus</option>
                    <option value="dracula">Dracula</option>
                    <option value="github-dark">GitHub Dark</option>
                    <option value="github-light">GitHub Light</option>
                    <option value="nord">Nord</option>
                    <option value="poimandres">Poimandres</option>
                    <option value="min-light">Min Light</option>
                    <option value="min-dark">Min Dark</option>
                    <option value="monokai">Monokai</option>
                    <option value="solarized-dark">Solarized Dark</option>
                    <option value="solarized-light">Solarized Light</option>
                    <option value="andromeeda">Andromeeda</option>
                    <option value="aurora-x">Aurora X</option>
                    <option value="catppuccin-latte">Catppuccin Latte</option>
                    <option value="catppuccin-mocha">Catppuccin Mocha</option>
                    <option value="night-owl">Night Owl</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Language</Label>
                  <select
                    className="flex h-8 w-full rounded-md border border-input bg-background/50 px-2.5 py-1 text-xs shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    value={currentSlide.language}
                    onChange={(e) => updateSlide(currentSlide.id, { language: e.target.value })}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="tsx">React (TSX)</option>
                    <option value="css">CSS</option>
                    <option value="html">HTML</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="php">PHP</option>
                    <option value="json">JSON</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Preview Font Size</Label>
                    <span className="text-[10px] text-muted-foreground font-mono">{fontSize}px</span>
                  </div>
                  <Slider
                    min={12}
                    max={32}
                    step={2}
                    value={[fontSize]}
                    onValueChange={(v) => setFontSize(v[0] as any)}
                    className="h-1.5"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Preview Line Height</Label>
                    <span className="text-[10px] text-muted-foreground font-mono">{lineHeight}</span>
                  </div>
                  <Slider
                    min={1.0}
                    max={3.0}
                    step={0.1}
                    value={[lineHeight]}
                    onValueChange={(v) => setLineHeight(v[0])}
                    className="h-1.5"
                  />
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t">
                  <Label htmlFor="lineNumbers" className="text-xs">Line Numbers</Label>
                  <Switch
                    id="lineNumbers"
                    checked={showLineNumbers}
                    onCheckedChange={setShowLineNumbers}
                    className="scale-75"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs font-semibold">Animation</Label>
              </div>
              
              <div className="space-y-2.5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="useGlobalTrans" className="text-xs">Global Transition</Label>
                    <Switch
                      id="useGlobalTrans"
                      checked={useGlobalTransition}
                      onCheckedChange={setUseGlobalTransition}
                      className="scale-75"
                    />
                  </div>
                  {useGlobalTransition && (
                    <div className="space-y-1 pl-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Duration</span>
                        <span className="font-mono">{globalTransitionDuration}ms</span>
                      </div>
                      <Slider
                        value={[globalTransitionDuration]}
                        max={3000}
                        step={50}
                        onValueChange={(v) => setGlobalTransitionDuration(v[0])}
                        className="h-1.5"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="useGlobalStagger" className="text-xs">Global Stagger</Label>
                    <Switch
                      id="useGlobalStagger"
                      checked={useGlobalStagger}
                      onCheckedChange={setUseGlobalStagger}
                      className="scale-75"
                    />
                  </div>
                  {useGlobalStagger && (
                    <div className="space-y-1 pl-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Delay</span>
                        <span className="font-mono">{globalStagger}ms</span>
                      </div>
                      <Slider
                        value={[globalStagger]}
                        max={100}
                        step={1}
                        onValueChange={(v) => setGlobalStagger(v[0])}
                        className="h-1.5"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs font-semibold">Playback</Label>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Label className="text-[10px] text-muted-foreground">Duration</Label>
                  <span className="text-[10px] text-muted-foreground font-mono">{currentSlide.duration / 1000}s</span>
                </div>
                <Slider
                  defaultValue={[currentSlide.duration]}
                  min={500}
                  max={10000}
                  step={500}
                  onValueChange={(v) => updateSlide(currentSlide.id, { duration: v[0] })}
                  className="h-1.5"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

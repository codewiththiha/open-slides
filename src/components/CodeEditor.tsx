/**
 * @file CodeEditor.tsx
 * @description The settings and code input panel for the selected slide.
 * @offers
 * - Raw code editing for individual slides.
 * - Tabbed interface for Code editing and Global Settings.
 * - Controls for animation (transition, stagger), appearance (theme, font), and playback.
 * @flow
 * Changes made in this panel are directly applied to the store, 
 * which in turn updates the Sidebar thumbnails and the SlidePreview.
 */
import { useStore } from '../store/useStore';

import { cn } from '../lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent, Label, Slider, Switch } from './ui/all';
import type { ThemeName } from '../types';

export function CodeEditor() {
  const { 
    slides, 
    currentSlideId, 
    updateSlide, 
    theme, 
    setTheme, 
    showLineNumbers, 
    setShowLineNumbers, 
    fontSize, 
    setFontSize,
    lineHeight,
    setLineHeight,
    useGlobalTransition, setUseGlobalTransition,
    globalTransitionDuration, setGlobalTransitionDuration,
    useGlobalStagger, setUseGlobalStagger,
    globalStagger, setGlobalStagger
  } = useStore();
  const currentSlide = slides.find((s) => s.id === currentSlideId);

  if (!currentSlide) return null;

  return (
    <div className="flex h-full flex-col border-l bg-card">
      <Tabs defaultValue="code" className="flex h-full flex-col">
        <div className="border-b px-4 py-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="code"> Code</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="code" className="flex-1 flex flex-col p-4 gap-6 data-[state=inactive]:hidden">
          {/* Slide Settings */}


          <div className="space-y-4">
             <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className={useGlobalTransition ? "text-muted-foreground/50" : ""}>Transition Duration (ms)</Label>
                  <span className="text-xs text-muted-foreground">
                    {useGlobalTransition ? "Global" : `${currentSlide.transitionDuration}ms`}
                  </span>
                </div>
                <Slider 
                  defaultValue={[currentSlide.transitionDuration]} 
                  max={2000} 
                  step={50}
                  disabled={useGlobalTransition}
                  className={useGlobalTransition ? "opacity-50" : ""}
                  onValueChange={(v) => updateSlide(currentSlide.id, { transitionDuration: v[0] })}
                />
             </div>
             
             <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className={useGlobalStagger ? "text-muted-foreground/50" : ""}>Stagger Delay (ms)</Label>
                  <span className="text-xs text-muted-foreground">
                     {useGlobalStagger ? "Global" : `${currentSlide.stagger}ms`}
                  </span>
                </div>
                <Slider 
                  defaultValue={[currentSlide.stagger]} 
                  max={100} 
                  step={1}
                  disabled={useGlobalStagger}
                  className={useGlobalStagger ? "opacity-50" : ""}
                  onValueChange={(v) => updateSlide(currentSlide.id, { stagger: v[0] })}
                />
             </div>
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col gap-2 min-h-0">
             <Label>Code Editor</Label>
             <div className="relative flex-1 rounded-md border bg-muted/30 shadow-inner overflow-hidden">
                <textarea
                  className={cn(
                    "absolute inset-0 h-full w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed outline-none",
                    "text-foreground selection:bg-primary/20 placeholder:text-muted-foreground/50",
                    "scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
                  )}
                  value={currentSlide.code}
                  onChange={(e) => updateSlide(currentSlide.id, { code: e.target.value })}
                  spellCheck={false}
                  placeholder="// Start typing your code..."
                />
             </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 p-4 gap-6 flex flex-col data-[state=inactive]:hidden">
           <div className="space-y-4">
             <div className="space-y-2">
               <Label>Appearance</Label>
               <div className="grid grid-cols-1 gap-4">
                 <div className="space-y-2">
                    <Label className="text-xs font-normal text-muted-foreground">Theme</Label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
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

                 <div className="space-y-2">
                    <Label className="text-xs font-normal text-muted-foreground">Language</Label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
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

                 <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-normal text-muted-foreground">Font Size (px)</Label>
                      <span className="text-xs text-muted-foreground">{fontSize}px</span>
                    </div>
                    <Slider 
                      id="fontSize" 
                      min={12} 
                      max={32} 
                      step={2}
                      value={[fontSize]} 
                      onValueChange={(v) => setFontSize(v[0] as any)}
                    />
                 </div>
                  
                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                       <Label className="text-xs font-normal text-muted-foreground">Line Height</Label>
                       <span className="text-xs text-muted-foreground">{lineHeight}</span>
                     </div>
                     <Slider 
                       id="lineHeight" 
                       min={1.0} 
                       max={3.0} 
                       step={0.1}
                       value={[lineHeight]} 
                       onValueChange={(v) => setLineHeight(v[0])}
                     />
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                      <Label>Global Animation Settings</Label>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="useGlobalTrans" className="text-xs font-normal text-muted-foreground">Global Transition Duration</Label>
                            <Switch 
                                id="useGlobalTrans" 
                                checked={useGlobalTransition} 
                                onCheckedChange={setUseGlobalTransition} 
                            />
                        </div>
                        {useGlobalTransition && (
                            <div className="pt-2">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Duration</span>
                                    <span>{globalTransitionDuration}ms</span>
                                </div>
                                <Slider 
                                    value={[globalTransitionDuration]} 
                                    max={3000} 
                                    step={50}
                                    onValueChange={(v) => setGlobalTransitionDuration(v[0])}
                                />
                            </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="useGlobalStagger" className="text-xs font-normal text-muted-foreground">Global Stagger</Label>
                            <Switch 
                                id="useGlobalStagger" 
                                checked={useGlobalStagger} 
                                onCheckedChange={setUseGlobalStagger} 
                            />
                        </div>
                        {useGlobalStagger && (
                            <div className="pt-2">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Stagger Delay</span>
                                    <span>{globalStagger}ms</span>
                                </div>
                                <Slider 
                                    value={[globalStagger]} 
                                    max={100} 
                                    step={1}
                                    onValueChange={(v) => setGlobalStagger(v[0])}
                                />
                            </div>
                        )}
                      </div>
                  </div>

                 <div className="flex items-center justify-between pt-2 border-t">
                    <Label htmlFor="lineNumbers" className="text-xs font-normal text-muted-foreground">Line Numbers</Label>
                    <Switch 
                      id="lineNumbers" 
                      checked={showLineNumbers}
                      onCheckedChange={setShowLineNumbers}
                    />
                 </div>
               </div>
             </div>

             <div className="space-y-2">
               <Label>Playback</Label>
               <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs font-normal text-muted-foreground">Slide Duration (seconds)</Label>
                    <span className="text-xs text-muted-foreground">{currentSlide.duration / 1000}s</span>
                  </div>
                  <Slider 
                    defaultValue={[currentSlide.duration]} 
                    min={500}
                    max={10000} 
                    step={500}
                    onValueChange={(v) => updateSlide(currentSlide.id, { duration: v[0] })}
                  />
               </div>
             </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

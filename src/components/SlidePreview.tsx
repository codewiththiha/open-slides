/**
 * @file SlidePreview.tsx
 * @description The live preview engine for the current slide.
 * @offers
 * - Shiki-powered syntax highlighting with "Magic Move" transitions.
 * - Dynamic theme and font scaling (adaptive for editor vs. presentation mode).
 * - Real-time feedback as code is edited.
 * @flow
 * This component listens to the current slide's code and settings,
 * using `shiki-magic-move` to animate transitions when the slide or code changes.
 */
import { ShikiMagicMove } from 'shiki-magic-move/react';

import { useStore } from '../store/useStore';
import { useEffect, useState } from 'react';
import { createHighlighter, type Highlighter } from 'shiki';
import 'shiki-magic-move/dist/style.css';
import { cn } from '../lib/utils';
import { DYNAMIC_LANGUAGE, SUPPORTED_LANGUAGES } from '../types';

export function SlidePreview(props: { isPresenting?: boolean }) {
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
    globalStagger
  } = useStore();
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);

  const currentSlide = slides.find((s) => s.id === currentSlideId) || slides[0];
  const isDynamicMode = slides[0]?.language === DYNAMIC_LANGUAGE;

  useEffect(() => {
    async function loadHighlighter() {
      const h = await createHighlighter({
        themes: [
          'dark-plus', 'dracula', 'github-dark', 'github-light', 'nord', 'poimandres',
          'min-light', 'min-dark', 'monokai', 'solarized-dark', 'solarized-light',
          'andromeeda', 'aurora-x', 'catppuccin-latte', 'catppuccin-mocha', 'night-owl'
        ],
        langs: SUPPORTED_LANGUAGES.map(lang => lang.value),
      });
      setHighlighter(h);
    }
    loadHighlighter();
  }, []);

  if (!highlighter || !currentSlide) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        Loading magic...
      </div>
    );
  }

  // In dynamic mode, use each slide's own language; otherwise use first slide's language
  // If language is "dynamic" itself, fallback to typescript for highlighting
  const effectiveLanguage = isDynamicMode 
    ? (currentSlide.language === DYNAMIC_LANGUAGE ? 'typescript' : currentSlide.language)
    : (slides[0]?.language || 'typescript');

  // Map theme names to approximate background colors for the "slide" look
  // This ensures the slide looks correct regardless of correct UI mode
  const getThemeBg = (t: string) => {
    switch (t) {
      case 'github-light': return '#ffffff';
      case 'dracula': return '#282a36';
      case 'github-dark': return '#24292e';
      case 'nord': return '#2e3440';
      case 'poimandres': return '#1b1e28';
      case 'min-light': return '#ffffff';
      case 'min-dark': return '#1f1f1f';
      case 'monokai': return '#272822';
      case 'solarized-dark': return '#002b36';
      case 'solarized-light': return '#fdf6e3';
      case 'andromeeda': return '#23262e';
      case 'aurora-x': return '#07090f';
      case 'catppuccin-latte': return '#eff1f5';
      case 'catppuccin-mocha': return '#1e1e2e';
      case 'night-owl': return '#011627';
      case 'dark-plus': default: return '#1e1e1e';
    }
  };

  const slideBg = getThemeBg(theme);

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl shadow-2xl transition-colors duration-500"
      style={{ backgroundColor: slideBg }}
    >
      <div className={cn(
        "relative z-10 w-full flex items-center justify-center",
        // If presenting, use much larger padding/container
        props.isPresenting ? "p-32" : "p-12"
      )}>
        {/* Force Shiki to be transparent so it blends with our container bg */}
        <style dangerouslySetInnerHTML={{__html: `
          .shiki-magic-move-container,
          .shiki-magic-move-container pre,
          .shiki-magic-move-container code {
            background-color: transparent !important;
            white-space: pre !important;
            display: block !important;
            line-height: var(--line-height) !important;
            font-size: var(--font-size) !important;
          }
        `}} />

        <div style={{
          width: '100%',
          // @ts-ignore
          '--line-height': lineHeight.toString(),
          // @ts-ignore
          // Presentation mode uses 1.15x font size for minimal zoom effect
          // Keeps relative size - small preview = small presentation, just slightly larger
          '--font-size': props.isPresenting ? `${(fontSize * 1.15).toFixed(1)}px` : `${fontSize}px`
        }}>
          <ShikiMagicMove
            key={`${theme}-${showLineNumbers}-${fontSize}-${effectiveLanguage}`} // Force re-render on theme, lineNumbers, fontSize, or language change
            lang={effectiveLanguage}
            theme={theme}
            highlighter={highlighter}
            code={currentSlide.code}
            options={{
              duration: useGlobalTransition ? globalTransitionDuration : currentSlide.transitionDuration,
              stagger: useGlobalStagger ? globalStagger : currentSlide.stagger,
              lineNumbers: showLineNumbers,
            }}
            className={cn(
              "shiki-magic-move-container font-medium tracking-wide font-mono"
            )}
          />
        </div>
      </div>
    </div>
  );
}

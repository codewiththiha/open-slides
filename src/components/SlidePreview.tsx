/**
 * @file SlidePreview.tsx
 * @description The live preview engine for the current slide.
 */
import { ShikiMagicMove } from 'shiki-magic-move/react';

import { useStore } from '../store/useStore';
import { useEffect, useState } from 'react';
import { createHighlighter, type Highlighter } from 'shiki';
import 'shiki-magic-move/dist/style.css';
import { cn } from '../lib/utils';
import { DYNAMIC_LANGUAGE, SUPPORTED_LANGUAGES } from '../types';
import { merustmarLanguage } from '@/lib/merustmar-language';
import { highlightMerustmarCode } from '@/lib/merustmar-highlight';

const LIGHT_THEMES = new Set([
  'github-light', 'min-light', 'solarized-light', 'catppuccin-latte'
]);

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
      try {
        const builtInLangs = SUPPORTED_LANGUAGES
          .filter(lang => lang.value !== 'merustmar')
          .map(lang => lang.value);

        const h = await createHighlighter({
          themes: [
            'dark-plus', 'dracula', 'github-dark', 'github-light', 'nord', 'poimandres',
            'min-light', 'min-dark', 'monokai', 'solarized-dark', 'solarized-light',
            'andromeeda', 'aurora-x', 'catppuccin-latte', 'catppuccin-mocha', 'night-owl'
          ],
          langs: builtInLangs,
        });

        // Load merustmar separately
        try {
          await h.loadLanguage(merustmarLanguage);
          const loaded = h.getLoadedLanguages();
          console.log('[OpenSlides Preview] ✅ merustmar loaded:', loaded.includes('merustmar'));
        } catch (loadErr) {
          console.error('[OpenSlides Preview] ❌ merustmar loadLanguage threw:', loadErr);
        }

        setHighlighter(h);
      } catch (err) {
        console.error('[OpenSlides Preview] ❌ createHighlighter failed:', err);
      }
    }
    loadHighlighter();
  }, []);

  if (!currentSlide) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        Loading magic...
      </div>
    );
  }

  const effectiveLanguage = isDynamicMode
    ? (currentSlide.language === DYNAMIC_LANGUAGE ? 'typescript' : currentSlide.language)
    : (slides[0]?.language || 'typescript');

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
  const isDarkBg = !LIGHT_THEMES.has(theme);

  // Check if Shiki can handle this language
  const canUseShiki = highlighter && highlighter.getLoadedLanguages().includes(effectiveLanguage);

  // --- Merustmar custom fallback (when Shiki can't load the grammar) ---
  if (effectiveLanguage === 'merustmar' && !canUseShiki) {
    const highlightedHtml = highlightMerustmarCode(currentSlide.code, isDarkBg);

    return (
      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl shadow-2xl transition-colors duration-500"
        style={{ backgroundColor: slideBg }}
      >
        <div className={cn(
          "relative z-10 w-full flex items-center justify-center",
          props.isPresenting ? "p-32" : "p-12"
        )}>
          <div style={{
            width: '100%',
            lineHeight: lineHeight.toString(),
            fontSize: props.isPresenting ? `${(fontSize * 1.15).toFixed(1)}px` : `${fontSize}px`
          }}>
            <pre
              className="font-medium tracking-wide font-mono"
              style={{ backgroundColor: 'transparent', margin: 0, whiteSpace: 'pre' }}
              dangerouslySetInnerHTML={{ __html: highlightedHtml || '&nbsp;' }}
            />
          </div>
        </div>
      </div>
    );
  }

  // --- ShikiMagicMove for all languages Shiki supports (including merustmar if loaded) ---
  if (!highlighter || !canUseShiki) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        Loading magic...
      </div>
    );
  }

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl shadow-2xl transition-colors duration-500"
      style={{ backgroundColor: slideBg }}
    >
      <div className={cn(
        "relative z-10 w-full flex items-center justify-center",
        props.isPresenting ? "p-32" : "p-12"
      )}>
        <style dangerouslySetInnerHTML={{
          __html: `
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
          '--font-size': props.isPresenting ? `${(fontSize * 1.15).toFixed(1)}px` : `${fontSize}px`
        }}>
          <ShikiMagicMove
            key={`${theme}-${showLineNumbers}-${fontSize}-${effectiveLanguage}`}
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

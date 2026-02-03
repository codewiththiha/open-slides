/**
 * @file RemotionVideo.tsx
 * @description Defines the Remotion composition for generating high-quality code animations.
 * @offers
 * - Shiki-powered syntax highlighting for video.
 * - Smooth "Magic Move" transitions between code blocks.
 * - Dynamic frame-based rendering for video export.
 * @flow
 * This component maps the presentation state (slides, themes, settings) into a 
 * time-sequenced animation that can be rendered to MP4.
 */
import { AbsoluteFill, useVideoConfig, useCurrentFrame } from 'remotion';

import { ShikiMagicMove } from 'shiki-magic-move/react';
import { useEffect, useState } from 'react';
import { createHighlighter, type Highlighter } from 'shiki';
import type { Slide } from '../types';

interface MyVideoProps {
  slides: Slide[];
  theme: string;
  showLineNumbers: boolean;
  fontSize: number;
  lineHeight: number;
  useGlobalTransition: boolean;
  globalTransitionDuration: number;
  useGlobalStagger: boolean;
  globalStagger: number;
}

export const RemotionVideo: React.FC<MyVideoProps> = ({ 
    slides, theme, showLineNumbers, fontSize, lineHeight,
    useGlobalTransition, globalTransitionDuration, useGlobalStagger, globalStagger
}) => {
  const config = useVideoConfig(); // useVideoConfig might be partially empty in some Player contexts
  const fps = config ? config.fps : 30; // Default to 30 if undefined
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);

  useEffect(() => {
    async function load() {
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
    load();
  }, []); // Load once

  if (!highlighter) return <AbsoluteFill className="bg-[#1e1e1e] flex items-center justify-center text-muted-foreground">Loading...</AbsoluteFill>;

  return (
      <MagicMoveSequence 
        slides={slides} 
        theme={theme} 
        highlighter={highlighter}
        fps={fps || 30}
        showLineNumbers={showLineNumbers}
        fontSize={fontSize}
        lineHeight={lineHeight}
        useGlobalTransition={useGlobalTransition}
        globalTransitionDuration={globalTransitionDuration}
        useGlobalStagger={useGlobalStagger}
        globalStagger={globalStagger}
      />
  );
};

function MagicMoveSequence({ 
  slides, 
  theme, 
  highlighter,
  fps,
  showLineNumbers,
  fontSize,
  lineHeight,
  useGlobalTransition,
  globalTransitionDuration,
  useGlobalStagger,
  globalStagger
}: { 
  slides: Slide[], 
  theme: string, 
  highlighter: Highlighter,
  fps: number,
  showLineNumbers: boolean,
  fontSize: number,
  lineHeight: number,
  useGlobalTransition: boolean,
  globalTransitionDuration: number,
  useGlobalStagger: boolean,
  globalStagger: number
}) {
  const frame = useCurrentFrame();

  // Calculate active slide based on variable durations
  let activeSlide = slides.length > 0 ? slides[slides.length - 1] : null; // Default to last slide (for end of video)
  let currentStartFrame = 0;

  for (const slide of slides) {
    const durationMs = slide.duration || 3000;
    const slideFrames = (durationMs / 1000) * fps;
    const endFrame = currentStartFrame + slideFrames;

    // Check if current frame falls within this slide's time window
    if (frame >= currentStartFrame && frame < endFrame) {
      activeSlide = slide;
      break;
    }
    
    currentStartFrame += slideFrames;
  }

  // Get theme background for container
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
  const bg = getThemeBg(theme);

  if (!activeSlide) return <AbsoluteFill style={{ backgroundColor: bg }} />;

  return (
    <AbsoluteFill 
      style={{ backgroundColor: bg }}
      className="items-center justify-center"
    >
      <div className="relative w-full flex items-center justify-center p-32">
         {/* Force Shiki transparency to blend with container */}
          <style dangerouslySetInnerHTML={{__html: `
           .shiki-magic-move-container,
           .shiki-magic-move-container pre,
           .shiki-magic-move-container code { 
             background-color: transparent !important; 
             white-space: pre !important; 
             display: block !important;
             line-height: var(--line-height) !important;
           }
        `}} />

        <div style={{ 
          fontSize: fontSize ? `${fontSize * 2}px` : '40px', 
          width: '100%',
          // @ts-ignore
          '--line-height': lineHeight.toString()
        }}>
          <ShikiMagicMove
            lang={activeSlide.language}
            theme={theme}
            highlighter={highlighter}
            code={activeSlide.code}
            options={{ 
              duration: useGlobalTransition ? globalTransitionDuration : (activeSlide.transitionDuration || 800), 
              stagger: useGlobalStagger ? globalStagger : (activeSlide.stagger || 0.3), 
              lineNumbers: showLineNumbers || false
            }}
            className="shiki-magic-move-container font-medium tracking-wide font-mono"
          />
        </div>
      </div>
    </AbsoluteFill>
  );
}

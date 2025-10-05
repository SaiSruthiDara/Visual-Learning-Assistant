import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Slide } from '../types';
import { TextSlide } from './visualizations/TextSlide';
import { BarChartViz } from './visualizations/BarChartViz';
import { LineChartViz } from './visualizations/LineChartViz';
import { FlowchartViz } from './visualizations/FlowchartViz';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { ReplayIcon } from './icons/ReplayIcon';

interface VideoPlayerProps {
  slides: Slide[];
  onReset: () => void;
}

const TRANSITION_DURATION = 500; // ms

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ slides, onReset }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [outgoingSlideIndex, setOutgoingSlideIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const currentSlide = slides[currentSlideIndex];
  const outgoingSlide = outgoingSlideIndex !== null ? slides[outgoingSlideIndex] : null;

  const changeSlide = useCallback((newIndex: number) => {
    if (newIndex === currentSlideIndex) return;

    setOutgoingSlideIndex(currentSlideIndex);
    setCurrentSlideIndex(newIndex);
    setIsFinished(newIndex === slides.length - 1);

    setTimeout(() => {
      setOutgoingSlideIndex(null);
    }, TRANSITION_DURATION);
  }, [currentSlideIndex, slides.length]);

  const speak = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      if (currentSlideIndex < slides.length - 1) {
        changeSlide(currentSlideIndex + 1);
      } else {
        setIsPlaying(false);
        setIsFinished(true);
      }
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [currentSlideIndex, slides.length, changeSlide]);

  useEffect(() => {
    // Speak only when not transitioning and playing
    if (isPlaying && !isFinished && outgoingSlideIndex === null) {
      speak(currentSlide.narration);
    } else {
      window.speechSynthesis.cancel();
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentSlideIndex, isPlaying, isFinished, speak, currentSlide.narration, outgoingSlideIndex]);

  const handlePlayPause = () => {
    if (isFinished) {
      handleReplay();
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleReplay = () => {
    if (outgoingSlideIndex !== null) return; // Prevent replay during transition
    changeSlide(0);
    setIsFinished(false);
    setIsPlaying(true);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || outgoingSlideIndex !== null) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newIndex = Math.floor((clickX / width) * slides.length);
    const clampedIndex = Math.max(0, Math.min(slides.length - 1, newIndex));
    
    setIsPlaying(true); // Resume playing from new spot
    setIsFinished(false);
    changeSlide(clampedIndex);
  }
  
  const renderSlide = (slide: Slide) => {
    switch (slide.type) {
      case 'TEXT': return <TextSlide slide={slide} />;
      case 'BAR_CHART': return <BarChartViz slide={slide} />;
      case 'LINE_CHART': return <LineChartViz slide={slide} />;
      case 'FLOWCHART': return <FlowchartViz slide={slide} />;
      default: return null;
    }
  };

  const progress = ((currentSlideIndex + 1) / slides.length) * 100;

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg mb-4">
        {/* Current Slide */}
        <div key={currentSlideIndex} className="absolute inset-0 animate-fade-in-long">
          {renderSlide(currentSlide)}
        </div>
        {/* Outgoing Slide */}
        {outgoingSlide && (
          <div key={outgoingSlideIndex} className="absolute inset-0 animate-fade-out-long">
            {renderSlide(outgoingSlide)}
          </div>
        )}
      </div>
      
      <div 
        ref={progressRef}
        onClick={handleProgressClick}
        className="w-full bg-gray-700 rounded-full h-2.5 mb-4 cursor-pointer"
        role="progressbar"
        aria-valuenow={currentSlideIndex + 1}
        aria-valuemin={1}
        aria-valuemax={slides.length}
        aria-label="Video Progress"
      >
        <div className="bg-purple-500 h-2.5 rounded-full pointer-events-none" style={{ width: `${progress}%`, transition: 'width 0.3s ease-in-out' }}></div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <button onClick={handlePlayPause} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors">
                {isPlaying && !isFinished ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button onClick={handleReplay} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors">
                <ReplayIcon />
            </button>
            <p className="text-sm text-gray-400">
                Slide {currentSlideIndex + 1} of {slides.length}
            </p>
        </div>
        <button onClick={onReset} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Generate New Video
        </button>
      </div>

       <div className="mt-4 p-4 bg-gray-700 rounded-lg max-h-28 overflow-y-auto">
        <h3 className="font-semibold text-gray-200 mb-1">Narration:</h3>
        <p className="text-gray-300 text-sm">{currentSlide.narration}</p>
      </div>
    </div>
  );
};
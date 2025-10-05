import React from 'react';
import type { TextSlideData } from '../../types';

interface TextSlideProps {
  slide: TextSlideData;
}

export const TextSlide: React.FC<TextSlideProps> = ({ slide }) => {
  const contentToListItems = (content: string) => {
    return (content || '')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('- ') || line.length > 0)
      .map((line, index) => (
        <li key={index} className="mb-2 text-lg lg:text-xl text-gray-300">
          {line.replace(/^- /, '')}
        </li>
      ));
  };
  
  return (
    <div className="w-full h-full p-8 flex flex-col justify-center animate-fade-in">
      <h2 className="text-3xl lg:text-4xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">{slide.title}</h2>
      <ul className="list-disc list-inside space-y-4">
        {contentToListItems(slide.content)}
      </ul>
    </div>
  );
};
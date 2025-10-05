import React, { useState, useCallback } from 'react';
import { InputForm } from './components/InputForm';
import { VideoPlayer } from './components/VideoPlayer';
import { LoadingSpinner } from './components/LoadingSpinner';
import type { Slide } from './types';
import { generateVideoScript } from './services/geminiService';
import { extractTextFromPDF } from './services/pdfService';

const App: React.FC = () => {
  const [videoScript, setVideoScript] = useState<Slide[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [videoKey, setVideoKey] = useState<number>(0);

  const handleGenerate = useCallback(async (topic: string, pdfFile: File | null) => {
    setIsLoading(true);
    setError(null);
    setVideoScript(null);

    try {
      let content = topic;
      if (pdfFile) {
        content = await extractTextFromPDF(pdfFile);
      }

      if (!content.trim()) {
        setError('Please provide a topic or a PDF with text content.');
        setIsLoading(false);
        return;
      }
      
      const script = await generateVideoScript(content);
      setVideoScript(script);
      setVideoKey(prevKey => prevKey + 1); // Reset VideoPlayer state
    } catch (e) {
      console.error(e);
      setError('Failed to generate video script. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setVideoScript(null);
    setError(null);
    setIsLoading(false);
    setVideoKey(prevKey => prevKey + 1);
  }, []);

  const hasVideoScript = videoScript && videoScript.length > 0;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            AI Educational Video Generator
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Turn any topic or PDF into a dynamic video presentation with AI-powered visuals and narration.
          </p>
        </header>

        <main className="bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-500">
          {!videoScript && !isLoading && (
            <InputForm onGenerate={handleGenerate} />
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-64">
              <LoadingSpinner />
              <p className="mt-4 text-lg text-gray-300">Generating your video... this may take a moment.</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-red-400 text-lg">{error}</p>
                <button
                    onClick={handleReset}
                    className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
                >
                    Try Again
                </button>
            </div>
           )}

          {hasVideoScript && !isLoading && (
            <VideoPlayer key={videoKey} slides={videoScript!} onReset={handleReset} />
          )}
          
          {videoScript && videoScript.length === 0 && !isLoading && (
             <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-yellow-400 text-lg">The AI could not generate a video from the provided content. Please try a different topic or document.</p>
                <button
                    onClick={handleReset}
                    className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
                >
                    Try Again
                </button>
            </div>
          )}
        </main>
        <footer className="text-center mt-8 text-gray-500">
          <p>Powered by Gemini and React</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
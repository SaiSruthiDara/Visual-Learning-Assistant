
import React, { useState, useCallback } from 'react';

interface InputFormProps {
  onGenerate: (topic: string, pdfFile: File | null) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ onGenerate }) => {
  const [topic, setTopic] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setPdfFile(file);
        setFileName(file.name);
        setTopic(''); // Clear topic when a file is selected
      } else {
        alert('Please select a valid PDF file.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic && !pdfFile) {
      alert('Please enter a topic or upload a PDF file.');
      return;
    }
    onGenerate(topic, pdfFile);
  };

  const handleClearFile = useCallback(() => {
    setPdfFile(null);
    setFileName('');
    // Need to clear the input value as well for re-selection of the same file
    const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-2">
          Enter a Topic
        </label>
        <textarea
          id="topic"
          rows={4}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition disabled:opacity-50"
          placeholder="e.g., 'Explain the process of photosynthesis'"
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value)
            if(pdfFile) handleClearFile();
          }}
          disabled={!!pdfFile}
        />
      </div>

      <div className="relative flex items-center justify-center">
        <div className="flex-grow border-t border-gray-600"></div>
        <span className="flex-shrink mx-4 text-gray-400">OR</span>
        <div className="flex-grow border-t border-gray-600"></div>
      </div>

      <div>
        <label htmlFor="pdf-upload" className="block text-sm font-medium text-gray-300 mb-2">
          Upload a PDF
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-gray-400">
              <label htmlFor="pdf-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-purple-400 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-purple-500">
                <span>Upload a file</span>
                <input id="pdf-upload" name="pdf-upload" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PDF up to 10MB</p>
          </div>
        </div>
        {fileName && (
          <div className="mt-3 flex items-center justify-between bg-gray-700 p-2 rounded-md">
            <p className="text-sm text-gray-300 truncate">{fileName}</p>
            <button type="button" onClick={handleClearFile} className="text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
      >
        Generate Video
      </button>
    </form>
  );
};

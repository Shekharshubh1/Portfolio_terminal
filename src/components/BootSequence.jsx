// src/components/BootSequence.jsx
import React, { useState, useCallback } from 'react';
import { useTypingEffect } from '../hooks/useTypingEffect';

const bootLines = [
  'Initializing virtual environment...',
  'Connecting to GitHub API... connection successful.',
  'Compiling modules... 100% complete.',
  'Starting UI... Welcome to my portfolio.',
];

const BootSequence = ({ onBootComplete }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const handleLineComplete = useCallback(() => {
    if (currentLineIndex < bootLines.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
    } else {
      setTimeout(onBootComplete, 200);
    }
  }, [currentLineIndex, bootLines.length, onBootComplete]);

  const displayedText = useTypingEffect(bootLines[currentLineIndex], 30, handleLineComplete);

  return (
    <div className="w-full h-full bg-[#0d1117] text-green-400 font-mono p-6 flex flex-col justify-center">
      {bootLines.slice(0, currentLineIndex).map((line, i) => (
        <div key={i}>
          <span className="text-blue-400 mr-2">✓</span>{line}
        </div>
      ))}
      <div>
        <span className="text-blue-400 mr-2">{'>'}</span>{displayedText}
        <span className="animate-ping">_</span>
      </div>
    </div>
  );
};

export default BootSequence;
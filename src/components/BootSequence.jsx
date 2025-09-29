import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTypingEffect } from '../hooks/useTypingEffect';

const bootLines = [
  'Initializing virtual environment...',
  'Connecting to GitHub API... connection successful.',
  'Starting UI... Welcome to my portfolio.',
];

const BootSequence = ({ onBootComplete }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  // Use Vite-friendly asset resolution so the audio file resolves correctly in dev/build
  // Load audio from the public directory using a root-relative path.
  const bootSound = useMemo(() => new Audio('/sounds/corrupt.mp3'), []);

  const glitchSound = useMemo(() => new Audio('/sounds/glitch.mp3'), []);

  useEffect(() => {
    // Configure audio defaults
    try {
      bootSound.volume = 0.6;
      bootSound.playbackRate = 1;
      bootSound.currentTime = 0;
      bootSound.preload = 'auto';
      glitchSound.preload = 'auto';
    } catch (e) {}

    // Attempt to play. If it fails, we know we need a user gesture.
    bootSound.play()
      .then(() => setAudioUnlocked(true)) // Autoplay worked
      .catch(() => setAudioUnlocked(false)); // Autoplay was blocked

    // Cleanup function to pause sounds if component unmounts early
    return () => {
      try { bootSound.pause(); } catch (e) {}
      try { glitchSound.pause(); } catch (e) {}
    };
  }, [bootSound, glitchSound]); // This effect runs only once on mount

  const handleUserGesture = useCallback(() => {
    if (audioUnlocked) return;
    // User interaction unlocks audio. Play the sound and update state.
    bootSound.play().catch(e => console.error("Failed to play boot sound on gesture:", e));
    // Ensure glitch sound is also unlocked for later
    glitchSound.play().then(() => glitchSound.pause()).catch(() => {});
    setAudioUnlocked(true);
  }, [audioUnlocked, bootSound, glitchSound]);

  const handleLineComplete = useCallback(() => {
    if (currentLineIndex < bootLines.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
    } else {
      // Stop the boot sound and call the completion handler
      bootSound.pause();
      setTimeout(onBootComplete, 250); // Short delay before transitioning
    }
  }, [currentLineIndex, onBootComplete, bootSound]);

  // Speed up typing by reducing the delay (default reduced in hook); still pass smaller per-call delay
  const displayedText = useTypingEffect(
    audioUnlocked ? bootLines[currentLineIndex] : '', // Only start typing after audio is ready
    15,
    handleLineComplete
  );

  return (
    <div className="w-full h-full bg-[#0d1117] text-green-400 font-mono p-6 flex flex-col justify-center relative" onClick={handleUserGesture}>
      {audioUnlocked ? (
        <>
          {bootLines.slice(0, currentLineIndex).map((line, i) => (
            <div key={i}>
              <span className="text-blue-400 mr-2">✓</span>{line}
            </div>
          ))}
          <div>
            <span className="text-blue-400 mr-2">{'>'}</span>{displayedText}
            <span className="animate-ping">_</span>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-400 animate-pulse cursor-pointer">
          [ Click to initialize system ]
        </div>
      )}
    </div>
  );
};

export default BootSequence;
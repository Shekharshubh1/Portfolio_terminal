import { useState, useEffect, useRef } from 'react';

/**
 * A React hook that displays text with a "typewriter" effect.
 * This improved version introduces variable speed for a more natural feel.
 * @param {string} text - The text to display.
 * @param {number} speed - The base speed in ms between characters.
 * @param {function} onComplete - A callback function to run when typing is finished.
 * @returns {string} The text displayed so far.
 */
export const useTypingEffect = (text, speed = 80, onComplete = () => {}) => {
  const [displayedText, setDisplayedText] = useState('');
  const animationFrameRef = useRef(null);
  const textRef = useRef(text);
  textRef.current = text; // Keep ref updated with the latest text to avoid stale closures

  useEffect(() => {
    if (!text) return;
    setDisplayedText(''); // Reset on text change
    
    let startTime = null;
    let progress = 0;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;

      // Calculate how many characters should be visible based on the base speed
      const expectedProgress = Math.floor(elapsedTime / speed);

      if (progress < expectedProgress && progress < textRef.current.length) {
        progress++;

        // --- Improvement: Add extra delay for punctuation ---
        // This makes the typing feel more natural and less robotic.
        const char = textRef.current.charAt(progress - 1);
        if ('.'.includes(char)) {
            // By resetting the start time, we create a pause before the next character appears.
            startTime = timestamp + 50 - (Math.random() * 20);
            
        }

        setDisplayedText(textRef.current.slice(0, progress));
      }
      
      if (progress < textRef.current.length) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup function to cancel the animation when the component unmounts or text changes
    return () => {
        if(animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    }
  }, [text, speed, onComplete]);

  return displayedText;
};

export default useTypingEffect;
import { useState, useEffect, useRef } from 'react';

/**
 * A React hook that displays text with a "typewriter" effect.
 * This improved version introduces variable speed for a more natural feel.
 * @param {string} text - The text to display.
 * @param {number} speed - The base speed in ms between characters.
 * @param {function} onComplete - A callback function to run when typing is finished.
 * @returns {string} The text displayed so far.
 */
export const useTypingEffect = (text, speed = 25, onComplete = () => {}) => {
  const [displayedText, setDisplayedText] = useState('');
  const timeoutRef = useRef(null);
  const textRef = useRef(text);
  textRef.current = text; // Keep ref updated with the latest text to avoid stale closures

  useEffect(() => {
    if (!text) return;
    setDisplayedText(''); // Reset on text change

    let currentIndex = 0;

    const typeCharacter = () => {
      if (currentIndex < textRef.current.length) {
        const char = textRef.current.charAt(currentIndex);
        setDisplayedText((prev) => prev + char);
        currentIndex++;

        // --- Improved Delay Logic ---
        let delay = speed;
        // Add a small, controlled pause for punctuation to keep rhythm but avoid long delays.
        if (',.?!'.includes(char)) {
          delay += 120; // Add a 120ms pause for punctuation
        }

        timeoutRef.current = setTimeout(typeCharacter, delay);
      } else {
        onComplete();
      }
    };

    // Start the typing effect
    timeoutRef.current = setTimeout(typeCharacter, speed);

    // Cleanup function to cancel the animation when the component unmounts or text changes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, onComplete]);

  return displayedText;
};

export default useTypingEffect;
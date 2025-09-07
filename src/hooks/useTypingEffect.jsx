// src/hooks/useTypingEffect.jsx
import { useState, useEffect, useRef } from 'react';

export const useTypingEffect = (text, speed = 50, onComplete = () => {}) => {
  const [displayedText, setDisplayedText] = useState('');
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!text) return;
    
    let startTime = null;
    let progress = 0;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;

      if (elapsedTime > progress * speed) {
        progress++;
        setDisplayedText(text.slice(0, progress));
      }
      
      if (progress < text.length) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [text, speed, onComplete]);

  return displayedText;
};
import React from 'react';
import useTypingEffect from '../../hooks/useTypingEffect'; // Ensure this path is correct
import Spinner from './Spinner';

/**
 * This component acts as a "router" for terminal output.
 * It receives an output object and decides HOW to render it based on the 'mode'.
 */
const OutputRenderer = ({ item }) => {
  // Base classes for consistent styling
  const baseClasses = "whitespace-pre-wrap font-mono text-sm leading-relaxed";

  // The switch statement is the core of the data-driven rendering
  switch (item.mode) {
    case 'instant':
      // Renders text immediately. Used for user commands, 'ls', and final results.
      return <pre className={`${baseClasses} ${item.color || 'text-gray-300'}`}>{item.content}</pre>;

    case 'typewriter':
      // --- FIX IS HERE ---
      // This mode uses the useTypingEffect hook to render text character-by-character.
      const typedText = useTypingEffect(item.content, item.speed || 20);
      return <pre className={`${baseClasses} ${item.color || 'text-gray-300'}`}>{typedText}</pre>;

    case 'spinner':
      // Shows a loading animation for async tasks like API calls.
      return <Spinner text={item.content} />;
    
    // A default case to handle any unexpected or simple text output gracefully.
    default:
      return <pre className={`${baseClasses} text-gray-300`}>{item.content}</pre>;
  }
};

export default OutputRenderer;
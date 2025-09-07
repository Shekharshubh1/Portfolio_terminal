import React from 'react';
import useTypingEffect from '../../hooks/useTypingEffect';
import Spinner from './Spinner';

const OutputRenderer = ({ item }) => {
  // Base classes for consistent styling
  const baseClasses = "whitespace-pre-wrap font-mono text-sm leading-relaxed";

  switch (item.mode) {
    case 'instant':
      // For instant output like 'ls' or the user's own command
      return <pre className={`${baseClasses} ${item.color || 'text-gray-300'}`}>{item.content}</pre>;

    case 'typewriter':
      // For character-by-character typing like 'help'
      const typedText = useTypingEffect(item.content, item.speed);
      return <pre className={`${baseClasses} ${item.color || 'text-gray-300'}`}>{typedText}</pre>;

    case 'spinner':
      // For showing a loading state
      return <Spinner text={item.content} />;
    
    // Default case handles any legacy or simple text output
    default:
      return <pre className={`${baseClasses} text-gray-300`}>{item.content}</pre>;
  }
};

export default OutputRenderer;
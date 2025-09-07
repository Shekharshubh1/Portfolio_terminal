// src/components/SyntaxHighlightedCode.jsx
import React from 'react';

const SyntaxHighlightedCode = ({ code, language }) => {
  if (!code) return null;

  if (language !== 'js') {
    return <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300 p-6">{code}</pre>;
  }

  const highlighted = code
    .replace(/\b(const|let|var)\b/g, '<span class="text-purple-400">$1</span>')
    .replace(/(\w+):/g, '<span class="text-blue-400">$1</span>:')
    .replace(/'([^']*)'/g, '<span class="text-yellow-300">\'$1\'</span>')
    .replace(/\b(null|true|false)\b/g, '<span class="text-red-400">$1</span>');
    
  return <pre className="whitespace-pre-wrap font-mono text-sm p-6" dangerouslySetInnerHTML={{ __html: highlighted }} />;
};

export default SyntaxHighlightedCode;
// src/components/terminal/OutputLine.jsx
import React from 'react';

const OutputLine = ({ item }) => {
  const baseClasses = "whitespace-pre-wrap font-mono text-sm leading-relaxed";
  
  switch (item.type) {
    case 'command': return <div className={`${baseClasses} text-green-400`}>{item.content}</div>;
    case 'error': return <div className={`${baseClasses} text-red-400`}>{item.content}</div>;
    case 'system': return <div className={`${baseClasses} text-blue-400`}>{item.content}</div>;
    case 'help': return <div className={`${baseClasses} text-yellow-300`}>{item.content}</div>;
    case 'projects': return <div className={`${baseClasses} text-purple-300`}>{item.content}</div>;
    default: return <div className={`${baseClasses} text-gray-300`}>{item.content}</div>;
  }
};

export default OutputLine;
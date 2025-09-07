import React, { useState, useEffect } from 'react';

const Spinner = ({ text = 'Processing...' }) => {
  const frames = ['|', '/', '-', '\\'];
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % frames.length);
    }, 100);
    return () => clearInterval(interval);
  }, [frames.length]);

  return (
    <div className="text-blue-400 whitespace-pre-wrap font-mono text-sm leading-relaxed">
      <span>{frames[frame]}</span> {text}
    </div>
  );
};

export default Spinner;

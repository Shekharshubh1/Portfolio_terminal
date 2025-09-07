import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchGitHubProjects } from '../../services/githubService';
import { GITHUB_USERNAME } from '../../data/appData';

/**
 * Custom hook for creating a typewriter effect.
 * @param {string} text The text to type out.
 * @param {number} speed The delay between characters in milliseconds.
 * @param {function} onComplete Callback to execute when typing is finished.
 * @returns {string} The currently displayed portion of the text.
 */
const useTypingEffect = (text, speed = 25, onComplete = () => {}) => {
  const [displayedText, setDisplayedText] = useState('');
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!text) {
      onCompleteRef.current();
      return;
    };
    
    setDisplayedText('');
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(intervalId);
        onCompleteRef.current();
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return displayedText;
};

/**
 * Renders a single line in the terminal, applying the typing effect.
 */
const TerminalLine = ({ item, onComplete }) => {
  const displayedText = useTypingEffect(item.content || '', 20, onComplete);
  const isTyping = displayedText !== item.content;

  return (
    <div className={`whitespace-pre-wrap font-mono text-sm leading-relaxed ${item.color || 'text-gray-300'}`}>
      {displayedText}
      {isTyping && <span className="inline-block w-2 h-4 bg-green-400 ml-1 animate-pulse" />}
    </div>
  );
};


/**
 * The main Terminal Controller component.
 */
const TerminalController = ({ files, fileContents, onOpenFile }) => {
  const [output, setOutput] = useState([]); // Stores completed output lines
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const commandQueue = useRef([]);
  const [activeLine, setActiveLine] = useState(null); // The line currently being typed

  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // Focus input on initial render
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll to bottom whenever output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output, activeLine]);
  
  // This callback is triggered when a line finishes typing
  const handleLineComplete = useCallback(() => {
    if (activeLine) {
      setOutput(prev => [...prev, activeLine]);
      setActiveLine(null); // Ready for the next line in the queue
    }
  }, [activeLine]);

  // Processes the command queue whenever the terminal is not busy
  const processQueue = useCallback(() => {
    if (commandQueue.current.length > 0 && !activeLine) {
      const nextItem = commandQueue.current.shift();
      
      // Items marked as 'instant' are added directly to output without typing
      if (nextItem.instant) {
        setOutput(prev => [...prev, nextItem]);
      } else {
        setActiveLine(nextItem);
      }
    }
  }, [activeLine]);

  // Interval to check and process the queue
  useEffect(() => {
    const interval = setInterval(processQueue, 100);
    return () => clearInterval(interval);
  }, [processQueue]);

  // Lock the input while a line is being typed or the queue is not empty
  useEffect(() => {
    setIsProcessing(!!activeLine || commandQueue.current.length > 0);
  }, [activeLine, output]);

  // --- Command Execution Logic ---
  const executeCommand = (cmd) => {
    const trimmed = cmd.trim();

    // Add user's command to output instantly
    commandQueue.current.push({ 
      content: `guest@portfolio:~$ ${trimmed}`,
      color: 'text-green-400',
      instant: true
    });

    if (trimmed === '') return;

    setHistory(prev => [trimmed, ...prev.filter(h => h !== trimmed)]);
    setHistoryIndex(-1);

    const [base, ...args] = trimmed.split(' ');
    
    switch (base.toLowerCase()) {
      case 'help':
        commandQueue.current.push({ color: 'text-yellow-300', content: `Available commands:\n  help          - Show this help message\n  about         - Show about info\n  projects      - Fetch and list my projects\n  contact       - Show contact details\n  clear         - Clear the terminal\n  ls            - List available files\n  cat <filename> - Open a file` });
        break;

      case 'ls':
        const fileList = files.map(f => f.name).join('\n');
        commandQueue.current.push({ color: 'text-blue-400', content: `.\n..\n${fileList}`, instant: true });
        break;

      case 'cat':
        const filename = args[0];
        if (filename && fileContents[filename]) {
          onOpenFile(filename);
          commandQueue.current.push({ color: 'text-blue-400', content: `Opening '${filename}'...`, instant: true });
        } else {
          commandQueue.current.push({ color: 'text-red-400', content: `cat: ${filename || 'file'}: No such file or directory`, instant: true });
        }
        break;

      case 'about':
        commandQueue.current.push({ color: 'text-cyan-300', content: fileContents['about.md'] });
        break;

      case 'contact':
        commandQueue.current.push({ color: 'text-emerald-300', content: fileContents['contact.txt'] });
        break;

      case 'clear':
        setOutput([]); // Direct state manipulation, bypasses queue
        break;
      
      case 'projects':
        commandQueue.current.push({ color: 'text-blue-400', content: 'Fetching projects from GitHub...', instant: true });
        // Use a small delay to ensure the "Fetching..." message renders before the async operation
        setTimeout(async () => {
          try {
            const fetchedProjects = await fetchGitHubProjects(GITHUB_USERNAME);
            const projectList = fetchedProjects.map(p => `  - ${p.title}\n    ${p.repoUrl}`).join('\n');
            commandQueue.current.push({ color: 'text-purple-300', content: `Found ${fetchedProjects.length} projects:\n${projectList}` });
          } catch(err) {
            commandQueue.current.push({ color: 'text-red-400', content: `Error: Failed to fetch projects. ${err.message}` });
          }
        }, 100);
        break;

      default:
        commandQueue.current.push({ color: 'text-red-400', content: `Command not found: '${trimmed}'. Type 'help'.`, instant: true });
        break;
    }
  };

  // --- Keyboard Input Handling ---
  const handleKeyDown = (e) => {
    if (isProcessing && e.key !== 'Tab') return; // Allow tabbing out

    if (e.key === 'Enter') {
      executeCommand(command);
      setCommand('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, history.length - 1);
      if (newIndex >= 0) {
        setHistoryIndex(newIndex);
        setCommand(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      setCommand(newIndex === -1 ? '' : (history[newIndex] || ''));
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div 
        ref={terminalRef} 
        className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent" 
        onClick={() => inputRef.current?.focus()}
      >
        <div className="space-y-1">
          {output.map((item, index) => (
            <div key={index} className={`whitespace-pre-wrap font-mono text-sm leading-relaxed ${item.color || 'text-gray-300'}`}>
              {item.content}
            </div>
          ))}
          {activeLine && <TerminalLine item={activeLine} onComplete={handleLineComplete} />}
        </div>
      </div>
      <div className="border-t border-gray-600 p-2 bg-[#1a1a1a]">
        <div className="relative flex items-center font-mono text-sm">
          <span className="text-green-400 mr-2 flex-shrink-0">guest@portfolio:~$</span>
          <span className="text-white whitespace-pre">{command}</span>
          {!isProcessing && <span className="inline-block w-2.5 h-4 bg-green-400 animate-pulse"></span>}
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-transparent caret-transparent"
            spellCheck={false}
            autoComplete="off"
            disabled={isProcessing}
          />
        </div>
      </div>
    </div>
  );
};

export default TerminalController;
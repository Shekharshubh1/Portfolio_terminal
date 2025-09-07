import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTypingEffect } from '../../hooks/useTypingEffect'; // Import the hook
import { fetchGitHubProjects } from '../../services/githubService';
import { GITHUB_USERNAME } from '../../data/appData';

// A simple helper for creating delays in async functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
  const [output, setOutput] = useState([]);
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [activeLine, setActiveLine] = useState(null);

  const commandQueue = useRef([]);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // --- Effects ---

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scrolls to bottom on new completed output or when a new line starts typing
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output, activeLine]);

  // Continuously scrolls to bottom WHILE a line is actively typing
  useEffect(() => {
    if (activeLine) {
      const interval = setInterval(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [activeLine]);
  
  const processQueue = useCallback(() => {
    if (commandQueue.current.length > 0 && !activeLine) {
      const nextItem = commandQueue.current.shift();
      if (nextItem.instant) {
        setOutput(prev => [...prev, nextItem]);
      } else {
        setActiveLine(nextItem);
      }
    }
  }, [activeLine]);

  useEffect(() => {
    const interval = setInterval(processQueue, 100);
    return () => clearInterval(interval);
  }, [processQueue]);

  useEffect(() => {
    setIsProcessing(!!activeLine || commandQueue.current.length > 0);
  }, [activeLine, output]);

  // --- Handlers ---

  const handleLineComplete = useCallback(() => {
    if (activeLine) {
      setOutput(prev => [...prev, activeLine]);
      setActiveLine(null);
    }
  }, [activeLine]);

  const handleCommandChange = (e) => {
    const value = e.target.value;
    setCommand(value);

    if (value.trim() === '') {
      setSuggestion('');
      return;
    }

    const possibleCommands = ['help', 'about', 'projects', 'contact', 'clear', 'ls', 'cat '];
    const commandMatch = possibleCommands.find(c => c.startsWith(value.toLowerCase()));

    if (commandMatch && commandMatch !== value) {
      setSuggestion(commandMatch);
    } else if (value.toLowerCase().startsWith('cat ') && value.length >= 4) {
      const partialFilename = value.substring(4);
      const fileMatch = files.find(f => f.name.startsWith(partialFilename.toLowerCase()));
      if (fileMatch) {
        setSuggestion(`cat ${fileMatch.name}`);
      } else {
        setSuggestion('');
      }
    } else {
      setSuggestion('');
    }
  };

  const executeCommand = (cmd) => {
    const trimmed = cmd.trim();

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
        setOutput([]);
        break;
      
      case 'projects':
        (async () => {
          commandQueue.current.push({ color: 'text-blue-400', content: 'Connecting to api.github.com...', instant: true });
          await sleep(400);
          commandQueue.current.push({ color: 'text-blue-400', content: 'Authenticating session...', instant: true });
          await sleep(600);
          commandQueue.current.push({ color: 'text-blue-400', content: 'Parsing repository data...', instant: true });
          await sleep(300);

          try {
            const { projects } = await fetchGitHubProjects(GITHUB_USERNAME);
            if (projects && projects.length > 0) {
              const projectList = projects.map(p => `  - ${p.title}\n    ${p.repoUrl}`).join('\n');
              commandQueue.current.push({ color: 'text-purple-300', content: `Found ${projects.length} projects:\n${projectList}` });
            } else {
              commandQueue.current.push({ color: 'text-yellow-300', content: 'No public projects found.' });
            }
          } catch(err) {
            commandQueue.current.push({ color: 'text-red-400', content: `Error: Failed to fetch projects. ${err.message}` });
          }
        })();
        break;

      default:
        commandQueue.current.push({ color: 'text-red-400', content: `Command not found: '${trimmed}'. Type 'help'.`, instant: true });
        break;
    }
  };

  const handleKeyDown = (e) => {
    if (isProcessing && e.key !== 'Tab') return;

    if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      setCommand(suggestion);
      setSuggestion('');
      return;
    }

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
          <div className="relative flex-1 flex items-center">
            <span className="text-white whitespace-pre">{command}</span>

            {suggestion && command && (
              <span className="text-gray-600 whitespace-pre absolute left-0 top-0 pointer-events-none">
                <span className="invisible">{command}</span>{suggestion.substring(command.length)}
              </span>
            )}
            
            {isProcessing ? (
              <span className="inline-block h-4 text-green-400 ml-1">_</span>
            ) : (
              <span className="inline-block w-2.5 h-4 bg-green-400 animate-blink ml-1"></span>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={handleCommandChange}
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
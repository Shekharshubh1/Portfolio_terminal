import React, { useState, useEffect, useRef } from 'react';
import OutputRenderer from './OutputRenderer';
import { fetchGitHubProjects } from '../../services/githubService';
// --- FIX IS HERE ---
// Changed the import path to match your actual filename "appData.js"
import { GITHUB_USERNAME } from '../../data/appData'; 

// A simple helper function for creating delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const TerminalController = ({ files, fileContents, onOpenFile }) => {
  const [output, setOutput] = useState([]);
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);

  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const processCommand = async (cmd) => {
    const trimmed = cmd.trim();
    if (trimmed === '') return;

    setIsProcessing(true);
    if (trimmed) setHistory(prev => [trimmed, ...prev]);
    setHistoryIndex(-1);
    
    setOutput(prev => [...prev, { 
        id: Date.now(), 
        mode: 'instant', 
        content: `guest@portfolio:~$ ${trimmed}`,
        color: 'text-green-400'
    }]);

    await sleep(100 + Math.random() * 150);

    const [base, ...args] = trimmed.split(' ');
    
    switch (base.toLowerCase()) {
      case 'help':
        setOutput(prev => [...prev, { id: Date.now(), mode: 'typewriter', color: 'text-yellow-300', content: `Available commands:\n  help          - Show this help message\n  about         - Show about info\n  projects      - Fetch and list my projects\n  contact       - Show contact details\n  clear         - Clear the terminal\n  ls            - List available files\n  cat <filename> - Open a file` }]);
        break;

      case 'ls':
        const fileList = files.map(f => f.name).join('\n');
        setOutput(prev => [...prev, { id: Date.now(), mode: 'instant', color: 'text-blue-400', content: `.\n..\n${fileList}` }]);
        break;

      case 'cat':
        const filename = args[0];
        if (filename && fileContents[filename]) {
          onOpenFile(filename);
          setOutput(prev => [...prev, { id: Date.now(), mode: 'instant', color: 'text-blue-400', content: `Opening '${filename}'...` }]);
        } else {
          setOutput(prev => [...prev, { id: Date.now(), mode: 'instant', color: 'text-red-400', content: `cat: ${filename || 'file'}: No such file or directory` }]);
        }
        break;

      case 'about':
        setOutput(prev => [...prev, { id: Date.now(), mode: 'typewriter', color: 'text-blue-400', content: fileContents['about.md'] }]);
        break;

      case 'contact':
         setOutput(prev => [...prev, { id: Date.now(), mode: 'typewriter', color: 'text-blue-400', content: fileContents['contact.txt'] }]);
        break;

      case 'clear':
        setOutput([]);
        break;
        
      case 'projects':
        const spinnerId = Date.now();
        setOutput(prev => [...prev, { id: spinnerId, mode: 'spinner', content: 'Fetching projects from GitHub...' }]);
        try {
            const fetchedProjects = await fetchGitHubProjects(GITHUB_USERNAME);
            const projectList = fetchedProjects.map(p => `  - ${p.title}\n    ${p.repoUrl}`).join('\n');
            setOutput(prev => prev.map(item => item.id === spinnerId 
                ? { id: spinnerId, mode: 'instant', color: 'text-purple-300', content: `Found ${fetchedProjects.length} projects:\n${projectList}` }
                : item
            ));
        } catch(err) {
            setOutput(prev => prev.map(item => item.id === spinnerId 
                ? { id: spinnerId, mode: 'instant', color: 'text-red-400', content: `Error: Failed to fetch projects. ${err.message}` }
                : item
            ));
        }
        break;

      default:
        setOutput(prev => [...prev, { id: Date.now(), mode: 'instant', color: 'text-red-400', content: `Command not found: '${trimmed}'. Type 'help'.` }]);
        break;
    }

    setIsProcessing(false);
  };

  const handleKeyDown = (e) => {
    if (isProcessing) return;

    if (e.key === 'Enter') {
      processCommand(command);
      setCommand('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, history.length - 1);
      if(newIndex >= 0) {
        setHistoryIndex(newIndex);
        setCommand(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      setCommand(newIndex === -1 ? '' : history[newIndex]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div 
        ref={terminalRef} 
        className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent" 
        onClick={() => inputRef.current?.focus()}
      >
        <div className="space-y-2">
          {output.map((item) => <OutputRenderer key={item.id} item={item} />)}
        </div>
      </div>
      <div className="border-t border-gray-600 p-2 bg-[#1a1a1a]">
        <div className="relative flex items-center font-mono text-sm">
          <span className="text-green-400 mr-2 flex-shrink-0">guest@portfolio:~$</span>
          <span className="text-white whitespace-pre">{command}</span>
          <span className={`inline-block w-2.5 h-4 bg-green-400 ${isProcessing ? 'opacity-0' : 'animate-pulse'}`}></span>
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


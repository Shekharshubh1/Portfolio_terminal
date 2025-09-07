// src/components/terminal/TerminalController.jsx
import React, { useState, useEffect, useRef } from 'react';
import OutputLine from './OutputLine';
import { files } from '../../data/appData';

const TerminalController = ({ projects, fileContents, onOpenFile }) => {
  const [output, setOutput] = useState([]);
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cursorVisible, setCursorVisible] = useState(true);
  
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [output]);
  useEffect(() => {
    const blinkInterval = setInterval(() => setCursorVisible(prev => !prev), 530);
    return () => clearInterval(blinkInterval);
  }, []);

  const processCommand = (cmd) => {
    const trimmed = cmd.trim();
    const newOutput = [...output, { type: 'command', content: `guest@portfolio:~$ ${trimmed}` }];

    if (trimmed) {
      setHistory(prev => [trimmed, ...prev]);
    }
    setHistoryIndex(-1);

    const [baseCommand, ...args] = trimmed.split(' ');
    let response = null;

    switch (baseCommand.toLowerCase()) {
      case 'help':
        response = { type: 'help', content: `Available commands:\n  help          - Show this help message\n  about         - Show about info\n  projects      - List all projects\n  contact       - Show contact details\n  clear         - Clear the terminal\n  ls            - List available files\n  cat <filename> - Open a file` };
        break;
      case 'ls':
        const fileList = files.map(f => f.name).join('\n');
        response = { type: 'system', content: `.\n..\n${fileList}` };
        break;
      case 'cat':
        const filename = args[0];
        if (filename && fileContents[filename]) {
          onOpenFile(filename);
          response = { type: 'system', content: `Opening '${filename}'...` };
        } else {
          response = { type: 'error', content: `cat: ${filename || ''}: No such file or directory` };
        }
        break;
      case 'about':
        response = { type: 'system', content: fileContents['about.md'] };
        break;
      case 'projects':
        const projectList = projects.map(p => `  - ${p.title} (${p.id})`).join('\n');
        response = { type: 'projects', content: `Found ${projects.length} projects:\n${projectList}\n\nHint: Use 'cat projects.js' to see the data.` };
        break;
      case 'contact':
        response = { type: 'system', content: fileContents['contact.txt'] };
        break;
      case 'clear':
        setOutput([]);
        return;
      case '':
        break;
      default:
        response = { type: 'error', content: `Command not found: '${trimmed}'. Type 'help'.` };
        break;
    }

    if (response) {
      setOutput([...newOutput, response]);
    } else {
      setOutput(newOutput);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      processCommand(command);
      setCommand('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(newIndex);
        setCommand(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > -1) {
        const newIndex = Math.max(historyIndex - 1, -1);
        setHistoryIndex(newIndex);
        setCommand(newIndex === -1 ? '' : history[newIndex]);
      }
    }
  };

  return (
    <div className="h-2/5 flex flex-col border-t border-gray-600">
      <div ref={terminalRef} className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <div className="space-y-2">
          {output.map((item, index) => <OutputLine key={index} item={item} />)}
        </div>
      </div>
      <div className="border-t border-gray-600 p-2 bg-[#1a1a1a]" onClick={() => inputRef.current?.focus()}>
        <div className="relative flex items-center font-mono text-sm">
          <span className="text-green-400 mr-2 flex-shrink-0">guest@portfolio:~$</span>
          <span className="text-white whitespace-pre">{command}</span>
          <span className={`inline-block w-2.5 h-4 bg-green-400 ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}></span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-transparent caret-transparent"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
};

export default TerminalController;
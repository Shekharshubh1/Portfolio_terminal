// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Terminal, Folder, FolderOpen } from 'lucide-react';

// Data and Services
import { GITHUB_USERNAME, files, initialFileContents } from './data/appData';
import { fetchGitHubProjects } from './services/githubService';

// Components
import BootSequence from './components/BootSequence';
import FileExplorer from './components/FileExplorer';
import TabBar from './components/TabBar';
import SyntaxHighlightedCode from './components/SyntaxHighlightedCode';
import TerminalController from './components/terminal/TerminalController';

export default function App() {
  // App State
  const [isBooting, setIsBooting] = useState(true);
  const [uiVisibilityClass, setUiVisibilityClass] = useState('opacity-0');
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);

  // Data State
  const [projects, setProjects] = useState([]);
  const [fileContents, setFileContents] = useState(initialFileContents);

  // UI State
  const [tabs, setTabs] = useState([{ id: 'README.md', name: 'README.md' }]);
  const [activeTabId, setActiveTabId] = useState('README.md');

  // --- EFFECTS ---

  useEffect(() => {
    const loadProjects = async () => {
      const { projects, code } = await fetchGitHubProjects(GITHUB_USERNAME);
      setProjects(projects);
      setFileContents(prev => ({ ...prev, 'projects.js': code }));
    };
    loadProjects();
  }, []);

  // --- HANDLERS ---

  const handleBootComplete = useCallback(() => {
    setTimeout(() => setUiVisibilityClass('opacity-0'), 0);
    setTimeout(() => setUiVisibilityClass('opacity-100'), 80);
    setTimeout(() => setUiVisibilityClass('opacity-0'), 160);
    setTimeout(() => {
      setUiVisibilityClass('opacity-100');
      setIsBooting(false);
    }, 240);
  }, []);

  const handleFileClick = (fileId) => {
    if (!tabs.some(tab => tab.id === fileId)) {
      setTabs(prevTabs => [...prevTabs, { id: fileId, name: fileId }]);
    }
    setActiveTabId(fileId);
    setIsExplorerOpen(false);
  };

  const handleCloseTab = (e, tabIdToClose) => {
    e.stopPropagation();
    if (tabs.length === 1) return;

    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabIdToClose);
      if (activeTabId === tabIdToClose) {
        setActiveTabId(newTabs[0].id);
      }
      return newTabs;
    });
  };

  // --- RENDER ---

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 font-sans flex items-center justify-center p-2 md:p-4">
      {isBooting && (
        <div className="absolute inset-0 z-20">
          <BootSequence onBootComplete={handleBootComplete} />
        </div>
      )}

      <div className={`w-full h-full max-w-7xl transition-opacity duration-75 ${uiVisibilityClass}`}>
        <div className="bg-[#1e1e1e] rounded-lg shadow-2xl border border-gray-700 overflow-hidden h-[95vh]">
          {/* Title Bar */}
          <header className="bg-[#2d2d2d] px-4 py-3 flex items-center border-b border-gray-600 flex-shrink-0">
            {/* Left Column */}
            <div className="w-1/5 flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>

            {/* Center Column */}
            <div className="w-3/5 flex justify-center">
              <div className="flex items-center space-x-2 text-gray-300 text-sm font-mono">
                <Terminal className="w-4 h-4" />
                <span>portfolio - ~/</span>
              </div>
            </div>

            {/* Right Column */}
            <div className="w-1/5 flex justify-end">
              <button onClick={() => setIsExplorerOpen(!isExplorerOpen)} className="p-1 rounded hover:bg-gray-700">
                {isExplorerOpen ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
              </button>
            </div>
          </header>

          {/* Main Layout */}
          <div className="flex flex-col md:flex-row h-[calc(100%-49px)]">
            <FileExplorer
              activeTabId={activeTabId}
              onFileClick={handleFileClick}
              className="w-64 bg-[#252525] border-r border-gray-600 p-4 hidden md:block"
            />

            <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden relative">
              <FileExplorer
                activeTabId={activeTabId}
                onFileClick={handleFileClick}
                className={`absolute md:hidden top-0 left-0 right-0 bg-[#252525] border-b border-gray-600 z-10 p-4 transition-all duration-300 ease-in-out overflow-hidden ${isExplorerOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              />

              {/* Top Pane: File Viewer */}
              <div className="flex-1 flex flex-col min-h-0">
                <TabBar
                  tabs={tabs}
                  activeTabId={activeTabId}
                  onTabClick={setActiveTabId}
                  onCloseTab={handleCloseTab}
                />
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  <SyntaxHighlightedCode
                    code={fileContents[activeTabId]}
                    language={activeTabId.endsWith('.js') ? 'js' : 'text'}
                  />
                </div>
              </div>

              {/* Bottom Pane: Terminal */}
              <TerminalController
                projects={projects}
                fileContents={fileContents}
                onOpenFile={handleFileClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
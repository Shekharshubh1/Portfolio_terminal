import React, { useState, useEffect, useCallback } from 'react';
import { Terminal, Folder, FolderOpen } from 'lucide-react';

// Styles
import './styles/global.css';

// Data, Services, and Hooks
import { files, initialFileContents } from './data/appData';
import { fetchGitHubProjects } from './services/githubService';

// Components
import BootSequence from './components/BootSequence';
import FileExplorer from './components/FileExplorer';
import TabBar from './components/TabBar';
import TerminalController from './components/terminal/TerminalController';
import SyntaxHighlightedCode from './components/SyntaxHighlightedCode';

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [uiVisibility, setUiVisibility] = useState('opacity-0');
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);

  const [tabs, setTabs] = useState([{ id: 'README.md', name: 'README.md' }]);
  const [activeTabId, setActiveTabId] = useState('README.md');
  const [fileContents, setFileContents] = useState(initialFileContents);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const GITHUB_USERNAME = 'Shekharshubh1'; // Define username here or import it
        const fetchedProjects = await fetchGitHubProjects(GITHUB_USERNAME);
        const projectsCode = `const projects = [\n${fetchedProjects.map(p => `  {\n    id: '${p.id}',\n    title: '${p.title}'\n  }`).join(',\n')}\n];`;
        setFileContents(prev => ({ ...prev, 'projects.js': projectsCode }));
      } catch (err) {
        setFileContents(prev => ({ ...prev, 'projects.js': `// Error: ${err.message}` }));
      }
    };
    loadProjects();
  }, []);

  const handleBootComplete = useCallback(() => {
    setTimeout(() => setUiVisibility('opacity-0'), 0);
    setTimeout(() => setUiVisibility('opacity-100'), 80);
    setTimeout(() => setUiVisibility('opacity-0'), 160);
    setTimeout(() => {
      setUiVisibility('opacity-100');
      setIsBooting(false);
    }, 240);
  }, []);

  const handleFileClick = (fileId) => {
    if (!tabs.some(tab => tab.id === fileId)) {
      setTabs(prev => [...prev, { id: fileId, name: fileId }]);
    }
    setActiveTabId(fileId);
    setIsExplorerOpen(false);
  };
  
  const handleCloseTab = (e, tabIdToClose) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(tab => tab.id !== tabIdToClose);
    setTabs(newTabs);
    if (activeTabId === tabIdToClose) {
      setActiveTabId(newTabs[0].id);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 font-sans flex items-center justify-center p-2 md:p-4">
      {isBooting && (
        <div className="absolute inset-0 z-20">
          <BootSequence onBootComplete={handleBootComplete} />
        </div>
      )}
      <div className={`w-full max-w-7xl h-[95vh] transition-opacity duration-75 ${uiVisibility}`}>
        <div className="bg-[#1e1e1e] rounded-lg shadow-2xl border border-gray-700 overflow-hidden h-full flex flex-col">
          <header className="bg-[#2d2d2d] px-4 py-3 flex items-center border-b border-gray-600 flex-shrink-0">
            {/* Header content remains the same */}
            <div className="w-1/5 flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="w-3/5 flex justify-center">
              <div className="flex items-center space-x-2 text-gray-300 text-sm font-mono">
                <Terminal className="w-4 h-4" /><span>portfolio - ~/</span>
              </div>
            </div>
            <div className="w-1/5 flex justify-end">
              <button onClick={() => setIsExplorerOpen(!isExplorerOpen)} className="md:hidden p-1 rounded hover:bg-gray-700">
                {isExplorerOpen ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
              </button>
            </div>
          </header>
          
          <div className="flex flex-grow min-h-0">
            <aside className="w-64 bg-[#252525] border-r border-gray-600 p-4 hidden md:block">
              <FileExplorer files={files} activeTabId={activeTabId} onFileClick={handleFileClick} />
            </aside>
            
            <main className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden relative">
              <div className={`absolute md:hidden top-0 left-0 right-0 bg-[#252525] border-b border-gray-600 z-10 p-4 transition-all duration-300 ease-in-out ${isExplorerOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                <FileExplorer files={files} activeTabId={activeTabId} onFileClick={handleFileClick} />
              </div>

              {/* --- FIX IS HERE --- */}
              {/* This section now correctly splits the main view into two distinct panes */}
              
              {/* Top Pane: File Viewer (takes 3/5 of the height) */}
              <div className="h-3/5 flex flex-col min-h-0">
                  <TabBar tabs={tabs} activeTabId={activeTabId} onTabClick={setActiveTabId} onTabClose={handleCloseTab} />
                  <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                      <SyntaxHighlightedCode code={fileContents[activeTabId]} language={activeTabId.endsWith('.js') ? 'js' : 'text'} />
                  </div>
              </div>
              
              {/* Bottom Pane: Terminal (takes 2/5 of the height) */}
              <div className="h-2/5 border-t border-gray-600">
                 <TerminalController 
                    files={files} 
                    fileContents={fileContents} 
                    onOpenFile={handleFileClick}
                 />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}


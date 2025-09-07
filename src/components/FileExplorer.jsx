// src/components/FileExplorer.jsx
import React from 'react';
import { Folder } from 'lucide-react';
import { files as fileData } from '../data/appData'; 

const FileExplorer = ({ activeTabId, onFileClick, className = '' }) => {
  return (
    <div className={className}>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center">
        <Folder className="w-3 h-3 mr-2" />Explorer
      </h3>
      <div className="space-y-1 text-sm font-mono">
        {fileData.map(file => (
          <div 
            key={file.id} 
            onClick={() => onFileClick(file.id)} 
            className={`flex items-center px-2 py-1 rounded cursor-pointer transition-colors ${activeTabId === file.id ? 'text-blue-400 bg-blue-900/30' : 'text-gray-400 hover:bg-gray-700/50'}`}
          >
            <file.icon className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{file.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
import React from 'react';
import { X } from 'lucide-react';

const TabBar = ({ tabs, activeTabId, onSwitchTab, onCloseTab }) => {
  return (
    <div className="flex border-b border-gray-600 bg-[#252525]">
      {tabs.map(tab => (
        <div
          key={tab.id}
          onClick={() => onSwitchTab(tab.id)}
          className={`flex items-center justify-between px-4 py-2 border-r border-gray-600 cursor-pointer text-sm font-mono transition-colors ${
            activeTabId === tab.id
              ? 'bg-[#1e1e1e] text-white'
              : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#333]'
          }`}
        >
          <span>{tab.name}</span>
          <button 
            onClick={(e) => onCloseTab(e, tab.id)}
            className={`ml-3 p-0.5 rounded hover:bg-gray-600 transition-colors ${tabs.length <= 1 ? 'invisible' : ''}`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default TabBar;
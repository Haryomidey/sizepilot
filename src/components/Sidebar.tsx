/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  RefreshCcw, 
  Layers, 
  History
} from 'lucide-react';
import { cn } from '../lib/utils';

const workspaceItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Batch Jobs', icon: Layers, path: '/batch' },
  { label: 'History', icon: History, path: '/history' },
];

const toolItems = [
  { label: 'Image Optimizer', icon: ImageIcon, path: '/compress-image' },
  { label: 'Video Compressor', icon: Video, path: '/compress-video' },
  { label: 'PDF Tools', icon: FileText, path: '/compress-pdf' },
  { label: 'Format Converter', icon: RefreshCcw, path: '/convert' },
];

interface SidebarProps {
  onClose?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose, className }) => {
  return (
    <div className={cn("w-64 border-r border-[#222222] h-full flex flex-col bg-[#000000] overflow-y-auto", className)}>
      <div className="p-6 flex items-center gap-2 border-b border-[#222222] shrink-0">
        <NavLink to="/" onClick={onClose} className="flex items-center gap-2 font-semibold tracking-tight text-xl">
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-black rotate-45"></div>
          </div>
          <span>SizePilot</span>
        </NavLink>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <div className="text-[11px] uppercase tracking-widest text-[#52525b] font-bold mb-4 mt-2 px-2">Workspace</div>
        {workspaceItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all group",
                isActive 
                  ? "bg-[#111111] border border-[#222222] text-white" 
                  : "text-[#a1a1aa] hover:text-white"
              )
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}

        <div className="h-6"></div>
        <div className="text-[11px] uppercase tracking-widest text-[#52525b] font-bold mb-4 px-2">Tools</div>
        {toolItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all group",
                isActive 
                  ? "bg-[#111111] border border-[#222222] text-white" 
                  : "text-[#a1a1aa] hover:text-white"
              )
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

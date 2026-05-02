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
  CheckSquare, 
  History, 
  Settings,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';

const workspaceItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Batch Process', icon: Layers, path: '/batch' },
  { label: 'History', icon: History, path: '/history' },
];

const toolItems = [
  { label: 'Image Optimizer', icon: ImageIcon, path: '/compress-image' },
  { label: 'Video Compressor', icon: Video, path: '/compress-video' },
  { label: 'PDF Controller', icon: FileText, path: '/compress-pdf' },
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

      <div className="p-4 border-t border-[#222222] shrink-0">
        <div className="bg-[#111111] p-3 rounded-lg border border-[#222222]">
          <div className="text-xs text-[#52525b] mb-1">Pro Plan Active</div>
          <div className="w-full bg-[#222222] h-1 rounded-full overflow-hidden">
            <div className="bg-white h-full w-[72%]" />
          </div>
          <div className="text-[10px] mt-2 text-[#a1a1aa]">7.2 GB of 10 GB used</div>
        </div>
      </div>
    </div>
  );
};

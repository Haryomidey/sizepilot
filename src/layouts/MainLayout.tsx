/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const pathName = location.pathname.split('/').filter(Boolean).pop() || 'Overview';
  const capitalizedPath = pathName.charAt(0).toUpperCase() + pathName.slice(1);

  // Close sidebar on navigation
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#000000] text-white overflow-hidden font-sans relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <Sidebar aria-label="Desktop Sidebar" />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 z-[70] lg:hidden"
            >
              <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-[-48px] w-10 h-10 bg-black border border-[#222222] rounded-full flex items-center justify-center text-[#a1a1aa] hover:text-white"
              >
                <X size={20} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col bg-[#050505] min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-[#222222] flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4 text-sm overflow-hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-[#a1a1aa] hover:text-white"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 lg:gap-4 truncate">
              <span className="text-[#a1a1aa] hidden sm:inline">SizePilot</span>
              <span className="text-[#3f3f46] hidden sm:inline">/</span>
              <span className="font-medium truncate">{capitalizedPath}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 lg:gap-4 shrink-0">
            <button className="hidden sm:block text-xs text-[#a1a1aa] font-medium px-3 py-1.5 border border-[#222222] rounded-md hover:bg-[#111111] transition-colors">
              Support
            </button>
            <div className="w-8 h-8 rounded-full bg-[#111111] border border-[#333333]"></div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="p-8 max-w-6xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Status Bar */}
        <footer className="h-10 border-t border-[#222222] bg-[#0A0A0A] flex items-center justify-between px-6 text-[10px] text-[#52525b]">
          <div className="flex gap-6">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              <span>AI Engine Online</span>
            </div>
            <span>System v2.4.1</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="text-[#a1a1aa]">© 2026 SizePilot Inc.</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn } from '../lib/utils';
import { Sparkles, Terminal } from 'lucide-react';
import { motion } from 'motion/react';

interface AICommandInputProps {
  onCommand: (command: string) => void;
  isLoading?: boolean;
}

export const AICommandInput: React.FC<AICommandInputProps> = ({ onCommand, isLoading }) => {
  const [value, setValue] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onCommand(value.trim());
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#52525b] uppercase tracking-widest flex items-center gap-2">
          <Terminal size={14} /> AI File Controller
        </h2>
        <span className="text-[10px] bg-white text-black px-1.5 py-0.5 font-bold rounded">BETA</span>
      </div>

      <div className="relative group">
        <form onSubmit={handleSubmit} className="relative flex items-center bg-[#111111] border border-[#222222] rounded-xl h-14 overflow-hidden focus-within:border-white transition-colors">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525b]">
            <Sparkles size={16} />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder='Resize images to 1080px or Compress to 2MB...'
            className="w-full bg-transparent border-none outline-none text-white placeholder:text-[#3f3f46] pl-10 pr-24 sm:pl-12 sm:pr-32 text-xs sm:text-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !value.trim()}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-white text-black text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[#e4e4e7] transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Wait...' : 'Execute'}
          </button>
        </form>
      </div>

      <div className="flex gap-2 justify-center overflow-x-auto pb-2 scrollbar-hide">
        {['500KB', 'Instagram size', 'Convert to PDF', 'Smallest possible'].map((hint) => (
          <button
            key={hint}
            onClick={() => {
                setValue(`Make this ${hint.toLowerCase()}`);
            }}
            className="text-xs bg-[#0A0A0A] border border-[#222222] px-3 py-1.5 rounded-full text-[#52525b] hover:text-white hover:border-[#3f3f46] transition-colors whitespace-nowrap"
          >
            {hint}
          </button>
        ))}
      </div>
    </div>
  );
};

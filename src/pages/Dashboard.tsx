import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AICommandInput } from '../components/AICommandInput';
import { FileUploadZone } from '../components/FileUploadZone';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { 
  Zap, 
  History, 
  Settings as SettingsIcon, 
  Image as ImageIcon, 
  Video, 
  FileText,
  FileCheck,
  Plus,
  ArrowRight,
  RefreshCcw,
  Layers
} from 'lucide-react';
import { useHistory } from '../hooks/useStorage';
import { formatBytes } from '../lib/utils';
import { motion } from 'motion/react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { history } = useHistory();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCommand = (command: string) => {
    setIsProcessing(true);
    // Simulate AI thinking and redirecting
    setTimeout(() => {
      setIsProcessing(false);
      navigate(`/ai-command?q=${encodeURIComponent(command)}`);
    }, 800);
  };

  const handleFiles = (files: File[]) => {
    // Determine context based on file type and redirect
    if (files.length > 1) {
      navigate('/batch', { state: { files } });
      return;
    }
    const file = files[0];
    if (file.type.startsWith('image/')) navigate('/compress-image', { state: { files } });
    else if (file.type.startsWith('video/')) navigate('/compress-video', { state: { files } });
    else if (file.type.includes('pdf')) navigate('/compress-pdf', { state: { files } });
    else navigate('/batch', { state: { files } });
  };

  const stats = [
    { label: 'Files Processed', value: history.length, icon: FileCheck },
    { label: 'Space Saved', value: formatBytes(history.reduce((a, b) => a + (b.originalSize - b.newSize), 0)), icon: Zap },
    { label: 'Recent Optimizations', value: history.filter(i => i.timestamp > Date.now() - 86400000 * 7).length, icon: History },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* AI Command Center Section */}
      <section>
        <AICommandInput onCommand={handleCommand} isLoading={isProcessing} />
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-5 border-border bg-surface">
            <div className="text-[#a1a1aa] text-xs mb-1 uppercase tracking-widest font-bold font-mono">{stat.label}</div>
            <div className="text-2xl font-medium tracking-tight text-white">{stat.value}</div>
            <div className="text-[10px] text-[#52525b] mt-2 font-mono">
              {i === 1 ? 'Live performance data' : 'Verified system metric'}
            </div>
          </Card>
        ))}
      </div>

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Upload Zone */}
        <div className="lg:col-span-3">
          <FileUploadZone 
            onFilesSelected={handleFiles} 
            className="h-full min-h-80 border-border bg-surface hover:border-[#52525b]" 
          />
        </div>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-border bg-surface flex flex-col h-full min-h-80">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#52525b]">Recent Activity</span>
            <Button variant="ghost" size="sm" onClick={() => navigate('/history')} className="text-[10px] h-6 px-2 text-[#a1a1aa] hover:text-white">
              View All
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border/50">
            {history.length > 0 ? (
              history.slice(0, 5).map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-white/2 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#18181b] rounded flex items-center justify-center text-[10px] font-bold text-[#52525b] group-hover:text-white transition-colors">
                      {item.format?.toUpperCase().slice(0, 3)}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white truncate max-w-30">{item.name}</div>
                      <div className="text-[10px] text-[#52525b] font-mono">
                        {formatBytes(item.originalSize)} → {formatBytes(item.newSize)}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-[#3f3f46] font-mono whitespace-nowrap">
                    {Math.round((1 - item.newSize / item.originalSize) * 100)}% ↓
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 opacity-20">
                <History size={24} />
                <p className="text-[10px] mt-2 font-mono uppercase tracking-widest">No activity</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Toolbox Shortcut */}
      <section className="pt-4">
        <div className="text-[10px] uppercase tracking-widest text-[#52525b] font-bold mb-4">Quick Toolbox</div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: 'Image', icon: ImageIcon, path: '/compress-image' },
            { label: 'Video', icon: Video, path: '/compress-video' },
            { label: 'PDF', icon: FileText, path: '/compress-pdf' },
            { label: 'Convert', icon: RefreshCcw, path: '/convert' },
            { label: 'Batch', icon: Layers, path: '/batch' },
            { label: 'Checker', icon: FileCheck, path: '/checker' },
          ].map((tool) => (
            <button 
              key={tool.label}
              onClick={() => navigate(tool.path)}
              className="p-4 bg-surface border border-border rounded-xl flex items-center justify-between hover:border-[#3f3f46] hover:bg-[#18181b] transition-all group"
            >
              <tool.icon size={16} className="text-[#52525b] group-hover:text-white transition-colors" />
              <span className="text-xs font-medium text-[#a1a1aa] group-hover:text-white">{tool.label}</span>
              <ArrowRight size={12} className="text-[#3f3f46] group-hover:text-white translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

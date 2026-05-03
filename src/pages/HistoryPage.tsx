import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { 
  History as HistoryIcon, 
  Trash2, 
  Download, 
  Search,
  Image as ImageIcon,
  Video,
  FileText,
  ArrowUpDown
} from 'lucide-react';
import { useHistory } from '../hooks/useStorage';
import { formatBytes } from '../lib/utils';

const HistoryPage: React.FC = () => {
  const { history, clearHistory, removeItem } = useHistory();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtered = history.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadHistoryItem = (item: typeof history[number]) => {
    if (!item.outputDataUrl) return;
    const anchor = document.createElement('a');
    anchor.href = item.outputDataUrl;
    anchor.download = item.outputName || item.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">History</h1>
          <p className="text-[#a1a1aa] text-sm font-medium">Files you have processed on this device.</p>
        </div>
        {history.length > 0 && (
          <Button variant="ghost" onClick={clearHistory} className="text-[#52525b] hover:text-white text-[10px] uppercase font-bold tracking-widest">
            <Trash2 size={12} className="mr-2" />
            Clear history
          </Button>
        )}
      </header>

      <div className="relative">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3f3f46]" size={16} />
         <input 
           type="text" 
           placeholder="Search history..."
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="w-full bg-surface-dim border border-border rounded-xl pl-12 pr-4 py-4 focus:border-white outline-none transition-all text-sm placeholder:text-[#3f3f46] font-medium"
         />
      </div>

      <Card className="bg-surface border-border">
        {filtered.length > 0 ? (
          <div className="divide-y divide-border/50">
             {/* Header - Desktop Only */}
             <div className="p-4 hidden md:grid grid-cols-12 text-[9px] uppercase font-bold tracking-[0.2em] text-[#52525b] border-b border-border">
                <div className="col-span-1">Tag</div>
                <div className="col-span-5 flex items-center gap-2">File name <ArrowUpDown size={8} /></div>
                <div className="col-span-2">Efficiency</div>
                <div className="col-span-2">Final size</div>
                <div className="col-span-2 text-right">Actions</div>
             </div>
             {filtered.map((item) => (
                <div key={item.id} className="p-4 md:p-6 flex flex-col md:grid md:grid-cols-12 md:items-center hover:bg-white/5 border border-border transition-colors group gap-4 md:gap-0">
                   {/* Mobile Header Line */}
                   <div className="flex md:contents items-center justify-between">
                     <div className="md:col-span-1">
                        {item.previewDataUrl ? (
                          <div className="h-10 w-10 overflow-hidden rounded border border-border bg-black">
                            {item.type === 'image' && <img src={item.previewDataUrl} alt={item.name} className="h-full w-full object-cover" />}
                            {item.type === 'video' && <video src={item.previewDataUrl} className="h-full w-full object-cover" muted />}
                            {item.type === 'pdf' && <iframe src={item.previewDataUrl} title={item.name} className="h-full w-full bg-white" />}
                          </div>
                        ) : (
                          <>
                            {item.type === 'image' && <ImageIcon size={16} className="text-[#3f3f46]" />}
                            {item.type === 'video' && <Video size={16} className="text-[#3f3f46]" />}
                            {item.type === 'pdf' && <FileText size={16} className="text-[#3f3f46]" />}
                          </>
                        )}
                     </div>
                     <div className="md:col-span-5 md:pr-8 flex-1 px-3 md:px-0">
                        <p className="font-bold text-xs uppercase text-white truncate">{item.name}</p>
                        <p className="text-[9px] text-[#3f3f46] font-mono mt-0.5 tracking-widest uppercase">{new Date(item.timestamp).toLocaleString()}</p>
                     </div>
                     {/* Mobile Dropdown/Actions Toggle could go here, or just show them */}
                     <div className="md:hidden flex gap-2">
                        <Button variant="ghost" size="icon" disabled={!item.outputDataUrl} onClick={() => downloadHistoryItem(item)} className="h-8 w-8 hover:bg-white/5 border border-border">
                          <Download size={14} className="text-[#a1a1aa]" />
                        </Button>
                     </div>
                   </div>

                   <div className="flex md:grid md:grid-cols-12 md:col-span-6 items-center justify-between border-t border-border/30 pt-3 md:pt-0 md:border-none">
                     <div className="md:col-span-4 flex flex-col md:block">
                        <span className="md:hidden text-[8px] uppercase tracking-widest text-[#52525b] mb-1">Reduction</span>
                        <span className="text-xs font-bold text-green-500 font-mono tracking-tighter">-{Math.round((1 - item.newSize / item.originalSize) * 100)}%</span>
                     </div>
                     <div className="md:col-span-4 flex flex-col md:block">
                        <span className="md:hidden text-[8px] uppercase tracking-widest text-[#52525b] mb-1">Final Size</span>
                        <span className="text-xs font-mono text-[#a1a1aa]">{formatBytes(item.newSize)}</span>
                     </div>
                     <div className="hidden md:col-span-4 md:flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-all md:translate-x-2 group-hover:translate-x-0">
                        <Button variant="ghost" size="icon" disabled={!item.outputDataUrl} onClick={() => downloadHistoryItem(item)} className="h-8 w-8 hover:bg-white/5 border border-transparent hover:border-border">
                          <Download size={14} className="text-[#a1a1aa]" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5 border border-transparent hover:border-border" onClick={() => removeItem(item.id)}>
                          <Trash2 size={14} className="text-[#a1a1aa]" />
                        </Button>
                     </div>
                     {/* Mobile Delete Button */}
                     <div className="md:hidden">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-900/50 hover:text-red-500" onClick={() => removeItem(item.id)}>
                          <Trash2 size={14} />
                        </Button>
                     </div>
                   </div>
                </div>
             ))}
          </div>
        ) : (
          <div className="p-32 text-center text-[#3f3f46]">
            <HistoryIcon size={32} className="mx-auto mb-4 opacity-10" />
            <p className="text-[10px] uppercase font-bold tracking-widest">No history yet</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default HistoryPage;
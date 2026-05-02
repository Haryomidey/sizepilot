import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { 
  Settings as SettingsIcon,
  ShieldCheck,
  Monitor,
  Info
} from 'lucide-react';
import { useSettings } from '../hooks/useStorage';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Workspace Preferences</h1>
        <p className="text-[#a1a1aa] text-sm font-medium">Configure global optimization behavior and privacy standards.</p>
      </header>

      <div className="space-y-8">
        <section className="space-y-4">
           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#52525b] mb-4">
             <Monitor size={12} /> System Profile
           </div>
           <Card className="divide-y divide-border bg-surface border-border">
              <div className="p-6 flex items-center justify-between">
                 <div>
                    <h4 className="text-sm font-bold uppercase tracking-tight text-white mb-1">Default Engine Profile</h4>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#52525b]">Select primary optimization logic.</p>
                 </div>
                 <select 
                    value={settings.defaultMode}
                    onChange={(e) => updateSettings({ defaultMode: e.target.value as any })}
                    className="bg-background border border-border px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest outline-none focus:border-white text-[#a1a1aa] focus:text-white transition-colors"
                 >
                    <option value="balanced">Balanced</option>
                    <option value="smart">Smart AI</option>
                    <option value="quality">High Quality</option>
                    <option value="size">Max Compression</option>
                 </select>
              </div>
              <div className="p-6 flex items-center justify-between">
                 <div>
                    <h4 className="text-sm font-bold uppercase tracking-tight text-white mb-1">Auto-Download Sequence</h4>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#52525b]">Enable browser push after node completion.</p>
                 </div>
                 <button 
                   onClick={() => updateSettings({ autoDownload: !settings.autoDownload })}
                   className={`w-10 h-5 rounded-full p-1 transition-all ${settings.autoDownload ? 'bg-white' : 'bg-border'}`}
                 >
                    <div className={`w-3 h-3 rounded-full transition-all ${settings.autoDownload ? 'bg-black translate-x-5' : 'bg-[#3f3f46]'}`} />
                 </button>
              </div>
           </Card>
        </section>

        <section className="space-y-4">
           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#52525b] mb-4">
             <ShieldCheck size={12} /> Protocol & Security
           </div>
           <Card className="divide-y divide-border bg-surface border-border">
              <div className="p-6">
                 <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold uppercase tracking-tight text-white">Browser-Only Logic</h4>
                    <span className="bg-white text-black text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">Mandatory</span>
                 </div>
                 <p className="text-[11px] text-[#52525b] leading-relaxed mb-4">
                    SizePilot is architected to process all binary data locally in your temporary browser memory. 
                    No file data nodes ever traverse external indices. This protocol is hardcoded to ensure total secure alignment.
                 </p>
                 <div className="flex items-center gap-2 text-green-500 text-[10px] font-bold uppercase tracking-widest font-mono">
                    <ShieldCheck size={12} /> Secure Tunnel Active
                 </div>
              </div>
              <div className="p-6 flex items-center justify-between">
                 <div>
                    <h4 className="text-sm font-bold uppercase tracking-tight text-white mb-1">Local Indexing</h4>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#52525b]">Retain manifest of file headers in storage.</p>
                 </div>
                 <button 
                   onClick={() => updateSettings({ privacyMode: !settings.privacyMode })}
                   className={`w-10 h-5 rounded-full p-1 transition-all ${settings.privacyMode ? 'bg-white' : 'bg-border'}`}
                 >
                    <div className={`w-3 h-3 rounded-full transition-all ${settings.privacyMode ? 'bg-black translate-x-5' : 'bg-[#3f3f46]'}`} />
                 </button>
              </div>
           </Card>
        </section>

        <section>
          <Card className="p-10 bg-workspace border-border text-center border-dashed">
             <div className="w-12 h-12 bg-surface border border-border rounded-xl flex items-center justify-center mx-auto mb-6">
               <Info size={24} className="text-[#52525b]" />
             </div>
             <div className="text-[10px] uppercase tracking-widest font-bold text-[#52525b] mb-6 font-mono">
               SizePilot v2.4.1 <br/> Neural Core Indices 0.9.1
             </div>
             <Button variant="outline" size="sm" className="text-[10px] font-bold uppercase tracking-widest px-6 border-[#3f3f46] hover:bg-white/5">System Diagnosis</Button>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;

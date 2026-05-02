import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { parseAICommand } from '../utils/aiParser';
import { AIIntention } from '../types';
import { 
  Zap, 
  ChevronRight, 
  ShieldAlert, 
  Settings2, 
  FileCheck,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatBytes } from '../lib/utils';

const AICommandPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [intention, setIntention] = useState<AIIntention | null>(null);
  const [isComputing, setIsComputing] = useState(true);

  useEffect(() => {
    if (query) {
      setIsComputing(true);
      // Simulate "AI" analysis
      const timer = setTimeout(() => {
        const parsed = parseAICommand(query);
        setIntention(parsed);
        setIsComputing(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [query]);

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <Zap size={48} className="text-gray-700 mb-6" />
        <h2 className="text-2xl font-bold mb-2">No Command Entered</h2>
        <p className="text-gray-500 mb-8">Go back to the dashboard to enter an AI instruction.</p>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Command Analysis</h1>
          <p className="text-sm text-gray-500 font-mono">"{query}"</p>
        </div>
      </header>

      {isComputing ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="animate-spin text-white mb-4" size={40} />
          <p className="text-gray-400 font-medium">SizePilot Neural Engine analyzing intent...</p>
        </div>
      ) : intention && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-8"
        >
          {/* Analysis View */}
          <Card className="p-8 border-accent/20 bg-accent/2">
            <div className="flex items-center gap-2 text-accent mb-6">
              <Zap size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Parsed Result</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <section>
                  <label className="text-[10px] uppercase tracking-tighter text-gray-500 block mb-2 font-bold">Planned Action</label>
                  <p className="text-xl font-medium">{intention.action.charAt(0).toUpperCase() + intention.action.slice(1)}</p>
                </section>

                <div className="grid grid-cols-2 gap-4">
                  <section>
                    <label className="text-[10px] uppercase tracking-tighter text-gray-500 block mb-2 font-bold">Target Size</label>
                    <p className="text-lg font-mono">{intention.targetSize ? formatBytes(intention.targetSize) : 'Standard Auto'}</p>
                  </section>
                  <section>
                    <label className="text-[10px] uppercase tracking-tighter text-gray-500 block mb-2 font-bold">Target Format</label>
                    <p className="text-lg font-mono">{intention.format?.toUpperCase() || 'Auto (Original)'}</p>
                  </section>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-border h-1 rounded-full overflow-hidden">
                    <div className="bg-white h-full transition-all duration-1000" style={{ width: `${intention.confidence * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">{Math.round(intention.confidence * 100)}% Confidence</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-tighter text-gray-500 block mb-2 font-bold">AI Suggestions & Warnings</label>
                <div className="space-y-3">
                  {intention.suggestions.map((s, i) => (
                    <div key={i} className="flex gap-3 text-sm p-3 bg-white/5 border border-border rounded-lg">
                      <ShieldAlert size={16} className={s.includes('Warning') ? 'text-white' : 'text-gray-500'} />
                      <p className={s.includes('Warning') ? 'text-white font-medium' : 'text-gray-400'}>{s}</p>
                    </div>
                  ))}
                  {intention.suggestions.length === 0 && (
                    <p className="text-sm text-gray-600 italic">No warnings. Optimal parameters detected.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4 pt-8 border-t border-border">
              <Button size="lg" className="flex-1 gap-2" onClick={() => navigate('/dashboard')}>
                Apply Settings <FileCheck size={18} />
              </Button>
              <Button size="lg" variant="secondary" className="flex-1 gap-2" onClick={() => navigate('/compress-image')}>
                Edit Manually <Settings2 size={18} />
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4">How it works</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              SizePilot uses a rule-based inference engine to translate your natural language requests into specific compression parameters. 
              The engine prioritizes image quality while meeting strict file size constraints provided in your prompt.
            </p>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default AICommandPage;

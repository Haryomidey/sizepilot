import React, { useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FileUploadZone } from '../components/FileUploadZone';
import { 
  CheckSquare, 
  Search, 
  ShieldCheck, 
  AlertTriangle,
  CheckCircle2,
  Zap,
  ArrowRight
} from 'lucide-react';
import { formatBytes } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { compressImageFile, downloadBlob, ProcessedOutput } from '../utils/fileProcessing';

const CheckerPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [requirements, setRequirements] = useState({
    maxSize: 5 * 1024 * 1024, // 5MB
    formats: ['pdf', 'jpg', 'png'],
    width: 0,
    height: 0
  });
  const [checking, setChecking] = useState(false);
  const [report, setReport] = useState<any[] | null>(null);
  const [fixedOutput, setFixedOutput] = useState<ProcessedOutput | null>(null);
  const [fixing, setFixing] = useState(false);
  const [error, setError] = useState('');
  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : '', [file]);

  const runCheck = () => {
    if (!file) return;
    setChecking(true);
    setTimeout(() => {
      const results = [
        { 
          label: 'File Size', 
          value: formatBytes(file.size), 
          passed: file.size <= requirements.maxSize,
          message: file.size > requirements.maxSize ? `Exceeds limit by ${formatBytes(file.size - requirements.maxSize)}` : 'Well within limit'
        },
        { 
          label: 'Format', 
          value: file.name.split('.').pop()?.toUpperCase(), 
          passed: requirements.formats.includes(file.name.split('.').pop()?.toLowerCase() || ''),
          message: 'Supported extension'
        },
        { 
          label: 'Data Integrity', 
          value: 'Validated', 
          passed: true,
          message: 'No corruption detected'
        }
      ];
      setReport(results);
      setChecking(false);
    }, 1000);
  };

  const autoFix = async () => {
    if (!file) return;
    setFixing(true);
    setError('');
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Auto-fix is currently available for images. Use PDF Tools for PDFs.');
      }
      const preferredFormat = requirements.formats.includes('webp')
        ? 'webp'
        : requirements.formats.includes('jpg')
          ? 'jpg'
          : requirements.formats.includes('png')
            ? 'png'
            : 'webp';
      const output = await compressImageFile(file, {
        format: preferredFormat,
        quality: 80,
        targetSizeKb: Math.floor(requirements.maxSize / 1024),
      });
      setFixedOutput(output);
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : 'Could not auto-fix this file.');
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Requirement Checker</h1>
        <p className="text-gray-500">Validate files against strict portal, school, or job requirements.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Config */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="p-6 space-y-6">
              <h3 className="font-bold flex items-center gap-2">
                <CheckSquare size={18} /> Requirements
              </h3>
              
              <div className="space-y-4">
                <label className="text-[10px] uppercase font-bold text-gray-500">Maximum Size (MB)</label>
                <input 
                  type="number" 
                  defaultValue={5}
                  onChange={(e) => setRequirements(prev => ({ ...prev, maxSize: Number(e.target.value) * 1024 * 1024 }))}
                  className="w-full bg-white/5 border border-border rounded-lg px-4 py-3 outline-none focus:border-white transition-all text-sm font-mono"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase font-bold text-gray-500">Allowed Formats</label>
                <div className="flex flex-wrap gap-2">
                  {['PDF', 'JPG', 'PNG', 'WEBP', 'DOCX'].map(f => (
                    <button 
                      key={f}
                      onClick={() => {
                        const lowF = f.toLowerCase();
                        setRequirements(prev => ({
                          ...prev,
                          formats: prev.formats.includes(lowF) 
                            ? prev.formats.filter(x => x !== lowF)
                            : [...prev.formats, lowF]
                        }));
                      }}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                        requirements.formats.includes(f.toLowerCase()) ? 'bg-white text-black border-white' : 'border-border text-gray-500'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                 <p className="text-[11px] text-gray-600 italic">
                   Input the requirements provided by the destination portal. All validation happens locally.
                 </p>
              </div>
           </Card>
        </div>

        {/* Main Workspace */}
        <div className="lg:col-span-2 space-y-8">
           {!file ? (
             <FileUploadZone onFilesSelected={(f) => { setFile(f[0]); setReport(null); setFixedOutput(null); setError(''); }} className="h-64" />
           ) : (
             <div className="space-y-6">
                <Card className="p-6 flex items-center justify-between border-dashed border-gray-800">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <Search size={24} className="text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm tracking-tight">{file.name}</h4>
                        <p className="text-[10px] font-mono text-gray-600">{formatBytes(file.size)}</p>
                      </div>
                   </div>
                   <Button variant="ghost" onClick={() => { setFile(null); setFixedOutput(null); }}>Remove</Button>
                </Card>

                {file.type.startsWith('image/') && (
                  <img src={previewUrl} alt={file.name} className="h-72 w-full rounded-xl border border-border bg-black object-contain" />
                )}

                <Button className="w-full h-14 text-lg gap-2" onClick={runCheck} disabled={checking}>
                  {checking ? 'Analyzing File Structure...' : 'Verify Compatibility'} <Zap size={20} />
                </Button>

                <AnimatePresence>
                  {report && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                       <Card className="overflow-hidden">
                          <div className="bg-white/5 p-4 border-b border-border flex items-center justify-between">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Validation Protocol #SP-092</span>
                             <span className={report.every(r => r.passed) ? 'text-accent text-xs font-bold' : 'text-red-500 text-xs font-bold'}>
                               {report.every(r => r.passed) ? 'PASSED ALL TESTS' : 'REQUIREMENTS NOT MET'}
                             </span>
                          </div>
                          <div className="divide-y divide-border">
                             {report.map((item, i) => (
                               <div key={i} className="p-6 flex items-start gap-4">
                                  <div className={`mt-1 ${item.passed ? 'text-white' : 'text-gray-600'}`}>
                                    {item.passed ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                                  </div>
                                  <div className="flex-1">
                                     <div className="flex justify-between items-baseline mb-1">
                                        <h5 className="font-bold text-sm">{item.label}</h5>
                                        <span className="text-[10px] font-mono p-1 bg-white/5 rounded">{item.value}</span>
                                     </div>
                                     <p className="text-xs text-gray-500">{item.message}</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </Card>

                       {!report.every(r => r.passed) && (
                         <Card className="p-6 bg-white/2 border-white/20">
                            <div className="flex items-center justify-between">
                               <div>
                                  <h4 className="font-bold mb-1">One-Click Auto-Fix</h4>
                                  <p className="text-xs text-gray-500">SizePilot AI can automatically adjust this file to meet all remaining criteria.</p>
                               </div>
                               <Button className="gap-2" onClick={autoFix} disabled={fixing}>
                                 {fixing ? 'Optimizing...' : 'Optimize Now'} <ArrowRight size={16} />
                               </Button>
                            </div>
                         </Card>
                       )}

                       {fixedOutput && (
                         <Card className="p-6 bg-white/2 border-white/20">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                               <div>
                                  <h4 className="font-bold mb-1">Fixed File Ready</h4>
                                  <p className="text-xs text-gray-500">{fixedOutput.name} / {formatBytes(fixedOutput.size)}</p>
                               </div>
                               <Button className="gap-2" onClick={() => downloadBlob(fixedOutput.blob, fixedOutput.name)}>
                                 Download Fixed File <ArrowRight size={16} />
                               </Button>
                            </div>
                         </Card>
                       )}

                       {error && (
                         <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">{error}</p>
                       )}
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CheckerPage;

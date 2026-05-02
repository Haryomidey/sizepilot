import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FileUploadZone } from '../components/FileUploadZone';
import { 
  ImageIcon, 
  Settings2, 
  Download, 
  Zap,
  Trash2,
  Eye,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatBytes, generateId } from '../lib/utils';
import { useHistory } from '../hooks/useStorage';
import { blobToDataUrl, compressImageFile, downloadBlob, ProcessedOutput } from '../utils/fileProcessing';

const CompressImagePage: React.FC = () => {
  const location = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState('webp');
  const [targetSize, setTargetSize] = useState<number | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<(ProcessedOutput & { width?: number; height?: number }) | null>(null);
  const [error, setError] = useState('');
  
  const { addHistoryItem } = useHistory();
  const sourcePreviewUrl = useMemo(() => file ? URL.createObjectURL(file) : '', [file]);

  useEffect(() => {
    const routedFile = (location.state as { files?: File[] } | null)?.files?.[0];
    if (routedFile && routedFile.type.startsWith('image/')) setFile(routedFile);
  }, [location.state]);

  useEffect(() => () => {
    if (sourcePreviewUrl) URL.revokeObjectURL(sourcePreviewUrl);
  }, [sourcePreviewUrl]);

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError('');

    try {
      if (result?.previewUrl) URL.revokeObjectURL(result.previewUrl);
      const output = await compressImageFile(file, { format, quality, targetSizeKb: targetSize });
      const previewDataUrl = await blobToDataUrl(file);
      const outputDataUrl = await blobToDataUrl(output.blob);

      setResult(output);
      setIsProcessing(false);

      addHistoryItem({
        id: generateId(),
        name: file.name,
        type: 'image',
        originalSize: file.size,
        newSize: output.size,
        status: 'completed',
        timestamp: Date.now(),
        format,
        quality,
        outputName: output.name,
        outputDataUrl,
        previewDataUrl,
        mimeType: output.mimeType,
      });
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : 'Could not process this image.');
      setIsProcessing(false);
    }
  };

  const reset = () => {
    if (result?.previewUrl) URL.revokeObjectURL(result.previewUrl);
    setFile(null);
    setResult(null);
    setError('');
  };

  const handleFilesSelected = (files: File[]) => {
    const selected = files.find((selectedFile) => selectedFile.type.startsWith('image/'));
    if (!selected) {
      setError('Choose an image file to preview and optimize.');
      return;
    }
    if (result?.previewUrl) URL.revokeObjectURL(result.previewUrl);
    setFile(selected);
    setResult(null);
    setError('');
  };

  const handleDownload = () => {
    if (!result) return;
    downloadBlob(result.blob, result.name);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Image Optimizer</h1>
        <p className="text-[#a1a1aa] text-sm font-medium">Precision optimization for visual asset nodes.</p>
      </header>

      {!file ? (
        <FileUploadZone onFilesSelected={handleFilesSelected} className="h-96" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 space-y-8 bg-surface border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#52525b] flex items-center gap-2">
                  <Settings2 size={12} /> Parameters
                </h3>
                <button onClick={reset} className="text-[#3f3f46] hover:text-white transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#52525b]">Quality Profile: {quality}%</label>
                <input 
                  type="range" 
                  min="1" max="100" 
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-white appearance-none h-1 bg-border rounded-full" 
                />
                <div className="flex justify-between text-[9px] text-[#3f3f46] font-mono tracking-widest uppercase">
                  <span>Efficient</span>
                  <span>Source Match</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#52525b]">Export Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {['webp', 'jpg', 'png', 'avif'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`px-4 py-3 rounded-lg text-[11px] font-bold tracking-widest uppercase border transition-all ${
                        format === f ? 'bg-white text-black border-white' : 'bg-surface-dim text-[#52525b] border-border hover:border-[#3f3f46]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#52525b]">Target Magnitude (Optional)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="500"
                    value={targetSize}
                    onChange={(e) => setTargetSize(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-surface-dim border border-border rounded-lg px-4 py-3 text-sm focus:border-white outline-none font-mono text-white placeholder:text-[#3f3f46]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3f3f46] text-[10px] font-bold uppercase tracking-widest">KB</span>
                </div>
              </div>

              <Button 
                className="w-full h-12 gap-2 text-xs font-bold uppercase tracking-widest rounded-lg" 
                onClick={handleCompress}
                disabled={isProcessing}
              >
                {isProcessing ? 'Optimizing Cluster...' : 'Execute Workflow'} 
                {!isProcessing && <Zap size={14} />}
              </Button>
              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">{error}</p>
              )}
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="aspect-square bg-workspace relative border-border group">
                <div className="absolute top-4 left-4 z-10 bg-black/50 border border-border px-2 py-0.5 rounded text-[9px] uppercase tracking-widest text-[#52525b] font-bold">Source</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src={sourcePreviewUrl} alt={file.name} className="h-full w-full object-contain p-4" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                   <div className="text-[10px] font-mono text-[#52525b] truncate max-w-30">{file.name}</div>
                   <div className="text-[10px] font-bold font-mono text-white">{formatBytes(file.size)}</div>
                </div>
              </Card>

              <Card className="aspect-square bg-workspace relative border-border group">
                <div className="absolute top-4 left-4 z-10 bg-white text-black px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-widest">Optimized</div>
                <AnimatePresence>
                  {isProcessing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 bg-black/90 flex flex-col items-center justify-center p-8 text-center"
                    >
                      <div className="w-12 h-px bg-white/10 mb-4 overflow-hidden">
                        <motion.div 
                          className="h-full bg-white"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                      </div>
                      <p className="text-[9px] text-[#52525b] font-mono uppercase tracking-[0.2em]">Quantizing data nodes...</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {result ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-700">
                      <div className="text-center">
                        <div className="text-xs text-[#52525b] font-mono mb-1 uppercase tracking-widest">Output Magnitude</div>
                        <div className="text-5xl font-bold tracking-tighter mb-4">{formatBytes(result.size)}</div>
                        <div className="inline-block px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-widest rounded-full">
                          {Math.round((1 - result.size / file.size) * 100)}% Mass Reduction
                        </div>
                      </div>
                      {result.previewUrl && (
                        <img src={result.previewUrl} alt={`Optimized ${file.name}`} className="absolute inset-0 h-full w-full object-contain p-4 opacity-20" />
                      )}
                      <Button className="mt-12 w-full gap-2 text-xs font-bold uppercase tracking-widest h-10 border-border relative z-10" variant="outline" onClick={handleDownload}>
                        Export Result <Download size={14} />
                      </Button>
                   </div>
                ) : (
                   <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10">
                      <Eye size={64} className="text-white" />
                      <p className="text-[10px] uppercase tracking-[0.3em] font-bold mt-4">Node Pending</p>
                   </div>
                )}
              </Card>
            </div>

            {/* Quality Summary */}
            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-5 bg-surface-dim border-border flex gap-5 items-start">
                   <div className="mt-1 p-2 bg-surface rounded border border-border">
                     <AlertCircle size={16} className="text-[#52525b]" />
                   </div>
                   <div>
                     <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#52525b] mb-1">Compression Report</h4>
                     <p className="text-sm text-[#a1a1aa] leading-relaxed font-medium">
                       Process profile: <span className="text-white font-mono">{quality}% Purity</span>. 
                       Encoded via <span className="text-white font-bold">{format.toUpperCase()}</span>. 
                       Structural integrity verified for standard deployment.
                     </p>
                   </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompressImagePage;
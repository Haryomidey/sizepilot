import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FileUploadZone } from '../components/FileUploadZone';
import { RefreshCcw, Download, ArrowRight, Zap, Info } from 'lucide-react';
import { formatBytes, generateId } from '../lib/utils';
import { useHistory } from '../hooks/useStorage';
import { blobToDataUrl, convertImageFile, copyFileOutput, downloadBlob, ProcessedOutput } from '../utils/fileProcessing';

const ConvertPage: React.FC = () => {
  const location = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('webp');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedOutput | null>(null);
  const [error, setError] = useState('');
  const { addHistoryItem } = useHistory();
  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : '', [file]);

  useEffect(() => {
    const routedFile = (location.state as { files?: File[] } | null)?.files?.[0];
    if (routedFile) handleFile([routedFile]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFile = (files: File[]) => {
    const f = files[0];
    setFile(f);
    setFrom(f.name.split('.').pop() || '');
    setResult(null);
    setError('');
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError('');

    try {
      const output = file.type.startsWith('image/')
        ? await convertImageFile(file, to)
        : await copyFileOutput(file);
      const previewDataUrl = file.type.startsWith('image/') ? await blobToDataUrl(file) : undefined;
      const outputDataUrl = output.size <= 4 * 1024 * 1024 ? await blobToDataUrl(output.blob) : undefined;
      setResult(output);
      setIsProcessing(false);

      addHistoryItem({
        id: generateId(),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : file.type.includes('pdf') ? 'pdf' : file.type.startsWith('video/') ? 'video' : 'other',
        originalSize: file.size,
        newSize: output.size,
        status: 'completed',
        timestamp: Date.now(),
        format: to,
        outputName: output.name,
        outputDataUrl,
        previewDataUrl,
        mimeType: output.mimeType,
      });
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : 'Could not convert this file.');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) downloadBlob(result.blob, result.name);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">File Converter</h1>
        <p className="text-gray-500">Switch formats effortlessly while maintaining header integrity.</p>
      </header>

      {!file ? (
        <FileUploadZone onFilesSelected={handleFile} className="h-96" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <Card className="p-8 space-y-8">
              <h3 className="font-bold flex items-center gap-3">
                <RefreshCcw size={20} /> Transformation Logic
              </h3>
              
              <div className="flex items-center gap-6">
                 <div className="flex-1 p-6 bg-white/5 border border-border rounded-2xl text-center">
                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-2">Source</p>
                    <p className="text-2xl font-bold font-mono">{from.toUpperCase()}</p>
                 </div>
                 <ArrowRight className="text-gray-700" size={32} />
                 <div className="flex-1 p-6 bg-white/2 border border-white/20 rounded-2xl text-center relative overflow-hidden">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Target</p>
                    <select 
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="bg-transparent text-2xl font-bold font-mono text-center w-full outline-none appearance-none"
                    >
                      <option value="webp">WEBP</option>
                      <option value="png">PNG</option>
                      <option value="jpg">JPG</option>
                      <option value="avif">AVIF</option>
                      <option value="pdf">PDF</option>
                    </select>
                 </div>
              </div>

              <div className="p-6 bg-accent/2 border border-dashed border-accent/20 rounded-xl flex gap-4">
                 <Info size={20} className="text-gray-500 shrink-0 mt-1" />
                 <p className="text-xs text-gray-500 leading-relaxed">
                   Converting to <span className="text-white font-bold">{to.toUpperCase()}</span> typically results in a 
                   <span className="text-accent font-bold"> 40-70% reduction </span> 
                   in file size without visual loss.
                 </p>
              </div>

              <Button className="w-full h-14 text-lg gap-2" onClick={handleConvert} disabled={isProcessing}>
                {isProcessing ? 'Rewriting Headers...' : `Convert to ${to.toUpperCase()}`} <Zap size={18} />
              </Button>
              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">{error}</p>
              )}
           </Card>

           <div className="space-y-6">
              <Card className="p-6">
                 <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Source Object</h4>
                    <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Swap File</Button>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-border">
                       <RefreshCcw size={32} className="text-gray-600" />
                    </div>
                    <div className="overflow-hidden">
                       <p className="font-bold truncate text-sm">{file.name}</p>
                       <p className="text-xs font-mono text-gray-500 uppercase">{formatBytes(file.size)} &bull; RAW</p>
                    </div>
                 </div>
                 {file.type.startsWith('image/') && (
                   <img src={previewUrl} alt={file.name} className="mt-6 h-64 w-full rounded-lg border border-border object-contain bg-black" />
                 )}
              </Card>

              {result && (
                <Card className="p-12 text-center border-accent/20 animate-in zoom-in-95 duration-500">
                   <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-6">
                      <Download size={32} />
                   </div>
                   <h3 className="text-2xl font-bold tracking-tight mb-2">Transmutation Complete</h3>
                   <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-8">{formatBytes(result.size)} ready for download</p>
                   {result.previewUrl && (
                     <img src={result.previewUrl} alt={result.name} className="mb-6 h-52 w-full rounded-lg border border-border object-contain bg-black" />
                   )}
                   <Button className="w-full h-12" onClick={handleDownload}>Save {to.toUpperCase()} File</Button>
                </Card>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default ConvertPage;

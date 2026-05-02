import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FileUploadZone } from '../components/FileUploadZone';
import { 
  Trash2, 
  Download, 
  Loader2,
  File as FileIcon
} from 'lucide-react';
import { formatBytes, generateId } from '../lib/utils';
import { useHistory } from '../hooks/useStorage';
import { blobToDataUrl, compressImageFile, copyFileOutput, downloadBlob, ProcessedOutput } from '../utils/fileProcessing';

interface BatchFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  newSize?: number;
  output?: ProcessedOutput;
  previewUrl?: string;
  error?: string;
}

const BatchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addHistoryItem } = useHistory();

  useEffect(() => {
    const routedFiles = (location.state as { files?: File[] } | null)?.files;
    if (routedFiles?.length) handleFiles(routedFiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleFiles = (newFiles: File[]) => {
    const formatted = newFiles.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      file: f,
      status: 'pending' as const,
      previewUrl: URL.createObjectURL(f),
    }));
    setFiles(prev => [...prev, ...formatted]);
  };

  const startBatch = async () => {
    setIsProcessing(true);
    for (let i = 0; i < files.length; i++) {
      const item = files[i];
      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'processing' } : f));

      try {
        const output = item.file.type.startsWith('image/')
          ? await compressImageFile(item.file, { format: 'webp', quality: 80 })
          : await copyFileOutput(item.file);
        const previewDataUrl = item.file.type.startsWith('image/') && item.file.size <= 3 * 1024 * 1024
          ? await blobToDataUrl(item.file)
          : undefined;
        const outputDataUrl = output.size <= 4 * 1024 * 1024 ? await blobToDataUrl(output.blob) : undefined;

        setFiles(prev => prev.map((f, idx) => idx === i ? { 
            ...f, 
            status: 'completed', 
            newSize: output.size,
            output,
        } : f));

        addHistoryItem({
          id: generateId(),
          name: item.file.name,
          type: item.file.type.startsWith('image/') ? 'image' : item.file.type.startsWith('video/') ? 'video' : item.file.type.includes('pdf') ? 'pdf' : 'other',
          originalSize: item.file.size,
          newSize: output.size,
          status: 'completed',
          timestamp: Date.now(),
          format: output.name.split('.').pop() || 'file',
          outputName: output.name,
          outputDataUrl,
          previewDataUrl,
          mimeType: output.mimeType,
        });
      } catch (processingError) {
        setFiles(prev => prev.map((f, idx) => idx === i ? { 
          ...f, 
          status: 'error',
          error: processingError instanceof Error ? processingError.message : 'Could not process this file.',
        } : f));
      }
    }
    setIsProcessing(false);
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const item = prev.find(f => f.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item?.output?.previewUrl) URL.revokeObjectURL(item.output.previewUrl);
      return prev.filter(f => f.id !== id);
    });
  };

  const downloadAll = () => {
    files.filter((item) => item.output).forEach((item, index) => {
      window.setTimeout(() => {
        if (item.output) downloadBlob(item.output.blob, item.output.name);
      }, index * 250);
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Batch Jobs</h1>
          <p className="text-[#a1a1aa] text-sm font-medium">Add several files and process them together. Images are compressed; other files are prepared for download.</p>
        </div>
        {files.length > 0 && (
          <Button onClick={startBatch} disabled={isProcessing} className="w-full sm:w-auto gap-2 h-12 px-8 text-xs font-bold uppercase tracking-widest rounded-lg">
            {isProcessing ? 'Processing files...' : 'Process files'}
          </Button>
        )}
      </header>

      {files.length === 0 ? (
        <FileUploadZone onFilesSelected={handleFiles} className="h-96 bg-surface-dim border-border" />
      ) : (
        <div className="space-y-6">
           <Card className="divide-y divide-border overflow-hidden bg-surface border-border">
             {files.map((item) => (
                <div key={item.id} className="p-4 flex flex-wrap items-center justify-between group hover:bg-white/2 transition-colors gap-4">
                   <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="h-12 w-12 overflow-hidden bg-background rounded border border-border shrink-0 flex items-center justify-center">
                        {item.file.type.startsWith('image/') && item.previewUrl ? (
                          <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" />
                        ) : item.file.type.startsWith('video/') && item.previewUrl ? (
                          <video src={item.previewUrl} muted className="h-full w-full object-cover" />
                        ) : (
                          <FileIcon size={18} className="text-[#52525b]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs uppercase tracking-tight text-white truncate max-w-50 sm:max-w-sm">{item.file.name}</p>
                        <p className="text-[10px] font-mono text-[#52525b] uppercase">{formatBytes(item.file.size)}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-4 sm:gap-8 ml-auto sm:ml-0">
                      {item.status === 'processing' && (
                        <div className="flex items-center gap-2 text-white font-mono text-[10px] uppercase tracking-widest">
                          <Loader2 size={12} className="animate-spin" />
                          <span className="hidden sm:inline">Processing...</span>
                        </div>
                      )}
                      {item.status === 'completed' && (
                        <div className="text-right">
                           <p className="text-[10px] font-bold text-white font-mono">{formatBytes(item.newSize!)}</p>
                           <p className="text-[10px] text-green-500 font-bold font-mono">{Math.round((1 - item.newSize! / item.file.size) * 100)}% smaller</p>
                        </div>
                      )}
                      {item.status === 'error' && (
                        <p className="max-w-48 text-right text-[10px] text-red-300">{item.error}</p>
                      )}
                      {item.output && (
                        <button
                          onClick={() => downloadBlob(item.output!.blob, item.output!.name)}
                          className="p-2 text-[#a1a1aa] hover:text-white transition-colors"
                          aria-label={`Download ${item.output.name}`}
                        >
                          <Download size={16} />
                        </button>
                      )}
                      
                      <button 
                        onClick={() => removeFile(item.id)}
                        disabled={isProcessing}
                        className="p-2 text-[#3f3f46] hover:text-white disabled:opacity-20 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all sm:static sm:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                </div>
             ))}
           </Card>

           <div className="flex flex-col sm:flex-row justify-between items-center bg-surface-dim border border-border p-6 rounded-xl gap-6 sm:gap-0 text-center sm:text-left">
              <div>
                <p className="text-[10px] text-[#52525b] uppercase tracking-[0.2em] font-bold mb-1">Files selected</p>
                <p className="text-lg font-bold tracking-tight">{files.length} {files.length === 1 ? 'file' : 'files'} ready</p>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={() => setFiles([])} disabled={isProcessing} className="flex-1 sm:flex-none text-[10px] font-bold tracking-widest uppercase">Clear list</Button>
                <Button variant="outline" size="sm" onClick={downloadAll} disabled={isProcessing || !files.some((item) => item.output)} className="flex-1 sm:flex-none text-[10px] font-bold tracking-widest uppercase">Download All</Button>
                <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')} disabled={isProcessing} className="flex-1 sm:flex-none text-[10px] font-bold tracking-widest uppercase">Add more</Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default BatchPage;

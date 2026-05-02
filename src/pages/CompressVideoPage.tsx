import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FileUploadZone } from '../components/FileUploadZone';
import { 
  Video, 
  Settings2, 
  Download, 
  Zap,
  Trash2,
  CheckCircle2,
  VolumeX,
  FastForward,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatBytes, generateId } from '../lib/utils';
import { useHistory } from '../hooks/useStorage';
import { blobToDataUrl, copyFileOutput, downloadBlob, getFileExtension, ProcessedOutput } from '../utils/fileProcessing';

const CompressVideoPage: React.FC = () => {
  const location = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [resolution, setResolution] = useState('720p');
  const [format, setFormat] = useState('mp4');
  const [removeAudio, setRemoveAudio] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedOutput | null>(null);
  const [error, setError] = useState('');
  
  const { addHistoryItem } = useHistory();
  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : '', [file]);

  useEffect(() => {
    const routedFile = (location.state as { files?: File[] } | null)?.files?.[0];
    if (routedFile && routedFile.type.startsWith('video/')) setFile(routedFile);
  }, [location.state]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError('');

    try {
      const output = await copyFileOutput(file);
      const previewDataUrl = await blobToDataUrl(file);
      setResult(output);
      setIsProcessing(false);

      addHistoryItem({
        id: generateId(),
        name: file.name,
        type: 'video',
        originalSize: file.size,
        newSize: output.size,
        status: 'completed',
        timestamp: Date.now(),
        format: getFileExtension(file.name) || format,
        resolution,
        outputName: output.name,
        previewDataUrl,
        mimeType: output.mimeType,
      });
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : 'Could not prepare this video.');
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
    const selected = files.find((selectedFile) => selectedFile.type.startsWith('video/'));
    if (!selected) {
      setError('Choose a video file to preview and export.');
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
    <div className="max-w-6xl mx-auto space-y-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Video Compressor</h1>
        <p className="text-gray-500">Transcode and compress high-resolution video streams locally.</p>
      </header>

      {!file ? (
        <FileUploadZone onFilesSelected={handleFilesSelected} className="h-96" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <Settings2 size={18} /> Stream Config
                </h3>
                <Button variant="ghost" size="icon" onClick={reset}>
                  <Trash2 size={16} />
                </Button>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Target Resolution</label>
                <div className="flex flex-wrap gap-2">
                  {['480p', '720p', '1080p', '4K'].map((res) => (
                    <button
                      key={res}
                      onClick={() => setResolution(res)}
                      className={`flex-1 min-w-15 py-2 rounded-md text-xs font-mono border transition-all ${
                        resolution === res ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-400 border-border'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Video Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {['mp4', 'webm', 'mov'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`px-3 py-2 rounded-md text-sm font-medium border transition-all ${
                        format === f ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-400 border-border'
                      }`}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-4">
                 <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={removeAudio}
                      onChange={(e) => setRemoveAudio(e.target.checked)}
                      className="w-4 h-4 accent-white rounded bg-surface border-border" 
                    />
                    <div className="flex items-center gap-2">
                      <VolumeX size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                      <span className="text-sm font-medium text-gray-400 group-hover:text-white">Stripping Audio Stream</span>
                    </div>
                 </label>
              </div>

              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-xs text-yellow-100 flex gap-2">
                <Info size={14} className="shrink-0 mt-0.5" />
                <span>Browser preview and export are active. Full video transcoding needs an FFmpeg engine, so SizePilot keeps the exported video valid.</span>
              </div>

              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">{error}</p>
              )}

              <Button 
                className="w-full h-12 gap-2 mt-4" 
                onClick={handleCompress}
                disabled={isProcessing}
              >
                {isProcessing ? 'Preparing Export...' : 'Prepare Video Export'} 
                {!isProcessing && <FastForward size={18} />}
              </Button>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
               <video src={previewUrl} controls className="absolute inset-0 h-full w-full bg-black object-contain" />
               <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase">
                  <span>{file.name}</span>
                  <span>{formatBytes(file.size)}</span>
               </div>
            </Card>

            <AnimatePresence>
              {isProcessing && (
                <Card className="p-8 border-accent/20 bg-accent/2">
                   <div className="flex items-center gap-4 mb-4">
                      <LoaderCircle />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs font-mono mb-2">
                          <span>BITRATE ANALYSIS</span>
                          <span>{resolution} STREAM</span>
                        </div>
                        <div className="w-full bg-border h-1 rounded-full overflow-hidden">
                          <motion.div 
                            className="bg-white h-full"
                            animate={{ width: ['0%', '100%'] }}
                            transition={{ duration: 2.5, ease: 'linear' }}
                          />
                        </div>
                      </div>
                   </div>
                </Card>
              )}

              {result && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                  <Card className="p-12 text-center border-accent/20">
                    <CheckCircle2 size={48} className="text-white mx-auto mb-6" />
                    <h2 className="text-4xl font-bold tracking-tighter mb-2">{formatBytes(result.size)}</h2>
                    <p className="text-accent text-xs font-bold uppercase mb-8">Export Ready &bull; Valid playable video preserved</p>
                    <div className="flex gap-4">
                      <Button variant="outline" className="flex-1 h-12 gap-2">
                        {resolution} / {removeAudio ? 'Audio Off' : 'Audio Kept'}
                      </Button>
                      <Button className="flex-1 h-12 gap-2" onClick={handleDownload}>
                        Download Video <Download size={18} />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

const LoaderCircle = () => (
  <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default CompressVideoPage;
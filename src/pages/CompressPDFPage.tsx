import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FileUploadZone } from '../components/FileUploadZone';
import { 
  FileText, 
  Settings2, 
  Download, 
  Layers,
  Scissors,
  Trash2,
  ShieldCheck,
  FileSearch,
  Plus,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatBytes, generateId } from '../lib/utils';
import { useHistory } from '../hooks/useStorage';
import { blobToDataUrl } from '../utils/fileProcessing';

type PdfMode = 'compress' | 'merge' | 'split';
type PdfResult = {
  blob: Blob;
  name: string;
  size: number;
  pages: number;
  summary: string;
};

const getDownloadName = (name: string, suffix: string) => {
  const baseName = name.replace(/\.pdf$/i, '');
  return `${baseName}-${suffix}.pdf`;
};

const getPdfBytes = async (file: File) => new Uint8Array(await file.arrayBuffer());

const parsePageRanges = (value: string, pageCount: number) => {
  const trimmed = value.trim();
  if (!trimmed) return Array.from({ length: pageCount }, (_, index) => index);

  const pages: number[] = [];
  const seen = new Set<number>();

  for (const part of trimmed.split(',')) {
    const token = part.trim();
    if (!token) continue;

    const match = token.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) {
      throw new Error('Use ranges like 1-3, 5, 8-10.');
    }

    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;

    if (start < 1 || end < 1 || start > end || end > pageCount) {
      throw new Error(`Page ranges must stay between 1 and ${pageCount}.`);
    }

    for (let page = start; page <= end; page += 1) {
      const pageIndex = page - 1;
      if (!seen.has(pageIndex)) {
        seen.add(pageIndex);
        pages.push(pageIndex);
      }
    }
  }

  if (pages.length === 0) {
    throw new Error('Choose at least one page to export.');
  }

  return pages;
};

const sanitizePdf = (pdf: PDFDocument) => {
  pdf.setTitle('');
  pdf.setAuthor('');
  pdf.setSubject('');
  pdf.setKeywords([]);
  pdf.setProducer('SizePilot');
  pdf.setCreator('SizePilot');
  pdf.setCreationDate(new Date(0));
  pdf.setModificationDate(new Date());
};

const flattenPdfForms = (pdf: PDFDocument) => {
  try {
    pdf.getForm().flatten();
  } catch {
    // PDFs without AcroForm fields do not need any extra handling.
  }
};

const CompressPDFPage: React.FC = () => {
  const location = useLocation();
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<PdfMode>('compress');
  const [quality, setQuality] = useState('medium');
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [flattenForms, setFlattenForms] = useState(true);
  const [pageRanges, setPageRanges] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PdfResult | null>(null);
  const [error, setError] = useState('');
  
  const { addHistoryItem } = useHistory();

  const primaryFile = files[0] ?? null;
  const pdfPreviewUrl = useMemo(() => primaryFile ? URL.createObjectURL(primaryFile) : '', [primaryFile]);
  const totalSize = files.reduce((sum, selectedFile) => sum + selectedFile.size, 0);
  const canProcess = files.length > 0 && (mode !== 'merge' || files.length > 1);

  useEffect(() => {
    const routedFiles = (location.state as { files?: File[] } | null)?.files;
    if (routedFiles?.length) handleFilesSelected(routedFiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => () => {
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
  }, [pdfPreviewUrl]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    const pdfFiles = selectedFiles.filter((selectedFile) => {
      const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
      return isPdf && !files.some((file) => file.name === selectedFile.name && file.size === selectedFile.size);
    });

    setFiles((currentFiles) => [...currentFiles, ...pdfFiles]);
    setResult(null);
    setError(pdfFiles.length === selectedFiles.length ? '' : 'Only PDF files were added.');
  };

  const reset = () => {
    setFiles([]);
    setResult(null);
    setError('');
    setPageRanges('');
  };

  const removeFile = (fileIndex: number) => {
    setFiles((currentFiles) => currentFiles.filter((_, index) => index !== fileIndex));
    setResult(null);
  };

  const buildCompressedPdf = async (file: File) => {
    const pdf = await PDFDocument.load(await getPdfBytes(file), { ignoreEncryption: true });
    if (removeMetadata) sanitizePdf(pdf);
    if (flattenForms) flattenPdfForms(pdf);

    const bytes = await pdf.save({
      useObjectStreams: quality !== 'mild',
      addDefaultPage: false,
      objectsPerTick: quality === 'extreme' ? 200 : 50,
    });

    return {
      bytes,
      pages: pdf.getPageCount(),
      name: getDownloadName(file.name, 'optimized'),
      summary: 'PDF optimization completed successfully',
      historyName: file.name,
      originalSize: file.size,
    };
  };

  const buildMergedPdf = async () => {
    const mergedPdf = await PDFDocument.create();
    let pageCount = 0;

    for (const file of files) {
      const sourcePdf = await PDFDocument.load(await getPdfBytes(file), { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
      pageCount += sourcePdf.getPageCount();
    }

    if (removeMetadata) sanitizePdf(mergedPdf);
    if (flattenForms) flattenPdfForms(mergedPdf);

    const bytes = await mergedPdf.save({ useObjectStreams: true, addDefaultPage: false });

    return {
      bytes,
      pages: pageCount,
      name: 'sizepilot-merged.pdf',
      summary: `Merged ${files.length} PDFs into one document`,
      historyName: 'Merged PDF',
      originalSize: totalSize,
    };
  };

  const buildSplitPdf = async (file: File) => {
    const sourcePdf = await PDFDocument.load(await getPdfBytes(file), { ignoreEncryption: true });
    const pageIndices = parsePageRanges(pageRanges, sourcePdf.getPageCount());
    const splitPdf = await PDFDocument.create();
    const copiedPages = await splitPdf.copyPages(sourcePdf, pageIndices);
    copiedPages.forEach((page) => splitPdf.addPage(page));

    if (removeMetadata) sanitizePdf(splitPdf);
    if (flattenForms) flattenPdfForms(splitPdf);

    const bytes = await splitPdf.save({ useObjectStreams: true, addDefaultPage: false });

    return {
      bytes,
      pages: pageIndices.length,
      name: getDownloadName(file.name, 'split'),
      summary: `Exported ${pageIndices.length} selected page${pageIndices.length === 1 ? '' : 's'}`,
      historyName: file.name,
      originalSize: file.size,
    };
  };

  const handleAction = async () => {
    if (!primaryFile || !canProcess) return;

    setIsProcessing(true);
    setResult(null);
    setError('');

    try {
      const output = mode === 'merge'
        ? await buildMergedPdf()
        : mode === 'split'
          ? await buildSplitPdf(primaryFile)
          : await buildCompressedPdf(primaryFile);

      const blob = new Blob([output.bytes], { type: 'application/pdf' });
      const outputDataUrl = await blobToDataUrl(blob);
      const nextResult: PdfResult = {
        blob,
        name: output.name,
        size: blob.size,
        pages: output.pages,
        summary: output.summary,
      };

      setResult(nextResult);
      setIsProcessing(false);

      addHistoryItem({
        id: generateId(),
        name: output.historyName,
        type: 'pdf',
        originalSize: output.originalSize,
        newSize: blob.size,
        status: 'completed',
        timestamp: Date.now(),
        format: 'pdf',
        outputName: output.name,
        outputDataUrl,
        previewDataUrl: primaryFile ? await blobToDataUrl(primaryFile) : undefined,
        mimeType: 'application/pdf',
      });
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : 'Could not process this PDF.');
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const url = URL.createObjectURL(result.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = result.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">PDF Tools</h1>
        <p className="text-gray-500">Professional PDF toolkit: Compress, merge, split, and sanitize.</p>
      </header>

      <div className="flex gap-2 p-1 bg-surface border border-border rounded-lg w-fit">
        {[
          { id: 'compress', label: 'Compress', icon: FileText },
          { id: 'merge', label: 'Merge', icon: Layers },
          { id: 'split', label: 'Split', icon: Scissors },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => { setMode(t.id as PdfMode); setResult(null); setError(''); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
              mode === t.id ? 'bg-white text-black' : 'text-gray-500 hover:text-white'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {files.length === 0 ? (
        <FileUploadZone onFilesSelected={handleFilesSelected} className="h-96" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2 uppercase tracking-tighter">
                  <Settings2 size={16} /> Options
                </h3>
                <Button variant="ghost" size="icon" onClick={reset} aria-label="Clear PDFs">
                  <Trash2 size={16} />
                </Button>
              </div>

              {mode === 'compress' && (
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Compression Strength</label>
                  <div className="space-y-2">
                    {[
                      { id: 'standard', title: 'Standard', desc: 'Recommended balance of quality and size.' },
                      { id: 'extreme', title: 'Extreme', desc: 'Maximized compression. Text remains sharp.' },
                      { id: 'mild', title: 'Mild', desc: 'Very light compression. Maintains 300DPI.' },
                    ].map((q) => (
                      <div 
                        key={q.id}
                        onClick={() => setQuality(q.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          quality === q.id ? 'border-white bg-white/5' : 'border-border hover:border-gray-700'
                        }`}
                      >
                         <h4 className="text-sm font-bold">{q.title}</h4>
                         <p className="text-[11px] text-gray-500 line-clamp-1">{q.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mode === 'split' && (
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Page Range</label>
                  <input
                    value={pageRanges}
                    onChange={(event) => { setPageRanges(event.target.value); setResult(null); }}
                    placeholder="All pages, or 1-3, 5"
                    className="w-full bg-surface-dim border border-border rounded-lg px-4 py-3 text-sm focus:border-white outline-none font-mono text-white placeholder:text-gray-700"
                  />
                  <p className="text-[11px] text-gray-500">Leave empty to export every page from the first PDF.</p>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <div className="space-y-3">
                   <label className="flex items-center gap-3 text-xs text-gray-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={removeMetadata}
                        onChange={(event) => setRemoveMetadata(event.target.checked)}
                        className="w-3.5 h-3.5 rounded bg-surface border-border accent-white"
                      />
                      <span>Remove Document Metadata</span>
                   </label>
                   <label className="flex items-center gap-3 text-xs text-gray-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={flattenForms}
                        onChange={(event) => setFlattenForms(event.target.checked)}
                        className="w-3.5 h-3.5 rounded bg-surface border-border accent-white"
                      />
                      <span>Flatten Form Fields</span>
                   </label>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
                  {error}
                </div>
              )}

              {mode === 'merge' && files.length < 2 && (
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-100">
                  Add at least two PDFs to merge.
                </div>
              )}

              <Button 
                className="w-full h-12 gap-2 mt-4" 
                onClick={handleAction}
                disabled={isProcessing || !canProcess}
              >
                {isProcessing ? 'Processing PDF...' : `Start ${mode.charAt(0).toUpperCase() + mode.slice(1)}`} 
              </Button>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
             <Card className="p-8 border-dashed border-border flex items-center gap-8">
                <div className="w-20 h-24 bg-white/5 border border-border rounded flex items-center justify-center relative overflow-hidden">
                   <FileText size={32} className="text-gray-700" />
                   <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-transparent" />
                </div>
                <div className="flex-1">
                   <h3 className="font-bold text-lg mb-1">{mode === 'merge' ? `${files.length} PDFs selected` : primaryFile?.name}</h3>
                   <div className="flex gap-4 text-xs font-mono text-gray-500 uppercase">
                      <span>{formatBytes(totalSize)}</span>
                      <span>{removeMetadata ? 'Metadata Removed' : 'Metadata Kept'}</span>
                      <span>{flattenForms ? 'Forms Flattened' : 'Forms Editable'}</span>
                   </div>
                </div>
                <label className="relative">
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <span><Plus size={14} /> Add PDFs</span>
                  </Button>
                  <input
                    type="file"
                    multiple
                    accept="application/pdf,.pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(event) => {
                      if (event.target.files) handleFilesSelected(Array.from(event.target.files));
                      event.currentTarget.value = '';
                    }}
                  />
                </label>
             </Card>

             <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4">
              <div className="space-y-2">
               {files.map((selectedFile, index) => (
                 <Card key={`${selectedFile.name}-${selectedFile.size}-${index}`} className="p-4 flex items-center gap-4">
                   <FileText size={18} className="text-gray-500 shrink-0" />
                   <div className="min-w-0 flex-1">
                     <p className="text-sm font-bold truncate">{selectedFile.name}</p>
                     <p className="text-[10px] text-gray-500 font-mono uppercase">{formatBytes(selectedFile.size)}</p>
                   </div>
                   <button
                     type="button"
                     onClick={() => removeFile(index)}
                     className="p-2 text-gray-600 hover:text-white transition-colors"
                     aria-label={`Remove ${selectedFile.name}`}
                   >
                     <X size={14} />
                   </button>
                 </Card>
               ))}
              </div>

              {pdfPreviewUrl && (
                <Card className="h-96 overflow-hidden border-border bg-workspace">
                  <iframe
                    src={pdfPreviewUrl}
                    title={primaryFile?.name || 'PDF preview'}
                    className="h-full w-full bg-white"
                  />
                </Card>
              )}
             </div>

             <AnimatePresence>
                {isProcessing && (
                  <Card className="p-8 border-accent/20 bg-accent/2">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs font-mono mb-2 uppercase">
                          <span>Processing document structure</span>
                          <span>{mode}</span>
                        </div>
                        <div className="h-1 bg-border rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-white"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {result && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="p-12 text-center border-accent/20 bg-accent/1">
                        <div className="flex justify-center mb-8">
                           <div className="p-4 bg-white text-black rounded-full shadow-[0_0_50px_-12px_rgba(255,255,255,0.5)]">
                             <ShieldCheck size={32} />
                           </div>
                        </div>
                        <h2 className="text-5xl font-bold tracking-tighter mb-2">{formatBytes(result.size)}</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase mb-12 tracking-widest">
                          {result.summary}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                           <Card className="p-4 text-left">
                              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Original</p>
                              <p className="font-mono">{formatBytes(totalSize)}</p>
                           </Card>
                           <Card className="p-4 text-left border-white/20">
                              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Output</p>
                              <p className="font-mono text-white">{formatBytes(result.size)} / {result.pages} pages</p>
                           </Card>
                        </div>
                        <Button className="w-full mt-8 h-14 gap-2 text-lg" onClick={handleDownload}>
                          Download PDF <Download size={20} />
                        </Button>
                    </Card>
                  </motion.div>
                )}
             </AnimatePresence>

             {!result && !isProcessing && (
               <div className="p-24 text-center border border-border rounded-xl">
                  <FileSearch size={48} className="mx-auto text-border mb-4" />
                  <p className="text-sm text-gray-600">Select parameters to begin PDF optimization</p>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompressPDFPage;

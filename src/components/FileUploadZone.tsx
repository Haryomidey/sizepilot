import React from 'react';
import { 
  Upload,
  Image as ImageIcon,
  Video,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  className?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onFilesSelected, className }) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-xl border border-border transition-all duration-300 p-12 text-center flex flex-col items-center justify-center group",
        isDragging ? "bg-surface border-white" : "bg-surface-dim hover:bg-[#0d0d0d] hover:border-[#3f3f46]",
        className
      )}
    >
      <input
        type="file"
        multiple
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={(e) => {
          if (e.target.files) onFilesSelected(Array.from(e.target.files));
        }}
      />
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <Upload className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-medium mb-2 tracking-tight text-white">Add Files</h3>
          <p className="text-[#52525b] text-sm font-medium uppercase tracking-widest">or drag and drop here</p>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center">
              <ImageIcon size={10} className="text-[#52525b]" />
            </div>
            <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center">
              <Video size={10} className="text-[#52525b]" />
            </div>
            <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center">
              <FileText size={10} className="text-[#52525b]" />
            </div>
          </div>
          <p className="text-[10px] text-[#3f3f46] font-mono">Supports JPG, PNG, MP4, PDF & more</p>
        </div>
      </div>
      
      {/* Corner Accents */}
      <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-border"></div>
      <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-border"></div>
      <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-border"></div>
      <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-border"></div>
    </div>
  );
};

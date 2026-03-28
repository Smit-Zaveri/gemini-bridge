import React, { useState, useRef } from "react";
import { Upload, X, FileText, Image as ImageIcon, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface MediaDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  onClear: () => void;
}

export function MediaDropzone({ onFilesSelected, onClear }: MediaDropzoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      onFilesSelected([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (newFiles.length === 0) onClear();
    else onFilesSelected(newFiles);
  };

  const isImage = (file: File) => file.type.startsWith('image/');

  return (
    <div className="space-y-4">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "h-48 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all",
          files.length > 0 && "border-brand-primary/30 bg-brand-primary/5"
        )}
      >
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,application/pdf"
        />
        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4">
          <Upload className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm font-bold text-white">Click or drag to upload</p>
        <p className="text-xs text-slate-500 mt-1">Images or PDFs (Max 10MB each)</p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {files.map((file, i) => (
            <div key={i} className="relative group bg-bg-elevated border border-white/5 rounded-xl p-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                {isImage(file) ? (
                  <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <FileText className="w-5 h-5 text-brand-primary" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{file.name}</p>
                <p className="text-[10px] text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                aria-label={`Remove ${file.name}`}
                className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

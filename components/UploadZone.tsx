import React, { useRef, useState, DragEvent } from 'react';
import { Upload, X } from 'lucide-react';

interface UploadZoneProps {
  label: string;
  previewUrl: string | null;
  onUpload: (file: File) => void;
  onClear: () => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ label, previewUrl, onUpload, onClear }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    // Only open file dialog if no image is present, or if user explicitly wants to replace via click?
    // Usually clicking a preview is ambiguous (view vs replace). 
    // Current logic: click only works if empty. Clear button handles removal.
    if (!previewUrl) {
      inputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // Basic validation for image type
      if (file.type.startsWith('image/')) {
        onUpload(file);
      }
    }
  };

  // Determine styles based on state
  let borderClass = 'border-gray-700';
  let bgClass = '';
  
  if (isDragging) {
    borderClass = 'border-blue-500 ring-1 ring-blue-500';
    bgClass = 'bg-blue-500/10';
  } else if (previewUrl) {
    borderClass = 'border-gray-700';
    bgClass = 'bg-gray-900';
  } else {
    borderClass = 'border-gray-700 hover:border-gray-500';
    bgClass = 'hover:bg-gray-800';
  }

  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group w-full aspect-[3/2] rounded-lg border border-dashed transition-all duration-200 flex items-center justify-center cursor-pointer overflow-hidden ${borderClass} ${bgClass}`}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Uploaded" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            {/* Overlay for drag state when image exists */}
            {isDragging && (
                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                    <span className="text-white font-medium text-sm drop-shadow-md">Drop to Replace</span>
                </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="absolute top-2 right-2 p-1 bg-black/70 rounded-full text-white hover:bg-red-600 transition-colors z-10"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="text-center p-2 pointer-events-none">
            <Upload size={20} className={`mx-auto mb-2 transition-colors ${isDragging ? 'text-blue-500' : 'text-gray-500'}`} />
            <span className={`text-xs block transition-colors ${isDragging ? 'text-blue-400' : 'text-gray-500'}`}>
              {isDragging ? 'Drop Image Here' : 'Click or Drop to upload'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadZone;
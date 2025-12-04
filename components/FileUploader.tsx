import React, { useRef } from 'react';
import { UploadedFile } from '../types';

interface FileUploaderProps {
  onFilesSelected: (files: UploadedFile[]) => void;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles: UploadedFile[] = Array.from<File>(event.target.files).map((file: File) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      onFilesSelected(newFiles);
      // Reset input so same files can be selected again if needed
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        const newFiles: UploadedFile[] = Array.from<File>(event.dataTransfer.files)
        .filter((f: File) => f.type.startsWith('image/'))
        .map((file: File) => ({
          id: Math.random().toString(36).substr(2, 9),
          file,
          previewUrl: URL.createObjectURL(file),
        }));
      onFilesSelected(newFiles);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
        disabled
          ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
          : 'border-orange-300 bg-orange-50/50 hover:bg-orange-50 hover:border-orange-400 cursor-pointer'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept="image/*"
        disabled={disabled}
      />
      <div className="flex flex-col items-center space-y-3">
        <div className="p-3 bg-white rounded-full shadow-sm text-orange-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-medium text-slate-700">
            Upload Marathi Handwritten Images
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Drag & drop or click to browse (JPEG, PNG)
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
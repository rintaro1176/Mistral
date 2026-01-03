'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileDropzoneProps {
  onFilesAdded: (files: File[]) => void;
}

export default function FileDropzone({ onFilesAdded }: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAdded(acceptedFiles);
    },
    [onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/avif': ['.avif'],
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-colors duration-200
        ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="text-lg">
          {isDragActive ? (
            <p className="text-blue-600 font-medium">
              PDF・画像ファイルをここにドロップ
            </p>
          ) : (
            <div>
              <p className="text-gray-700 font-medium">
                PDF・画像ファイルをドラッグ&ドロップ
              </p>
              <p className="text-sm text-gray-500 mt-2">
                またはクリックしてファイルを選択
              </p>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500">
          PDF、PNG、JPG、AVIF対応 | 複数ファイル可 | 1ファイル最大10MB
        </p>
      </div>
    </div>
  );
}

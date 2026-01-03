'use client';

import { useState } from 'react';
import FileDropzone from '@/components/FileDropzone';
import FileList from '@/components/FileList';
import ProcessingStatus from '@/components/ProcessingStatus';
import MarkdownPreview from '@/components/MarkdownPreview';
import DownloadButton from '@/components/DownloadButton';
import CopyButton from '@/components/CopyButton';
import { APIResponse } from '@/lib/types';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [result, setResult] = useState<{ markdown: string; pages: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setError(null);
  };

  const handleReorder = (reorderedFiles: File[]) => {
    setFiles(reorderedFiles);
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      setError('ファイルを追加してください');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setProcessingStatus(`${files.length}個のファイルを処理中...`);

    try {
      // FormDataを作成
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      // API呼び出し
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const data: APIResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'OCR処理に失敗しました');
      }

      setResult({
        markdown: data.markdown!,
        pages: data.pages!,
      });
      setProcessingStatus('');
    } catch (err) {
      console.error('処理エラー:', err);
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      setProcessingStatus('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mistral OCR
          </h1>
          <p className="text-lg text-gray-600">
            PDF・画像ファイルをMarkdownに変換
          </p>
          <p className="text-sm text-gray-500 mt-2">
            複数のファイルを統合し、図表番号を自動的に付番します
          </p>
        </div>

        {/* ファイルドロップゾーン */}
        <div className="mb-8">
          <FileDropzone onFilesAdded={handleFilesAdded} />
        </div>

        {/* ファイルリスト */}
        {files.length > 0 && (
          <div className="mb-8">
            <FileList
              files={files}
              onReorder={handleReorder}
              onRemove={handleRemove}
            />
          </div>
        )}

        {/* 処理開始ボタン */}
        {files.length > 0 && !isProcessing && !result && (
          <div className="mb-8 text-center">
            <button
              onClick={handleProcess}
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg rounded-lg shadow-lg transition-colors duration-200"
            >
              <svg
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              OCR処理を開始
            </button>
          </div>
        )}

        {/* 処理状況 */}
        {isProcessing && (
          <div className="mb-8">
            <ProcessingStatus message={processingStatus} />
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-red-600 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
          </div>
        )}

        {/* 結果表示 */}
        {result && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  変換完了
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {result.pages}ページを処理しました
                </p>
              </div>
              <div className="flex gap-3">
                <CopyButton markdown={result.markdown} />
                <DownloadButton markdown={result.markdown} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                プレビュー
              </h3>
              <MarkdownPreview markdown={result.markdown} />
            </div>

            {/* リセットボタン */}
            <div className="text-center">
              <button
                onClick={() => {
                  setFiles([]);
                  setResult(null);
                  setError(null);
                }}
                className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                新しいファイルを処理
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

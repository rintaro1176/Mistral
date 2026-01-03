'use client';

import { useState } from 'react';

interface CopyButtonProps {
  markdown: string;
}

export default function CopyButton({ markdown }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Clipboard API（モダンブラウザ）
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // フォールバック（古いブラウザ）
      try {
        const textarea = document.createElement('textarea');
        textarea.value = markdown;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        alert('コピーに失敗しました。ブラウザの設定を確認してください。');
      }
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center px-6 py-3 font-medium rounded-lg shadow-sm transition-all duration-200 ${
        copied ? 'bg-blue-600 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'
      }`}
    >
      {copied ? (
        <>
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          コピーしました！
        </>
      ) : (
        <>
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Markdownをコピー
        </>
      )}
    </button>
  );
}

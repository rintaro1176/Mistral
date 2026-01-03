import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mistral OCR - PDFをMarkdownに変換',
  description: 'Mistral AIを使用してPDFをMarkdownに変換するWebアプリケーション',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}

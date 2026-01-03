# Mistral OCR Web アプリケーション

Mistral AI OCR APIを使用してPDFファイルをMarkdownに変換するWebアプリケーションです。

## 主要機能

- 📄 **複数PDFのドラッグ&ドロップアップロード**
- 🔢 **ファイル順序の変更** - ドラッグ&ドロップで処理順序を調整可能
- 🔗 **統合Markdown生成** - 複数PDFを一つなぎのMarkdownファイルに変換
- 🏷️ **図表番号の自動付番** - 図1, 図2... / 表1, 表2... と全PDF通して連番を付与
- 🖼️ **画像のBase64埋め込み** - 単一ファイルで完結
- 👁️ **Markdownプレビュー** - ブラウザ上でレンダリング表示
- ⬇️ **ダウンロード** - 生成されたMarkdownファイルをダウンロード可能

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **OCR API**: Mistral AI OCR API
- **デプロイ**: Vercel

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、Mistral AI APIキーを設定:

```bash
MISTRALAI_API_KEY=your_api_key_here
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## ビルド

```bash
npm run build
```

## Vercelへのデプロイ

### 方法1: Vercel CLI

```bash
# Vercel CLIのインストール
npm install -g vercel

# ログイン
vercel login

# デプロイ
vercel

# 本番環境へのデプロイ
vercel --prod
```

### 方法2: Vercel ダッシュボード

1. [Vercel](https://vercel.com)にログイン
2. 新しいプロジェクトをインポート
3. 環境変数 `MISTRALAI_API_KEY` を設定
4. デプロイ

## 使い方

1. **PDFファイルをアップロード** - ドラッグ&ドロップまたはクリックしてファイルを選択
2. **ファイル順序を調整** - ドラッグ&ドロップで処理順序を変更（オプション）
3. **OCR処理を開始** - 「OCR処理を開始」ボタンをクリック
4. **結果を確認** - ブラウザ上でMarkdownをプレビュー
5. **ダウンロード** - 「Markdownをダウンロード」ボタンでファイルを保存

## プロジェクト構造

```
mistral-ocr-web/
├── src/
│   ├── app/                      # App Router
│   │   ├── layout.tsx           # グローバルレイアウト
│   │   ├── page.tsx             # メインページ
│   │   └── api/ocr/route.ts     # OCR APIエンドポイント
│   ├── components/              # Reactコンポーネント
│   │   ├── FileDropzone.tsx    # ドラッグ&ドロップUI
│   │   ├── FileList.tsx         # ファイルリスト・順序管理
│   │   ├── MarkdownPreview.tsx # Markdownプレビュー
│   │   ├── ProcessingStatus.tsx # 処理状況表示
│   │   └── DownloadButton.tsx   # ダウンロードボタン
│   └── lib/                     # ユーティリティ・ロジック
│       ├── mistral-client.ts    # Mistral APIクライアント
│       ├── markdown-generator.ts # Markdown生成・図表番号付番
│       └── types.ts             # TypeScript型定義
├── public/                      # 静的ファイル
├── .env.local                   # 環境変数（gitignore対象）
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── vercel.json                  # Vercelデプロイ設定
```

## 制限事項

- 1ファイルあたりの最大サイズ: 10MB
- 処理時間: 最大60秒（Vercel Serverless Functions制限）
- 対応形式: PDFのみ

## ライセンス

ISC

## 開発元

このプロジェクトは、Mistral AI OCR APIとNext.jsを使用して構築されています。

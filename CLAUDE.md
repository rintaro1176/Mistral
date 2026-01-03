# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このリポジトリには、Mistral AI OCR APIを使用したPDF→Markdown変換ツールが2つ含まれています:

1. **CLIツール** (`MarkdownGen.py`) - 単一PDFを処理するPythonスクリプト
2. **Webアプリケーション** (`mistral-ocr-web/`) - 複数PDFを統合処理するNext.jsアプリ

## 開発環境のセットアップ

### 仮想環境の有効化
```bash
source .venv/bin/activate
```

### 必要なパッケージのインストール
主要な依存関係:
- `mistralai`: Mistral AI API クライアント
- その他の依存関係は`.venv`にインストール済み

新しい依存関係を追加する場合:
```bash
pip install <package-name>
```

### 環境変数の設定
`.env` ファイルに以下を設定:
```
MISTRALAI_API_KEY=your_api_key_here
```

**重要**: `.env` ファイルには実際のAPIキーが含まれているため、Gitにコミットしないこと。

## プロジェクト構造

```
.
├── MarkdownGen.py                # CLIツール: 単一PDFをOCR処理
├── util/
│   └── markdown_utils.py        # Markdown変換ユーティリティ
├── sample.pdf                    # OCR対象のサンプルPDFファイル
├── result/                       # OCR結果の出力ディレクトリ
│   ├── ocr_result.json          # OCR結果のJSON形式
│   └── ocr_result.md            # OCR結果のMarkdown形式
├── .env                          # 環境変数（APIキーなど）
└── mistral-ocr-web/              # Webアプリケーション（Next.js）
    ├── src/
    │   ├── app/                  # App Router
    │   │   ├── page.tsx         # メインページ
    │   │   └── api/ocr/route.ts # OCR APIエンドポイント
    │   ├── components/           # Reactコンポーネント
    │   └── lib/                  # ロジック・ユーティリティ
    ├── package.json
    ├── next.config.js
    ├── vercel.json              # Vercelデプロイ設定
    └── README.md                # Webアプリケーションのドキュメント
```

## アーキテクチャと実装の詳細

### ワークフロー

1. **ファイルアップロード**: `client.files.upload()` を使用してPDFファイルをMistral AIにアップロード
2. **署名付きURL取得**: `client.files.get_signed_url()` でアップロードしたファイルの一時URLを取得
3. **OCR処理**: `client.ocr.process()` でPDFをOCR処理（`mistral-ocr-latest` モデル使用）
4. **結果の保存**:
   - JSON形式で生データを保存
   - `util.markdown_utils.get_combined_markdown()` を使用してMarkdown形式に変換して保存

### 重要な設計上の注意点

- **`util/markdown_utils.py` モジュール**:
  - `MarkdownGen.py:6` でインポートされているが、まだ実装されていない
  - `get_combined_markdown(pdf_response)` 関数を実装する必要がある
  - この関数は `client.ocr.process()` のレスポンスオブジェクトを受け取り、統合されたMarkdown文字列を返す

- **OCRレスポンスの構造**:
  - `include_image_base64=True` オプションで画像データも含まれる
  - レスポンスは `pdf_response.model_dump_json()` でJSON形式に変換可能

## 実行方法

### メインスクリプトの実行
```bash
python MarkdownGen.py
```

実行前の確認事項:
1. `.env` ファイルに正しいAPIキーが設定されていること
2. `sample.pdf` ファイルが存在すること
3. `result/` ディレクトリが存在すること（存在しない場合は自動作成されない）
4. `util/markdown_utils.py` が実装されていること

## テストとデバッグ

現時点でテストフレームワークは設定されていない。

デバッグには以下を推奨:
- IPythonがインストール済みなので、対話的デバッグが可能
- OCR結果のJSON出力を確認して、レスポンス構造を理解する

## Webアプリケーション (`mistral-ocr-web/`)

### 開発コマンド

```bash
cd mistral-ocr-web

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# 本番サーバーの起動
npm run start

# Linter
npm run lint
```

### 主要機能

- 複数PDFのドラッグ&ドロップアップロード
- ファイル順序の変更（ドラッグ&ドロップ）
- 統合Markdown生成（複数PDFを一つなぎに変換）
- 図表番号の自動付番（図1, 図2... / 表1, 表2...）
- Base64画像埋め込み
- Markdownプレビュー表示
- ダウンロード機能

### 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- react-dropzone: ドラッグ&ドロップUI
- @dnd-kit: ファイル順序変更
- react-markdown: Markdownレンダリング

### 環境変数

Webアプリケーションの `.env.local` ファイル:

```
MISTRALAI_API_KEY=your_api_key_here
```

### Vercelデプロイ

```bash
# Vercel CLIでデプロイ
cd mistral-ocr-web
vercel --prod
```

Vercelダッシュボードで環境変数 `MISTRALAI_API_KEY` を設定すること。

## コーディング規約

- コメントは日本語で記述
- シンプルで読みやすいコードを心がける
- 環境変数は `.env` / `.env.local` ファイルで管理
- TypeScript: 型安全性を重視

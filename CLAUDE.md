# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Mistral AI OCR APIを使用したPDF→Markdown変換CLIツール。
図表自動付番 (図1, 図2... / 表1, 表2...) に対応。

## 技術スタック

- **言語**: Python 3.11+
- **パッケージ管理**: uv
- **CLI**: Click
- **API**: mistralai Python SDK
- **出力**: rich (美しいCLI出力)

## プロジェクト構造

```
.
├── pyproject.toml                 # プロジェクト設定
├── .env                           # 環境変数 (MISTRALAI_API_KEY)
├── README.md                      # ドキュメント
│
├── src/
│   └── mistral_ocr/              # メインパッケージ
│       ├── __init__.py
│       ├── __main__.py           # python -m mistral_ocr エントリーポイント
│       ├── cli.py                # Click CLI定義
│       ├── client.py             # Mistral API クライアント
│       ├── markdown_generator.py # Markdown生成・図表付番
│       ├── validators.py         # ファイル検証
│       └── types.py              # 型定義
│
└── result/                       # OCR結果出力
    ├── *.md                      # Markdownファイル
    └── images/                   # 抽出画像ファイル
        └── figure_*.jpg          # 図画像 (連番)
```

## 開発環境セットアップ

### 仮想環境のセットアップ

```bash
# プロジェクトセットアップ (仮想環境作成 + 依存関係インストール)
uv sync

# 開発モードでインストール
uv pip install -e .
```

### 依存関係追加

```bash
uv add <package-name>
```

### 実行方法

```bash
# uv run を使用（推奨）
uv run mistral-ocr process sample.pdf

# 仮想環境を有効化してから実行
source .venv/bin/activate
mistral-ocr process sample.pdf

# モジュールとして実行
python -m mistral_ocr process sample.pdf
```

## 主要機能

1. **図表自動付番**
   - 画像: `![図N](images/figure_N.jpg)\n\n**図N**` (外部ファイルとして保存)
   - 表: Markdown表構文を検出し `**表N**` を挿入

2. **ファイル検証**
   - ファイルサイズ: 最大50MB (Mistral API上限)
   - ページ数: 最大1000ページ (Mistral API上限)

3. **出力形式**
   - Markdown: 図表番号付きMarkdown (デフォルト)
   - JSON: OCR API生レスポンス (オプション)

## アーキテクチャ詳細

### ワークフロー

1. **ファイル検証** (`validators.py`)
   - pypdfでページ数、ファイルサイズチェック

2. **ファイルアップロード** (`client.py`)
   - `client.files.upload()` でMistral AIにアップロード

3. **署名付きURL取得** (`client.py`)
   - `client.files.get_signed_url()` で一時URL取得 (有効期限1時間)

4. **OCR処理** (`client.py`)
   - `client.ocr.process()` でPDFをOCR (mistral-ocr-latest)
   - `include_image_base64=True` でBase64画像埋め込み

5. **Markdown生成** (`markdown_generator.py`)
   - 図表自動付番ロジック適用
   - 画像を外部ファイルとして保存 (images/figure_*.jpg)
   - ページヘッダー、区切り線追加 (オプション)

6. **結果保存** (`cli.py`)
   - Markdown形式で出力 (デフォルト)
   - JSONも出力可能 (--format bothまたはjson)

### 図表自動付番ロジック (TypeScriptから移植)

**画像処理:**
```python
# page.images を走査
for image in page.images:
    counter.image_count += 1

    # Base64画像を外部ファイルとして保存
    image_path = _save_image(
        image.image_base64,
        output_dir,
        counter.image_count
    )  # 戻り値: "images/figure_001.jpg"

    # ![img-X.jpeg](img-X.jpeg) を検出
    pattern = re.compile(rf"!\[{re.escape(image.id)}\]\({re.escape(image.id)}\)")
    # ![図N](images/figure_N.jpg)\n\n**図N** に置換
    replacement = f"![図{counter.image_count}]({image_path})\n\n**図{counter.image_count}**"
    page_markdown = pattern.sub(replacement, page_markdown)
```

**表処理:**
```python
# Markdown表構文 (|...|) を検出
is_table_line = bool(re.match(r"^\s*\|.+\|\s*$", line))
if is_table_line and not in_table:
    in_table = True
    counter.table_count += 1
    result.append(f"**表{counter.table_count}**")
    result.append(line)
```

## コマンドラインオプション

| オプション | 説明 | デフォルト |
|-----------|------|----------|
| `-o, --output` | 出力先ディレクトリ | `./result` |
| `--page-headers` | ページヘッダー (# Page N) を含める | False (デフォルトで非表示) |
| `--format` | 出力形式 (`markdown`, `json`, `both`) | `markdown` |
| `--filename` | 出力ファイル名 (拡張子不要) | `ocr_result_YYYYMMDD_HHMMSS` |
| `--api-key` | Mistral API キー (.envより優先) | 環境変数 |
| `--max-size` | 最大ファイルサイズ (MB) | 50 |
| `--max-pages` | 最大ページ数 | 1000 |

## テスト

```bash
# 基本的な使用
uv run mistral-ocr process sample.pdf

# カスタム出力先
uv run mistral-ocr process sample.pdf -o ~/output

# ページヘッダー付き、JSONも出力
uv run mistral-ocr process sample.pdf --page-headers --format both
```

## コーディング規約

- コメントは日本語で記述
- シンプルで読みやすいコードを心がける
- 型ヒント (type hints) を積極的に使用
- 環境変数は `.env` ファイルで管理

## 重要な注意点

- `.env` ファイルには実際のAPIキーが含まれるため、Gitにコミットしない
- `result/` ディレクトリ内の生成ファイルはGit管理外
- 単一PDFのみ対応 (複数PDFは将来実装予定)
- macOS環境でgit cloneして動作することを目指した設計

## Mistral OCR API制約

- ファイルサイズ: 最大50MB
- ページ数: 最大1000ページ
- 価格: 1000ページあたり2ドル

# Mistral OCR CLI

Mistral AI OCR APIを使用したPDF→Markdown変換CLIツール。
図表自動付番 (図1, 図2... / 表1, 表2...) に対応。

## 特徴

- 単一PDFファイルのOCR処理
- 図表自動付番 (日本語対応)
- 画像を外部ファイルとして保存 (images/figure_001.jpg形式)
- Markdown表構文の自動検出・番号付与
- ファイルサイズ・ページ数制約チェック (50MB, 1000ページ)
- uvを使った高速パッケージ管理
- 美しいCLI出力 (rich)

## インストール

### 必要要件

- Python 3.11以上
- [uv](https://docs.astral.sh/uv/) パッケージマネージャー

### セットアップ

```bash
# リポジトリクローン
git clone <repository-url>
cd Mistral

# uvインストール (未インストールの場合)
curl -LsSf https://astral.sh/uv/install.sh | sh

# プロジェクトセットアップ
uv sync

# 環境変数設定
cp .env.example .env
# エディタで.envファイルを開き、your_api_key_here の部分をあなたのAPIキーに置き換えます
# APIキーは https://console.mistral.ai/ から取得できます

# 開発モードでインストール
uv pip install -e .
```

### APIキーの取得と設定

1. **Mistral AI Consoleにアクセス**
   - https://console.mistral.ai/ にアクセス
   - アカウントを作成またはログイン

2. **APIキーの作成**
   - 左側メニューの「API Keys」をクリック
   - 「Create new key」ボタンをクリック
   - 任意の名前を入力して作成
   - 表示されたAPIキーをコピー（後で表示できないので注意）

3. **.envファイルの編集**
   - プロジェクトルートの`.env`ファイルを開く
   - `MISTRALAI_API_KEY="your_api_key_here"` の `your_api_key_here` 部分を
   - コピーしたAPIキーに置き換える
   - 例: `MISTRALAI_API_KEY="abcd1234efgh5678ijkl9012mnop3456"`

## 使用方法

### 基本的な使用

uvで仮想環境を使用しているため、以下のいずれかの方法で実行してください：

**方法1: uv run を使用（推奨）**
```bash
uv run mistral-ocr process sample.pdf
```

**方法2: 仮想環境を有効化**
```bash
source .venv/bin/activate
mistral-ocr process sample.pdf
# 終了時
deactivate
```

**方法3: Pythonモジュールとして実行**
```bash
python -m mistral_ocr process sample.pdf
```

### オプション

以下の例では`uv run`を使用していますが、仮想環境を有効化している場合は`uv run`を省略できます。

```bash
# カスタム出力先
uv run mistral-ocr process sample.pdf -o ~/Documents/output

# ページヘッダー付き、JSONも出力
uv run mistral-ocr process sample.pdf --page-headers --format both

# カスタムファイル名
uv run mistral-ocr process sample.pdf --filename my_document

# ヘルプ表示
uv run mistral-ocr process --help
```

### コマンドオプション一覧

| オプション | 説明 | デフォルト |
|-----------|------|----------|
| `-o, --output` | 出力先ディレクトリ | `./result` |
| `--page-headers` | ページヘッダー (# Page N) を含める | False (デフォルトで非表示) |
| `--format` | 出力形式 (`markdown`, `json`, `both`) | `markdown` |
| `--filename` | 出力ファイル名 (拡張子不要) | `ocr_result_YYYYMMDD_HHMMSS` |
| `--api-key` | Mistral API キー (.envより優先) | 環境変数 |
| `--max-size` | 最大ファイルサイズ (MB) | 50 |
| `--max-pages` | 最大ページ数 | 1000 |

## Mistral OCR API制約

- ファイルサイズ: 最大50MB
- ページ数: 最大1000ページ
- 価格: 1000ページあたり2ドル

## 開発

```bash
# テスト実行
uv run pytest

# フォーマット
uv run black src/

# Linter
uv run ruff check src/
```

## ライセンス

MIT

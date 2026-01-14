"""
Mistral OCR APIのレスポンスからMarkdownを生成するモジュール。
TypeScript版の図表自動付番ロジックをPythonに移植。
"""

import base64
from datetime import datetime
from pathlib import Path
import re
from typing import Any

from .types import FigureCounter


def _save_image(
    image_base64: str,
    output_dir: Path,
    figure_number: int
) -> str:
    """
    Base64画像をファイルとして保存し、相対パスを返す。

    Args:
        image_base64: Base64エンコードされた画像データ (Data URI形式も可)
        output_dir: 出力先ディレクトリ
        figure_number: 図番号

    Returns:
        Markdownで使用する相対パス (例: images/figure_001.jpg)
    """
    # imagesディレクトリを作成
    images_dir = output_dir / "images"
    images_dir.mkdir(exist_ok=True)

    # Data URI形式の場合、Base64部分のみを抽出
    if "," in image_base64:
        base64_data = image_base64.split(",", 1)[1]
    else:
        base64_data = image_base64

    # Base64デコードしてファイルに保存
    image_data = base64.b64decode(base64_data)
    filename = f"figure_{figure_number:03d}.jpg"
    filepath = images_dir / filename
    filepath.write_bytes(image_data)

    # 相対パスを返す
    return f"images/{filename}"


def generate_markdown(
    ocr_response: Any,
    output_dir: Path,
    include_page_headers: bool = False
) -> str:
    """
    OCRレスポンスから統合Markdownを生成。

    Args:
        ocr_response: Mistral OCR APIのレスポンスオブジェクト
        output_dir: 出力先ディレクトリ (画像ファイル保存用)
        include_page_headers: ページヘッダー (# Page N) を含めるか

    Returns:
        統合されたMarkdown文字列
    """
    counter = FigureCounter()
    markdown = ""
    global_page_number = 0

    for page in ocr_response.pages:
        global_page_number += 1

        if include_page_headers:
            markdown += f"# Page {global_page_number}\n\n"

        page_markdown = page.markdown or ""

        # 画像処理と図番号付与
        if page.images:
            for image in page.images:
                counter.image_count += 1

                # Base64画像を外部ファイルとして保存
                image_path = _save_image(
                    image.image_base64,
                    output_dir,
                    counter.image_count
                )

                # 正規表現でパターンマッチ
                pattern = re.compile(
                    rf"!\[{re.escape(image.id)}\]\({re.escape(image.id)}\)",
                    re.MULTILINE
                )

                # 相対パスを使用したMarkdownに置換
                replacement = (
                    f"![図{counter.image_count}]({image_path})\n\n"
                    f"**図{counter.image_count}**"
                )

                page_markdown = pattern.sub(replacement, page_markdown)

        # 表番号付与
        page_markdown = _add_table_numbers(page_markdown, counter)

        markdown += page_markdown + "\n\n---\n\n"

    return markdown.strip()


def _add_table_numbers(markdown: str, counter: FigureCounter) -> str:
    """
    Markdown内の表構文を検出して表番号を付与。

    Args:
        markdown: 処理対象のMarkdown文字列
        counter: 図表カウンター

    Returns:
        表番号が付与されたMarkdown文字列
    """
    lines = markdown.split("\n")
    result = []
    in_table = False

    for line in lines:
        is_table_line = bool(re.match(r"^\s*\|.+\|\s*$", line))

        if is_table_line and not in_table:
            # 表の開始
            in_table = True
            counter.table_count += 1
            result.append(f"**表{counter.table_count}**")
            result.append(line)
        elif is_table_line and in_table:
            # 表の継続
            result.append(line)
        elif not is_table_line and in_table:
            # 表の終了
            in_table = False
            result.append(line)
        else:
            # 通常の行
            result.append(line)

    return "\n".join(result)


def generate_filename() -> str:
    """
    Markdownファイル名を生成 (例: ocr_result_20260113_143000.md)
    """
    now = datetime.now()
    return now.strftime("ocr_result_%Y%m%d_%H%M%S.md")

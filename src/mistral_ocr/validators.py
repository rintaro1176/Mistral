"""
PDFファイルの検証モジュール。
ファイルサイズ、ページ数制約のチェック。
"""

from pathlib import Path
from pypdf import PdfReader
from typing import Tuple


class ValidationError(Exception):
    """検証エラー"""
    pass


def validate_pdf_file(
    file_path: Path,
    max_size_mb: int = 50,
    max_pages: int = 1000
) -> Tuple[int, int]:
    """
    PDFファイルを検証。

    Args:
        file_path: PDFファイルパス
        max_size_mb: 最大ファイルサイズ (MB)
        max_pages: 最大ページ数

    Returns:
        (ファイルサイズ(bytes), ページ数)

    Raises:
        ValidationError: 検証失敗
    """
    # ファイル存在チェック
    if not file_path.exists():
        raise ValidationError(f"ファイルが見つかりません: {file_path}")

    if not file_path.is_file():
        raise ValidationError(f"ファイルではありません: {file_path}")

    # 拡張子チェック
    if file_path.suffix.lower() != ".pdf":
        raise ValidationError(f"PDFファイルではありません: {file_path}")

    # ファイルサイズチェック
    file_size = file_path.stat().st_size
    max_size_bytes = max_size_mb * 1024 * 1024

    if file_size > max_size_bytes:
        raise ValidationError(
            f"ファイルサイズが上限を超えています: "
            f"{file_size / 1024 / 1024:.2f}MB > {max_size_mb}MB"
        )

    # ページ数チェック
    try:
        reader = PdfReader(file_path)
        num_pages = len(reader.pages)
    except Exception as e:
        raise ValidationError(f"PDFファイルの読み込みに失敗しました: {e}")

    if num_pages > max_pages:
        raise ValidationError(
            f"ページ数が上限を超えています: {num_pages} > {max_pages}"
        )

    return file_size, num_pages

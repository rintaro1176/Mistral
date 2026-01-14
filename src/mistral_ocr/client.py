"""
Mistral OCR APIクライアントモジュール。
既存のMarkdownGen.pyのロジックを関数化。
"""

from pathlib import Path
from mistralai import Mistral, DocumentURLChunk
from typing import Any


def process_pdf_with_ocr(
    pdf_file: Path,
    api_key: str
) -> Any:
    """
    PDFファイルをMistral OCR APIで処理。

    Args:
        pdf_file: PDFファイルパス
        api_key: Mistral API キー

    Returns:
        OCRレスポンスオブジェクト

    Raises:
        Exception: API呼び出しエラー
    """
    try:
        client = Mistral(api_key=api_key)

        # PDFファイルをアップロード
        uploaded_file = client.files.upload(
            file={
                "file_name": pdf_file.stem,
                "content": pdf_file.read_bytes(),
            },
            purpose="ocr",
        )

        # 署名付きURLを取得 (有効期限1時間)
        signed_url = client.files.get_signed_url(
            file_id=uploaded_file.id,
            expiry=1
        )

        # OCR処理
        pdf_response = client.ocr.process(
            document=DocumentURLChunk(document_url=signed_url.url),
            model="mistral-ocr-latest",
            include_image_base64=True
        )

        return pdf_response

    except Exception as e:
        raise Exception(f"OCR処理に失敗しました: {e}")

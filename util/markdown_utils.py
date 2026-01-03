"""
Mistral OCR APIのレスポンスをMarkdown形式に変換するユーティリティモジュール
"""

def get_combined_markdown(ocr_response):
    """
    Mistral OCR APIのレスポンスから統合されたMarkdown文字列を生成する

    Args:
        ocr_response: Mistral OCR APIのレスポンスオブジェクト

    Returns:
        str: 統合されたMarkdown文字列
    """
    markdown_parts = []

    # レスポンスがpagesを持っている場合
    if hasattr(ocr_response, 'pages') and ocr_response.pages:
        for i, page in enumerate(ocr_response.pages, start=1):
            # ページヘッダーを追加
            markdown_parts.append(f"# Page {i}\n")

            # ページのテキストを追加
            if hasattr(page, 'text') and page.text:
                markdown_parts.append(page.text)
            elif hasattr(page, 'markdown') and page.markdown:
                markdown_parts.append(page.markdown)
            elif hasattr(page, 'content') and page.content:
                markdown_parts.append(page.content)

            # ページ区切りを追加
            markdown_parts.append("\n\n---\n\n")

    # レスポンスが直接textを持っている場合
    elif hasattr(ocr_response, 'text'):
        markdown_parts.append(ocr_response.text)

    # レスポンスが直接markdownを持っている場合
    elif hasattr(ocr_response, 'markdown'):
        markdown_parts.append(ocr_response.markdown)

    # それ以外の場合は、レスポンスの文字列表現を使用
    else:
        markdown_parts.append(str(ocr_response))

    return "\n".join(markdown_parts)

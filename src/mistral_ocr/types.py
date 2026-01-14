"""
Mistral OCR APIのレスポンス型定義。
TypeScript版の型をPythonのdataclassに移植。
"""

from typing import List, Optional, Any
from dataclasses import dataclass


@dataclass
class ImageObject:
    """画像オブジェクト"""
    id: str
    top_left_x: int
    top_left_y: int
    bottom_right_x: int
    bottom_right_y: int
    image_base64: str
    image_annotation: Optional[Any] = None


@dataclass
class Dimensions:
    """ページ寸法情報"""
    dpi: int
    height: int
    width: int


@dataclass
class PageObject:
    """ページオブジェクト"""
    index: int
    markdown: str
    images: List[ImageObject]
    dimensions: Dimensions
    tables: List[Any]
    hyperlinks: List[Any]
    header: Optional[str]
    footer: Optional[str]


@dataclass
class UsageInfo:
    """使用情報"""
    pages_processed: int
    doc_size_bytes: int


@dataclass
class FigureCounter:
    """図表カウンター"""
    image_count: int = 0
    table_count: int = 0

// Mistral OCR APIのレスポンス型定義

/** 画像オブジェクトの型 */
export interface ImageObject {
  id: string;
  top_left_x: number;
  top_left_y: number;
  bottom_right_x: number;
  bottom_right_y: number;
  image_base64: string;
  image_annotation: any | null;
}

/** ページ寸法情報の型 */
export interface Dimensions {
  dpi: number;
  height: number;
  width: number;
}

/** テーブルオブジェクトの型 */
export interface TableObject {
  // Mistral APIのtables構造に依存（現在は空配列のため詳細不明）
  [key: string]: any;
}

/** ハイパーリンクオブジェクトの型 */
export interface HyperlinkObject {
  // Mistral APIのhyperlinks構造に依存（現在は空配列のため詳細不明）
  [key: string]: any;
}

/** ページオブジェクトの型 */
export interface PageObject {
  index: number;
  markdown: string;
  images: ImageObject[];
  dimensions: Dimensions;
  tables: TableObject[];
  hyperlinks: HyperlinkObject[];
  header: string | null;
  footer: string | null;
}

/** 使用情報の型 */
export interface UsageInfo {
  pages_processed: number;
  doc_size_bytes: number;
}

/** OCRレスポンスの型 */
export interface OCRResponse {
  pages: PageObject[];
  model: string;
  usage_info: UsageInfo;
  document_annotation: any | null;
}

/** 図表カウンターの型 */
export interface FigureCounter {
  imageCount: number;  // 図のカウンタ
  tableCount: number;  // 表のカウンタ
}

/** API レスポンスの型 */
export interface APIResponse {
  success: boolean;
  markdown?: string;
  pages?: number;
  error?: string;
}

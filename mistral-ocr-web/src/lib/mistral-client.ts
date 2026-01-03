import { Mistral } from '@mistralai/mistralai';
import { OCRResponse } from './types';

/**
 * ファイル名からMIMEタイプを推定する
 *
 * @param fileName - ファイル名
 * @returns MIMEタイプ
 */
function getMimeType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop();
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'avif': 'image/avif',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

/**
 * 単一のファイル（PDFまたは画像）をOCR処理する
 *
 * @param file - 処理対象のファイル（PDFまたは画像）
 * @returns OCRレスポンス
 */
export async function processOCR(file: File): Promise<OCRResponse> {
  // APIキーの確認
  const apiKey = process.env.MISTRALAI_API_KEY;
  if (!apiKey) {
    throw new Error('MISTRALAI_API_KEY環境変数が設定されていません');
  }

  // Mistralクライアントの初期化
  const client = new Mistral({ apiKey });

  try {
    // ファイルをArrayBufferに変換してBufferに変換
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);
    const fileName = file.name;

    // MIMEタイプを動的に取得
    const mimeType = getMimeType(fileName);

    // Node.js環境でFileオブジェクトを作成（Node.js 20+）
    const uploadFile = new File([buffer], fileName, { type: mimeType });

    // ファイルをアップロード
    const uploadedFile = await client.files.upload({
      file: uploadFile,
      purpose: 'ocr',
    });

    // 署名付きURLを取得
    const signedUrl = await client.files.getSignedUrl({
      fileId: uploadedFile.id,
      expiry: 1, // 1時間
    });

    // OCR処理を実行
    const ocrResponse = await client.ocr.process({
      document: {
        documentUrl: signedUrl.url,
      },
      model: 'mistral-ocr-latest',
      includeImageBase64: true,
    });

    // レスポンスはすでにJavaScriptオブジェクトなのでそのまま返す
    return ocrResponse as unknown as OCRResponse;
  } catch (error) {
    console.error('OCR処理エラー:', error);
    throw new Error(`OCR処理に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
}

/**
 * 複数のファイル（PDFまたは画像）を順番にOCR処理する
 *
 * @param files - 処理対象のファイル配列（PDFまたは画像）
 * @returns OCRレスポンスの配列
 */
export async function processMultipleOCR(files: File[]): Promise<OCRResponse[]> {
  const responses: OCRResponse[] = [];

  for (const file of files) {
    try {
      const response = await processOCR(file);
      responses.push(response);
    } catch (error) {
      console.error(`ファイル ${file.name} の処理エラー:`, error);
      throw error;
    }
  }

  return responses;
}

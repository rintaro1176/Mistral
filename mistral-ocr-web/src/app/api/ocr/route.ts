import { NextRequest, NextResponse } from 'next/server';
import { processMultipleOCR } from '@/lib/mistral-client';
import { generateMarkdown } from '@/lib/markdown-generator';
import { APIResponse } from '@/lib/types';

// Route Segment Config
export const maxDuration = 60; // 最大実行時間（秒）
export const dynamic = 'force-dynamic'; // 動的レンダリングを強制

/**
 * POST /api/ocr
 * 複数のPDFファイルをOCR処理してMarkdownを生成
 */
export async function POST(request: NextRequest) {
  try {
    // FormDataからファイルを取得
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    // ファイルのバリデーション
    if (!files || files.length === 0) {
      const errorResponse: APIResponse = {
        success: false,
        error: 'ファイルがアップロードされていません',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // ファイル形式のチェック（PDF・画像）
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.avif'];
    for (const file of files) {
      const fileName = file.name.toLowerCase();
      const isValid = allowedExtensions.some(ext => fileName.endsWith(ext));

      if (!isValid) {
        const errorResponse: APIResponse = {
          success: false,
          error: `不正なファイル形式です: ${file.name}（対応形式: PDF、PNG、JPG、JPEG、AVIF）`,
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }
    }

    // ファイルサイズのチェック（1ファイルあたり10MB以下）
    for (const file of files) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 10) {
        const errorResponse: APIResponse = {
          success: false,
          error: `ファイルサイズが大きすぎます: ${file.name}（10MB以下にしてください）`,
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }
    }

    console.log(`${files.length}個のファイル（PDF・画像）を処理開始`);

    // 複数ファイルを順番にOCR処理
    const ocrResponses = await processMultipleOCR(files);

    // 総ページ数を計算
    const totalPages = ocrResponses.reduce(
      (sum, response) => sum + response.pages.length,
      0
    );

    console.log(`OCR処理完了: ${totalPages}ページ`);

    // 統合Markdownを生成
    const markdown = generateMarkdown(ocrResponses);

    console.log(`Markdown生成完了: ${markdown.length}文字`);

    // レスポンスを返す
    const successResponse: APIResponse = {
      success: true,
      markdown,
      pages: totalPages,
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error('API Routeエラー:', error);

    const errorResponse: APIResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'OCR処理中に不明なエラーが発生しました',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

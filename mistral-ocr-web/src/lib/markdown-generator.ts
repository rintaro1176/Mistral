import { OCRResponse, FigureCounter } from './types';

/**
 * 複数のOCRレスポンスから統合されたMarkdownを生成する
 *
 * @param ocrResponses - OCRレスポンスの配列
 * @param includePageHeaders - ページヘッダー（# Page N）を含めるかどうか（デフォルト: false）
 * @returns 統合されたMarkdown文字列
 */
export function generateMarkdown(ocrResponses: OCRResponse[], includePageHeaders: boolean = false): string {
  const counter: FigureCounter = { imageCount: 0, tableCount: 0 };
  let markdown = '';
  let globalPageNumber = 0;

  for (const response of ocrResponses) {
    for (const page of response.pages) {
      globalPageNumber++;

      // ページヘッダーをオプションで追加
      if (includePageHeaders) {
        markdown += `# Page ${globalPageNumber}\n\n`;
      }

      let pageMarkdown = page.markdown || '';

      // 画像の処理と図番号の付与
      if (page.images && page.images.length > 0) {
        for (const image of page.images) {
          counter.imageCount++;

          // ![img-X.jpeg](img-X.jpeg) を Base64画像に置換
          // 正規表現で画像参照を検出
          const imgPattern = new RegExp(
            `!\\[${escapeRegExp(image.id)}\\]\\(${escapeRegExp(image.id)}\\)`,
            'g'
          );

          // Base64画像への置換文字列を作成
          const replacement = `![図${counter.imageCount}](${image.image_base64})\n\n**図${counter.imageCount}**`;

          pageMarkdown = pageMarkdown.replace(imgPattern, replacement);
        }
      }

      // 表の処理と表番号の付与（将来的な拡張用）
      // Mistral APIのtables配列に情報がある場合の処理
      if (page.tables && page.tables.length > 0) {
        // テーブルの処理ロジック
        // 現在はtables配列が空なので、将来の拡張として保持
        for (const table of page.tables) {
          counter.tableCount++;
          // 表の前後に番号を挿入する処理
          // （具体的な実装はMistral APIのtable構造に依存）
        }
      }

      // Markdown内の表構文（|で区切られた行）を検出して表番号を付与
      pageMarkdown = addTableNumbers(pageMarkdown, counter);

      markdown += pageMarkdown + '\n\n---\n\n';
    }
  }

  return markdown.trim();
}

/**
 * Markdown内の表構文を検出して表番号を付与する
 *
 * @param markdown - 処理対象のMarkdown文字列
 * @param counter - 図表カウンター
 * @returns 表番号が付与されたMarkdown文字列
 */
function addTableNumbers(markdown: string, counter: FigureCounter): string {
  // Markdown表の開始パターン（| で始まる行）
  const tablePattern = /^(\|.+\|)\s*$/gm;
  const lines = markdown.split('\n');
  const result: string[] = [];
  let inTable = false;
  let tableStartIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTableLine = /^\|.+\|/.test(line.trim());

    if (isTableLine && !inTable) {
      // 表の開始
      inTable = true;
      tableStartIndex = i;
      counter.tableCount++;
      result.push(`**表${counter.tableCount}**\n`);
      result.push(line);
    } else if (isTableLine && inTable) {
      // 表の継続
      result.push(line);
    } else if (!isTableLine && inTable) {
      // 表の終了
      inTable = false;
      result.push(line);
    } else {
      // 通常の行
      result.push(line);
    }
  }

  return result.join('\n');
}

/**
 * 正規表現で使用する特殊文字をエスケープする
 *
 * @param string - エスケープする文字列
 * @returns エスケープされた文字列
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Markdownファイルのダウンロード用のファイル名を生成する
 *
 * @returns ファイル名（例: ocr_result_20260101_143000.md）
 */
export function generateFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `ocr_result_${year}${month}${day}_${hours}${minutes}${seconds}.md`;
}

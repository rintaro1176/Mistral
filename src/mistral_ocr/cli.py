"""
CLIエントリーポイント (Click使用)。
"""

import click
from pathlib import Path
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from dotenv import load_dotenv
import os
import json

from .client import process_pdf_with_ocr
from .markdown_generator import generate_markdown, generate_filename
from .validators import validate_pdf_file, ValidationError


console = Console()


@click.group()
def cli():
    """Mistral OCR CLI - PDFをMarkdownに変換 (図表自動付番)"""
    pass


@cli.command()
@click.argument("pdf_file", type=click.Path(exists=True, path_type=Path))
@click.option(
    "-o", "--output",
    type=click.Path(path_type=Path),
    default="./result",
    help="出力先ディレクトリ"
)
@click.option(
    "--page-headers",
    is_flag=True,
    help="ページヘッダー (# Page N) を含める"
)
@click.option(
    "--format",
    type=click.Choice(["markdown", "json", "both"], case_sensitive=False),
    default="markdown",
    help="出力形式"
)
@click.option(
    "--filename",
    type=str,
    default=None,
    help="出力ファイル名 (拡張子不要)"
)
@click.option(
    "--api-key",
    type=str,
    default=None,
    help="Mistral API キー (.envより優先)"
)
@click.option(
    "--max-size",
    type=int,
    default=50,
    help="最大ファイルサイズ (MB)"
)
@click.option(
    "--max-pages",
    type=int,
    default=1000,
    help="最大ページ数"
)
def process(
    pdf_file: Path,
    output: Path,
    page_headers: bool,
    format: str,
    filename: str,
    api_key: str,
    max_size: int,
    max_pages: int
):
    """
    PDFファイルをOCR処理してMarkdownに変換。

    例:
        mistral-ocr process sample.pdf
        mistral-ocr process sample.pdf -o ~/output --page-headers
    """
    # .envファイル読み込み
    load_dotenv()

    # API キー取得
    api_key = api_key or os.getenv("MISTRALAI_API_KEY")
    if not api_key:
        console.print("[red]エラー:[/red] MISTRALAI_API_KEY が設定されていません。", style="bold")
        console.print(".envファイルまたは--api-keyオプションで設定してください。")
        raise click.Abort()

    try:
        # ファイル検証
        console.print(f"[cyan]検証中:[/cyan] {pdf_file}")
        file_size, num_pages = validate_pdf_file(pdf_file, max_size, max_pages)
        console.print(
            f"  ファイルサイズ: {file_size / 1024 / 1024:.2f}MB\n"
            f"  ページ数: {num_pages}"
        )

        # OCR処理
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            task = progress.add_task("[cyan]OCR処理中...", total=None)
            pdf_response = process_pdf_with_ocr(pdf_file, api_key)
            progress.update(task, completed=True)

        console.print("[green]✓[/green] OCR処理完了")

        # 出力ディレクトリ作成
        output.mkdir(parents=True, exist_ok=True)

        # ファイル名生成
        if not filename:
            filename = generate_filename().replace(".md", "")

        # JSON出力
        if format in ["json", "both"]:
            json_path = output / f"{filename}.json"
            response_dict = json.loads(pdf_response.model_dump_json())
            json_string = json.dumps(response_dict, indent=4, ensure_ascii=False)
            json_path.write_text(json_string, encoding="utf-8")
            console.print(f"[green]✓[/green] JSON保存: {json_path}")

        # Markdown出力
        if format in ["markdown", "both"]:
            md_path = output / f"{filename}.md"
            markdown_string = generate_markdown(
                pdf_response,
                output,
                include_page_headers=page_headers
            )
            md_path.write_text(markdown_string, encoding="utf-8")
            console.print(f"[green]✓[/green] Markdown保存: {md_path}")

        console.print("\n[bold green]処理完了![/bold green]")

    except ValidationError as e:
        console.print(f"[red]検証エラー:[/red] {e}", style="bold")
        raise click.Abort()

    except Exception as e:
        console.print(f"[red]エラー:[/red] {e}", style="bold")
        raise click.Abort()


if __name__ == "__main__":
    cli()

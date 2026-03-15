/**
 * Client-side document parsing: extracts text from PDF and DOCX files.
 */

export type SupportedMimeType =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const SUPPORTED_EXTENSIONS: Record<string, SupportedMimeType> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export function getSupportedMimeType(file: File): SupportedMimeType | null {
  if (file.type && Object.values(SUPPORTED_EXTENSIONS).includes(file.type as SupportedMimeType)) {
    return file.type as SupportedMimeType;
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext ? SUPPORTED_EXTENSIONS[ext] ?? null : null;
}

export function isSupported(file: File): boolean {
  return getSupportedMimeType(file) !== null;
}

async function extractFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");

  // Use the bundled worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(pageText);
  }

  return pages.join("\n\n");
}

async function extractFromDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export async function extractText(file: File): Promise<string> {
  const mimeType = getSupportedMimeType(file);
  if (!mimeType) {
    throw new Error(`Unsupported file type: ${file.name}`);
  }

  switch (mimeType) {
    case "application/pdf":
      return extractFromPdf(file);
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return extractFromDocx(file);
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

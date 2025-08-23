export interface Pdf {
  name: string;
  url: string;
}

export interface StoragePdf {
  [key: string]: Pdf;
}

export const NEWPDF_TYPE = "NEWPDF" as const;
export interface NewPdf {
  type: typeof NEWPDF_TYPE;
  pdf: Pdf;
}

export const NEWPDF_BYTES_TYPE = "NEWPDFBYTES" as const;
export interface NewPdfBytes {
  type: typeof NEWPDF_BYTES_TYPE;
  name: string;
  bytes: ArrayBuffer;
}

export const GET_ALL_PDF_TYPE = "GET_ALL_PDF_TYPE" as const;
export interface GetAllPdfUrls {
  type: typeof GET_ALL_PDF_TYPE;
}

// --- New Message Types for Custom Button ---
export const GET_PDF_FOR_CURRENT_TAB_TYPE = "GET_PDF_FOR_CURRENT_TAB" as const;
export interface GetPdfForCurrentTab {
  type: typeof GET_PDF_FOR_CURRENT_TAB_TYPE;
}

export const DOWNLOAD_PDF_TYPE = "DOWNLOAD_PDF" as const;
export interface DownloadPdf {
  type: typeof DOWNLOAD_PDF_TYPE;
  pdf: Pdf;
}
// --- End of New Message Types ---

export interface TransferPdfWorld {
  bytes: ArrayBuffer;
  name: string;
}

// --- Updated Req type to include all possible messages ---
export type Req = 
  | NewPdf 
  | GetAllPdfUrls 
  | NewPdfBytes 
  | GetPdfForCurrentTab 
  | DownloadPdf;

// Define the ScriptParams interface
export interface ScriptParams {
  extId: string;
}

export interface GetPdfsReply {
  currentPdf: Pdf;
  otherPdfs: StoragePdf;
}

export interface UpdateMessage {
  pdf: Pdf;
  isCurrent: boolean;
}

const log = console.log;
const warn = console.warn;
const error = console.error;
const assert = console.assert;

export const c = {
  log: (...messages: any[]): void => {
    log("%c[SD-D]", "background: green; color: white; padding: 2px;", ...messages);
  },
  warn: (...messages: any[]): void => {
    warn("%c[SD-D]", "background: orange; color: black; padding: 2px;", ...messages);
  },
  error: (...messages: any[]): void => {
    error("%c[SD-D]", "background: red; color: white; padding: 2px;", ...messages);
  },
  assert: (a: any, ...messages: any[]): void => {
    assert(a, "%c[SD-D]", "background: red; color: white; padding: 2px;", ...messages);
  },
};

export const api: typeof chrome = (() => {
  try {
    if (chrome) return chrome;
  } catch {}
  /* cfg:firefox */
  try {
    if (browser) return browser as any;
  } catch {}
  /* endcfg */
  return {} as any; // throw Error("Unreachable, no browser api present.");
})();

export async function SHA256(value: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

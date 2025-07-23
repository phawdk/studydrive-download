export interface Pdf {
    name: string,
    url: string,

}

export const NEWPDF_TYPE = "NEWPDF" as const;
export interface NewPdf {
    type: typeof NEWPDF_TYPE;
    pdf: Pdf,
    nonce: string
}

export const GET_ALL_PDF_TYPE = "GET_ALL_PDF_TYPE" as const;
export interface GetAllPdfUrls {
    type: typeof GET_ALL_PDF_TYPE;
}



export type Req = (NewPdf | GetAllPdfUrls ) & {nonce?:string};

// Define the ScriptParams interface
export interface ScriptParams {
    extId: string;
    nonce: string;
}

export interface GetPdfsReply {
    currentPdf: Pdf,
    otherPdfs: Pdf[],
}

export interface UpdateMessage {
    pdf: Pdf,
    isCurrent: boolean,
}
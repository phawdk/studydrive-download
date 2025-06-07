import { Store } from "vuex";
import { forceLoadPostsAndComments, sortCommentsByPage } from "./load-discussion";
import { StoreState } from "./sdtypes";
import { BUTTON_TITLE, GetUrlReply, GetUrlRequest, ID, MESSAGE_TYPE_STRING } from "./types-constants";

type PdfWorker = typeof import("./worker");

export const STATE: {
  store?: Store<StoreState>;
  originalPdfBytes?: ArrayBuffer;
  worker?: PdfWorker;
  buttonContainer?: HTMLDivElement;
  fileName: string;
} = {
  fileName: "sdDownload.pdf",
};

export async function getWorker() {
  if (STATE.worker !== undefined) {
    return STATE.worker;
  }

  const responsePromise = new Promise((resolve) => {
    const responseHandler = (event: CustomEvent<GetUrlReply>) => {
      if (event.detail.type === "GET-URL-REPLY") {
        resolve(event.detail.url);
        window.removeEventListener(MESSAGE_TYPE_STRING, responseHandler as EventListener);
      }
    };

    window.addEventListener(MESSAGE_TYPE_STRING, responseHandler as EventListener);

    const event: CustomEvent<GetUrlRequest> = new CustomEvent(MESSAGE_TYPE_STRING, {
      detail: {
        type: "GET-URL-REQUEST",
        of: "/worker.js",
      },
    });
    window.dispatchEvent(event);
  });

  const url = await responsePromise;
  STATE.worker = (await import(url as any)) as PdfWorker;
  return STATE.worker;
}

export const handlePdfBytes = (pdfBytes: ArrayBuffer) => {
  STATE.buttonContainer = document.createElement("div");
  document.getElementById(ID)?.remove();
  STATE.buttonContainer.id = ID;

  document.body.insertBefore(STATE.buttonContainer, document.body.firstChild);

  STATE.originalPdfBytes = pdfBytes;
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);
  STATE.buttonContainer.appendChild(createLink(blobUrl, "Open", { target: "_blank", title: BUTTON_TITLE }));
  STATE.buttonContainer.appendChild(
    createLink(blobUrl, "Download", { downloadName: STATE.fileName, title: BUTTON_TITLE })
  );

  const withCommentsButton = createButton("With comments", async (e) => {
    if (!STATE.store) {
      console.warn("[SD-Download]: No store");
      return;
    }
    if (!STATE.originalPdfBytes) {
      console.warn("[SD-Download]: No originalPdfBytes");
      return;
    }

    withCommentsButton.disabled = true;
    withCommentsButton.style.opacity = "0.7";
    const content = withCommentsButton.textContent;

    try {
      withCommentsButton.textContent = "Preparing Worker";
      const worker = await getWorker();

      await forceLoadPostsAndComments(STATE.store, (s) => {
        withCommentsButton.textContent = s;
      });

      const map = sortCommentsByPage(STATE.store.state.document.discussionFeed);

      withCommentsButton.textContent = "Generating Pdf";
      const newPdf = await worker.modifyPDFWithComments(
        STATE.originalPdfBytes,
        map,
        STATE.store.state.document.document
      );
      const blob = new Blob([newPdf], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);

      withCommentsButton.textContent = "Done";

      STATE.buttonContainer?.appendChild(
        createLink(blobUrl, "Open with Comments", { target: "_blank", title: BUTTON_TITLE })
      );
      STATE.buttonContainer?.appendChild(
        createLink(blobUrl, "Download with Comments", {
          downloadName: STATE.fileName.replace(/\.pdf$/, "") + "_withComments.pdf",
          title: BUTTON_TITLE,
        })
      );

      withCommentsButton.remove();
    } finally {
      // When something fails, pherpahs it doesnt fail when we try again, thats why we make the button usable again
      withCommentsButton.disabled = false;
      withCommentsButton.textContent = content;
      withCommentsButton.style.opacity = "1";
    }
  });
  STATE.buttonContainer.appendChild(withCommentsButton);
};

export const createButton = (label: string, onclick: (e: MouseEvent) => void) => {
  const btn = document.createElement("button");
  btn.classList.add("button-85");
  btn.onclick = onclick;
  btn.textContent = label;
  return btn;
};

export const createLink = (
  url: string,
  label: string,
  options: { downloadName?: string; target?: string; title?: string }
) => {
  const btn = document.createElement("a");
  btn.href = url;
  btn.classList.add("button-85");
  btn.role = "button";
  btn.textContent = label;

  if (options?.title) btn.title = options.title;
  if (options?.downloadName) btn.download = options.downloadName;
  if (options?.target) btn.target = options.target;

  return btn;
};

import { NewPdf, NEWPDF_TYPE, ScriptParams } from "./shared";

declare const scriptParams: ScriptParams;

const URL_REGEX = /.*studydrive\.net\/file-preview/g;

const registerPdfLoadedHook = (hook: (pdfBytes: ArrayBuffer) => void) => {
  try {
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (
      this: XMLHttpRequest,
      method: string,
      url: string,
      async?: boolean,
      user?: string,
      password?: string
    ) {
      if (url.match(URL_REGEX)) {
        this.addEventListener(
          "load",
          () => {
            hook(this.response);
          },
          false
        );
      }
      originalOpen.apply(this, arguments as any);
    };
  } catch (e) {
    console.error("[SD-D] Failed to set up XMLHttoRequest Hook", e);
  }

  try {
    let originalFetch = window.fetch;

    window.fetch = async (input, init) => {
      const url = typeof input === "string" ? input : input instanceof Request ? input.url : "";

      const response = await originalFetch(input, init);

      try {
        if (url.match(URL_REGEX)) {
          const clonedResponse = response.clone();
          hook(await clonedResponse.arrayBuffer());
        }
      } catch (e) {
        console.error("[SD-D] Failed to clone and process fetch respnse.", e);
      }

      return response;
    };
  } catch (e) {
    console.error("[SD-D] Failed to set up Fetch hook", e);
  }
};

// We save the original one, so no one can mess with it later
const oSendMsg = chrome.runtime.sendMessage;

registerPdfLoadedHook(async (pdfBytes) => {
  try {
    const url = URL.createObjectURL(new Blob([pdfBytes], { type: "application/pdf" }));

    const match = window.location.href.match(/doc\/([^\/]+)/);
    const name = match?.[1] ? `${match[1]}.pdf` : "UnknownName.pdf";

    const msg: NewPdf = {
      type: NEWPDF_TYPE,
      pdf: { url, name },
      nonce: scriptParams.nonce,
    };
    await oSendMsg(scriptParams.extId, msg);
  } catch (e) {
    console.error("Failed to send URL to the service worker.", e);
  }
});

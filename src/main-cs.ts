import { NewPdf, NEWPDF_TYPE, ScriptParams, c, api, SHA256, TransferPdfWorld } from "./shared";

const dataElm = document.documentElement.querySelector("#data-transfer-element");
c.assert(dataElm !== null, "No data Element found!");
const scriptParams: ScriptParams = JSON.parse(
  dataElm?.getAttribute("data-transfer") ?? `{"fallback":"THIS IS NOT GOOD"}`
);
dataElm?.remove();
c.log("Main-cs initializing with params:", scriptParams);

c.assert((window as any).sdWinow === undefined, "sdWindow should not be set at this point.", (window as any).sdWindow);

(window as any).sdWindow = new Proxy(
  {},
  {
    set(target, prop: string, value: any, receiver: any) {
      if (prop === "user") {
        if (value && typeof value === "object") {
          try {
            Object.defineProperty(value, "is_premium", {
              value: true,
              configurable: false,
              writable: false,
            });
            c.log("Sucessfully installed is_premium override.");
          } catch (e) {
            c.error("Could not define override for is_premium");
          }
        } else {
          c.warn(
            "Non-object value assigned to user property: %o%c\nIf everything works as expected this can safely be ignored.",
            value,
            "color:grey;font-style:italic;"
          );
        }
      }
      return Reflect.set(target, prop, value, receiver);
    },
  }
);

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
    c.error("Failed to set up XMLHttoRequest Hook", e);
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
        c.error("Failed to clone and process fetch respnse.", e);
      }

      return response;
    };
  } catch (e) {
    c.error("Failed to set up Fetch hook", e);
  }
};

/* cfg:chrome */
// @ts-ignore
const oSendMsg = api.runtime.sendMessage;
/* endcfg */

/* cfg:firefox */
const oDispatchEvent = window.dispatchEvent;
const oCustomEvent = CustomEvent;
/* endcfg */

registerPdfLoadedHook(async (pdfBytes) => {
  try {
    const match = window.location.href.match(/doc\/([^\/]+)/);
    const name = match?.[1] ? `${match[1]}.pdf` : "UnknownName.pdf";

    /* cfg:firefox */
    {
      const msg: TransferPdfWorld = {
        bytes: pdfBytes,
        name,
      };
      oDispatchEvent(
        new oCustomEvent(await SHA256(scriptParams.extId), {
          detail: msg,
        })
      );
      c.log("Send PDF Bytes")
    }
    /* endcfg */

    /* cfg:chrome */
    {
      const url = URL.createObjectURL(new Blob([pdfBytes], { type: "application/pdf" }));

      const msg: NewPdf = {
        type: NEWPDF_TYPE,
        pdf: { url, name },
      };
      await oSendMsg(scriptParams.extId, msg);
      c.log("Send Blob Url");
    }
    /* endcfg */
  } catch (e) {
    c.error("Failed to send URL to the service worker.", e);
  }
});

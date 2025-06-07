export const registerPdfLoadedHook = (hook: (pdfBytes: ArrayBuffer) => void) => {
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (
    this: XMLHttpRequest,
    method: string,
    url: string,
    async?: boolean,
    user?: string,
    password?: string
  ) {
    if (url.match(/.*studydrive\.net\/file-preview/g)) {
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

  let originalFetch = window.fetch;

  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof Request ? input.url : "";

    const response = await originalFetch(input, init);

    if (url.match(/.*studydrive\.net\/file-preview/g)) {
      const clonedResponse = response.clone();
      hook(await clonedResponse.arrayBuffer());
    }

    return response;
  };
};

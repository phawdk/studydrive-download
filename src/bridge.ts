// This script only exists because the `chrome.runtime` API is not available in a page script in Firefox.
// Should Firefox support be discontinued, the line to get the URL can be inlined into the page script.
import { GetUrlReply, GetUrlRequest, MESSAGE_TYPE_STRING } from "./types-constants";

declare function cloneInto<T>(source: T, target?: any, options?: any): T;

window.addEventListener(MESSAGE_TYPE_STRING, ((e: CustomEvent<GetUrlRequest>) => {
  if (e.detail.type === "GET-URL-REQUEST") {
    const url = chrome.runtime.getURL(e.detail.of);

    let responseDetail = {
      type: "GET-URL-REPLY" as const,
      url: url,
    };

    if (typeof cloneInto === "function") {
      // Nececary for Firefox as the details can not be read in the MAIN world.
      responseDetail = cloneInto(responseDetail, document.defaultView);
    }

    const event: CustomEvent<GetUrlReply> = new CustomEvent(MESSAGE_TYPE_STRING, {
      detail: responseDetail,
    });

    window.dispatchEvent(event);
  }
}) as EventListener);

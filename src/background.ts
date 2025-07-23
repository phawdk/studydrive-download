//@ts-ignore we ignore the import error here, as we import the special generated script.
import { contentScript } from "./content-script.js";
import { GetPdfsReply, Req, ScriptParams, UpdateMessage } from "./shared.js";

const generateNonce = (length: number) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => ("0" + byte.toString(16)).slice(-2)).join("");
};

const NONCE = generateNonce(32);

chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameType === "outermost_frame" && details.url.match("https://www.studydrive.net/*")) {
    const params: ScriptParams = {
      extId: chrome.runtime.id,
      nonce: NONCE,
    };
    chrome.scripting.executeScript({
      target: { tabId: details.tabId, allFrames: true },
      func: contentScript,
      args: [params],
      injectImmediately: true,
      world: "MAIN",
    });
  }
});

const handleMessage = async (
  request: Req,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => {
  console.log("MSG", request, sender);

  switch (request.type) {
    case "NEWPDF":
      let result = await chrome.storage.session.get(["pdfs"]);
      console.log("BEFORE; SET", result.pdfs);
      const pdfs = result.pdfs || {};
      if (!sender.tab?.id) {
        console.warn("Message received without tab id");
        return;
      }
      const tabId = sender.tab.id;
      pdfs[tabId] = request.pdf;
      chrome.storage.session.set({ pdfs: pdfs }, () => {
        console.log("PDF for tab ID", tabId, "updated in session storage.");
      });
      if (Popupport) {
        const msg: UpdateMessage = { pdf: request.pdf, isCurrent: (await getCurrentTabId()) === tabId };
        try {
          Popupport.postMessage(msg);
        } catch (e) {
          console.log("Failed to send Update");
          Popupport = undefined;
        }
      }
      break;

    case "GET_ALL_PDF_TYPE":
      try {
        const currentTabId = await getCurrentTabId();
        const result = await chrome.storage.session.get(["pdfs"]);
        const pdfs = result.pdfs || {};
        const currentPdf = pdfs[currentTabId!];
        if (currentTabId) delete pdfs[currentTabId];
        const response: GetPdfsReply = {
          otherPdfs: pdfs,
          currentPdf,
        };
        console.log("GETRESP", { response });
        sendResponse(response);
      } catch (error) {
        console.error("Error handling GET_ALL_PDF_TYPE:", error);
      }
  }
};

// Helper function to get the current tab ID
const getCurrentTabId = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs.length > 0) {
    const activeTab = tabs[0];
    return activeTab.id;
  }
  return undefined;
};

chrome.runtime.onMessage.addListener((request: Req, sender, sendResponse) => {
  (async () => {
    await handleMessage(request, sender, sendResponse);
  })();
  return true;
});

chrome.runtime.onMessageExternal.addListener((request: Req, sender, sendResponse) => {
  if (request.nonce === NONCE) {
    (async () => {
      await handleMessage(request, sender, sendResponse);
    })();
    return true;
  } else {
    console.warn("Dropping request, unknwon Nonce.", { request, sender });
  }
});

let Popupport: chrome.runtime.Port | undefined = undefined;

chrome.runtime.onConnect.addListener((port) => {
  // we assume only one open poput at a time
  Popupport = port;
  port.onDisconnect.addListener(() => {
    console.log("Disconnected port from service worker.");
    if (Popupport === port) {
      Popupport = undefined;
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url) {
    clearByTabId(tabId);
  }
});

const clearByTabId = async (tabId: number) => {
  let result = await chrome.storage.session.get(["pdfs"]) || {};
  if (result.pdfs?.[tabId]) {
    delete result.pdfs[tabId];

    chrome.storage.session.set({ pdfs: result.pdfs }, () => {
      console.log("Deleted for tabId", tabId);
    });
  }
};

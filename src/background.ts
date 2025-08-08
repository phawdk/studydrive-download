import { c, GetPdfsReply, Req, UpdateMessage, api, NewPdf } from "./shared.js";


const handleMessage = async (request: Req, sender: chrome.runtime.MessageSender): Promise<any> => {
  c.log("Handle Message", request, sender);

  switch (request.type) {
    /* cfg:firefox */
    case "NEWPDFBYTES":
      const url = URL.createObjectURL(new Blob([request.bytes], { type: "application/pdf" }));
      const pdf = {
        name: request.name,
        url
      }  
      request = request as any as NewPdf
      request.pdf = pdf
    /* endcfg */
    case "NEWPDF":
      let result = await api.storage.session.get(["pdfs"]);
      const pdfs = result.pdfs || {};
      if (!sender.tab?.id) {
        c.warn("Message received without tab id");
        return;
      }
      const tabId = sender.tab.id;
      pdfs[tabId] = request.pdf;
      api.storage.session.set({ pdfs: pdfs }, () => {
        c.log("PDF for tab ID", tabId, "updated in session storage.");
      });
      if (Popupport) {
        const msg: UpdateMessage = { pdf: request.pdf, isCurrent: (await getCurrentTabId()) === tabId };
        try {
          Popupport.postMessage(msg);
        } catch (e) {
          c.log("Failed to send Update");
          Popupport = undefined;
        }
      }
      break;

    case "GET_ALL_PDF_TYPE":
      try {
        const currentTabId = await getCurrentTabId();
        const result = await api.storage.session.get(["pdfs"]);
        const pdfs = result.pdfs || {};
        const currentPdf = pdfs[currentTabId!];
        if (currentTabId) delete pdfs[currentTabId];
        const response: GetPdfsReply = {
          otherPdfs: pdfs,
          currentPdf,
        };
        c.log("Responding with", { response });
        return response;
      } catch (error) {
        c.error("Error handling GET_ALL_PDF_TYPE:", error);
      }
    default:
      c.warn("Unhandled message", request)
  }
};

const getCurrentTabId = async () => {
  const tabs = await api.tabs.query({ active: true, currentWindow: true });
  if (tabs.length > 0) {
    const activeTab = tabs[0];
    return activeTab.id;
  }
  return undefined;
};

api.runtime.onMessage.addListener((request: Req, sender, sendResponse) => {
  (async () => {
    sendResponse(await handleMessage(request, sender));
  })();
  return true;
});

api.runtime.onMessageExternal.addListener((request: Req, sender, sendResponse) => {
  (async () => {
    sendResponse(await handleMessage(request, sender));
  })();
  return true;
});

let Popupport: chrome.runtime.Port | undefined = undefined;
api.runtime.onConnect.addListener((port) => {
  // we assume only one open poput at a time
  Popupport = port;
  port.onDisconnect.addListener(() => {
    if (Popupport === port) {
      Popupport = undefined;
    }
    c.log("Disconnected port from service worker.");
  });
});

api.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url) {
    clearByTabId(tabId);
  }
});

const clearByTabId = async (tabId: number) => {
  let result = (await api.storage.session.get(["pdfs"])) || {};
  if (result.pdfs?.[tabId]) {
    delete result.pdfs[tabId];

    api.storage.session.set({ pdfs: result.pdfs }, () => {
      c.log("Deleted for tabId", tabId);
    });
  }
};

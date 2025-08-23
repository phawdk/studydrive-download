import { api, c } from "./shared";
import type { GetPdfForCurrentTab, DownloadPdf, Pdf } from "./shared";

/**
 * Creates a new custom button element.
 * @returns {HTMLButtonElement} The newly created button.
 */
function createCustomButton(): HTMLButtonElement {
  const newButton = document.createElement('button');

  const downloadIconSVG = `
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="22" 
      height="22" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      style="margin-right: 12px; vertical-align: middle;"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>`;

  newButton.innerHTML = downloadIconSVG + 'Download';

  Object.assign(newButton.style, {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(145deg, #0d6efd, #0a58ca)',
    padding: '11px 20px',
    border: '1px solid #0a53be',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(13, 110, 253, 0.5) inset',
    cursor: 'pointer',
    transition: 'all 0.25s ease-out',
    letterSpacing: '0.5px',
  });

  newButton.onmouseover = () => {
    newButton.style.transform = 'translateY(-2px)';
    newButton.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.25)';
    newButton.style.background = 'linear-gradient(145deg, #1b7aff, #0d6efd)';
  };
  newButton.onmouseout = () => {
    newButton.style.transform = 'translateY(0)';
    newButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(13, 110, 253, 0.5) inset';
    newButton.style.background = 'linear-gradient(145deg, #0d6efd, #0a58ca)';
  };
  newButton.onmousedown = () => {
    newButton.style.transform = 'translateY(1px) scale(0.98)';
    newButton.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
  };
  newButton.onmouseup = () => {
    newButton.style.transform = 'translateY(-2px)';
    newButton.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.25)';
  };

  newButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    c.log("Button clicked. Asking background for PDF data...");
    const getPdfRequest: GetPdfForCurrentTab = { type: "GET_PDF_FOR_CURRENT_TAB" };
    api.runtime.sendMessage(getPdfRequest, (pdfData: Pdf | undefined) => {
      if (api.runtime.lastError) {
        c.error("Error fetching PDF data:", api.runtime.lastError.message);
        alert('Could not connect to the extension. Please try reloading the page.');
        return;
      }
      if (pdfData && pdfData.url) {
        c.log("PDF data found! Requesting download for:", pdfData.name);
        const downloadRequest: DownloadPdf = { type: "DOWNLOAD_PDF", pdf: pdfData };
        api.runtime.sendMessage(downloadRequest);
      } else {
        c.warn("Background script reports no PDF is ready for this tab.");
        alert('Download not ready. Please ensure the document preview has fully loaded and try again.');
      }
    });
  });

  return newButton;
}

function replaceTargetButtons() {
  const targetElements = document.querySelectorAll<HTMLElement>('button[data-specific-auth-trigger="download"]');
  targetElements.forEach(element => {
    if (element.dataset.replaced) {
      return;
    }
    const newButton = createCustomButton();
    if (element.parentNode) {
      element.parentNode.replaceChild(newButton, element);
      element.dataset.replaced = 'true';
    }
  });
}

function observeDOMChanges() {
  const targetSelector = 'button[data-specific-auth-trigger="download"]';
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        const hasTargetButton = Array.from(mutation.addedNodes).some(node =>
          node.nodeType === 1 && ((node as Element).matches(targetSelector) || (node as Element).querySelector(targetSelector))
        );
        if (hasTargetButton) {
          replaceTargetButtons();
        }
      }
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

replaceTargetButtons();
observeDOMChanges();

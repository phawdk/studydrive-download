import { GET_ALL_PDF_TYPE, GetPdfsReply, Pdf, UpdateMessage } from "./shared";

const file = (pdf: Pdf) => {
  return `<div><span>${pdf.name}</span><a href="${pdf.url}" target="_blank">Open</a><a href="${pdf.url}" target="_blank" download=${pdf.name}>Download</a></div>`;
};

chrome.runtime.sendMessage({ type: GET_ALL_PDF_TYPE }, async (pdfs: GetPdfsReply) => {
  console.log("ALL PDFS", pdfs);
  let current = document.getElementById("current");
  if (!current) throw new Error("Could not find listelement");

  if (pdfs.currentPdf) current.innerHTML = current.innerHTML + file(pdfs.currentPdf);

  let others = document.getElementById("other");
  if (!others) throw new Error("Could not find listelement");

  for (const pdf of Object.values(pdfs.otherPdfs).reverse()) {
    others.innerHTML += file(pdf);
  }
});

const port = chrome.runtime.connect();

port.onMessage.addListener((msg: UpdateMessage) => {
  if (msg.isCurrent) {
    let current = document.getElementById("current");
    if (!current) throw new Error("Could not find listelement");

    if (msg.pdf) current.innerHTML = file(msg.pdf) + current.innerHTML;
  } else {
    let others = document.getElementById("other");
    if (!others) throw new Error("Could not find listelement");
    if (msg.pdf) others.innerHTML = file(msg.pdf) + others.innerHTML;
  }
});

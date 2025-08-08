import {
  NEWPDF_BYTES_TYPE,
  NewPdfBytes,
  SHA256,
  ScriptParams,
  TransferPdfWorld,
  api,
} from "./shared";

const scriptParams: ScriptParams = {
  extId: api.runtime.id,
};

const dataElement = document.createElement("div");
dataElement.id = "data-transfer-element";
dataElement.setAttribute("data-transfer", JSON.stringify(scriptParams));
document.documentElement.prepend(dataElement);

/* cfg:firefox */
(async () => {
  window.addEventListener(await SHA256(scriptParams.extId), (event) => {
    const { name, bytes }: TransferPdfWorld = (event as any).detail;

    const msg: NewPdfBytes = {
      type: NEWPDF_BYTES_TYPE,
      name,
      bytes,
    };
    api.runtime.sendMessage(msg);
  });
})();
/* endcfg */

import { registerPdfLoadedHook } from "./download";
import { executeExploitPreventionBypass } from "./expolit-prevention-bypass";

import { handlePdfBytes, STATE } from "./state";

const mainPreLoad = () => {
  executeExploitPreventionBypass();
  registerPdfLoadedHook(handlePdfBytes);
  document.addEventListener("DOMContentLoaded", main);
};

const main = () => {
  // Invoked on DOMContentLoaded
  const app = document.getElementById("app") as HTMLElement & { __vue_app__: any };
  if (app !== null) {
    STATE.store = app.__vue_app__.config.globalProperties.$store;
  } else {
    console.warn("No App found");
  }

  const match = window.location.href.match(/doc\/([^\/]+)/);
  if (match?.[1]) {
    STATE.fileName = `${match[1]}.pdf`;
  }
};

// Entry point
mainPreLoad();

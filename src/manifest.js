const IS_CHROME = process.env.BROWSER_TARGET === "CHROME";

const VERSION =
  process.env.VERSION ||
  "0." +
    new Date()
      .toLocaleTimeString("en-GB", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
      })
      .replace(/:/g, ".");
const manifest = {
  manifest_version: 3,
  name: "StudydriveDownload",
  version: VERSION,
  description:
    "Adds a download button to the top of the Page. " + `(This is a ${IS_CHROME ? "Chrome" : "Firefox"} build)`,
  host_permissions: ["https://www.studydrive.net/*"],
  homepage_url: "https://github.com/phawdk/studydrive-download",
  permissions: ["scripting", "storage"],
  web_accessible_resources: [
    {
      resources: ["test.html"],
      matches: ["<all_urls>"],
    },
  ],
  content_scripts: [
    {
      matches: ["https://www.studydrive.net/*"],
      js: ["isolated-cs.js"],
      world: "ISOLATED",
      run_at: "document_start",
    },
    {
      matches: ["https://www.studydrive.net/*"],
      js: ["main-cs.js"],
      world: "MAIN",
      run_at: "document_start",
    },
  ],
  action: {
    default_popup: "popup.html",
    default_icon: {
      16: "icon16x16.png",
      48: "icon48x48.png",
      128: "icon128x128.png",
    },
  },
  icons: {
    16: "icon16x16.png",
    48: "icon48x48.png",
    128: "icon128x128.png",
  },
  background: IS_CHROME
    ? {
        service_worker: "background.js",
        type: "module",
      }
    : { scripts: ["background.js"] },
};

if (IS_CHROME) {
  manifest.externally_connectable = {
    matches: ["https://www.studydrive.net/*"],
  };
}

export default manifest;

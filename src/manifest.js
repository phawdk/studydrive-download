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

const ICONS = {
      16: "icon16x16.png",
      48: "icon48x48.png",
      128: "icon128x128.png",
    };
const INJECT_URL = "https://www.studydrive.net/*";

const manifest = {
  manifest_version: 3,
  name: "StudydriveDownload",
  version: VERSION,
  description:
    "Adds a download button to the top of the Page. " + `(This is a ${IS_CHROME ? "Chrome" : "Firefox"} build)`,
  host_permissions: [INJECT_URL],
  homepage_url: "https://github.com/phawdk/studydrive-download",
  permissions: ["scripting", "storage", "downloads"],
  browser_specific_settings: {
    gecko: {
      id: "studydrive-download@phawdk.main.example",
      data_collection_permissions: {
        required: ["none"]
      }
    }
  },
  content_scripts: [
    {
      matches: [INJECT_URL],
      js: ["isolated-cs.js"],
      world: "ISOLATED",
      run_at: "document_start",
    },
    {
      matches: [INJECT_URL],
      js: ["main-cs.js"],
      world: "MAIN",
      run_at: "document_start",
    },
        {
      matches: [INJECT_URL],
      js: ["content.js"],
      world: "ISOLATED",
      run_at: "document_end",
    },
  ],
  action: {
    default_popup: "popup.html",
    default_icon: ICONS,
  },
  icons: ICONS,
  background: IS_CHROME
    ? {
        service_worker: "background.js",
        type: "module",
      }
    : { scripts: ["background.js"] },
};

if (IS_CHROME) {
  manifest.externally_connectable = {
    matches: [INJECT_URL],
  };
}

export default manifest;


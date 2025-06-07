# StudydriveDownload Extension

This extension adds a download button to the top of the Studydrive page which allows you to download any PDF on Studydrive.  
As a side effect, it also removes ads.

✨ **Exciting Update!** ✨  
It now enables you to download a specific file along with all comments displayed on the side of the page. 📥💬

#### Status:
🟢 Working as of 7 June, 2025  
*There is no autoupdate. If it stops working, please reinstall the latest version from the Releases section.*

If you encounter any issues, bugs, or have suggestions, feel free to [create an issue](../../issues).

![Demo of the extension](data/demo.gif)

#### Note:
- A free Studydrive account is required (login needed).
- Only currently displayed files can be downloaded (Anki cards not supported).

#### Patch history:
- 6 May, 2025: Update to Fetch API
- 4 Sep, 2024: Patched URL block

---

## 🔧 Installation Instructions

### 🧭 Chrome / Edge / Brave / Chromium

1. Download the latest release ZIP file from the [Releases page](../../releases/latest).
2. Open your browser and go to `chrome://extensions/` (or `edge://extensions/`, etc.).
3. Enable **Developer mode** (top right toggle).
4. **Drag and drop the ZIP file** directly onto the extensions page,  
   or click **“Load unpacked”** and select the extracted folder.


✔️ The extension will be installed and ready to use.

---

### 🦊 Firefox

1. Download the latest release ZIP file from the [Releases page](../../releases/latest).
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
3. Click **"Load Temporary Add-on"** and select the `StudydriveDownload-phawdk-[version].zip` file.

⚠️ Firefox will unload the extension when the browser is closed.

---

## 🤝 Contribution

Contributions are welcome! To contribute:

1. Fork this repository.
2. Create a new branch:
   ```bash
   git checkout -b my-feature

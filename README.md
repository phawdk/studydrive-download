# StudydriveDownload Extension

This extension adds a download button to the top of the Studydrive page which allows you to download any PDF on Studydrive.
As a side effect it also removes ads.

#### Status:
🟢 Working as of 16 February, 2025
<br>*There is no autoupdate, if it doesn't work for you, please reinstall*

If you encounter any issues or if something doesn't work as expected, or if you have any feedback, please create an issue.

**Note:** Login to a free studydrive account is required.

#### Patch history:
- 4 Sep, 2024: Patched URL block 

## Installation Instructions

### Chrome (and Other Chromium-Based Browsers)

1. Clone or download this repository:
    ```bash
    git clone https://github.com/phawdk/studydrive-download.git
    ```
   Or download the ZIP file and extract it.

2. Open Chrome (or your Chromium-based browser) and navigate to `chrome://extensions/`.

3. Enable "Developer mode" by toggling the switch in the top right corner.

4. Select the option to "Load unpacked" and choose the folder where the repository is cloned or extracted.

**Note:** These steps are very similar for other Chromium-based browsers like Microsoft Edge, Brave, or Opera. You may just need to navigate to the corresponding extensions page (e.g., `edge://extensions/` for Edge). Depending on the browser, the buttons may be located elsewhere on the page.
**Also Note:** If you see the message `Unrecognized manifest key 'browser_specific_settings'`, you can safely ignore it. This key is only used by Firefox and has no effect on Chrome or other Chromium-based browsers.


### Firefox

1. Clone or download this repository:
    ```bash
    git clone https://github.com/phawdk/studydrive-download.git
    ```
   Or download the ZIP file and extract it.

2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.

3. Click on "Load Temporary Add-on" and select the `manifest.json` file from the repository folder.

**Note:**  This temporary Firefox add-on will last until the browser is closed.

## Contribution

Contributions are welcome! If you would like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your changes:
    ```bash
    git checkout -b your-branch-name
    ```
3. Make your changes and commit them:
    ```bash
    git commit -m "Description of your changes"
    ```
4. Push your changes to your forked repository:
    ```bash
    git push origin your-branch-name
    ```
5. Open a pull request to the main repository, providing a description of your changes.


## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.

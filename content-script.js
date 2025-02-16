(() => {
  // ==============================
  // Exploit Prevention Bypass
  // ==============================

  /** @type {ProxyHandler<Object>} */
  const UserProxYHandler = {
    get(target, prop, receiver) {
      if (prop === "is_premium") {
        return true;
      }
      return Reflect.get(target, prop, receiver);
    },
  };

  //  @ts-ignore
  window.sdWindow = new Proxy(
    {},
    {
      set(target, prop, value, receiver) {
        if (prop === "user") {
          if (value && typeof value === "object") {
            value = new Proxy(value, UserProxYHandler);
          } else {
            console.warn(
              "[SD-Download]: Non-object value assigned to user property: %o%c\nIf everything works as expected this can safely be ignored.",
              value,
              "color:grey;font-style:italic;"
            );
          }
        }
        return Reflect.set(target, prop, value, receiver);
      },
    }
  );

  // ==============================
  // Main Functionality: Download Buttons
  // ==============================

  const originalOpen = XMLHttpRequest.prototype.open;
  /**
   * Overrides the default open method of XMLHttpRequest.
   *
   * @param {string} method
   * @param {string} url - The URL to which the request is sent.
   * @param {boolean} [async=true]
   * @param {string} [user]
   * @param {string} [password]
   * @returns {void}
   */
  XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
    if (url.match(/.*studydrive\.net\/file-preview/g)) {
      this.addEventListener(
        "load",
        () => {
          let blob = new Blob([this.response], { type: "application/pdf" });
          let url = URL.createObjectURL(blob);
          addButtons(url);
        },
        false
      );
    }
    originalOpen.apply(this, arguments);
  };

  /*** @param {string} url */
  const addButtons = (url) => {
    const ID = "jsA7AGx6o2Yi61DvK8iooXEeQtgnKR";

    document.getElementById(ID)?.remove();

    let match = window.location.href.match(/doc\/([^\/]+)/);
    const name = match?.[1] ? `${match[1]}.pdf` : "studydrive-download.pdf";

    const ButtonTitle = "Depending on the browser settings this might open and or download the file";

    /**
     * Creates a button element with specified label and options.
     *
     * @param {string} label - The text to display on the button.
     * @param {Object} [options] - Optional settings for the button.
     * @param {boolean} [options.download] - If true, sets the download attribute for the button.
     * @param {string} [options.target] - Specifies where to open the linked document (e.g., "_blank").
     * @returns {HTMLAnchorElement} The created button element.
     */
    const createButton = (label, options) => {
      let btn = document.createElement("a");
      btn.href = url;
      btn.classList.add("button-85");
      btn.role = "button";
      btn.title = ButtonTitle;
      btn.textContent = label;

      if (options?.download) btn.download = name;
      if (options?.target) btn.target = options.target;

      return btn;
    };

    let container = document.createElement("div");
    container.id = ID;
    container.appendChild(createButton("Open", { target: "_blank" }));
    container.appendChild(createButton("Download", { download: true }));
    document.body.insertBefore(container, document.body.firstChild);
  };
})();

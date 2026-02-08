/* ==================================================================== */
/* Import Utilities
======================================================================= */
import { charadex } from '../utilities.js';

/* ==================================================================== */
/* Load
======================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  charadex.tools.loadIncludedFiles();
  charadex.tools.updateMeta();
  charadex.tools.loadPage('#charadex-body', 100);
  setupTheme();
});

/* ==================================================================== */
/* Functions
======================================================================= */

function setupTheme() {
  document.querySelector("body").setAttribute("data-theme", getTheme());
}

function getTheme() {
  const theme = localStorage.getItem("theme");

  if(theme === null) {
    return "dark";
  } else {
    return theme;
  }

}

function setTheme(theme) {
  console.log(`Setting theme: ${theme}`)
  localStorage.setItem("theme", theme);
  document.querySelector("body").setAttribute("data-theme", theme);
}

function syncThemeIcons() {
  document.querySelectorAll("[data-theme-toggle] i").forEach((icon) => {
    icon.classList.remove("fa-moon", "fa-sun");
    icon.classList.add(
      getTheme() === "dark" ? "fa-sun" : "fa-moon"
    );

    icon.parentElement.setAttribute(
      "aria-label",
      getTheme() === "dark"
        ? "Change to light theme"
        : "Change to dark theme"
    );
  });
}

/* ==================================================================== */
/* Theme switching / Updating Icons
======================================================================= */

const observer = new MutationObserver(() => {
  syncThemeIcons();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});


const icons = {
  light: "fa-moon",
  dark: "fa-sun"
};

document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-theme-toggle]");
  if (!link) return;

  e.preventDefault();

  const newTheme = getTheme() === "dark" ? "light" : "dark";
  const icon = link.querySelector("i");

  // swap icons
  icon.classList.remove(icons[getTheme()]);
  icon.classList.add(icons[newTheme]);

  // update aria-label
  const newLabel =
    newTheme === "dark"
      ? "Change to light theme"
      : "Change to dark theme";
  link.setAttribute("aria-label", newLabel);

  setTheme(newTheme);
});

/* ==================================================================== */
/* Automatically make Toyhou.se links clickable
======================================================================= */

(function () {
  const toyhouseRegex = /https?:\/\/toyhou\.se\/[^\s<]+/g;

  function linkifyTextNode(textNode) {
    const text = textNode.nodeValue;
    if (!toyhouseRegex.test(text)) return;

    const span = document.createElement("span");
    span.innerHTML = text.replace(toyhouseRegex, url =>
      `<a href="${url}" target="_blank">${url}</a>`
    );

    textNode.parentNode.replaceChild(span, textNode);
  }

  function scanNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      // Skip text already inside links
      if (node.parentElement?.closest("a")) return;
      linkifyTextNode(node);
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      // Skip script/style tags
      if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(node.tagName)) return;
      node.childNodes.forEach(scanNode);
    }
  }

  // Initial scan (for first load)
  scanNode(document.body);

  // Watch for Charadex DOM injections
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(scanNode);
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();

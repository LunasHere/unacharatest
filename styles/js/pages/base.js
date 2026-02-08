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

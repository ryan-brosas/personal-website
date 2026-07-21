(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var menuButton = document.querySelector("[data-menu-button]");
  var toast = document.querySelector("[data-toast]");
  var trackButtons = Array.prototype.slice.call(document.querySelectorAll("[data-track-choice]"));
  var trackPanels = Array.prototype.slice.call(document.querySelectorAll("[data-track-panel]"));
  var trackKey = "ryan-brand-track";

  function announce(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(announce.timer);
    announce.timer = window.setTimeout(function () {
      toast.hidden = true;
    }, 2200);
  }

  if (menuButton && header) {
    menuButton.addEventListener("click", function () {
      var open = header.getAttribute("data-open") === "true";
      header.setAttribute("data-open", String(!open));
      menuButton.setAttribute("aria-expanded", String(!open));
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        header.setAttribute("data-open", "false");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.focus();
      }
    });
  }

  function applyTrack(track) {
    var selected = track === "client" ? "client" : "personal";
    trackButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-track-choice") === selected));
    });
    trackPanels.forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-track-panel") !== selected;
    });
    try {
      window.localStorage.setItem(trackKey, selected);
    } catch (_) {}
  }

  if (trackButtons.length) {
    var savedTrack = "personal";
    try {
      savedTrack = window.localStorage.getItem(trackKey) || "personal";
    } catch (_) {}
    applyTrack(savedTrack);
    trackButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        applyTrack(button.getAttribute("data-track-choice"));
      });
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy") ? resolve() : reject(new Error("copy failed"));
      } catch (error) {
        reject(error);
      }
      area.remove();
    });
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-copy-target], [data-copy-text]");
    if (!button) return;
    var targetId = button.getAttribute("data-copy-target");
    var target = targetId ? document.getElementById(targetId) : null;
    var text = target ? target.textContent.trim() : button.getAttribute("data-copy-text");
    if (!text) return;
    copyText(text).then(function () {
      announce("Copied to clipboard.");
    }).catch(function () {
      announce("Copy was blocked. Select the text manually.");
    });
  });

  var demoLoadingButton = document.querySelector("[data-loading-demo]");
  if (demoLoadingButton) {
    demoLoadingButton.addEventListener("click", function () {
      var original = demoLoadingButton.textContent;
      demoLoadingButton.disabled = true;
      demoLoadingButton.textContent = "Checking system...";
      window.setTimeout(function () {
        demoLoadingButton.disabled = false;
        demoLoadingButton.textContent = original;
        announce("Demo state reset.");
      }, 1200);
    });
  }

  var sampleForm = document.querySelector("[data-sample-form]");
  if (sampleForm) {
    sampleForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = sampleForm.querySelector("[data-required-input]");
      var error = sampleForm.querySelector("[data-form-error]");
      var valid = Boolean(input && input.value.trim());
      input.setAttribute("aria-invalid", String(!valid));
      error.hidden = valid;
      if (valid) announce("Validation example passed.");
      else input.focus();
    });
  }
})();

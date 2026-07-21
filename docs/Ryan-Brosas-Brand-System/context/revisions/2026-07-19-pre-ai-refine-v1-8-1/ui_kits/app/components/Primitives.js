(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  var ICON_GEOMETRY = {
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    "arrow-right": '<path d="M4 12h15m-5-5 5 5-5 5"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    copy: '<rect x="8" y="8" width="10" height="11" rx="1"/><path d="M15 8V6a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2"/>',
    check: '<path d="m5 12 4.2 4.2L19 6.5"/>',
    refresh: '<path d="M19 8V4m0 0h-4m4 0-3 3a7 7 0 1 0 1.4 7.7"/>',
    alert: '<path d="M12 4 3.8 18.2A1.2 1.2 0 0 0 4.8 20h14.4a1.2 1.2 0 0 0 1-1.8L12 4Z"/><path d="M12 9v4m0 3h.01"/>',
    info: '<circle cx="12" cy="12" r="8"/><path d="M12 11v5m0-8h.01"/>',
    "file-plus": '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9l-5-6Z"/><path d="M14 3v6h5M12 13v5m-2.5-2.5h5"/>'
  };

  function UtilityIcon(name, className) {
    var safeName = String(name || "info").replace(/[^a-z0-9-]/gi, "");
    var geometry = ICON_GEOMETRY[safeName] || ICON_GEOMETRY.info;
    return '<svg class="icon ' + escapeHtml(className || "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + geometry + '</svg>';
  }

  function LogoTile(options) {
    options = options || {};
    var src = options.src || "../../logos/Logo---Ryan-1.svg";
    var className = options.className || "brand-tile";
    return '<span class="' + escapeHtml(className) + '" aria-hidden="true"><img src="' + escapeHtml(src) + '" alt="" /></span>';
  }

  function Button(options) {
    options = options || {};
    var kind = options.kind || "primary";
    var className = "button button--" + escapeHtml(kind) + (options.className ? " " + escapeHtml(options.className) : "");
    var attrs = [
      'class="' + className + '"',
      'data-od-id="' + escapeHtml(options.odId || "kit-button") + '"'
    ];
    if (options.href) {
      attrs.push('href="' + escapeHtml(options.href) + '"');
      if (options.ariaDisabled) attrs.push('aria-disabled="true"');
      return '<a ' + attrs.join(" ") + '>' + (options.icon ? UtilityIcon(options.icon) : "") + '<span>' + escapeHtml(options.label) + '</span></a>';
    }
    attrs.push('type="' + escapeHtml(options.type || "button") + '"');
    if (options.action) attrs.push('data-action="' + escapeHtml(options.action) + '"');
    if (options.pressed != null) attrs.push('aria-pressed="' + String(Boolean(options.pressed)) + '"');
    if (options.busy) attrs.push('aria-busy="true"');
    if (options.disabled) attrs.push("disabled");
    return '<button ' + attrs.join(" ") + '>' + (options.icon ? UtilityIcon(options.icon) : "") + '<span>' + escapeHtml(options.label) + '</span></button>';
  }

  function StatusLabel(status) {
    var normalized = String(status || "Verified").toLowerCase();
    return '<span class="status-label status-label--' + escapeHtml(normalized) + '">' + escapeHtml(status) + '</span>';
  }

  function ThemeControl(theme) {
    return [
      '<div class="theme-control" role="group" aria-label="Color theme" data-od-id="kit-theme-control">',
      '  <span class="control-label">Theme</span>',
      '  <button type="button" data-theme-choice="light" data-od-id="kit-theme-light" aria-pressed="' + String(theme === "light") + '">Light</button>',
      '  <button type="button" data-theme-choice="dark" data-od-id="kit-theme-dark" aria-pressed="' + String(theme === "dark") + '">Dark</button>',
      '</div>'
    ].join("");
  }

  window.BrandEscape = escapeHtml;
  window.UtilityIcon = UtilityIcon;
  window.LogoTile = LogoTile;
  window.Button = Button;
  window.StatusLabel = StatusLabel;
  window.ThemeControl = ThemeControl;
})();

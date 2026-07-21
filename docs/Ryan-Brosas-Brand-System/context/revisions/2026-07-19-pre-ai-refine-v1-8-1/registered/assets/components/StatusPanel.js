(function () {
  "use strict";

  function StatusPanel(item) {
    var statusClass = String(item.status || "verified").toLowerCase();
    var odId = item.id || ("kit-status-" + statusClass);
    return [
      '<article class="status-panel status-panel--' + statusClass + '" data-status="' + statusClass + '" data-od-id="' + odId + '">',
      '  <div class="panel-meta">',
      window.StatusLabel(item.status),
      '    <span class="mono-label">' + item.kicker + '</span>',
      '  </div>',
      '  <h3>' + item.title + '</h3>',
      '  <p>' + item.body + '</p>',
      item.action ? '<button class="text-action" type="button" data-action="' + item.action + '">' + item.actionLabel + '</button>' : '',
      '</article>'
    ].join("");
  }

  window.StatusPanel = StatusPanel;
})();

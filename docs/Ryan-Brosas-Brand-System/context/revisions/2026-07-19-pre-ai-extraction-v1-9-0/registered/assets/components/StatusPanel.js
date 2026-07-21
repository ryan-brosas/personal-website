(function () {
  "use strict";

  function StatusPanel(item) {
    var safe = window.BrandEscape;
    var statusClass = String(item.status || "verified").toLowerCase();
    var odId = item.id || ("kit-status-" + statusClass);
    return [
      '<article class="status-panel status-panel--' + safe(statusClass) + '" data-status="' + safe(statusClass) + '" data-od-id="' + safe(odId) + '">',
      '  <div class="panel-meta">',
      window.StatusLabel(item.status),
      '    <span class="mono-label">' + safe(item.kicker) + '</span>',
      '  </div>',
      '  <h3>' + safe(item.title) + '</h3>',
      '  <p>' + safe(item.body) + '</p>',
      item.action ? '<button class="text-action" type="button" data-action="' + safe(item.action) + '">' + safe(item.actionLabel) + '</button>' : '',
      '</article>'
    ].join("");
  }

  window.StatusPanel = StatusPanel;
})();

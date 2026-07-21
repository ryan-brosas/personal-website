(function () {
  "use strict";

  function safe(value) {
    return window.BrandEscape ? window.BrandEscape(value) : String(value == null ? "" : value);
  }

  function FormField(options) {
    options = options || {};
    var id = options.id || "brand-field";
    var state = options.state || "default";
    var attrs = [
      'id="' + safe(id) + '"',
      'name="' + safe(options.name || id) + '"',
      'value="' + safe(options.value || "") + '"',
      'placeholder="' + safe(options.placeholder || "") + '"',
      'data-state="' + safe(state) + '"'
    ];
    if (state === "readonly") attrs.push("readonly");
    if (state === "disabled") attrs.push("disabled");
    if (state === "invalid") {
      attrs.push('aria-invalid="true"');
      attrs.push('aria-describedby="' + safe(id) + '-message"');
    }
    return [
      '<label class="field-wrap field-wrap--' + safe(state) + '" for="' + safe(id) + '" data-od-id="kit-field-' + safe(id) + '">',
      '  <span>' + safe(options.label || "Field") + '</span>',
      '  <input ' + attrs.join(" ") + ' />',
      '  <small class="field-message" id="' + safe(id) + '-message">' + safe(options.message || "") + '</small>',
      '</label>'
    ].join("");
  }

  function FeedbackMessage(options) {
    options = options || {};
    var kind = options.kind || "neutral";
    var role = kind === "error" ? "alert" : "status";
    return [
      '<article class="feedback-message feedback-message--' + safe(kind) + '" role="' + role + '" data-od-id="kit-feedback-' + safe(options.id || kind) + '">',
      '  <span class="mono-label">' + safe(options.label || kind) + '</span>',
      '  <strong>' + safe(options.title || "Status update") + '</strong>',
      '  <p>' + safe(options.body || "") + '</p>',
      options.actionLabel ? window.Button({ kind: "secondary", label: options.actionLabel, action: options.action || "recover", odId: "kit-feedback-action-" + (options.id || kind) }) : "",
      '</article>'
    ].join("");
  }

  function EvidenceMedia(options) {
    options = options || {};
    var state = options.state || "open";
    var icon = state === "error" ? "alert" : state === "loading" ? "refresh" : "file-plus";
    return [
      '<figure class="evidence-media evidence-media--' + safe(state) + '" data-evidence-state="' + safe(state) + '" data-od-id="kit-evidence-' + safe(options.id || state) + '">',
      '  <div class="evidence-media__plate">' + window.UtilityIcon(icon) + '<strong>' + safe(options.title || "Owned evidence needed") + '</strong><span>' + safe(options.message || "Still needed: name the owned proof.") + '</span></div>',
      '  <figcaption><span class="mono-label">' + safe(options.sourceLabel || "Open / source required") + '</span></figcaption>',
      '</figure>'
    ].join("");
  }

  window.FormField = FormField;
  window.FeedbackMessage = FeedbackMessage;
  window.EvidenceMedia = EvidenceMedia;
})();

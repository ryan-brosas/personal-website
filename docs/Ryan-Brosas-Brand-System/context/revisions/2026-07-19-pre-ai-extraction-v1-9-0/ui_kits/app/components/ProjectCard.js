(function () {
  "use strict";

  function ProjectCard(project) {
    var safe = window.BrandEscape;
    return [
      '<article class="project-card" data-module="' + safe(project.category) + '" data-status="open" data-od-id="kit-project-' + safe(project.slug) + '">',
      window.EvidenceMedia({ id: project.slug, state: "open", title: "Owned evidence needed", message: project.prompt, sourceLabel: "Open / source required" }),
      '  <div class="project-body">',
      '    <div class="panel-meta">' + window.StatusLabel("Open") + '<span class="mono-label">Owned evidence needed</span></div>',
      '    <h3>' + safe(project.title) + '</h3>',
      '    <p>' + safe(project.prompt) + '</p>',
      '    <button type="button" class="check-action" aria-pressed="false" data-check="' + safe(project.slug) + '" data-od-id="kit-project-' + safe(project.slug) + '-check">Mark request ready</button>',
      '  </div>',
      '</article>'
    ].join("");
  }

  window.ProjectCard = ProjectCard;
})();

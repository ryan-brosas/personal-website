(function () {
  "use strict";

  function ProjectCard(project) {
    return [
      '<article class="project-card" data-module="' + project.category + '" data-status="open" data-od-id="kit-project-' + project.slug + '">',
      '  <div class="project-visual" aria-hidden="true">',
      '    <span class="visual-rail"></span>',
      '    <span class="visual-block"></span>',
      '    <span class="visual-line"></span>',
      '  </div>',
      '  <div class="project-body">',
      '    <div class="panel-meta"><span class="status-label status-label--open">Open</span><span class="mono-label">Owned evidence needed</span></div>',
      '    <h3>' + project.title + '</h3>',
      '    <p>' + project.prompt + '</p>',
      '    <button type="button" class="check-action" aria-pressed="false" data-check="' + project.slug + '" data-od-id="kit-project-' + project.slug + '-check">Mark request ready</button>',
      '  </div>',
      '</article>'
    ].join("");
  }

  window.ProjectCard = ProjectCard;
})();

(function () {
  "use strict";

  function AppShell(data, track, theme) {
    var trackData = data.tracks[track];
    var statuses = trackData.statuses.map(window.StatusPanel).join("");
    var projects = data.projects.map(window.ProjectCard).join("");

    return [
      window.Navigation({ track: track, theme: theme }),
      '<main class="app-main" data-od-id="kit-main">',
      '  <section class="kit-hero" id="strategy" data-od-id="kit-hero">',
      '    <div class="hero-copy">',
      '      <span class="eyebrow">Applied workbench / ' + trackData.label + '</span>',
      '      <h1 data-od-id="kit-hero-title">' + trackData.headline + '</h1>',
      '      <p>' + trackData.intro + '</p>',
      '      <div class="hero-actions">',
      '        <button class="button button--primary" type="button" data-action="copy-statement" data-od-id="kit-copy-statement">Copy primary statement</button>',
      '        <a class="button button--secondary" href="../../preview/brand-assets.html" data-od-id="kit-inspect-assets">Inspect brand assets</a>',
      '      </div>',
      '    </div>',
      '    <aside class="hero-evidence" data-od-id="kit-hero-evidence">',
      '      <span class="status-label status-label--verified">Verified source</span>',
      '      <blockquote>“I build agent systems so repetitive work stops coming back to you.”</blockquote>',
      '      <span class="mono-label">Primary statement / exact language / mode-safe</span>',
      '    </aside>',
      '  </section>',
      '  <section class="workbench-section" data-od-id="kit-status-section">',
      '    <div class="section-heading"><span class="section-index">01 / Evidence status</span><h2 data-od-id="kit-status-title">Facts stay separate from guesses.</h2></div>',
      '    <div class="status-grid">' + statuses + '</div>',
      '  </section>',
      '  <section class="workbench-section" data-od-id="kit-system-section">',
      '    <div class="section-heading"><span class="section-index">02 / System choice</span><h2 data-od-id="kit-system-title">The agent is only one part.</h2></div>',
      window.SystemMap(),
      '  </section>',
      '  <section class="workbench-section" id="presentation" data-od-id="kit-project-section">',
      '    <div class="section-heading section-heading--split">',
      '      <div><span class="section-index">03 / Applied evidence</span><h2 data-od-id="kit-project-title">Show the work, including the bugs.</h2></div>',
      '      <div class="filter-control" role="group" aria-label="Filter modules">',
      '        <button type="button" data-filter="all" data-od-id="kit-filter-all" aria-pressed="true">All</button>',
      '        <button type="button" data-filter="strategy" data-od-id="kit-filter-strategy" aria-pressed="false">Strategy</button>',
      '        <button type="button" data-filter="presentation" data-od-id="kit-filter-presentation" aria-pressed="false">Presentation</button>',
      '        <button type="button" data-filter="guidelines" data-od-id="kit-filter-guidelines" aria-pressed="false">Guidelines</button>',
      '      </div>',
      '    </div>',
      '    <p class="section-lead">These categories are approved. The media stays Open until owned screenshots, workflows, terminal captures, or documented failures are supplied.</p>',
      '    <div class="project-grid">' + projects + '</div>',
      '  </section>',
      '  <section class="closing-plate" id="guidelines" data-od-id="kit-closing">',
      '    <span class="eyebrow">Campaign line / approved for presentation</span>',
      '    <h2>Building systems so everything <strong>doesn’t need you.</strong></h2>',
      '    <p>Keep this line outside permanent logo geometry.</p>',
      '  </section>',
      '</main>',
      '<div class="toast" data-toast role="status" aria-live="polite" hidden></div>'
    ].join("");
  }

  window.AppShell = AppShell;
})();

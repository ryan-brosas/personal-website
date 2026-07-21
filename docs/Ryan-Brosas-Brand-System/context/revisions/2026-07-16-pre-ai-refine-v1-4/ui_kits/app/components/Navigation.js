(function () {
  "use strict";

  function Navigation(options) {
    var track = options.track || "personal";
    var theme = options.theme || "light";
    return [
      '<header class="app-header" data-od-id="kit-header">',
      '  <a class="brand-lockup" href="../../preview/index.html" aria-label="Ryan Brosas brand system preview directory" data-od-id="kit-brand-home">',
      '    <span class="brand-tile"><img src="../../assets/Logo---Ryan-1.svg" alt="" /></span>',
      '    <span class="brand-copy"><strong>Ryan Brosas</strong><span>Agent Systems Builder</span></span>',
      '  </a>',
      '  <nav class="page-nav" aria-label="Primary workbook navigation" data-od-id="kit-primary-navigation">',
      '    <a href="#strategy" aria-current="page" data-od-id="kit-nav-strategy">Brand Strategy</a>',
      '    <a href="#presentation" data-od-id="kit-nav-presentation">Brand Presentation</a>',
      '    <a href="#guidelines" data-od-id="kit-nav-guidelines">Brand Guidelines</a>',
      '  </nav>',
      '  <div class="track-control" role="group" aria-label="Secondary brand track" data-od-id="kit-track-control">',
      '    <button type="button" data-track="personal" data-od-id="kit-track-personal" aria-pressed="' + String(track === "personal") + '">Personal</button>',
      '    <button type="button" data-track="client" data-od-id="kit-track-client" aria-pressed="' + String(track === "client") + '">Client</button>',
      '  </div>',
      '  <div class="theme-control" role="group" aria-label="Color theme" data-od-id="kit-theme-control">',
      '    <span class="control-label">Theme</span>',
      '    <button type="button" data-theme-choice="light" data-od-id="kit-theme-light" aria-pressed="' + String(theme === "light") + '">Light</button>',
      '    <button type="button" data-theme-choice="dark" data-od-id="kit-theme-dark" aria-pressed="' + String(theme === "dark") + '">Dark</button>',
      '  </div>',
      '</header>'
    ].join("");
  }

  window.Navigation = Navigation;
})();

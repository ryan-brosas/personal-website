(function () {
  "use strict";

  function Navigation(options) {
    var track = options.track || "personal";
    return [
      '<header class="app-header" data-od-id="kit-header">',
      '  <a class="brand-lockup" href="../../index.html" aria-label="Ryan Brosas brand system preview directory" data-od-id="kit-brand-home">',
      '    <span class="brand-tile"><img src="../../assets/Logo---Ryan-1.svg" alt="" /></span>',
      '    <span class="brand-copy"><strong>Ryan Brosas</strong><span>Agent Systems Builder</span></span>',
      '  </a>',
      '  <nav class="page-nav" aria-label="Primary workbook navigation" data-od-id="kit-primary-navigation">',
      '    <a href="#strategy" aria-current="page">Brand Strategy</a>',
      '    <a href="#presentation">Brand Presentation</a>',
      '    <a href="#guidelines">Brand Guidelines</a>',
      '  </nav>',
      '  <div class="track-control" role="group" aria-label="Secondary brand track" data-od-id="kit-track-control">',
      '    <button type="button" data-track="personal" aria-pressed="' + String(track === "personal") + '">Personal</button>',
      '    <button type="button" data-track="client" aria-pressed="' + String(track === "client") + '">Client</button>',
      '  </div>',
      '</header>'
    ].join("");
  }

  window.Navigation = Navigation;
})();


(function () {
  "use strict";

  function Navigation(options) {
    var track = options.track || "personal";
    var theme = options.theme || "light";
    return [
      '<header class="app-header" data-od-id="kit-header">',
      '  <a class="brand-lockup" href="../../preview/index.html" aria-label="Ryan Brosas brand system preview directory" data-od-id="kit-brand-home">',
      window.LogoTile({ src: "../../logos/Logo---Ryan-1.svg" }),
      '    <span class="brand-copy"><strong>Ryan Brosas</strong><span>Agent Systems Builder</span></span>',
      '  </a>',
      '  <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="kit-primary-navigation" data-nav-toggle data-od-id="kit-navigation-toggle">' + window.UtilityIcon("menu", "icon--menu") + '<span data-nav-toggle-label>Open primary pages</span>' + window.UtilityIcon("chevron-down", "icon--chevron") + '</button>',
      '  <nav class="page-nav" id="kit-primary-navigation" aria-label="Primary workbook navigation" data-mobile-open="false" data-od-id="kit-primary-navigation">',
      '    <a href="#strategy" aria-current="page" data-od-id="kit-nav-strategy">Brand Strategy</a>',
      '    <a href="#presentation" data-od-id="kit-nav-presentation">Brand Presentation</a>',
      '    <a href="#guidelines" data-od-id="kit-nav-guidelines">Brand Guidelines</a>',
      '  </nav>',
      '  <div class="track-control" role="group" aria-label="Secondary brand track" data-od-id="kit-track-control">',
      '    <button type="button" data-track="personal" data-od-id="kit-track-personal" aria-pressed="' + String(track === "personal") + '">Personal</button>',
      '    <button type="button" data-track="client" data-od-id="kit-track-client" aria-pressed="' + String(track === "client") + '">Client</button>',
      '  </div>',
      window.ThemeControl(theme),
      '</header>'
    ].join("");
  }

  window.Navigation = Navigation;
})();

(function () {
  "use strict";

  var steps = [
    { index: "01", name: "Context", question: "Where does the information come from, and can it be trusted?" },
    { index: "02", name: "Work", question: "Should this be an agent, a script, or a process change?" },
    { index: "03", name: "Checks", question: "Who or what verifies that the result is actually useful?" },
    { index: "04", name: "Handoffs", question: "How do people and other agents know what happened?" },
    { index: "05", name: "Recovery", question: "What happens when it fails at 3AM?" }
  ];

  function SystemMap() {
    return '<div class="system-map-wrap" data-od-id="kit-system-map-wrap"><ol class="system-map" aria-label="Context through recovery decision sequence" data-od-id="kit-system-map">' + steps.map(function (step) {
      return [
        '<li class="system-step" data-step="' + step.name.toLowerCase() + '" data-od-id="kit-system-step-' + step.name.toLowerCase() + '">',
        '  <span class="mono-label">' + step.index + ' / ' + step.name + '</span>',
        '  <p>' + step.question + '</p>',
        '</li>'
      ].join("");
    }).join("") + '</ol><p class="system-loop"><svg aria-hidden="true" focusable="false"><use href="../../assets/icons.svg#icon-refresh"></use></svg>Recovery records the failure context, then improves the next Context.</p></div>';
  }

  window.SystemMap = SystemMap;
})();

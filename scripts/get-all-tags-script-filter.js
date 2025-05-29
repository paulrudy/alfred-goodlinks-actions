#!/usr/bin/env osascript -l JavaScript

'use strict';

function run(argv) {
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;

  const scriptFilterItemsJSON = app.doShellScript(
    `osascript -l JavaScript ./scripts/sf-items-builder--search.js 'tags'`
  );

  return scriptFilterItemsJSON;
}

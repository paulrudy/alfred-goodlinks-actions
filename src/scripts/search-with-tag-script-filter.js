#!/usr/bin/env osascript -l JavaScript

'use strict';

function run(argv) {
  const searchTag = argv[0];

  const app = Application.currentApplication();
  app.includeStandardAdditions = true;

  const scriptFilterItemsJSON = app.doShellScript(
    `osascript -l JavaScript ./scripts/sf-items-builder--search.js 'links-with-tag,${searchTag}' false`
  );

  return scriptFilterItemsJSON;
}

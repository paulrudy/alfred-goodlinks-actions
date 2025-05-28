#!/usr/bin/env osascript -l JavaScript

'use strict';

function reloadWorkflow() {
  const alfredApp = Application('Alfred');
  alfredApp.includeStandardAdditions = true;

  // get workflow environment variables
  const bundleID = $.NSProcessInfo.processInfo.environment.objectForKey(
    'alfred_workflow_bundleid'
  ).js;
  // / get workflow environment variables

  alfredApp.reloadWorkflow(bundleID);
}

function run(argv) {
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;

  // get workflow environment variables
  const cachePath = $.NSProcessInfo.processInfo.environment.objectForKey(
    'alfred_workflow_cache'
  ).js;
  // / get workflow environment variables

  app.doShellScript(`[[ -d "${cachePath}" ]] || mkdir -p "${cachePath}"`);
  const cacheFile = `${cachePath}/gl.json`;
  app.doShellScript(`rm -f '${cacheFile}'`);

  reloadWorkflow();
}

#!/usr/bin/env osascript -l JavaScript

'use strict';

const getEnvVar = (varName) =>
  $.NSProcessInfo.processInfo.environment.objectForKey(varName).js;

const reloadWorkflow = ({ alfredApp, bundleID }) => {
  alfredApp.reloadWorkflow(bundleID);
};

function run(argv) {
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;
  const alfredApp = Application('Alfred');
  alfredApp.includeStandardAdditions = true;

  // get workflow environment variables
  const cachePath = getEnvVar('alfred_workflow_cache');
  const bundleID = getEnvVar('alfred_workflow_bundleid');
  // / get workflow environment variables

  app.doShellScript(`[[ -d "${cachePath}" ]] || mkdir -p "${cachePath}"`);
  const cacheFile = `${cachePath}/gl.json`;
  app.doShellScript(`rm -f '${cacheFile}'`);
  const cacheStatus = '';
  app.doShellScript(
    `osascript -l JavaScript ./scripts/set-caching-vars.js '${cacheStatus}'`
  );

  reloadWorkflow({ alfredApp, bundleID });
}

#!/usr/bin/env osascript -l JavaScript

'use strict';

const getEnvVar = (varName) =>
  $.NSProcessInfo.processInfo.environment.objectForKey(varName).js;

function run(argv) {
  const cacheStatus = argv[0];

  const alfredApp = Application('Alfred');
  alfredApp.includeStandardAdditions = true;

  // get workflow environment variables
  const bundleID = getEnvVar('alfred_workflow_bundleid');
  // / get workflow environment variables

  if (cacheStatus.length) {
    alfredApp.setConfiguration('cache_status', {
      toValue: cacheStatus,
      inWorkflow: bundleID,
    });
  } else {
    alfredApp.removeConfiguration('cache_status', {
      inWorkflow: bundleID,
    });
  }
  const cacheStatusSubtext =
    cacheStatus != 'done'
      ? 'Building cache. This may take a few seconds…'
      : 'Querying cached GoodLinks…';
  alfredApp.setConfiguration('cache_status_text', {
    toValue: cacheStatusSubtext,
    inWorkflow: bundleID,
  });
}

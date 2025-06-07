#!/usr/bin/env osascript -l JavaScript

'use strict';

function run(argv) {
  const cacheStatus = argv[0];

  const alfredApp = Application('Alfred');
  alfredApp.includeStandardAdditions = true;

  // get workflow environment variables
  const bundleID = $.NSProcessInfo.processInfo.environment.objectForKey(
    'alfred_workflow_bundleid'
  ).js;
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
  const pleaseWaitSubtextCache =
    cacheStatus != 'done'
      ? 'Building cache. This may take a few seconds…'
      : 'Querying cached GoodLinks…';
  alfredApp.setConfiguration('please_wait_subtext_cache', {
    toValue: pleaseWaitSubtextCache,
    inWorkflow: bundleID,
  });
}

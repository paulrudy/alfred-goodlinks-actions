#!/usr/bin/env osascript -l JavaScript

'use strict';

function run(argv) {
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;
  const alfredApp = Application('Alfred');
  alfredApp.includeStandardAdditions = true;
  const glApp = Application('GoodLinks');
  glApp.includeStandardAdditions = true;

  // get workflow environment variables
  const cacheDuration =
    Number(
      $.NSProcessInfo.processInfo.environment.objectForKey('cache_duration').js
    ) || 3600;
  const cachePath = $.NSProcessInfo.processInfo.environment.objectForKey(
    'alfred_workflow_cache'
  ).js;
  const cacheRebuilding =
    $.NSProcessInfo.processInfo.environment.objectForKey('cache_rebuilding').js;
  const bundleID = $.NSProcessInfo.processInfo.environment.objectForKey(
    'alfred_workflow_bundleid'
  ).js;
  // / get workflow environment variables

  app.doShellScript(`[[ -d "${cachePath}" ]] || mkdir -p "${cachePath}"`);
  const cacheFile = `${cachePath}/gl.json`;
  app.doShellScript(`touch '${cacheFile}'`);

  const currentCacheExpirationISO = app.doShellScript(
    `jq -r '.cache_file_props.expire_dt' '${cacheFile}'`
  );
  const currentCacheExpiration = new Date(currentCacheExpirationISO);
  const cacheSecondsRemaining = Math.round(
    (currentCacheExpiration - Date.now()) / 1000
  );

  let cacheJSON;
  if (
    cacheRebuilding != 'true' &&
    (isNaN(currentCacheExpiration) || cacheSecondsRemaining <= 0)
  ) {
    // cache isn't being rebuilt and no saved cache or cache expired
    alfredApp.setConfiguration('cache_rebuilding', {
      toValue: 'true',
      inWorkflow: bundleID,
    });
    const tmpFile = `${cachePath}/tmp.json`;
    app.doShellScript(`touch '${tmpFile}'`);
    const allGLLinksProps = glApp.links().map((l) => l.properties());
    const allGLTagsProps = glApp.tags().map((t) => {
      const linksWithTag = allGLLinksProps.filter(
        (l) => l.tagNames.length && l.tagNames.includes(t.name())
      );
      return {
        ...t.properties(),
        tagged_links_count: linksWithTag.length,
      };
    });
    const newCacheExpirationISO = new Date(
      Date.now() + cacheDuration * 1000
    ).toISOString();
    cacheJSON = JSON.stringify({
      cache_file_props: {
        expire_dt: newCacheExpirationISO,
      },
      all_gl_tags_props: allGLTagsProps,
      all_gl_links_props: allGLLinksProps,
    });

    app.doShellScript(`tee '${tmpFile}' <<-'EOF'\n${cacheJSON}\nEOF`); // literal heredoc newlines preserve javascript indentation
    app.doShellScript(`mv '${tmpFile}' '${cacheFile}'`);
  } else {
    // get items from saved cache
    cacheJSON = app.doShellScript(`cat '${cacheFile}'`);
  }

  alfredApp.setConfiguration('cache_rebuilding', {
    toValue: 'false',
    inWorkflow: bundleID,
  });

  return cacheJSON;
}

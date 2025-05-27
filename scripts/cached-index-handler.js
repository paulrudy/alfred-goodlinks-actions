#!/usr/bin/env osascript -l JavaScript

'use strict';

function run(argv) {
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;
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
  if (isNaN(currentCacheExpiration) || cacheSecondsRemaining <= 0) {
    // no saved cache or cache expired
    const allGLTagsProps = glApp.tags().map((t) => t.properties());
    const allGLLinksProps = glApp.links().map((l) => l.properties());
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

    app.doShellScript(`tee '${cacheFile}' <<-'EOF'\n${cacheJSON}\nEOF`); // literal heredoc newlines preserve javascript indentation
  } else {
    // get items from saved cache
    cacheJSON = app.doShellScript(`cat '${cacheFile}'`);
  }

  return cacheJSON;
}

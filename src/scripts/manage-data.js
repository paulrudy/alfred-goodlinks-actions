#!/usr/bin/env osascript -l JavaScript

'use strict';

const getEnvVar = (varName) =>
  $.NSProcessInfo.processInfo.environment.objectForKey(varName).js;

const setEnvVars = (keysVals) => {
  const alfredApp = Application('Alfred');
  alfredApp.includeStandardAdditions = true;
  const bundleID = getEnvVar('alfred_workflow_bundleid');

  for (const [key, value] of Object.entries(keysVals)) {
    alfredApp.setConfiguration(key, {
      toValue: value,
      inWorkflow: bundleID,
    });
  }
};

// rebuild cache if needed, return GoodLinks info
function run(argv) {
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;
  const glApp = Application('GoodLinks');
  glApp.includeStandardAdditions = true;

  const defaultsubText = getEnvVar('subtext_search_default');
  const cacheDuration = Number(getEnvVar('cache_duration')) || 3600;
  const cachePath = getEnvVar('alfred_workflow_cache');
  let cacheStatus = getEnvVar('cache_status');

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
  if (cacheStatus === 'rebuilding') {
    return null;
  } else if (isNaN(currentCacheExpiration) || cacheSecondsRemaining <= 0) {
    // cache isn't being rebuilt and no saved cache or cache expired, so rebuild
    const tmpFile = `${cachePath}/tmp.json`;
    app.doShellScript(`touch '${tmpFile}'`);

    cacheStatus = 'rebuilding';
    setEnvVars({
      cache_status: cacheStatus,
      cache_status_text: 'Building cache. This may take a few seconds…',
    });

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
    setEnvVars({
      cache_status: cacheStatus,
      cache_status_text: defaultsubText,
    });
    // get items from saved cache
    cacheJSON = app.doShellScript(`cat '${cacheFile}'`);
  }

  cacheStatus = 'done';
  setEnvVars({ cache_status: cacheStatus });

  return cacheJSON;
}

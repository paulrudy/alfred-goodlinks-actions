#!/usr/bin/env osascript -l JavaScript

'use strict';

function run(argv) {
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;

  // get workflow environment variables
  const cacheDuration =
    $.NSProcessInfo.processInfo.environment.objectForKey('myvariable').js ||
    3600;
  // / get workflow environment variables

  const cache = JSON.parse(
    app.doShellScript(
      'osascript -l JavaScript ./scripts/cached-index-handler.js'
    )
  );
  const allGLTagsProps = cache.all_gl_tags_props;
  const allGLLinksProps = cache.all_gl_links_props;
  const cacheSecondsRemaining = Math.round(
    (new Date(cache.cache_file_props.expire_dt) - Date.now()) / 1000
  );
  const alfredCacheSecondsRemaining = cacheSecondsRemaining - 1;

  const taggedLinks = allGLLinksProps.reduce((result, link) => {
    link.tagNames.length && result.push(link.tagNames);

    return result;
  }, []);

  const items = allGLTagsProps.map((tag) => {
    const linksWithTag = taggedLinks.filter((tagNames) =>
      tagNames.includes(tag.name)
    );

    return {
      uid: tag.id,
      title: tag.name,
      subtitle: `${linksWithTag.length} link${
        linksWithTag.length > 1 ? 's' : ''
      }`,
      arg: tag.name,
      text: {
        largetype: tag.name,
      },
    };
  });

  const scriptFilterItems = {
    cache: { seconds: alfredCacheSecondsRemaining, loosereload: true },
    ...{ items },
  };

  const scriptFilterItemsJSON = JSON.stringify(scriptFilterItems);

  return scriptFilterItemsJSON;
}

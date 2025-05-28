#!/usr/bin/env osascript -l JavaScript

'use strict';

function run(argv) {
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;

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

  const items = allGLTagsProps.map((tag) => {
    const linksWithTag = allGLLinksProps.filter((link) =>
      link.tagNames.includes(tag.name)
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
      quicklookurl: null,
    };
  });

  const scriptFilterItems = {
    cache: { seconds: alfredCacheSecondsRemaining, loosereload: true },
    ...{ items },
  };

  const scriptFilterItemsJSON = JSON.stringify(scriptFilterItems);

  return scriptFilterItemsJSON;
}

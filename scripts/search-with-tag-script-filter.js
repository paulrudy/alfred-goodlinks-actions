#!/usr/bin/env osascript -l JavaScript

'use strict';

function run(argv) {
  const searchTag = argv[0];
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;

  // get workflow environment variables
  const cacheDuration =
    Number(
      $.NSProcessInfo.processInfo.environment.objectForKey('cache_duration').js
    ) || 3600;
  const defaultSearchSubtitle =
    $.NSProcessInfo.processInfo.environment.objectForKey(
      'default_search_subtitle'
    ).js;
  // / get workflow environment variables

  const cache = JSON.parse(
    app.doShellScript(
      'osascript -l JavaScript ./scripts/cached-index-handler.js'
    )
  );
  const allGLLinksProps = cache.all_gl_links_props;
  const cacheSecondsRemaining = Math.round(
    (new Date(cache.cache_file_props.expire_dt) - Date.now()) / 1000
  );
  const alfredCacheSecondsRemaining = cacheSecondsRemaining - 1;

  const filteredItems = allGLLinksProps.filter((link) =>
    link.tagNames.includes(searchTag)
  );

  let items;
  if (!filteredItems.length) {
    items = [
      {
        title: `No results for tag "${searchTag}"`,
        subtitle: 'View existing GoodLinks tags?',
        arg: 'trigger:self_list_tags',
      },
    ];
  } else {
    items = filteredItems.map((link) => {
      const starredText = link.starred ? '\u2605' : '\u2606';
      const readText = link.read ? 'read' : 'unread';
      const tagInfo = link.tagNames.length
        ? `tags: ${link.tagNames.join(', ')}`
        : 'untagged';
      const altSearchSubtitle = `${starredText} | ${readText} | ${tagInfo}`;

      return {
        uid: link.uid,
        title: link.title,
        subtitle:
          defaultSearchSubtitle === 'show url' ? link.url : altSearchSubtitle,
        arg: link.url,
        mods: {
          cmd: {
            valid: true,
            subtitle:
              defaultSearchSubtitle === 'show url'
                ? altSearchSubtitle
                : link.url,
          },
          alt: {
            valid: true,
            subtitle: 'Copy the URL to the clipboard',
            arg: [link.url, 'copy'],
          },
          'cmd+alt': {
            valid: true,
            subtitle: link.summary || link.url,
          },
        },
        text: {
          copy: link.url,
        },
      };
    });
  }

  const scriptFilterItems = {
    // cache: { seconds: alfredCacheSecondsRemaining, loosereload: true }, // don't use cache with this script filter (not using "Alfred filters results")
    ...{ items },
  };

  const scriptFilterItemsJSON = JSON.stringify(scriptFilterItems);

  return scriptFilterItemsJSON;
}

#!/usr/bin/env osascript -l JavaScript

'use strict';

function run(argv) {
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;

  // get workflow environment variables
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

  const items = allGLLinksProps.map((link) => {
    const starredText = link.starred ? '\u2605' : '\u2606';
    const readText = link.read ? 'read' : 'unread';
    const tagInfo = link.tagNames.length
      ? `tags: ${link.tagNames.join(', ')}`
      : 'untagged';
    const linkInfoSubtitle = `${starredText} | ${readText} | ${tagInfo}`;
    const summaryText = link.summary || '(No summary available)';

    return {
      uid: link.uid,
      title: link.title,
      subtitle:
        defaultSearchSubtitle === 'show summary'
          ? summaryText
          : linkInfoSubtitle,
      arg: link.url,
      mods: {
        cmd: {
          valid: true,
          subtitle:
            defaultSearchSubtitle === 'show summary'
              ? linkInfoSubtitle
              : summaryText,
        },
        alt: {
          valid: true,
          subtitle: 'Copy the URL to the clipboard',
          arg: [link.url, 'copy'],
        },
        ctrl: {
          valid: true,
          subtitle: link.url,
        },
      },
      text: {
        copy: link.url,
        largetype: `${link.title}\n\n${summaryText}`,
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

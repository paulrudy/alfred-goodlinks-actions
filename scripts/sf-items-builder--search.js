#!/usr/bin/env osascript -l JavaScript

'use strict';

function run(argv) {
  const [filterFor, filterArg] = argv[0].split(',').map((item) => item.trim());
  const useAlfredCache = argv[1] ? JSON.parse(argv[1]) : true;

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
  const allGLTagsProps = cache.all_gl_tags_props;
  const allGLLinksProps = cache.all_gl_links_props;
  const cacheSecondsRemaining = Math.round(
    (new Date(cache.cache_file_props.expire_dt) - Date.now()) / 1000
  );
  const alfredCacheSecondsRemaining = cacheSecondsRemaining - 1;

  let items, noResultsItems;
  if (filterFor === 'with-tag') {
    noResultsItems = {
      title: `No results for tag "${filterArg}"`,
      subtitle: 'View existing GoodLinks tags?',
      arg: 'trigger:self_list_tags',
    };
  } else {
    noResultsItems = {
      title: `No results`,
      subtitle: 'GoodLinks has no matching items',
    };
  }

  if (filterFor === 'tags') {
    items = allGLTagsProps.map((tag) => {
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
  } else {
    items = allGLLinksProps.reduce((result, link) => {
      const starredText = link.starred ? '\u2605' : '\u2606';
      const readText = link.read ? 'read' : 'unread';
      const tagInfo = link.tagNames.length
        ? `tags: ${link.tagNames.join(', ')}`
        : 'untagged';
      const linkInfoSubtitle = `${starredText} | ${readText} | ${tagInfo}`;
      const summaryText = link.summary || '(No summary available)';
      const filterConditionMap = {
        'links-all': true,
        'links-unread': !link.read,
        'links-starred': link.starred,
        'links-with-tag': link.tagNames.includes(filterArg),
      };

      if (filterConditionMap[filterFor])
        result.push({
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
        });

      return result;
    }, []);
  }

  if (!items.length) {
    items.push(noResultsItems);
  }

  const scriptFilterItems = {
    cache: useAlfredCache
      ? { seconds: alfredCacheSecondsRemaining, loosereload: true }
      : null,
    ...{ items },
  };

  const scriptFilterItemsJSON = JSON.stringify(scriptFilterItems);

  return scriptFilterItemsJSON;
}

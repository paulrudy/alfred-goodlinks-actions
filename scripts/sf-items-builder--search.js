#!/usr/bin/env osascript -l JavaScript

'use strict';

function fisherYates(array) {
  let count = array.length;
  while (count) {
    const randomIndex = (Math.random() * count--) | 0;
    const temp = array[count];
    array[count] = array[randomIndex];
    array[randomIndex] = temp;
  }
}

function run(argv) {
  const [filterFor, filterArg] = argv[0].split(',').map((item) => item.trim());
  const useAlfredCache = argv[1] ? JSON.parse(argv[1]) : true;

  const app = Application.currentApplication();
  app.includeStandardAdditions = true;
  const alfredApp = Application('Alfred');
  alfredApp.includeStandardAdditions = true;

  // get workflow environment variables
  const cacheStatus =
    $.NSProcessInfo.processInfo.environment.objectForKey('cache_status').js;
  const bundleID = $.NSProcessInfo.processInfo.environment.objectForKey(
    'alfred_workflow_bundleid'
  ).js;
  const defaultSearchSubtitle =
    $.NSProcessInfo.processInfo.environment.objectForKey(
      'default_search_subtitle'
    ).js;
  // / get workflow environment variables

  const pleaseWaitSubtextCache =
    cacheStatus != 'done'
      ? 'Building cache. This may take a few seconds…'
      : 'Querying cached GoodLinks…';
  alfredApp.setConfiguration('please_wait_subtext_cache', {
    toValue: pleaseWaitSubtextCache,
    inWorkflow: bundleID,
  });

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
  if (filterFor === 'links-with-tag') {
    noResultsItems = {
      title: 'View existing GoodLinks tags',
      subtitle: `No results for tag "${filterArg}"`,
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
      return {
        uid: tag.id,
        title: tag.name,
        subtitle: `${tag.tagged_links_count} link${
          tag.tagged_links_count > 1 ? 's' : ''
        }`,
        arg: tag.name,
        text: {
          largetype: tag.name,
        },
        quicklookurl: null,
      };
    });
  } else {
    items = allGLLinksProps.reduce((result, link, i) => {
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
        'links-random-unread': !link.read,
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
              arg: link.url,
              variables: {
                action: 'copy',
              },
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

  if (filterFor === 'links-random-unread') {
    fisherYates(items); // randomize array
    items = items.slice(0, 1);
    items.push({
      title: 'Get another…',
      subtitle: 'Search for another random link',
      arg: 'trigger:self_random_unread',
      icon: {
        path: './icons/sf-symbols-red-arrow.clockwise.circle.fill.png',
      },
    });
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

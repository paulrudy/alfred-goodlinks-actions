#!/usr/bin/env osascript -l JavaScript

'use strict';

const cacheDuration =
  Number(
    $.NSProcessInfo.processInfo.environment.objectForKey('cache_duration').js
  ) || 3600;

const glApp = Application('GoodLinks');
glApp.includeStandardAdditions = true;

const items = glApp.links().reduce((result, link) => {
  const uid = link.id();
  const url = link.url();
  const title = link.title();
  const read = link().properties().read;
  const starred = link.starred();
  const tagNames = link.tagNames();
  const summary = link.summary();
  const starredText = starred ? '\u2605' : '\u2606';
  const readText = read ? 'read' : 'unread';
  const tagInfo = tagNames.length ? `tags: ${tagNames.join(', ')}` : 'untagged';

  if (starred)
    result.push({
      uid: uid,
      title: title,
      subtitle: url,
      arg: ['open url', url],
      mods: {
        cmd: {
          valid: true,
          subtitle: `${starredText} | ${readText} | ${tagInfo}`,
        },
        alt: {
          valid: true,
          subtitle: 'Copy the URL to the clipboard',
          arg: ['copy url', url],
        },
        'cmd+alt': {
          valid: true,
          subtitle: summary || url,
        },
      },
    });

  return result;
}, []);

const alfredItems = {
  cache: { seconds: cacheDuration, loosereload: true },
  items: items,
};

const alfredItemsJSON = JSON.stringify(alfredItems);

alfredItemsJSON;

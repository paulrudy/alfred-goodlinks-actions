#!/usr/bin/env osascript -l JavaScript

'use strict';

const cacheDuration =
  Number(
    $.NSProcessInfo.processInfo.environment.objectForKey('cache_duration').js
  ) || 3600;

const glApp = Application('GoodLinks');
glApp.includeStandardAdditions = true;

const items = glApp.links().map((link) => {
  const starStatus = link.starred() ? '\u2605' : '\u2606';
  const readStatus = link().properties().read ? 'read' : 'unread';
  const tagInfo = link.tagNames().length
    ? `tags: ${link.tagNames().join(', ')}`
    : 'untagged';

  return {
    uid: link.id(),
    title: link.title(),
    subtitle: link.url(),
    arg: ['open url', link.url()],
    mods: {
      cmd: {
        valid: true,
        subtitle: `${starStatus} | ${readStatus} | ${tagInfo}`,
      },
      alt: {
        valid: true,
        subtitle: 'Copy the URL to the clipboard',
        arg: ['copy url', link.url()],
      },
      'cmd+alt': {
        valid: true,
        subtitle: link.summary() || link.url(),
      },
    },
  };
});

const alfredItems = {
  cache: { seconds: cacheDuration, loosereload: true },
  items: items,
};

const alfredItemsJSON = JSON.stringify(alfredItems);

alfredItemsJSON;

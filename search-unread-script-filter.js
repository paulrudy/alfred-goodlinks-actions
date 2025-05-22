#!/usr/bin/env osascript -l JavaScript

'use strict';

const cacheDuration =
  Number(
    $.NSProcessInfo.processInfo.environment.objectForKey('cache_duration').js
  ) || 3600;
const defaultSubtitle =
  $.NSProcessInfo.processInfo.environment.objectForKey('default_subtitle').js;

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
  const altSubtitle = `${starredText} | ${readText} | ${tagInfo}`;

  if (!read)
    result.push({
      uid: uid,
      title: title,
      subtitle: defaultSubtitle === 'show url' ? url : altSubtitle,
      arg: url,
      mods: {
        cmd: {
          valid: true,
          subtitle: defaultSubtitle === 'show url' ? altSubtitle : url,
        },
        alt: {
          valid: true,
          subtitle: 'Copy the URL to the clipboard',
          arg: url,
        },
        'cmd+alt': {
          valid: true,
          subtitle: summary || url,
        },
      },
      text: {
        copy: url,
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

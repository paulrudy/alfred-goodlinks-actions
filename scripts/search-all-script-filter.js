#!/usr/bin/env osascript -l JavaScript

'use strict';

function run(argv) {
  const cacheDuration =
    Number(
      $.NSProcessInfo.processInfo.environment.objectForKey('cache_duration').js
    ) || 3600;
  const defaultSubtitle =
    $.NSProcessInfo.processInfo.environment.objectForKey('default_subtitle').js;

  const app = Application.currentApplication();
  app.includeStandardAdditions = true;
  const glApp = Application('GoodLinks');
  glApp.includeStandardAdditions = true;
  const allGLLinksProps = glApp.links().map((l) => l.properties());

  const items = allGLLinksProps.map((link) => {
    const starredText = link.starred ? '\u2605' : '\u2606';
    const readText = link.read ? 'read' : 'unread';
    const tagInfo = link.tagNames.length
      ? `tags: ${link.tagNames.join(', ')}`
      : 'untagged';
    const altSubtitle = `${starredText} | ${readText} | ${tagInfo}`;

    return {
      uid: link.uid,
      title: link.title,
      subtitle: defaultSubtitle === 'show url' ? link.url : altSubtitle,
      arg: link.url,
      mods: {
        cmd: {
          valid: true,
          subtitle: defaultSubtitle === 'show url' ? altSubtitle : link.url,
        },
        alt: {
          valid: true,
          subtitle: 'Copy the URL to the clipboard',
          arg: link.url,
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

  const scriptFilterItems = {
    cache: { seconds: cacheDuration, loosereload: true },
    ...{ items },
  };

  const scriptFilterItemsJSON = JSON.stringify(scriptFilterItems);

  return scriptFilterItemsJSON;
}

#!/usr/bin/env osascript -l JavaScript

'use strict';

const cacheDuration =
  $.NSProcessInfo.processInfo.environment.objectForKey('myvariable').js || 3600;

const glApp = Application('GoodLinks');
glApp.includeStandardAdditions = true;

const taggedLinks = glApp.links().reduce((result, link) => {
  link.tagNames().length && result.push(link.tagNames());

  return result;
}, []);

const items = glApp.tags().map((tag) => {
  const linksWithTag = taggedLinks.filter((tagNames) =>
    tagNames.includes(tag.name())
  );

  return {
    uid: tag.id(),
    title: tag.name(),
    subtitle: `${linksWithTag.length} link${
      linksWithTag.length > 1 ? 's' : ''
    }`,
    arg: tag.name(),
  };
});

const alfredItems = {
  cache: { seconds: cacheDuration, loosereload: true },
  items: items,
};

const alfredItemsJSON = JSON.stringify(alfredItems);

alfredItemsJSON;

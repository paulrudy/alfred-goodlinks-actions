# GoodLinks Actions - Alfred workflow

An Alfred workflow for searching and adding links in [GoodLinks](https://goodlinks.app).

## Usage

### Search GoodLinks

Use the keyword `gls` to search all links. Hold `⌘` to view the link's starred status,read/unread status, and tags, if any. Action the result to open the link in GoodLinks, or action with `⌥` to copy the link to the clipboard.

Use `glu` to search unread links.

Use `glx` to search starred links.

Use `glt` to search for a tag, then action the result to search for links with the selected tag.

Note: The first time a search is invoked, Alfred may take several seconds to display the results. After that, the results are intelligently cached and updated by Alfred, and should appear immediately.

### Add URL to GoodLinks

Add a link to GoodLinks using the [Universal Action](https://www.alfredapp.com/help/features/universal-actions/), or use the keyword `gl` to add a link from the frontmost browser.

By default, links are added via GoodLinks "quick save". Hold the `⌥` key to edit the link info in GoodLinks.

## Configuration

The workflow provides configuration for keywords and cache duration.

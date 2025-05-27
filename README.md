# GoodLinks Actions - Alfred workflow

An Alfred workflow for searching and adding links in [GoodLinks](https://goodlinks.app).

## Usage

### Search GoodLinks

Use the keyword `gls` to search all links.

Use `glu` to search unread links.

Use `glx` to search starred links.

Use `glt` to search for a tag, then action the result to search for links with the selected tag.

Use `glwt` to search for links with a specific tag.

Use `glr` to open a random unread link in GoodLinks.

Note: The first time a search is invoked, Alfred may take several seconds to display the results. After that, the results are intelligently cached and updated by Alfred, and should appear immediately.

#### Modifier Keys

The default subtext is the link's summary, if available. Hold `⌘` to view the link's starred status,read/unread status, and tags, if any. (These defaults can be switched in the workflow configuration.)

Hold `⌃` to show the link's URL.

Action the result to open the link in GoodLinks, or action with `⌥` to copy the link to the clipboard.

Use Alfred's [Large Type](https://www.alfredapp.com/help/features/large-type/) feature (`⌘`+`L`) to show a large-type view of the link's title, and if available, summary.

### Add URL to GoodLinks

Add a link to GoodLinks using the [Universal Action](https://www.alfredapp.com/help/features/universal-actions/), or use the keyword `glb` to add a link from the frontmost browser.

By default, links are added via GoodLinks "quick save". Hold the `⌥` key to edit the link info in GoodLinks.

## Configuration

The workflow provides configuration for default search subtext, keywords, and cache duration.

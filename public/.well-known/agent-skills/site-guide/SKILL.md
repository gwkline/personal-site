---
name: site-guide
description: >-
  How to read gavinkline.com as an agent: fetch llms.txt for the content
  index, use RSS for updates, and request any page with Accept:
  text/markdown to get markdown instead of HTML.
---

# Reading gavinkline.com

Start at /llms.txt. It links every post, project, and page with a one
line summary.

## Fetching content

- Any page returns markdown when requested with `Accept: text/markdown`.
- Post URLs also accept a `.md` suffix (for example
  `/posts/01-hello-world.md`).
- New posts are announced in /rss.xml.

## Endpoints

- /rss.xml: RSS 2.0 feed of posts.
- /sitemap.xml: every indexable URL.
- /api/health: JSON liveness probe.

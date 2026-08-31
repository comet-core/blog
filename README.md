# In the margins

A dark, personal journal for everyday observations, longer writing, and passing thoughts. Built with Eleventy; published as plain HTML, CSS, images, and a small amount of JavaScript. There is no backend, database, paid service, or production Node server.

## Put it on GitHub Pages

1. Create a GitHub repository and upload this project, including the hidden `.github` folder. Do **not** upload `node_modules` or `_site`.
2. In the repository, open **Settings → Pages → Build and deployment → Source**, and select **GitHub Actions**.
3. Open **Actions → Publish journal to GitHub Pages → Run workflow** for the initial deployment. After that, every commit to your default branch builds and publishes automatically.

The workflow gets your site's address directly from GitHub. Both `username.github.io` repositories and regular `username.github.io/repository-name/` sites work without changing asset paths. Custom domains configured in GitHub Pages are supported too. You do not need to edit a base URL or put secrets in the project.

If the first run happened before you enabled Pages, enable it and rerun the workflow. Your live address is shown in **Settings → Pages** and in the deployment run. A repository has not been created or published for you by this scaffold.

GitHub's official instructions: [Publishing with Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Write a post without using the terminal

1. In your GitHub repository, open `src/posts`.
2. Choose **Add file → Create new file**. Name it `your-post-title.md`.
3. Paste the following, then write beneath the second `---`:

```markdown
---
title: "A thing I noticed today"
description: "A short sentence to introduce this entry."
date: 2026-08-31
category: Everyday
draft: false
---

Write your entry here. A sentence is enough.

## Or give it a little room

You can use **bold**, *italics*, lists, quotes, and links.
```

4. Commit the file to your default branch. GitHub publishes the update automatically.

Use `Everyday`, `Writings`, `Fragments`, `Space`, or `Automotive` as the category. Any length is fine. You can write in any language; a visitor's system font will be used for characters outside the bundled Latin fonts. Dates control sorting. Dates are not a scheduler: a future-dated entry with `draft: false` is still published.

Set `draft: true` to exclude a post from the site, search, and RSS. **Drafts are still readable in a public GitHub repository**. Keep private writing outside the repository. A clean production build removes previously published files when you delete a post or make it a draft.

To feature an entry on the homepage, add `featured: true`. Keep only one featured entry; if more than one is marked, the newest wins. Otherwise, the newest entry is featured automatically.

### Add a photo

Upload your image to `src/assets/images`, then add these lines to the post's front matter:

```yaml
image: /assets/images/your-photo.jpg
imageAlt: "Describe what is in the photo."
imageCredit: "Photo by Subhro"
```

For an image inside the body, use Eleventy's URL filter so it also works on project Pages:

```markdown
![Describe the image]({{ '/assets/images/your-photo.jpg' | url }})
```

Keep filenames lowercase with hyphens. Rename a post file only when you intend to change its public URL.

## Make it yours

- `src/_data/site.json`: journal title, author, introduction, about text, note to self, and topics.
- `src/about.njk`: the rest of the about page.
- `src/index.njk`: homepage headline and layout.
- `src/assets/styles.css`: colours, type, spacing, and responsive layouts.
- `src/posts/*.md`: all writing.

The four included entries are **sample writing**, not claims about your experiences. They are marked on their reading pages. Delete or replace them before launch. Set `showExamples` to `false` in `site.json` after personalizing the copy; remove `sample: true` from entries you replace. If you remove all posts, the homepage shows a deliberate empty state.

## Work locally

Install Node.js 22 or later, then:

```sh
npm ci
npm run dev
```

Open the local address printed in your terminal. Changes update the preview.

Create a draft with:

```sh
npm run new -- "A thing I noticed today" --category Everyday
```

The command never overwrites an existing post. Change `draft: true` to `draft: false` when you want it included. Drafts are excluded from the local preview too.

Build and check the site:

```sh
npm test
```

The deployable output is `_site/`. To test a project Pages address locally:

```sh
PATH_PREFIX=/my-journal SITE_URL=https://example.github.io npm test
```

Run `npm run build` again afterward to restore the default local paths. `SITE_URL` is the origin only (for example `https://example.github.io`); `PATH_PREFIX` holds the repository path. GitHub Actions sets both for you.

## Included

- Mobile and desktop layouts; dark mode throughout.
- Real static entry pages with permanent URLs, reading times, and individual sharing metadata.
- Archive filters, full-entry text search, keyboard `/` shortcut, clearable search, and useful empty states.
- HTML navigation and readable posts even without JavaScript.
- RSS/Atom feed, sitemap, and a custom 404 page.
- Self-hosted fonts and photography. No analytics, cookies, or trackers.
- Keyboard focus styles, skip link, descriptive image text, and reduced-motion support.
- GitHub Actions publishing and pull-request checks for both root and repository-subdirectory hosting.

## Credits

Instrument Serif by Rodrigo Fuenzalida and DM Sans by Colophon Foundry, distributed under the SIL Open Font License. License files are included beside the local font files.

The sample photograph is served locally from Unsplash. Source: [coffee and notebook by a window](https://images.unsplash.com/photo-1594736131289-dd1b4d8260a4). Replace it with one of your own photographs to make this feel more personal.

Technical reference: [Eleventy path prefixes](https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix).

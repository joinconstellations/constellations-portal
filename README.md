# constellations-portal

Front-end code for the Constellations member portal (Circle), served over GitHub Pages.

Circle's Head code snippet has a hard ceiling of 65,536 characters. On 23 September 2026 it
stood at 64,731 — roughly 800 characters of room left. The portal's CSS and JavaScript were
moved here, and the snippet dropped to 5,967 characters. Everything the portal does now lives
in this repository and is loaded by four lines in that snippet.

## Files

| File | Loaded on | Purpose |
|---|---|---|
| `portal.css` | every page | All portal styles: the article design system, member feature layouts, the Discussions heroes, the Get started checklist panel, the Nova launcher and space, Report a Concern, and the various Circle chrome overrides. Block comments map each section back to its position in the original snippet. |
| `portal.js` | every page | All portal scripts: the member feature classifier (`scan()`), the Discussions heroes, the checklist panel, the monthly theme block, the emoji recolouring, and the small redirects and hides. Every block is self-contained; source order is preserved. |
| `features.css` | every page | Member feature templates. Loaded after `portal.css` so it wins the cascade. |
| `home.js` | `/c/welcome` | Builds the Home page: masthead and greeting, First steps, the monthly theme, Featured Gathering, Featured Articles, Our Community, and the static panels beneath them. Every live-data block hides itself if its call fails. |

## What stays in the Circle Head snippet, and why

Only three things, plus the loader tags:

- **Six `<meta>` tags** — home-screen identity (app title, theme colour, status bar). A meta tag
  cannot be loaded from an external file.
- **The Report a Concern form handler** — it holds a private webhook endpoint. It must never be
  committed here. See the rules below.
- **The loader tags** for the four files above.

Order in the snippet matters and should not be rearranged: `portal.css` before `features.css`
(cascade), `portal.js` before `home.js` (both `defer`, so they run in document order).

## How a change reaches members

1. Commit the file here, on `main`.
2. GitHub Pages rebuilds, usually within a minute or two.
3. Hard-reload the portal page (Cmd + Shift + R) — a plain reload will serve the cached copy.

Files are served from `https://joinconstellations.github.io/constellations-portal/`.
Bump the `VERSION` constant at the top of a file with each change, so what the portal is
serving can be confirmed rather than guessed at.

After committing, check the returned blob SHA and byte size against the local copy before
calling it done. "Looks right" is not the same as identical.

## Rules

- **No credentials, tokens, keys, webhook URLs or member data in this repository.** It is public.
- Member names and photographs live in Circle, never here.
- **Portal CSS and JavaScript changes belong in `portal.css` and `portal.js`, not in the Circle
  snippet.** The snippet is for meta tags, loader tags, and anything holding a private endpoint.
- Circle's snippet field saves silently and does not always keep what you typed. Reload the
  settings page and re-read the field to confirm any change.

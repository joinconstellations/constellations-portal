# constellations-portal

Front-end code for the Constellations member portal (Circle), served over GitHub Pages.

Circle's Head code snippet has a hard ceiling of 65,536 characters and is close to full,
so page code lives here instead and is loaded by a single `<script>` line in that snippet.

## Files

| File | Loaded on | Purpose |
|---|---|---|
| `home.js` | `/c/welcome` | Builds the Home page: masthead and greeting, First steps, the monthly theme, Featured Gathering, Featured Articles, Our Community, and the static panels beneath them. Every live-data block hides itself if its call fails. |

## How a change reaches members

1. Commit the file here, on `main`.
2. GitHub Pages rebuilds, usually within a minute or two.
3. Hard-reload the portal page (Cmd + Shift + R) — a plain reload will serve the cached copy.

The served file is at
`https://joinconstellations.github.io/constellations-portal/home.js`.
Bump the `VERSION` constant at the top of a file with each change, so what the portal is
serving can be confirmed rather than guessed at.

## Rules

- **No credentials, tokens, keys or member data in this repository.** It is public.
- Member names and photographs live in Circle, never here.
- Anything new that needs code should come here rather than into the Circle snippet.

# RythmicSteps — a collection of screen savers

Open `index.html` (or host with GitHub Pages: Settings → Pages → deploy from `main` root).

## Savers

| id | description |
|----|-------------|
| `balls-in-a-line` | A chain of circlets appears one by one, then drops out in order while the smallest grows into the first circle of the next chain. |
| `curved-balls` | Chains that bend along a gentle curve. Several chains overlap; new ones keep appearing while old ones fade later, either one ball at a time or all at once, quickly or slowly. |

## Rotation

The **most recently added** saver (last script in `index.html`) is shown first, to make
development and debugging easy. After about a minute the page crossfades to another
saver, chosen in random order without immediate repeats.

URL options:
- `?saver=curved-balls` pins a single saver (no rotation)
- `?interval=15` changes the dwell time in seconds

## Adding a saver

1. Create `savers/<id>.js` calling `Savers.register({ id, name, create(ctx, size) { return { frame(now) {} } } })`.
2. Add a `<script>` tag for it in `index.html` after the existing savers (last = shown first).

# Le Logo animation

This is a static browser demo of the logo being drawn as one continuous stroke. GSAP reveals one SVG path progressively and moves the pen marker along the same path.

## Run locally

From this directory, start any static HTTP server. With Python:

```sh
python3 -m http.server 4173
```

Then open [http://127.0.0.1:4173/](http://127.0.0.1:4173/) in a browser.

The demo loads GSAP from jsDelivr, so the browser needs network access on first load. No package installation or build step is required.

## Close the server

In the terminal running the server, press `Ctrl+C`.

If the terminal is no longer available, stop the process using port 4173:

```sh
lsof -ti :4173 | xargs -r kill
```

The server process should exit with a terminated message. That is expected.

## Pages

- **Fuse:** [http://127.0.0.1:4173/fuse/](http://127.0.0.1:4173/fuse/) is the primary motion page.
- **Path tool:** [http://127.0.0.1:4173/path-tool/](http://127.0.0.1:4173/path-tool/) contains the numbered segment picker.
- **Fold study:** [http://127.0.0.1:4173/fold/](http://127.0.0.1:4173/fold/) is the separate fixed-line logo-fold animation.

## Animation controls

- **Play route** starts or replays the permanent route.
- **Fold from line** feeds a horizontal line from the left before folding into the logo route.
- **Pause** toggles playback.
- **Replay** starts from the beginning.
- **Tempo** changes the playback rate.

## Edit the path

Open the [path tool](http://127.0.0.1:4173/path-tool/), press **Pick path segments**, and click the connected segments in order.

The picker rejects disconnected segments and prevents selecting the same segment twice. Use **Undo** to remove the last choice or **Clear** to start over. This is deliberately discrete: crossings and junctions are chosen explicitly instead of inferred from a rough freehand trace.

The root animation uses the permanent 24-segment route captured from the numbered canvas sequence. Changes made in the path tool are not automatically written to source; copy the resulting ordered route into `app.js` when a new path is confirmed.

## Reuse the fuse

The isolated component lives in [fuse-animation.js](fuse-animation.js). It registers `<le-fuse-animation>` and has no dependency on the page layout.

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/gsap.min.js"></script>
<script src="./fuse-animation.js"></script>
<le-fuse-animation id="process-fuse" show-ember></le-fuse-animation>
<script>
	const fuse = document.querySelector('#process-fuse');
	fuse.setColors({ active: '#31c48d', burned: '#38413d', guide: '#9aa9a0', spark: '#fff4ce' });
	fuse.setProgress(0.42); // bind this to a process value from 0 to 1
	fuse.animateTo(1, { duration: 8 });
	fuse.animateFold({ duration: 8 });
</script>
```

Supported attributes are `progress`, `show-ember`, `active-color`, `burned-color`, `guide-color`, and `spark-color`. The component exposes `setProgress(value)`, `animateTo(value, options)`, `animateFold(options)`, and `setColors(colors)`, and emits `fuse-progress` and `fuse-complete` events.

## Route notes

The orange `#route` path in `index.html` is an Euler circuit of the hand-drawn logo graph. The actual triangle contact points are treated as vertices, each of the 24 visible edges is traversed exactly once, and the circle uses SVG arcs rather than straight chords. `app.js` audits the route's undirected edge list and refuses to animate if an edge is accidentally added twice.

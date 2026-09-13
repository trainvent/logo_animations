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

## Controls

- **Draw** starts or replays the route.
- **Pause** toggles playback.
- **Reset** returns to the construction guides.
- **Speed** changes the playback rate.

## Set the path on the canvas

1. Press **Pick path segments**.
2. Click the first visible segment, then click the next segment connected to the current endpoint.
3. Continue through the logo. Each selected segment is highlighted and numbered in the order you picked it.
4. Press **Draw** to animate the exact selected route.

The picker rejects disconnected segments and prevents selecting the same segment twice. Use **Undo** to remove the last choice or **Clear** to start over. This is deliberately discrete: crossings and junctions are chosen explicitly instead of inferred from a rough freehand trace.

The current default animation is the 24-segment route captured from the numbered canvas sequence. Reloading restores that route; picking or clearing segments lets you create a different one.

## Route notes

The orange `#route` path in `index.html` is an Euler circuit of the hand-drawn logo graph. The actual triangle contact points are treated as vertices, each of the 24 visible edges is traversed exactly once, and the circle uses SVG arcs rather than straight chords. `app.js` audits the route's undirected edge list and refuses to animate if an edge is accidentally added twice.

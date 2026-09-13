# Le Logo animation

This is a static browser demo of the logo being drawn as one continuous stroke. GSAP reveals one SVG path progressively and moves the pen marker along the same path.

## Run locally

From this directory, start any static HTTP server. With Python:

```sh
python3 -m http.server 4173
```

Then open [http://127.0.0.1:4173/](http://127.0.0.1:4173/) in a browser.

The demo loads GSAP from jsDelivr, so the browser needs network access on first load. No package installation or build step is required.

## Controls

- **Draw** starts or replays the route.
- **Pause** toggles playback.
- **Reset** returns to the construction guides.
- **Speed** changes the playback rate.

## Route notes

The orange `#route` path in `index.html` is an Euler circuit of the logo graph. Triangle contact points are treated as vertices, each visible edge is traversed once, and the circle uses SVG arcs rather than straight chords. This keeps the animation continuous without drawing lines across the logo or introducing extra starting points.

# Path tool

This page is the route editor for Le Logo. It is separate from the animation page so path decisions can be made without changing the motion presentation.

From the repository root, run:

```sh
python3 -m http.server 4173
```

Open [http://127.0.0.1:4173/path-tool/](http://127.0.0.1:4173/path-tool/), activate **Pick path segments**, and click connected segments in order. Use **Undo** or **Clear** to revise the selection.

To close the server, press `Ctrl+C` in its terminal. As a fallback:

```sh
lsof -ti :4173 | xargs -r kill
```

# Building the C++ → WebAssembly effects module

This folder contains `effects.cpp`, which exposes:

- **`computeTeleportPosition(width, height, seed)`** — returns `{ x, y }` for a random visible position inside the card (used for teleporting the "No" button).
- **`triggerParticleBurst(x, y)`** — placeholder for a particle burst at `(x, y)`; the JS glue or this module can drive canvas drawing.

The web page (`index.html` + `script.js`) works **without** building this module; JS fallbacks provide the same behavior. Building adds the option to use C++ for teleport math and/or effects.

---

## Prerequisites

- **Emscripten SDK** (emcc)  
  Install from: https://emscripten.org/docs/getting_started/downloads.html  
  Ensure `emcc` is on your PATH:
  ```bash
  emcc --version
  ```

---

## Build steps

1. **Open a terminal** in this directory (`web/wasm_cpp/`).

2. **Compile to WebAssembly and glue JS** (Emscripten bindings export the C++ functions and `TeleportResult`):
   ```bash
   emcc effects.cpp -o effects.js -std=c++17 -O2 \
     -s MODULARIZE=1 \
     -s EXPORT_NAME="createEffectsModule" \
     -s WASM=1
   ```
   This produces:
   - `effects.js` — Emscripten glue and loader
   - `effects.wasm` — WebAssembly binary

3. **Place outputs in `web/wasm_cpp/`:**
   - `effects.js`
   - `effects.wasm`

4. **Wire the module into the page:**
   - In `web/index.html`, add before `script.js`:
     ```html
     <script src="wasm_cpp/effects.js"></script>
     ```
   - After the script loads, instantiate and expose the module so `script.js` can use it, e.g.:
     ```javascript
     createEffectsModule().then(function(Module) {
       window.EffectsWasm = {
         computeTeleportPosition: function(w, h, seed) {
           return Module.computeTeleportPosition(w, h, seed);
         },
         triggerParticleBurst: function(x, y) {
           Module.triggerParticleBurst(x, y);
         }
       };
     });
     ```
     (Exact API depends on your Emscripten bindings; use `ccall`/`cwrap` if needed.)

---

## Serving the app

WebAssembly often requires correct MIME types and no `file://` restrictions. Serve the `web/` directory over HTTP, e.g.:

```bash
cd web
python -m http.server 8080
```

Then open `http://localhost:8080`.

---

## If build fails

Use the site without building: open `web/index.html` or serve `web/` and rely on the **JavaScript fallback** in `script.js`. Behavior (teleport, growth, particles, celebration) is the same; only the implementation of teleport position and burst is pure JS.

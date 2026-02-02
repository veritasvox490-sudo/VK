# Building the Java → JS (or WASM) effects module

This folder contains `src/ValentineEffects.java`, which exposes:

- **`ValentineEffects.triggerParticleBurst(x, y)`** — trigger a particle burst at `(x, y)` (when implemented in the transpiled code or via a JS callback).
- **`ValentineEffects.computeTeleportPosition(width, height, seed)`** — optional; returns `[x, y]` for the "No" button teleport.

The web page works **without** building this; `script.js` provides the same behavior in pure JS. Building adds the option to use Java-driven effects.

---

## Option A: TeaVM (Java → JavaScript)

1. **Install TeaVM:**  
   https://teavm.org/

2. **Create a small runner** that calls `ValentineEffects` and compile to JS:
   - Add a main class or use TeaVM’s JS export to expose `triggerParticleBurst` and optionally `computeTeleportPosition` to the global scope as `ValentineEffects`.

3. **Output** (e.g. `valentine_effects.js`) should define:
   - `window.ValentineEffects = { triggerParticleBurst: function(x,y){...}, computeTeleportPosition: function(w,h,seed){...} };`

4. **Include in `web/index.html`:**
   ```html
   <script src="java_effects/valentine_effects.js"></script>
   ```
   Place before `script.js`. The main script will use `window.ValentineEffects` if present.

---

## Option B: GWT (Java → JavaScript)

1. **Set up a GWT project** and add `ValentineEffects.java` to the source path.

2. **Expose the class to JS** using GWT’s `JsExport` or a JSNI method that sets `window.ValentineEffects` with methods that delegate to the Java implementation.

3. **Build** the GWT project to produce a JS script; include that script in `index.html` before `script.js`.

---

## If you don’t build

Open `web/index.html` or serve the `web/` directory. The **JavaScript fallback** in `script.js` provides identical behavior (teleport, growth, particle burst, celebration). The Java build is optional for using Java in the pipeline.

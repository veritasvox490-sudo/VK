/**
 * Will You Be My Valentine? — C++ effects for WebAssembly
 *
 * Exposes:
 *   - triggerParticleBurst(x, y)  — for use by JS to trigger a particle burst at (x,y)
 *   - computeTeleportPosition(width, height, seed) — returns a random position inside the box
 *
 * Build with Emscripten (emcc). See build_instructions.md.
 */

#include <cmath>
#include <cstdint>
#include <emscripten/bind.h>

/** Simple deterministic-ish RNG for reproducible teleport from seed */
static uint32_t rng_state = 0;

static uint32_t rng_next() {
  rng_state = rng_state * 1103515245u + 12345u;
  return (rng_state >> 16) & 0x7FFFu;
}

/**
 * Compute a random position inside the rectangle [0, width) x [0, height),
 * with a margin so the "No" button stays visible. Uses seed to set RNG state.
 * Returns x, y as a small struct exposed to JS.
 */
struct TeleportResult {
  double x;
  double y;
};

TeleportResult computeTeleportPosition(double width, double height, double seed) {
  rng_state = static_cast<uint32_t>(std::fmod(seed, 2147483648.0));
  const double margin = 60.0;
  double minX = margin;
  double maxX = width - margin;
  double minY = margin;
  double maxY = height - margin;
  if (maxX <= minX) maxX = minX + 1;
  if (maxY <= minY) maxY = minY + 1;
  double x = minX + (rng_next() / 32768.0) * (maxX - minX);
  double y = minY + (rng_next() / 32768.0) * (maxY - minY);
  return {x, y};
}

/**
 * Trigger a particle burst at (x, y). This C++ module does not draw directly;
 * we export particle data so JS can draw on the canvas, or we call back into JS.
 * For simplicity we expose a function that JS calls; the actual drawing can
 * be done in JS using particle data. Here we just provide a "trigger" that
 * the JS glue can use (e.g. to run a more complex C++-computed burst).
 * Optionally: use EMSCRIPTEN_BINDINGS to export a function that returns
 * particle arrays. For minimal footprint we export a void trigger that JS
 * interprets as "run WASM-side effect"; the JS glue can then call back to
 * draw. See build_instructions.md for how to wire triggerParticleBurst to
 * canvas drawing via JS.
 */
void triggerParticleBurst(double x, double y) {
  (void)x;
  (void)y;
  /* Placeholder: in a full implementation you might compute particle data
   * and pass to JS via a callback (emscripten::val). For one-click build we
   * keep it simple; the JS fallback does the actual burst. When this symbol
   * is present, script.js can call it and then draw itself, or you can
   * extend this with EMSCRIPTEN_BINDINGS to pass particle arrays to JS. */
}

EMSCRIPTEN_BINDINGS(valentine_effects) {
  emscripten::function("computeTeleportPosition", &computeTeleportPosition);
  emscripten::function("triggerParticleBurst", &triggerParticleBurst);
  emscripten::value_object<TeleportResult>("TeleportResult")
    .field("x", &TeleportResult::x)
    .field("y", &TeleportResult::y);
}

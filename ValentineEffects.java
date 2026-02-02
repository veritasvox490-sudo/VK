/**
 * Will You Be My Valentine? — Java effects for JS/WASM
 *
 * Intended to be transpiled to JavaScript (e.g. TeaVM or GWT) so the web page
 * can call ValentineEffects.triggerParticleBurst(x, y) for optional
 * Java-driven particle effects. If this artifact is not built, script.js
 * provides the same behavior in pure JS.
 *
 * See build_instructions.md in this directory for TeaVM/GWT steps.
 */

public class ValentineEffects {

    /**
     * Trigger a particle burst at (x, y). When transpiled to JS, the page
     * can call ValentineEffects.triggerParticleBurst(x, y). Implementation
     * can push particle data to a JS canvas or call back into JS.
     */
    public static void triggerParticleBurst(double x, double y) {
        // Placeholder: in a full TeaVM/GWT build you might compute particle
        // data and invoke a JS callback. For one-click repo we keep it simple;
        // script.js fallback does the actual burst when this is not available.
        // Exposing this method allows the HTML to optionally load the
        // transpiled script and call it for a Java-driven effect.
        if (Math.abs(x) < 1e9 && Math.abs(y) < 1e9) {
            // Minimal side effect so the method is not optimized away
            System.out.println("ValentineEffects.triggerParticleBurst(" + x + ", " + y + ")");
        }
    }

    /**
     * Optional: compute a teleport position (width x height, seed) for the
     * "No" button. When transpiled, JS can call this for consistent behavior.
     */
    public static double[] computeTeleportPosition(double width, double height, long seed) {
        double margin = 60.0;
        double minX = margin;
        double maxX = width - margin;
        double minY = margin;
        double maxY = height - margin;
        if (maxX <= minX) maxX = minX + 1;
        if (maxY <= minY) maxY = minY + 1;
        java.util.Random r = new java.util.Random(seed);
        double x = minX + r.nextDouble() * (maxX - minX);
        double y = minY + r.nextDouble() * (maxY - minY);
        return new double[] { x, y };
    }
}

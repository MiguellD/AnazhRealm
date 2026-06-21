// bake-worker.js — DER BÄCKER-THREAD (V18.315): die THREE-freie Skin-Isosurface off-thread,
// damit der ~4-s-Skin-Bau den Main-Thread nicht mehr einfriert. `importScripts` lädt bake-core.js
// — DIESELBE Mathe wie der Main-Thread (EINE Quelle, kein Mirror). Empfängt {parts, opts}, rechnet
// die Isosurface, schickt die fertigen Arrays zurück (transferierbar = kein Kopier-Overhead).
const __bakeV = (function () {
    try {
        return new URLSearchParams(self.location.search).get("v") || "";
    } catch (_e) {
        return "";
    }
})();
// `?v=` mitziehen → bake-core wird mit derselben Version cache-gebustet wie der Worker.
importScripts((self.__anazhBase || "") + "bake-core.js" + (__bakeV ? "?v=" + __bakeV : ""));

self.onmessage = function (e) {
    const msg = e.data || {};
    if (msg.type !== "bake-skin") return;
    const requestId = msg.requestId;
    let baked = null;
    try {
        baked = self.__bakeSkinGeometry(msg.parts, msg.opts);
    } catch (err) {
        self.postMessage({ type: "bake-skin-result", requestId, error: String((err && err.message) || err) });
        return;
    }
    if (!baked || !baked.positions || !baked.indices) {
        self.postMessage({ type: "bake-skin-result", requestId, empty: true });
        return;
    }
    // Für den Transfer: Float32Array sind schon transferierbar; idx → Uint32Array.
    const positions = baked.positions instanceof Float32Array ? baked.positions : new Float32Array(baked.positions);
    const normals = baked.normals instanceof Float32Array ? baked.normals : new Float32Array(baked.normals);
    const colors = baked.colors
        ? baked.colors instanceof Float32Array
            ? baked.colors
            : new Float32Array(baked.colors)
        : null;
    const indices = baked.indices instanceof Uint32Array ? baked.indices : new Uint32Array(baked.indices);
    const transfer = [positions.buffer, normals.buffer, indices.buffer];
    if (colors) transfer.push(colors.buffer);
    self.postMessage({ type: "bake-skin-result", requestId, positions, normals, colors, indices }, transfer);
};

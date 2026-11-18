// Zahlbereich der Sonnenscheibe unter dem Schlüssel des Entscheids (rg11b10ufloat max 65 024), eigene Rechnung
const tab = [[90,123790],[75,117970],[60,102940],[45,80020],[35,61320],[25,40920],[18,26390],[14,18390],[12,14620],[10,11080],[8,7890]]; // tag-ref.json
const Om = Math.PI * ((0.265 * Math.PI) / 180) ** 2; const out = [];
for (const [h, Eh] of tab) for (const himmel of [0.12, 0.4]) {
  const Edn = (Eh * (1 - himmel)) / Math.sin((h * Math.PI) / 180), L = Edn / Om, LK = (0.18 * Eh) / Math.PI;
  const c = LK >= 634.8 ? 0.25 * Math.log2(LK / 6713) : NaN, k = (0.22 * 2 ** c) / LK, x = L * k;
  out.push(`Sonne ${h}° Himmelsanteil ${himmel}: L_Scheibe ${L.toExponential(2)} cd/m² · k ${k.toExponential(2)} · x ${x.toExponential(2)} ${x > 65024 ? "ÜBER 65 024" : "unter"}`);
}
console.log(out.join("\n")); require("fs").writeFileSync(__dirname + "/wa-sonne.out.txt", out.join("\n") + "\n");

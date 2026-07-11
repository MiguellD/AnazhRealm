"use strict";
// ULTRAGUSS U7 — die drei Prüf-Genome des humanoiden Skelett-Atlas (gate:koerper-atlas).
// Default-Genom + zwei Varianten (Geschlechts-/Build-/Muskel-/Kopf-/Höhen-/Farb-Achsen
// gespreizt) — die EINE Fixture-Quelle für Baseline-Stempel UND Kern-Beweis.
module.exports = [
    ["default", {}],
    [
        "weiblich_schwer",
        { sex: 1, build: 0.82, muscle: 0.58, headRatio: 1.12, kh: 0.21, bodyColor: 0xc9a07a, limbColor: 0xb07a52, bodyMat: "fleisch", limbMat: "fleisch", headMat: "knochen" },
    ],
    [
        "maennlich_schlank_muskel",
        { sex: 0.15, build: 0.28, muscle: 0.94, headRatio: 0.94, kh: 0.235, bodyColor: 0x8a5a38, limbColor: 0x6b4429 },
    ],
];

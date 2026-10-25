// DAS AUGE: ein dauerhaft offenes Spiel-Fenster im Browser-Bereich der App (Schöpfer 09.10.: „fast kontinuierlich ein Fenster
// offen haben und dinge visuell auswerten“). Dieser Wrapper startet den save-server eines Bühnen-Worktrees auf einem FESTEN
// Port, damit er nie auf 4312 (Integrator) fällt. Aufruf: node auge-server.cjs [worktree] [port]
const path = require('path')
const wt = process.argv[2] || 'C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\schau-v18537'
process.env.PORT = process.argv[3] || '7880'
process.chdir(wt)
require(path.join(wt, 'save-server.js'))

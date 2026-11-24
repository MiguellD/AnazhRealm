// DAS AUGE: ein dauerhaft offenes Spiel-Fenster im Browser-Bereich der App (Schöpfer 09.10.: „fast kontinuierlich ein Fenster
// offen haben und dinge visuell auswerten“). Dieser Wrapper startet den save-server eines Bühnen-Worktrees auf einem FESTEN
// Port, damit er nie auf 4312 (Integrator) fällt. Aufruf: node auge-server.cjs [worktree] [port]
// 24.11.: der save-server lauscht nur noch als Hauptprogramm (`require.main === module`, w28-mess-server-kopf) — als Modul geladen
// endete dieser Wrapper still mit Exit 0, das Auge war tot. Darum startet er ihn als Kind-Hauptprogramm und endet mit ihm.
const path = require('path')
const { spawn } = require('child_process')
const wt = process.argv[2] || 'C:\\Users\\micha\\AnazhRealm-profiband'
const port = process.argv[3] || '7880'
const kind = spawn(process.execPath, [path.join(wt, 'save-server.js')], {
    cwd: wt,
    stdio: 'inherit',
    windowsHide: true,
    env: { ...process.env, PORT: port },
})
kind.on('exit', (code) => process.exit(code == null ? 1 : code))
for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => kind.kill())

# blick.ps1 — der Messplatz-Blick mit dem GitHub-Token aus git credential (sonst 60 Abrufe/h und keine Cloud-Zeile)
Set-Location C:\Users\micha\AnazhRealm-profiband
$cred = "protocol=https`nhost=github.com`n`n" | git credential fill
$tok = ($cred | Where-Object { $_ -like 'password=*' }) -replace '^password=', ''
$env:TOKEN = $tok
$env:GH_TOKEN = $tok
node artifacts/profiband/werkzeug/messplatz-blick.cjs --takt 120

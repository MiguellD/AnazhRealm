# OMEN-Runner (Label omen-gpu), Job-Ende-Hook (ACTIONS_RUNNER_HOOK_JOB_COMPLETED in C:\actions-runner\.env).
# 1) Raeumt den Arbeitsordner IMMER (23.10.: lief der Start-Hook nicht oder brach er ab, urteilten die Schritte des naechsten
#    Laufs sonst ueber den alten Baum) - nur unter C:\actions-runner\_work.
# 2) Loest das GPU-Schloss NUR, wenn Zeile 1 von besitzer.txt genau diesen Job nennt, und nur nach erneutem Lesen desselben
#    Besitzers (nie ein fremdes Schloss, auch nicht nach einem abgewiesenen Job). Ein Fehler hier faerbt den Job nicht; die
#    Notiz scheitert nie (wie im Start-Hook).
$schloss = 'C:\Users\micha\AppData\Local\Temp\claude\gpu-schloss'
$log = 'C:\actions-runner\hooks\hook.log'
$werk = 'C:\actions-runner\_work'
$ich = "ci-runner $env:GITHUB_RUN_ID/$env:GITHUB_RUN_ATTEMPT $env:GITHUB_JOB"
function Notiz($t) {
    $z = "{0:yyyy-MM-dd HH:mm:ss} ende  {1}: {2}`r`n" -f (Get-Date), $ich, $t
    for ($i = 0; $i -lt 20; $i++) {
        try { [System.IO.File]::AppendAllText($log, $z, [System.Text.UTF8Encoding]::new($false)); return } catch { Start-Sleep -Milliseconds 250 }
    }
    try { [System.IO.File]::AppendAllText("$log.$env:GITHUB_RUN_ID", $z, [System.Text.UTF8Encoding]::new($false)) } catch { }
}
function Erster { try { return @((Get-Content "$schloss\besitzer.txt" -ErrorAction Stop) | Where-Object { $_ -ne '' })[0] } catch { return '' } }
$geraeumt = ''
try {
    $ws = $env:GITHUB_WORKSPACE
    if ($ws -and (Test-Path $ws) -and ([System.IO.Path]::GetFullPath($ws)).StartsWith($werk, [System.StringComparison]::OrdinalIgnoreCase)) {
        Get-ChildItem $ws -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
        $geraeumt = " - Arbeitsordner geraeumt ($ws)"
    }
} catch { $geraeumt = " - Raeumen scheiterte: $($_.Exception.Message)" }
$wer = Erster
if ($wer -eq $ich -and (Erster) -eq $ich) {
    Remove-Item $schloss -Recurse -Force -ErrorAction SilentlyContinue
    Notiz "Schloss geloest$geraeumt"
    Write-Host "OMEN-Runner: GPU-Schloss geloest."
} else {
    Notiz "Schloss nicht meins ('$wer') - bleibt$geraeumt"
}
exit 0

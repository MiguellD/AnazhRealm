# Radeon-Runner (Labels echt-gpu, radeon-gpu; Laptop Radeon 890M, Vorlage OMEN bericht/2210-runner-hook), Job-Ende-Hook (ACTIONS_RUNNER_HOOK_JOB_COMPLETED in C:\actions-runner\.env).
# Loest das GPU-Schloss NUR, wenn besitzer.txt genau diesen Job nennt (nie ein fremdes Schloss, auch nicht nach einem
# abgewiesenen Job). Ein Fehler hier faerbt den Job nicht; die Notiz scheitert nie (wie im Start-Hook).
$schloss = 'C:\Users\micha\AppData\Local\Temp\claude\gpu-schloss'
$log = 'C:\actions-runner\hooks\hook.log'
$ich = "ci-runner $env:GITHUB_RUN_ID/$env:GITHUB_RUN_ATTEMPT $env:GITHUB_JOB"
function Notiz($t) {
    $z = "{0:yyyy-MM-dd HH:mm:ss} ende  {1}: {2}`r`n" -f (Get-Date), $ich, $t
    for ($i = 0; $i -lt 20; $i++) {
        try { [System.IO.File]::AppendAllText($log, $z, [System.Text.UTF8Encoding]::new($false)); return } catch { Start-Sleep -Milliseconds 250 }
    }
    try { [System.IO.File]::AppendAllText("$log.$env:GITHUB_RUN_ID", $z, [System.Text.UTF8Encoding]::new($false)) } catch { }
}
$wer = ''
try { $wer = (Get-Content "$schloss\besitzer.txt" -Raw -ErrorAction Stop).Trim() } catch { }
if ($wer -eq $ich) {
    Remove-Item $schloss -Recurse -Force
    Notiz 'Schloss geloest'
    Write-Host "Radeon-Runner: GPU-Schloss geloest."
} else {
    Notiz "Schloss nicht meins ('$wer') - bleibt"
}
exit 0

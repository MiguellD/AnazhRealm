# OMEN-Runner (Label omen-gpu), Job-Ende-Hook (ACTIONS_RUNNER_HOOK_JOB_COMPLETED in C:\actions-runner\.env).
# Loest das GPU-Schloss NUR, wenn besitzer.txt genau diesen Job nennt (nie ein fremdes Schloss, auch nicht nach einem
# abgewiesenen Job). Ein Fehler hier faerbt den Job nicht.
$schloss = 'C:\Users\micha\AppData\Local\Temp\claude\gpu-schloss'
$log = 'C:\actions-runner\hooks\hook.log'
$ich = "ci-runner $env:GITHUB_RUN_ID/$env:GITHUB_RUN_ATTEMPT $env:GITHUB_JOB"
function Notiz($t) { Add-Content -Path $log -Value ("{0:yyyy-MM-dd HH:mm:ss} ende  {1}: {2}" -f (Get-Date), $ich, $t) -Encoding utf8 }
$wer = ''
try { $wer = (Get-Content "$schloss\besitzer.txt" -Raw -ErrorAction Stop).Trim() } catch { }
if ($wer -eq $ich) {
    Remove-Item $schloss -Recurse -Force
    Notiz 'Schloss geloest'
    Write-Host "OMEN-Runner: GPU-Schloss geloest."
} else {
    Notiz "Schloss nicht meins ('$wer') - bleibt"
}
exit 0

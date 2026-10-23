# fremd.ps1 <profil-teil> — die FREMDLAST über 10 s: CPU aller Prozesse außer dem eigenen Browser-Baum (Haupt-Prozess mit
# user-data-dir *<profil-teil>* und seine Nachfahren) und dem eigenen Node (echt-k1.cjs), in % aller Kerne; dazu die fremden Browser-Profile
param([string]$profil = "profil-echt-k1")
function Baum {
  $alle = Get-CimInstance Win32_Process
  $eigen = New-Object 'System.Collections.Generic.HashSet[int]'
  foreach ($p in $alle) { if (($p.Name -eq 'chrome.exe' -and $p.CommandLine -match [regex]::Escape($profil)) -or ($p.Name -eq 'node.exe' -and $p.CommandLine -match 'echt-k1\.cjs')) { [void]$eigen.Add([int]$p.ProcessId) } }
  do { $n = $eigen.Count; foreach ($p in $alle) { if ($eigen.Contains([int]$p.ParentProcessId)) { [void]$eigen.Add([int]$p.ProcessId) } } } while ($eigen.Count -ne $n)
  $fremdeProfile = @($alle | Where-Object { $_.Name -eq 'chrome.exe' -and $_.CommandLine -match 'user-data-dir' -and $_.CommandLine -notmatch '--type=' -and -not $eigen.Contains([int]$_.ProcessId) }).Count
  return @{ eigen = $eigen; fremdeProfile = $fremdeProfile }
}
function Summe($eigen) { $s = 0.0; foreach ($p in Get-Process) { if ($p.Id -le 4 -or $eigen.Contains($p.Id)) { continue }; try { $s += $p.TotalProcessorTime.TotalSeconds } catch {} }; return $s }
$b = Baum; $a = Summe $b.eigen; $t0 = Get-Date
Start-Sleep -Seconds 10
$b2 = Baum; $c = Summe $b2.eigen; $dt = ((Get-Date) - $t0).TotalSeconds
$kerne = [Environment]::ProcessorCount
"fremd%=" + [math]::Round(100 * ($c - $a) / ($dt * $kerne), 1) + " eigeneProz=" + $b2.eigen.Count + " fremdeBrowser=" + $b2.fremdeProfile

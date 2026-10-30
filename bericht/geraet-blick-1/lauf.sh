#!/bin/bash
# zug/geraet-blick.sh — Station (30.10., Schöpfer: „keine ungenutzten Prozesse auf OMEN und Radeon“): was auf der OMEN CPU, RAM und GPU
# belegt, als Tafel nach $OUT/blick.txt. NUR LESEN; beendet wird erst in einem zweiten Lauf mit benannten PIDs. Das Repo ist öffentlich:
# fremde Programme nur mit Namen und Last, Befehlszeilen nur für die eigenen Werkzeuge (AnazhRealm, p3, puppeteer, werkbank, save-server).
B="$OUT/blick.txt"; date '+%F %T' > "$B"
powershell -NoProfile -Command '
$os = Get-CimInstance Win32_OperatingSystem
"RAM frei MB: " + [math]::Round($os.FreePhysicalMemory/1024) + " von " + [math]::Round($os.TotalVisibleMemorySize/1024) + " · CPU-Last %: " + (Get-CimInstance Win32_Processor | Measure-Object LoadPercentage -Average).Average
$a = @{}; Get-Process | ForEach-Object { $a[$_.Id] = $_.CPU }; Start-Sleep -Seconds 5
"--- CPU 5 s (Prozent eines Kerns), Top 12"
Get-Process | ForEach-Object { if ($a.ContainsKey($_.Id) -and $_.CPU) { [pscustomobject]@{Name=$_.Name; Id=$_.Id; Pct=[math]::Round(($_.CPU-$a[$_.Id])/5*100); WS_MB=[math]::Round($_.WorkingSet64/1MB)} } } | Sort-Object Pct -Descending | Select-Object -First 12 | Format-Table -AutoSize | Out-String -Width 160
"--- RAM Top 12"
Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 12 Name, Id, @{n="WS_MB";e={[math]::Round($_.WorkingSet64/1MB)}}, @{n="CPUs";e={[math]::Round($_.CPU)}}, @{n="Start";e={ if ($_.StartTime) { $_.StartTime.ToString("dd. HH:mm") } }} | Format-Table -AutoSize | Out-String -Width 160
"--- Helfer (eigene Befehlszeilen; WAISE = Elternprozess fehlt)"
$alle = @{}; Get-CimInstance Win32_Process | ForEach-Object { $alle[[int]$_.ProcessId] = 1 }
Get-CimInstance Win32_Process | Where-Object { $_.Name -match "^(bash|node|chrome|tail|grep|cut|git|llama|ollama|python|sleep|nvidia-smi|powershell)" } | Sort-Object CreationDate | ForEach-Object {
  $c = [string]$_.CommandLine; $eigen = $c -match "AnazhRealm|p3[/\]|puppeteer|werkbank|save-server|messplatz"
  $w = if ($alle.ContainsKey([int]$_.ParentProcessId)) { "" } else { " WAISE" }
  "{0,6} <- {1,6} {2,-16} {3}{4}  {5}" -f $_.ProcessId, $_.ParentProcessId, $_.Name, $_.CreationDate.ToString("dd. HH:mm"), $w, $(if ($eigen) { $c.Substring(0, [math]::Min(170, $c.Length)) } else { "" })
}' >> "$B" 2>&1
echo "--- GPU" >> "$B"; nvidia-smi --query-gpu=name,memory.used,memory.total,utilization.gpu,temperature.gpu,clocks.gr,pstate --format=csv >> "$B" 2>&1
nvidia-smi --query-compute-apps=pid,process_name,used_memory --format=csv >> "$B" 2>&1
cat "$B"

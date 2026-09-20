# Cybercrime Predictive Analytics - Unified Teardown Script
# Stops Vite, Spring Boot, FastAPI, and PostgreSQL cleanly.

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  Cybercrime Predictive Analytics - Stopping Full Stack" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

function Stop-PortProcess {
    param(
        [int]$Port,
        [string]$ServiceName
    )
    Write-Host "Checking $ServiceName on port $Port..." -NoNewline
    try {
        $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        if ($conns) {
            foreach ($c in $conns) {
                $pidToKill = $c.OwningProcess
                if ($pidToKill -and $pidToKill -ne 0) {
                    try {
                        Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
                        Write-Host " [STOPPED PID $pidToKill]" -ForegroundColor Yellow
                    } catch {
                        Write-Host " [Could not stop PID $pidToKill]" -ForegroundColor Red
                    }
                }
            }
        } else {
            Write-Host " [NOT RUNNING]" -ForegroundColor Green
        }
    } catch {
        Write-Host " [SKIPPED]" -ForegroundColor Gray
    }
}

# 1. Stop Vite Frontend (:3000)
Stop-PortProcess -Port 3000 -ServiceName "Vite React Frontend"

# 2. Stop Spring Boot Backend (:8080)
Stop-PortProcess -Port 8080 -ServiceName "Spring Boot Backend"

# 3. Stop FastAPI ML Service (:8000)
Stop-PortProcess -Port 8000 -ServiceName "FastAPI ML Service"

# 4. Stop PostgreSQL (:5432)
$pgBin = "C:\Users\sangh\.pgsql16\pgsql\bin\pg_ctl.exe"
$pgData = "C:\Users\sangh\.pgsql16\data"
if (Test-Path $pgBin) {
    Write-Host "Stopping PostgreSQL via pg_ctl..." -NoNewline
    & $pgBin -D $pgData stop -m fast 2>$null | Out-Null
    Start-Sleep -Seconds 1
    Stop-PortProcess -Port 5432 -ServiceName "PostgreSQL"
} else {
    Stop-PortProcess -Port 5432 -ServiceName "PostgreSQL"
}

Write-Host "`nAll application services have been stopped.`n" -ForegroundColor Green

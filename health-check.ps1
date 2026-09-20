# Cybercrime Predictive Analytics - System Health Check Utility
# Probes all 4 services: PostgreSQL/PostGIS, FastAPI ML, Spring Boot, and Vite Frontend

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  Cybercrime Predictive Analytics - System Health Check" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

$allHealthy = $true
$results = @()

# 1. PostgreSQL & PostGIS Check (Port 5432)
Write-Host "`n[1/4] Checking PostgreSQL 16 + PostGIS on port 5432..." -NoNewline
try {
    $pgTcp = Test-NetConnection -ComputerName "127.0.0.1" -Port 5432 -WarningAction SilentlyContinue
    if ($pgTcp.TcpTestSucceeded) {
        $env:PGPASSWORD = "Vidya1@@"
        $psqlPath = "C:\Users\sangh\.pgsql16\pgsql\bin\psql.exe"
        if (Test-Path $psqlPath) {
            $postgisVer = & $psqlPath -h 127.0.0.1 -p 5432 -U postgres -d cybercrime_db -t -A -c "SELECT PostGIS_Version();" 2>$null
            if ($postgisVer -match "3\.") {
                Write-Host " [PASS]" -ForegroundColor Green
                $results += [PSCustomObject]@{ Service = "PostgreSQL/PostGIS"; Port = 5432; Status = "HEALTHY"; Details = "PostGIS $postgisVer" }
            } else {
                Write-Host " [PASS - DB Connected, PostGIS check warning]" -ForegroundColor Yellow
                $results += [PSCustomObject]@{ Service = "PostgreSQL/PostGIS"; Port = 5432; Status = "WARNING"; Details = "Connected, PostGIS query returned: $postgisVer" }
            }
        } else {
            Write-Host " [PASS - TCP open]" -ForegroundColor Green
            $results += [PSCustomObject]@{ Service = "PostgreSQL/PostGIS"; Port = 5432; Status = "HEALTHY"; Details = "TCP Port 5432 Active" }
        }
    } else {
        Write-Host " [FAIL]" -ForegroundColor Red
        $allHealthy = $false
        $results += [PSCustomObject]@{ Service = "PostgreSQL/PostGIS"; Port = 5432; Status = "DOWN"; Details = "Connection refused on port 5432" }
    }
} catch {
    Write-Host " [FAIL]" -ForegroundColor Red
    $allHealthy = $false
    $results += [PSCustomObject]@{ Service = "PostgreSQL/PostGIS"; Port = 5432; Status = "ERROR"; Details = $_.Exception.Message }
}

# 2. FastAPI ML Service Check (Port 8000)
Write-Host "[2/4] Checking FastAPI ML Service on port 8000..." -NoNewline
try {
    $mlHealth = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -TimeoutSec 3 -ErrorAction Stop
    if ($mlHealth.status -eq "healthy" -and $mlHealth.modelVersion -eq "xgb-v1") {
        Write-Host " [PASS]" -ForegroundColor Green
        $results += [PSCustomObject]@{ Service = "FastAPI ML (xgb-v1)"; Port = 8000; Status = "HEALTHY"; Details = "Model: $($mlHealth.modelVersion), Loaded: $($mlHealth.modelLoaded)" }
    } else {
        Write-Host " [WARNING]" -ForegroundColor Yellow
        $results += [PSCustomObject]@{ Service = "FastAPI ML (xgb-v1)"; Port = 8000; Status = "WARNING"; Details = "Status: $($mlHealth.status)" }
    }
} catch {
    Write-Host " [FAIL]" -ForegroundColor Red
    $allHealthy = $false
    $results += [PSCustomObject]@{ Service = "FastAPI ML (xgb-v1)"; Port = 8000; Status = "DOWN"; Details = "Endpoint http://127.0.0.1:8000/health unreachable" }
}

# 3. Spring Boot Backend Check (Port 8080)
Write-Host "[3/4] Checking Spring Boot Backend on port 8080..." -NoNewline
try {
    $atms = Invoke-RestMethod -Uri "http://localhost:8080/api/atms" -TimeoutSec 5 -ErrorAction Stop
    if ($atms -and $atms.Count -gt 0) {
        Write-Host " [PASS]" -ForegroundColor Green
        $results += [PSCustomObject]@{ Service = "Spring Boot Backend"; Port = 8080; Status = "HEALTHY"; Details = "$($atms.Count) ATMs loaded from DB" }
    } else {
        Write-Host " [PASS - Running]" -ForegroundColor Green
        $results += [PSCustomObject]@{ Service = "Spring Boot Backend"; Port = 8080; Status = "HEALTHY"; Details = "HTTP 200 OK from /api/atms" }
    }
} catch {
    Write-Host " [FAIL]" -ForegroundColor Red
    $allHealthy = $false
    $results += [PSCustomObject]@{ Service = "Spring Boot Backend"; Port = 8080; Status = "DOWN"; Details = "Endpoint http://localhost:8080/api/atms unreachable" }
}

# 4. Vite React Frontend Check (Port 3000)
Write-Host "[4/4] Checking Vite React Frontend on port 3000..." -NoNewline
try {
    $fe = Invoke-WebRequest -Uri "http://127.0.0.1:3000/" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    if ($fe.StatusCode -eq 200) {
        Write-Host " [PASS]" -ForegroundColor Green
        $results += [PSCustomObject]@{ Service = "Vite React Frontend"; Port = 3000; Status = "HEALTHY"; Details = "Serving HTTP 200 OK" }
    } else {
        Write-Host " [WARNING]" -ForegroundColor Yellow
        $results += [PSCustomObject]@{ Service = "Vite React Frontend"; Port = 3000; Status = "WARNING"; Details = "HTTP status $($fe.StatusCode)" }
    }
} catch {
    Write-Host " [FAIL]" -ForegroundColor Red
    $allHealthy = $false
    $results += [PSCustomObject]@{ Service = "Vite React Frontend"; Port = 3000; Status = "DOWN"; Details = "Endpoint http://127.0.0.1:3000/ unreachable" }
}

# Display Summary Table
Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "  Service Status Summary" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
$results | Format-Table -AutoSize

if ($allHealthy) {
    Write-Host ">>> ALL SERVICES ARE HEALTHY & DEMO-READY! <<<`n" -ForegroundColor Green
    exit 0
} else {
    Write-Host ">>> ONE OR MORE SERVICES FAILED HEALTH CHECK. Run .\start-all.ps1 to resolve. <<<`n" -ForegroundColor Red
    exit 1
}

# Cybercrime Predictive Analytics - Unified Startup Script
# Idempotent: Checks if services are already running before starting new instances.

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  Cybercrime Predictive Analytics - Starting Full Stack" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

$WorkspaceRoot = $PSScriptRoot
if (-not $WorkspaceRoot) { $WorkspaceRoot = Get-Location }

# 1. PostgreSQL 16 + PostGIS (Port 5432)
Write-Host "`n[1/4] Checking PostgreSQL on port 5432..." -ForegroundColor Yellow
$pgRunning = $false
try {
    $pgTcp = Test-NetConnection -ComputerName "127.0.0.1" -Port 5432 -WarningAction SilentlyContinue
    if ($pgTcp.TcpTestSucceeded) {
        $pgRunning = $true
        Write-Host "       PostgreSQL is already active and listening on port 5432." -ForegroundColor Green
    }
} catch {}

if (-not $pgRunning) {
    Write-Host "       Starting PostgreSQL 16 + PostGIS daemon..." -ForegroundColor Cyan
    $pgBin = "C:\Users\sangh\.pgsql16\pgsql\bin\postgres.exe"
    $pgData = "C:\Users\sangh\.pgsql16\data"
    if (Test-Path $pgBin) {
        Start-Process -FilePath $pgBin -ArgumentList "-D `"$pgData`"" -WindowStyle Hidden
        $attempts = 0
        while ($attempts -lt 15) {
            Start-Sleep -Seconds 1
            $check = Test-NetConnection -ComputerName "127.0.0.1" -Port 5432 -WarningAction SilentlyContinue
            if ($check.TcpTestSucceeded) {
                Write-Host "       PostgreSQL started successfully on port 5432." -ForegroundColor Green
                $pgRunning = $true
                break
            }
            $attempts++
        }
        if (-not $pgRunning) {
            Write-Host "       Warning: PostgreSQL did not become ready within 15 seconds." -ForegroundColor Red
        }
    } else {
        Write-Host "       Error: PostgreSQL binary not found at $pgBin." -ForegroundColor Red
    }
}

# 2. FastAPI ML Service (Port 8000)
Write-Host "`n[2/4] Checking FastAPI ML Service on port 8000..." -ForegroundColor Yellow
$fastApiRunning = $false
try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -TimeoutSec 2 -ErrorAction Stop
    if ($health.status -eq "healthy") {
        $fastApiRunning = $true
        Write-Host "       FastAPI service is already active (Model: $($health.modelVersion))." -ForegroundColor Green
    }
} catch {}

if (-not $fastApiRunning) {
    Write-Host "       Starting Python FastAPI ML service with xgb-v1..." -ForegroundColor Cyan
    $pyExe = Join-Path $WorkspaceRoot "ml-service\.venv\Scripts\python.exe"
    if (-not (Test-Path $pyExe)) {
        $pyExe = "python.exe"
    }
    $mlDir = Join-Path $WorkspaceRoot "ml-service"
    Start-Process -FilePath $pyExe -ArgumentList "-m uvicorn main:app --host 127.0.0.1 --port 8000" -WorkingDirectory $mlDir -WindowStyle Hidden
    
    $attempts = 0
    while ($attempts -lt 15) {
        Start-Sleep -Seconds 1
        try {
            $h = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -TimeoutSec 1 -ErrorAction Stop
            if ($h.status -eq "healthy") {
                Write-Host "       FastAPI service started successfully (Model: $($h.modelVersion))." -ForegroundColor Green
                $fastApiRunning = $true
                break
            }
        } catch {}
        $attempts++
    }
    if (-not $fastApiRunning) {
        Write-Host "       Warning: FastAPI did not become ready within 15 seconds." -ForegroundColor Red
    }
}

# 3. Spring Boot Backend (Port 8080)
Write-Host "`n[3/4] Checking Spring Boot Backend on port 8080..." -ForegroundColor Yellow
$springRunning = $false
try {
    $sbAtms = Invoke-RestMethod -Uri "http://localhost:8080/api/atms" -TimeoutSec 3 -ErrorAction Stop
    $springRunning = $true
    Write-Host "       Spring Boot backend is already active on port 8080." -ForegroundColor Green
} catch {}

if (-not $springRunning) {
    Write-Host "       Starting Spring Boot backend (Flyway, PostGIS, STOMP)..." -ForegroundColor Cyan
    $jdkPath = "C:\Users\sangh\.jdks\jdk-17.0.12+7"
    if (Test-Path $jdkPath) {
        $env:JAVA_HOME = $jdkPath
        $env:Path = "$jdkPath\bin;$env:Path"
    }
    
    $mvnCmd = Join-Path $WorkspaceRoot "mvnw.cmd"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c `"$mvnCmd`" spring-boot:run" -WorkingDirectory $WorkspaceRoot -WindowStyle Hidden
    
    Write-Host "       Waiting for Spring Boot to initialize database and start Tomcat (may take ~15-20s)..." -ForegroundColor Cyan
    $attempts = 0
    while ($attempts -lt 35) {
        Start-Sleep -Seconds 2
        try {
            $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/atms" -TimeoutSec 2 -ErrorAction Stop
            Write-Host "       Spring Boot backend is up and running on http://localhost:8080." -ForegroundColor Green
            $springRunning = $true
            break
        } catch {}
        $attempts++
    }
    if (-not $springRunning) {
        Write-Host "       Warning: Spring Boot has not answered on port 8080 yet. It may still be booting." -ForegroundColor Yellow
    }
}

# 4. Vite React Frontend (Port 3000)
Write-Host "`n[4/4] Checking Vite React Frontend on port 3000..." -ForegroundColor Yellow
$viteRunning = $false
try {
    $fe = Invoke-WebRequest -Uri "http://127.0.0.1:3000/" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    if ($fe.StatusCode -eq 200) {
        $viteRunning = $true
        Write-Host "       Vite Frontend is already active and serving on http://localhost:3000." -ForegroundColor Green
    }
} catch {}

if (-not $viteRunning) {
    Write-Host "       Starting Vite React frontend server..." -ForegroundColor Cyan
    $feDir = Join-Path $WorkspaceRoot "frontend"
    Start-Process -FilePath "npm.cmd" -ArgumentList "run dev -- --host 127.0.0.1 --port 3000" -WorkingDirectory $feDir -WindowStyle Hidden
    
    $attempts = 0
    while ($attempts -lt 15) {
        Start-Sleep -Seconds 1
        try {
            $feCheck = Invoke-WebRequest -Uri "http://127.0.0.1:3000/" -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop
            if ($feCheck.StatusCode -eq 200) {
                Write-Host "       Vite Frontend started successfully on http://localhost:3000." -ForegroundColor Green
                $viteRunning = $true
                break
            }
        } catch {}
        $attempts++
    }
    if (-not $viteRunning) {
        Write-Host "       Warning: Vite frontend did not answer within 15 seconds." -ForegroundColor Red
    }
}

# Run final health check
Write-Host "`n"
& (Join-Path $WorkspaceRoot "health-check.ps1")

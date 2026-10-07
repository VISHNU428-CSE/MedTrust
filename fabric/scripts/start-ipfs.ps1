# MedTrust - Start Local Real IPFS Node (Kubo)
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Starting MedTrust Real Local IPFS Node (Kubo)..." -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

docker compose -f ipfs/docker-compose.ipfs.yaml up -d

Write-Host ""
Write-Host "Verifying IPFS API responsiveness on port 5001..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    $res = Invoke-RestMethod -Uri "http://127.0.0.1:5001/api/v0/id" -Method Post -TimeoutSec 5
    Write-Host "✓ IPFS Node Online! Peer ID: " -NoNewline -ForegroundColor Green
    Write-Host $res.ID -ForegroundColor White
    Write-Host "  API Endpoint:     http://127.0.0.1:5001" -ForegroundColor Gray
    Write-Host "  Gateway Endpoint: http://127.0.0.1:8080/ipfs/" -ForegroundColor Gray
} catch {
    Write-Host "IPFS container started. Checking container status..." -ForegroundColor Yellow
    docker ps --filter "name=medtrust_ipfs_node"
}

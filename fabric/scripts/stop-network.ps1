# MedTrust - Stop Fabric Network & IPFS
Write-Host "Stopping and cleaning MedTrust Fabric & IPFS containers..." -ForegroundColor Yellow
docker compose -f docker-compose.yaml down -v --remove-orphans
Write-Host "✓ Containers stopped and volumes cleaned." -ForegroundColor Green

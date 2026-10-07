# MedTrust - Start Local Hyperledger Fabric Network & IPFS
param (
    [string]$Channel = "medtrustchannel",
    [string]$Chaincode = "medtrust_cc"
)

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "MedTrust Consortium – Hyperledger Fabric + IPFS" -ForegroundColor Cyan
Write-Host "Channel: $Channel | Chaincode: $Chaincode" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Ensure certificates exist
if (-not (Test-Path "fabric/network/crypto-config/peerOrganizations")) {
    Write-Host "Generating crypto credentials..." -ForegroundColor Yellow
    node fabric/scripts/generate-dev-certs.cjs
}

# 2. Launch Docker Containers
Write-Host "Bringing up Fabric orderer, peer, couchdb, cli, and IPFS node..." -ForegroundColor Yellow
docker compose -f docker-compose.yaml up -d

Write-Host ""
Write-Host "Containers starting. Waiting for network convergence..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 3. Check container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host ""
Write-Host "✓ MedTrust Fabric & IPFS infrastructure launched!" -ForegroundColor Green
Write-Host "Run 'npm run dev' to start the MedTrust backend & frontend application." -ForegroundColor Cyan

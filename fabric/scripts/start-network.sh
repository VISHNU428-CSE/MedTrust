#!/bin/bash
set -e

echo "=================================================="
echo "MedTrust Consortium – Hyperledger Fabric + IPFS"
echo "=================================================="

# 1. Generate dev certs if needed
if [ ! -d "fabric/network/crypto-config/peerOrganizations" ]; then
    echo "Generating certificates..."
    node fabric/scripts/generate-dev-certs.cjs
fi

# 2. Launch Docker Containers
echo "Bringing up containers..."
docker compose -f docker-compose.yaml up -d

echo "Waiting for services to initialize..."
sleep 5

docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo "✓ Infrastructure online!"

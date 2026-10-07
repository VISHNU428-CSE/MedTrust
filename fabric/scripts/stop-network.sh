#!/bin/bash
echo "Stopping MedTrust containers..."
docker compose -f docker-compose.yaml down -v --remove-orphans
echo "✓ Containers stopped."

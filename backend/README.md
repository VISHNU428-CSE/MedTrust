# MedTrust FastAPI Gateway Backend

The FastAPI Gateway is a Zero-Trust mediator connecting client applications to the Hyperledger Fabric consortium blockchain and decentralized IPFS cluster.

## Architecture Highlights
- **Framework**: FastAPI (Python 3.11+) with asynchronous ASGI request processing.
- **Strict Server-Side Consent Enforcement**: Every record access request executes a smart contract query against Hyperledger Fabric ledger state before releasing data.
- **Dual-Layer Architecture**: Heavy clinical files are AES-256-GCM encrypted and stored off-chain in IPFS; only cryptographic hashes (SHA-256) and CIDs are anchored on-chain.
- **Audit Logging**: All access requests (both granted and denied) are immutably logged to the Fabric blockchain.

## Quick Start (Local Setup)

### 1. Create Virtual Environment
```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive Swagger documentation will be available at:
`http://localhost:8000/docs`

## Docker Setup
```bash
docker build -t medtrust-fastapi .
docker run -p 8000:8000 medtrust-fastapi
```

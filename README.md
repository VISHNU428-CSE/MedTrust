# MedTrust: Blockchain-Based Secure Electronic Health Record (EHR) Sharing and Consent Management System

[![Hyperledger Fabric](https://img.shields.io/badge/Blockchain-Hyperledger%20Fabric%20v2.5-blue.svg)](https://www.hyperledger.org/use/fabric)
[![IPFS](https://img.shields.io/badge/Storage-IPFS%20Kubo-cyan.svg)](https://ipfs.tech/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61dafb.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-yellow.svg)](LICENSE)

---

## 1. Project Overview

**MedTrust** is an enterprise-grade, decentralized Electronic Health Record (EHR) management and patient-sovereign consent enforcement platform. It addresses the fundamental vulnerability of centralized healthcare databases: single points of failure, unauthorized provider snooping, opaque data monetization, and lack of patient control.

In MedTrust:
- **Patients** retain absolute sovereignty over their health data. They grant, constrain, and instantly revoke cryptographic access policies on a permissioned consortium blockchain.
- **Healthcare Providers (Doctors & Hospitals)** must present cryptographically verifiable consent anchored to the blockchain before any off-chain medical file can be decrypted or retrieved.
- **Auditors & Regulators** benefit from an immutable, append-only audit trail recording every access request, approval, retrieval, and unauthorized access attempt.

---

## 2. System Architecture

MedTrust uses a dual-layer architecture separating **on-chain metadata and consent logic** from **off-chain high-capacity medical data storage**.

```
+-----------------------------------------------------------------------------------+
|                              MEDTRUST ARCHITECTURE                                |
+-----------------------------------------------------------------------------------+

     [ Patient / Doctor ]
             |
             v
   +-------------------+
   |   React 19 UI     | (Sovereign Patient Portal, Clinical Console, Fabric Ledger)
   +-------------------+
             |  HTTPS / REST APIs
             v
   +----------------------------------------------------+
   |            Node.js / Express API Gateway           |
   |   - Identity Verification (PBKDF2 Sessions)        |
   |   - AES-256-GCM Cryptographic Envelope Engine     |
   |   - Strict Server-Side Fabric Consent Guard        |
   +----------------------------------------------------+
           /                                    \
 (Off-Chain Medical Files)              (On-Chain Metadata & Consent)
         /                                        \
        v                                          v
+-----------------------+              +------------------------------------------+
|  Real Local IPFS      |              |   Hyperledger Fabric Consortium          |
|  (Kubo Node via       |              |   Channel: medtrustchannel               |
|   Docker)             |              |   Contract: medtrust_cc                  |
|  - Content-Addressed  |              +------------------------------------------+
|    Storage (CID)      |              | - Raft Orderer (orderer.medtrust.health) |
|  - Raw Byte Fidelity  |              | - Endorsing Peer (peer0.hospitalorg1)    |
|    (No Compression)   |              | - CouchDB State Database                 |
|  - Zero On-Chain      |              | - Immutable Audit Event Ledger           |
|    Storage Overhead   |              | - Authoritative Consent State Store      |
+-----------------------+              +------------------------------------------+
        |                                                  ^
        |                                                  |
        +---- Returns CID (Qm...) to Gateway --------------+
              Gateway notarizes { CID, fileHash, metadata } on Fabric
```

### Why Dual-Layer Architecture?
1. **Blockchain Scalability**: Medical files (multi-megabyte DICOM MRI scans, high-resolution X-rays, multi-page PDFs) cause catastrophic ledger bloat if stored directly in blockchain blocks. Storing files off-chain in IPFS and only anchoring the 32-byte cryptographic hash and 46-character CID on Hyperledger Fabric guarantees millisecond transaction throughput and minimal ledger footprint.
2. **Right to Privacy & Compliance**: Encrypted content addressing in IPFS ensures zero-knowledge storage, while Fabric maintains strict role-based authorization rules.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Blockchain** | Hyperledger Fabric v2.5.9 (Raft Consensus, Channel: `medtrustchannel`) |
| **Smart Contracts** | Fabric TypeScript Contract API (`fabric/chaincode`) & Go Chaincode (`chaincode/smartcontract.go`) |
| **Gateway Client** | `@hyperledger/fabric-gateway`, `@grpc/grpc-js`, Python Fabric SDK |
| **Decentralized Storage** | IPFS Kubo v0.26.0 (Docker container, RPC port 5001, Gateway port 8080) |
| **Backend Gateways** | **FastAPI** (Python 3.11+, ASGI, Uvicorn in `backend/`) & **Node.js/Express** (`server.ts`) |
| **Cryptography** | AES-256-GCM symmetric encryption, SHA-256 integrity digests, PBKDF2 |
| **Frontend UI** | React 19, TypeScript, TailwindCSS v4, Vite 6, Lucide Icons |
| **Clinical Decision AI** | Google Gemini 3.8 Flash (plain-language patient explanations) |

---

## 4. Prerequisites

1. **Node.js**: v18.x or v20.x or higher (Tested on Node v24)
2. **Docker Desktop**:
   - For Windows: Docker Desktop with WSL 2 backend (or Hyper-V backend) enabled.
3. **Git**: Standard Git Bash or PowerShell 5.1 / PowerShell 7+.

---

## 5. Windows Setup Guide (PowerShell / VS Code)

MedTrust is natively developed to run seamlessly on Windows using PowerShell.

### Step 1: Clone and Install Node Dependencies
```powershell
cd "c:\Users\vempa\OneDrive\Desktop\new ibm"
npm install
```

### Step 2: Generate Developer MSP Certificates
Generates standard consortium X.509 certificates and keys for `HospitalOrg1MSP` and `OrdererMSP`:
```powershell
node fabric/scripts/generate-dev-certs.cjs
```

---

## 6. Docker Setup

The system includes reproducible Docker configurations for both IPFS and Hyperledger Fabric:

- `docker-compose.yaml`: Runs Orderer, Peer, CouchDB, CLI, and IPFS Kubo node together.
- `ipfs/docker-compose.ipfs.yaml`: Dedicated standalone IPFS Kubo service.
- `fabric/network/docker-compose.yaml`: Dedicated standalone Fabric network.

To start all containers:
```powershell
docker compose up -d
```

To verify running containers:
```powershell
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

---

## 7. Hyperledger Fabric Network Details

- **Channel Name**: `medtrustchannel`
- **Chaincode ID**: `medtrust_cc`
- **Consortium MSP**: `HospitalOrg1MSP` (Hospital Consortium) and `OrdererMSP` (Ordering Service)
- **Consensus**: Raft (Crash Fault Tolerant, etcdraft)
- **State Database**: CouchDB (`couchdb0:5984`)

### Supported Smart Contract Methods:
1. `CreateRecord(ctx, recordJson)`: Notarizes EHR metadata, file hash, and IPFS CID.
2. `GetRecord(ctx, recordId)`: Queries medical metadata by record ID.
3. `GetPatientRecords(ctx, patientId)`: Returns all records owned by a patient.
4. `RequestAccess(ctx, requestJson)`: Doctor submits an access request.
5. `GrantConsent(ctx, consentJson)`: Patient issues a signed dynamic consent policy.
6. `RejectConsent(ctx, requestId, reason)`: Patient formally declines a request.
7. `RevokeConsent(ctx, consentId, patientId, reason)`: Immediately revokes consent on-chain.
8. `VerifyConsent(ctx, doctorId, patientId, recordId)`: Evaluates if valid, active, non-expired consent exists for the doctor and record scope.
9. `RecordAuditEvent(ctx, eventJson)`: Writes an immutable audit log entry.
10. `GetAuditTrail(ctx, patientId, actorId)`: Queries tamper-evident access history.

---

## 8. Real IPFS (Kubo) Node Setup

MedTrust interacts with IPFS via the official Kubo RPC API (`/api/v0/add`, `/api/v0/cat`, `/api/v0/object/stat`).

### Direct IPFS Commands:
- **API Endpoint**: `http://127.0.0.1:5001`
- **Gateway Endpoint**: `http://127.0.0.1:8080/ipfs/<CID>`

To start IPFS independently:
```powershell
powershell -ExecutionPolicy Bypass -File fabric/scripts/start-ipfs.ps1
```

---

## 9. Backend Setup & Startup

### Option A: Node.js / Express Gateway
To build and launch the MedTrust Core Gateway with React UI:
```powershell
npm run build
npm start
```
Or for development with hot module reloading:
```powershell
npm run dev
```

### Option B: FastAPI Zero-Trust Consent Gateway (Python 3.11+)
Located in `./backend`:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation: `http://localhost:8000/docs`


The server will listen at `http://localhost:3000`.

---

## 10. Environment Variables

Create `.env` based on `.env.example`:

```ini
# Hyperledger Fabric Gateway
FABRIC_CHANNEL=medtrustchannel
FABRIC_CHAINCODE=medtrust_cc
FABRIC_MSP_ID=HospitalOrg1MSP
FABRIC_PEER_ENDPOINT=localhost:7051
FABRIC_CERT_PATH=fabric/network/crypto-config/peerOrganizations/hospitalorg1.medtrust.health/users/Admin@hospitalorg1.medtrust.health/msp/signcerts/cert.pem
FABRIC_KEY_PATH=fabric/network/crypto-config/peerOrganizations/hospitalorg1.medtrust.health/users/Admin@hospitalorg1.medtrust.health/msp/keystore/priv_sk

# Real IPFS Node (Kubo)
IPFS_API_URL=http://127.0.0.1:5001
IPFS_GATEWAY_URL=http://127.0.0.1:8080

# Cryptography
ENCRYPTION_KEY=c3918a24fb01928374a56b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e
ENCRYPTION_ALGORITHM=aes-256-gcm

# Optional Gemini AI API Key
GEMINI_API_KEY=""

PORT=3000
NODE_ENV=development
```

---

## 11. End-to-End Workflows

### A. Patient Upload Workflow
1. Patient logs into the Sovereign Patient Portal.
2. Selects "Upload Record" and chooses a PDF, JPG, PNG, or X-ray scan.
3. Node/Express backend receives the raw file buffer without downsampling or lossy compression.
4. File is uploaded to the real local IPFS node, which returns a real content-addressed CID (`Qm...`).
5. SHA-256 file hash and AES-256-GCM encryption key digest are calculated.
6. Record metadata `{ recordId, patientId, title, ipfsCid, fileHash, ... }` is committed to Fabric.
7. A `RECORD_UPLOADED` audit event is immutably committed on the ledger.
8. The record appears immediately on the patient's dashboard.

### B. Doctor Request & Consent Grant Workflow
1. Doctor logs into the Clinical Console, searches for a patient, and clicks "Request Access".
2. Doctor specifies purpose (e.g. "Cardiovascular Consultation") and scope (`ALL_RECORDS`, `SPECIFIC_RECORDS`, or `DIAGNOSTIC_ONLY`).
3. An `ACCESS_REQUESTED` transaction is recorded on Fabric.
4. Patient sees the incoming request in their "Consent Manager" and reviews the request with optional AI Privacy Advisory.
5. Patient clicks "Approve".
6. A `GrantConsent` transaction is committed to Fabric, generating an active consent policy with validity expiration.

### C. Strict Doctor Retrieval & Enforcement Workflow
1. Doctor clicks "Access Record" to view the patient's medical file.
2. **Server-Side Enforcement**: The backend calls Fabric's `VerifyConsent(doctorId, patientId, recordId)`.
3. If active consent exists:
   - An `AUTHORIZED_ACCESS` audit event is recorded on Fabric.
   - The backend retrieves the authentic file from IPFS using the CID.
   - The medical record and file payload are delivered to the doctor.
4. If consent is missing, revoked, expired, or out of scope:
   - Access is **immediately denied with HTTP 403 Forbidden**.
   - No medical file is fetched or returned.
   - A `DENIED_UNAUTHORIZED` security alert is permanently logged on the Fabric ledger.

### D. Revocation Workflow
1. Patient navigates to "Consent Manager" and clicks "Revoke Consent".
2. A `RevokeConsent` transaction is executed on Fabric, flipping status to `REVOKED`.
3. If the doctor subsequently attempts to fetch the record, `VerifyConsent` evaluates to false, returning HTTP 403.

---

## 12. Automated Testing Suite

The repository includes a comprehensive 8-step end-to-end integration test suite verifying the real Fabric and IPFS integration:

```powershell
npm test
```

### Tests Covered:
- **TEST 1**: Patient uploads PDF -> IPFS receives file, CID returned, Fabric record created.
- **TEST 2**: Patient uploads X-ray JPG/PNG -> Original bytes preserved, IPFS CID created, Fabric metadata contains CID.
- **TEST 3**: Doctor requests access -> Fabric access request created.
- **TEST 4**: Patient approves -> Fabric consent status = ACTIVE / GRANTED.
- **TEST 5**: Doctor accesses record -> Backend verifies Fabric consent, IPFS file is returned.
- **TEST 6**: Patient revokes access -> Fabric consent = REVOKED.
- **TEST 7**: Doctor tries again -> HTTP 403, no medical file returned, `DENIED_UNAUTHORIZED` audit event created.
- **TEST 8**: Doctor tries without consent -> HTTP 403, audit event created.

---

## 13. System Status Commands

- **Check Fabric & IPFS containers**:
  ```powershell
  docker ps --filter "name=medtrust"
  ```
- **Check IPFS Node API responsiveness**:
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:5001/api/v0/id" -Method Post
  ```
- **Check Backend Gateway Health & Blockchain Status**:
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/api/health"
  ```
- **Stop and reset all infrastructure**:
  ```powershell
  docker compose down -v
  ```

---

## 14. Viva & Examination Q&A

### Q1: Why Hyperledger Fabric instead of Ethereum or Bitcoin?
**Answer**:
1. **Permissioned Consortium Model**: Healthcare requires HIPAA/GDPR regulatory compliance where participating institutions (hospitals, diagnostic labs, clinics) have verified identities (X.509 PKI certificates), unlike anonymous public blockchains.
2. **No Gas Fees**: Fabric does not require volatile cryptocurrency mining fees to execute transactions or grant consent.
3. **High Throughput & Fast Finality**: Fabric uses Raft consensus with immediate deterministic finality (no probabilistic forks like PoW/PoS).
4. **Data Isolation (Channels)**: Enables private data channels between specific consortium members.

### Q2: Why IPFS? Why not store medical files directly on the blockchain?
**Answer**:
Blockchains are distributed state machines replicated across every node in the network. Storing a 20MB MRI scan directly inside blockchain blocks would lead to rapid ledger bloat, slow block propagation, and network crashes. IPFS provides decentralized, content-addressable storage where the file's address is its cryptographic hash (CID). The blockchain only needs to store the compact 46-character CID.

### Q3: What happens when an X-ray or medical image is uploaded? Does IPFS reduce image quality?
**Answer**:
**IPFS does NOT compress or reduce image quality.** IPFS is a content-addressable storage protocol, not an image processing tool. It chunks files using UnixFS and stores the exact binary stream byte-for-byte. If an X-ray is uploaded as a 10MB uncompressed file, it is retrieved as the exact same 10MB file with identical SHA-256 integrity checksums. Note: For clinical diagnostic workflows, original digital imaging such as DICOM is preferred over JPEG.

### Q4: What happens if the uploaded X-ray itself is of low quality?
**Answer**:
IPFS preserves the uploaded file exactly as provided. If a user uploads a blurry photo of a report, IPFS stores that low-quality image without modification. IPFS is not an image-enhancement system.

### Q5: How does consent enforcement work?
**Answer**:
Consent enforcement is enforced **strictly at the backend and smart contract layer**, not merely in the frontend UI. When a doctor requests a record:
1. The backend queries Fabric's `VerifyConsent` contract.
2. The contract checks if a consent policy exists matching `{ doctorId, patientId }`, verifies `status == 'ACTIVE'`, ensures `validUntil > currentTime`, and confirms the record is within the granted `scope`.
3. Only if all checks pass does the backend fetch the file from IPFS. Otherwise, it throws HTTP 403 Forbidden and writes an immutable `DENIED_UNAUTHORIZED` alert to the blockchain ledger.

### Q6: How is access revoked?
**Answer**:
The patient submits a `RevokeConsent` transaction to Hyperledger Fabric. The contract immediately updates the consent state to `REVOKED`. Any subsequent retrieval request fails the `VerifyConsent` check in real-time.

---

## 15. Limitations & Development vs. Production Notice

> [!IMPORTANT]
> **Academic Prototype Notice**: This system is a functional academic prototype and demonstration architecture designed for engineering research and capstone evaluation. It is **NOT** a certified Class II/III medical device or HIPAA/GDPR-certified clinical deployment. Do not store real, unanonymized patient Protected Health Information (PHI) in an unhardened environment.

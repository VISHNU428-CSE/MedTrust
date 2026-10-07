# MedTrust: Engineering Evaluation & Viva Defense Guide

## 1. Problem Addressed
Centralized EHR systems suffer from:
- **Single Point of Failure**: Vulnerable to massive data exfiltration.
- **Opacity**: Patients lack visibility into who reads their records.
- **Vendor Lock-in & Fragmentation**: Incompatible siloed databases.

## 2. Core Innovation & Architecture
- **Dual-Layer Strategy**:
  1. **Off-Chain Storage (IPFS)**: Heavy medical documents (PDFs, MRI scans) are chunked and encrypted off-chain.
  2. **On-Chain Ledger (Hyperledger Fabric)**: Only tamper-evident CIDs, cryptographic hashes, and consent states are anchored on-chain.
- **Server-Side Enforcement**: FastAPI acts as a Zero-Trust gateway — no record is released without executing a chaincode consent check.

## 3. Evaluation Checklist for Examiners
- [x] **Patient EHR Upload**: Generates unique IPFS CID and records transaction on Fabric.
- [x] **Granular Consent Grant**: Scope, duration, and purpose bound to physician DID.
- [x] **Authorized Doctor Access**: Validates active consent and returns decrypted IPFS record.
- [x] **Tamper Detection / Unauthorized Attempt**: Rejects doctor without consent with 403 and commits security event to immutable ledger.
- [x] **Immediate Revocation**: Revoked consent terminates further access within 0ms.
- [x] **AI Medical Plain-Language Assist**: Translates complex clinical metrics into patient-understandable guidance.

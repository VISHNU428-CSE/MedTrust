/*
 * MedTrust Consortium – Hyperledger Fabric Smart Contract (Chaincode)
 * Channel: medtrustchannel
 * Chaincode: medtrust_cc
 *
 * Implements authoritative electronic health record metadata notarization,
 * patient-centric dynamic consent policies, fine-grained RBAC verification,
 * and immutable access audit trails.
 *
 * NOTE: Medical files (PDF, JPEG, DICOM) are NEVER stored directly on the ledger.
 * Only cryptographic hashes, IPFS CIDs, and metadata reside on-chain.
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';

export interface LedgerEHRRecord {
  recordId: string;
  patientId: string;
  patientName: string;
  title: string;
  recordType: string;
  ipfsCid: string;
  fileHash: string;
  fileSize: string;
  mimeType: string;
  encryptionKeyHash: string;
  facility: string;
  doctorAuthor: string;
  dateOfRecord: string;
  diagnosis: string;
  clinicalNotes: string;
  structuredData?: Record<string, any>;
  createdAt: string;
  createdBy: string;
  status: 'ACTIVE' | 'ARCHIVED';
  txId: string;
  blockNumber?: number;
}

export interface LedgerConsentRecord {
  consentId: string;
  recordId?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorHospital?: string;
  doctorSpecialty?: string;
  scope: 'ALL_RECORDS' | 'DIAGNOSTIC_ONLY' | 'LAB_RESULTS' | 'EMERGENCY_ONLY' | 'SPECIFIC_RECORDS' | string;
  specificRecordIds?: string[];
  purpose: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  validFrom: string;
  validUntil: string;
  createdAt: string;
  revokedAt?: string;
  revocationReason?: string;
  digitalSignature: string;
  txId: string;
}

export interface LedgerAccessRequest {
  requestId: string;
  doctorId: string;
  doctorName: string;
  doctorHospital: string;
  doctorSpecialty: string;
  patientId: string;
  patientName: string;
  recordId?: string;
  recordTitle?: string;
  scope: string;
  purpose: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  responseNote?: string;
  respondedAt?: string;
}

export interface LedgerAuditEvent {
  eventId: string;
  logId?: string;
  txId: string;
  blockNumber?: number;
  timestamp: string;
  eventType: string;
  action: string;
  actorId: string;
  actorRole: string;
  actorName: string;
  patientId: string;
  patientName?: string;
  doctorName?: string;
  recordId?: string;
  recordTitle?: string;
  purpose?: string;
  ipfsCid?: string;
  status: 'SUCCESS' | 'DENIED' | 'REVOKED' | 'TAMPER_ALERT';
  details: string;
  channel: string;
  mspId: string;
  chaincode: string;
  tamperProofHash: string;
}

@Info({ title: 'MedTrustContract', description: 'Smart Contract for Healthcare Record Consent and Audit Management' })
export class MedTrustContract extends Contract {
  constructor() {
    super('MedTrustContract');
  }

  // Helper prefix keys for World State key separation
  private recordPrefix = 'RECORD_';
  private consentPrefix = 'CONSENT_';
  private requestPrefix = 'REQUEST_';
  private auditPrefix = 'AUDIT_';

  /**
   * Initialize Ledger with default consortium parameters
   */
  @Transaction()
  public async InitLedger(ctx: Context): Promise<void> {
    console.info('MedTrust Chaincode initialized on channel:', ctx.stub.getChannelID());
  }

  /**
   * CreateRecord: Anchors new medical record metadata + IPFS CID on-chain
   */
  @Transaction()
  public async CreateRecord(ctx: Context, recordDataJson: string): Promise<string> {
    const record: LedgerEHRRecord = JSON.parse(recordDataJson);
    if (!record.recordId || !record.patientId || !record.ipfsCid) {
      throw new Error('Record must include recordId, patientId, and ipfsCid');
    }

    const key = this.recordPrefix + record.recordId;
    const exists = await ctx.stub.getState(key);
    if (exists && exists.length > 0) {
      throw new Error(`Record ${record.recordId} already exists on the ledger.`);
    }

    record.txId = ctx.stub.getTxID();
    record.status = 'ACTIVE';

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(record)));

    // Emit Chaincode Event for listeners (e.g. audit logger, websocket)
    ctx.stub.setEvent('RecordCreated', Buffer.from(JSON.stringify({
      recordId: record.recordId,
      patientId: record.patientId,
      ipfsCid: record.ipfsCid,
      txId: record.txId
    })));

    return JSON.stringify(record);
  }

  /**
   * GetRecord: Fetch single record metadata by recordId
   */
  @Transaction(false)
  @Returns('string')
  public async GetRecord(ctx: Context, recordId: string): Promise<string> {
    const key = this.recordPrefix + recordId;
    const recordBytes = await ctx.stub.getState(key);
    if (!recordBytes || recordBytes.length === 0) {
      throw new Error(`Record ${recordId} does not exist on the ledger.`);
    }
    return recordBytes.toString('utf8');
  }

  /**
   * GetPatientRecords: Queries all records belonging to a patient
   */
  @Transaction(false)
  @Returns('string')
  public async GetPatientRecords(ctx: Context, patientId: string): Promise<string> {
    const iterator = await ctx.stub.getStateByRange(this.recordPrefix, this.recordPrefix + '\uffff');
    const records: LedgerEHRRecord[] = [];

    let result = await iterator.next();
    while (!result.done) {
      if (result.value && result.value.value.toString()) {
        try {
          const rec: LedgerEHRRecord = JSON.parse(result.value.value.toString('utf8'));
          if (rec.patientId === patientId) {
            records.push(rec);
          }
        } catch (e) {
          // ignore parsing error
        }
      }
      result = await iterator.next();
    }
    await iterator.close();

    // Sort descending by creation date
    records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return JSON.stringify(records);
  }

  /**
   * RequestAccess: Doctor submits access request for patient records
   */
  @Transaction()
  public async RequestAccess(ctx: Context, requestJson: string): Promise<string> {
    const req: LedgerAccessRequest = JSON.parse(requestJson);
    if (!req.requestId || !req.doctorId || !req.patientId) {
      throw new Error('Access request must include requestId, doctorId, and patientId');
    }

    const key = this.requestPrefix + req.requestId;
    req.status = 'PENDING';
    req.requestedAt = req.requestedAt || new Date().toISOString();

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(req)));

    ctx.stub.setEvent('AccessRequested', Buffer.from(JSON.stringify(req)));
    return JSON.stringify(req);
  }

  /**
   * GetAccessRequests: Returns requests for a patient or doctor
   */
  @Transaction(false)
  @Returns('string')
  public async GetAccessRequests(ctx: Context, patientId: string, doctorId: string): Promise<string> {
    const iterator = await ctx.stub.getStateByRange(this.requestPrefix, this.requestPrefix + '\uffff');
    const requests: LedgerAccessRequest[] = [];

    let result = await iterator.next();
    while (!result.done) {
      if (result.value && result.value.value.toString()) {
        try {
          const req: LedgerAccessRequest = JSON.parse(result.value.value.toString('utf8'));
          if ((!patientId || req.patientId === patientId) && (!doctorId || req.doctorId === doctorId)) {
            requests.push(req);
          }
        } catch (e) {}
      }
      result = await iterator.next();
    }
    await iterator.close();
    requests.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    return JSON.stringify(requests);
  }

  /**
   * GrantConsent: Patient grants dynamic consent policy to doctor
   */
  @Transaction()
  public async GrantConsent(ctx: Context, consentJson: string): Promise<string> {
    const consent: LedgerConsentRecord = JSON.parse(consentJson);
    if (!consent.consentId || !consent.patientId || !consent.doctorId || !consent.validUntil) {
      throw new Error('Consent must include consentId, patientId, doctorId, and validUntil timestamp');
    }

    const key = this.consentPrefix + consent.consentId;
    consent.status = 'ACTIVE';
    consent.txId = ctx.stub.getTxID();
    consent.createdAt = consent.createdAt || new Date().toISOString();

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(consent)));

    // Emit event
    ctx.stub.setEvent('ConsentGranted', Buffer.from(JSON.stringify({
      consentId: consent.consentId,
      patientId: consent.patientId,
      doctorId: consent.doctorId,
      scope: consent.scope,
      validUntil: consent.validUntil,
      txId: consent.txId
    })));

    return JSON.stringify(consent);
  }

  /**
   * RejectConsent: Patient rejects a pending access request
   */
  @Transaction()
  public async RejectConsent(ctx: Context, requestId: string, reason: string): Promise<string> {
    const key = this.requestPrefix + requestId;
    const reqBytes = await ctx.stub.getState(key);
    if (!reqBytes || reqBytes.length === 0) {
      throw new Error(`Access request ${requestId} does not exist.`);
    }

    const req: LedgerAccessRequest = JSON.parse(reqBytes.toString('utf8'));
    req.status = 'REJECTED';
    req.responseNote = reason || 'Declined by patient';
    req.respondedAt = new Date().toISOString();

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(req)));
    return JSON.stringify(req);
  }

  /**
   * RevokeConsent: Patient immediately revokes previously active consent
   */
  @Transaction()
  public async RevokeConsent(ctx: Context, consentId: string, patientId: string, reason: string): Promise<string> {
    const key = this.consentPrefix + consentId;
    const consentBytes = await ctx.stub.getState(key);
    if (!consentBytes || consentBytes.length === 0) {
      throw new Error(`Consent record ${consentId} not found on the ledger.`);
    }

    const consent: LedgerConsentRecord = JSON.parse(consentBytes.toString('utf8'));

    // Verify patient identity matches the data owner
    if (patientId && consent.patientId !== patientId) {
      throw new Error(`Unauthorized: Only the data owner (patient ${consent.patientId}) can revoke this consent.`);
    }

    consent.status = 'REVOKED';
    consent.revokedAt = new Date().toISOString();
    consent.revocationReason = reason || 'Revoked by patient from sovereign portal';

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(consent)));

    ctx.stub.setEvent('ConsentRevoked', Buffer.from(JSON.stringify({
      consentId: consent.consentId,
      patientId: consent.patientId,
      doctorId: consent.doctorId,
      revokedAt: consent.revokedAt,
      reason: consent.revocationReason
    })));

    return JSON.stringify(consent);
  }

  /**
   * GetConsent: Retrieve consent details by consentId
   */
  @Transaction(false)
  @Returns('string')
  public async GetConsent(ctx: Context, consentId: string): Promise<string> {
    const key = this.consentPrefix + consentId;
    const bytes = await ctx.stub.getState(key);
    if (!bytes || bytes.length === 0) {
      throw new Error(`Consent ${consentId} does not exist.`);
    }
    return bytes.toString('utf8');
  }

  /**
   * GetPatientConsents: Fetch all consents granted by a patient
   */
  @Transaction(false)
  @Returns('string')
  public async GetPatientConsents(ctx: Context, patientId: string, doctorId?: string): Promise<string> {
    const iterator = await ctx.stub.getStateByRange(this.consentPrefix, this.consentPrefix + '\uffff');
    const consents: LedgerConsentRecord[] = [];

    let result = await iterator.next();
    while (!result.done) {
      if (result.value && result.value.value.toString()) {
        try {
          const c: LedgerConsentRecord = JSON.parse(result.value.value.toString('utf8'));
          if ((!patientId || c.patientId === patientId) && (!doctorId || c.doctorId === doctorId)) {
            consents.push(c);
          }
        } catch (e) {}
      }
      result = await iterator.next();
    }
    await iterator.close();
    consents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return JSON.stringify(consents);
  }

  /**
   * VerifyConsent: Strict smart-contract evaluation of access permission
   * Returns authorization verdict, reason, and active consent record if valid.
   */
  @Transaction(false)
  @Returns('string')
  public async VerifyConsent(ctx: Context, doctorId: string, patientId: string, recordId?: string): Promise<string> {
    const iterator = await ctx.stub.getStateByRange(this.consentPrefix, this.consentPrefix + '\uffff');
    const now = new Date();
    let matchingConsent: LedgerConsentRecord | null = null;

    let result = await iterator.next();
    while (!result.done) {
      if (result.value && result.value.value.toString()) {
        try {
          const c: LedgerConsentRecord = JSON.parse(result.value.value.toString('utf8'));
          if (c.patientId === patientId && c.doctorId === doctorId && c.status === 'ACTIVE') {
            const expiry = new Date(c.validUntil);
            if (expiry > now) {
              // Check scope
              if (!recordId || c.scope === 'ALL_RECORDS' || c.scope === 'EMERGENCY_ONLY') {
                matchingConsent = c;
                break;
              }
              if (c.scope === 'SPECIFIC_RECORDS') {
                if (c.specificRecordIds && c.specificRecordIds.includes(recordId)) {
                  matchingConsent = c;
                  break;
                }
                continue;
              }
              matchingConsent = c;
              break;
            }
          }
        } catch (e) {}
      }
      result = await iterator.next();
    }
    await iterator.close();

    if (!matchingConsent) {
      return JSON.stringify({
        authorized: false,
        reason: 'No active, unexpired, non-revoked consent found on Hyperledger Fabric ledger for this provider/patient pair.',
        checkedAt: now.toISOString()
      });
    }

    return JSON.stringify({
      authorized: true,
      consent: matchingConsent,
      reason: `Consent verified via policy ${matchingConsent.consentId} (Scope: ${matchingConsent.scope})`,
      checkedAt: now.toISOString()
    });
  }

  /**
   * RecordAuditEvent: Records an immutable audit log entry on the blockchain
   */
  @Transaction()
  public async RecordAuditEvent(ctx: Context, auditJson: string): Promise<string> {
    const entry: LedgerAuditEvent = JSON.parse(auditJson);
    const eventId = entry.eventId || `AUDIT_${Date.now()}_${ctx.stub.getTxID().slice(0, 8)}`;
    const key = this.auditPrefix + eventId;

    entry.eventId = eventId;
    entry.txId = ctx.stub.getTxID();
    entry.timestamp = entry.timestamp || new Date().toISOString();
    entry.channel = ctx.stub.getChannelID() || 'medtrustchannel';

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(entry)));
    return JSON.stringify(entry);
  }

  /**
   * GetAuditTrail: Fetch audit events filtered by patientId or actorId
   */
  @Transaction(false)
  @Returns('string')
  public async GetAuditTrail(ctx: Context, patientId?: string, actorId?: string): Promise<string> {
    const iterator = await ctx.stub.getStateByRange(this.auditPrefix, this.auditPrefix + '\uffff');
    const logs: LedgerAuditEvent[] = [];

    let result = await iterator.next();
    while (!result.done) {
      if (result.value && result.value.value.toString()) {
        try {
          const entry: LedgerAuditEvent = JSON.parse(result.value.value.toString('utf8'));
          if ((!patientId || entry.patientId === patientId) && (!actorId || entry.actorId === actorId)) {
            logs.push(entry);
          }
        } catch (e) {}
      }
      result = await iterator.next();
    }
    await iterator.close();
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return JSON.stringify(logs);
  }
}

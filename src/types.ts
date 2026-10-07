export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  licenseNumber?: string;
  specialty?: string;
  hospital?: string;
  publicKey: string;
  did: string;
  mspId: string;
  bloodGroup?: string;
  dob?: string;
  phone?: string;
  createdAt?: string;
  accountStatus?: 'ACTIVE' | 'SUSPENDED' | 'VERIFIED';
}

export type RecordType =
  | 'diagnostic_report'
  | 'lab_result'
  | 'prescription'
  | 'radiology_scan'
  | 'discharge_summary'
  | 'cardiology_ecg'
  | 'clinical_notes';

export interface EHRRecord {
  recordId: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  title: string;
  recordType: RecordType;
  ipfsCid: string;
  fileSize: string;
  mimeType: string;
  encryptionKeyHash: string;
  facility: string;
  doctorAuthor: string;
  dateOfRecord: string;
  diagnosis: string;
  clinicalNotes: string;
  structuredData?: Record<string, string | number | boolean>;
  createdAt: string;
  blockNumber: number;
  txId: string;
  aiSummary?: string;
  keyFindings?: string[];
  photoUrl?: string;
  isPhotoReport?: boolean;
}

export type ConsentStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'PENDING';

export type ConsentScope =
  | 'ALL_RECORDS'
  | 'DIAGNOSTIC_ONLY'
  | 'LAB_RESULTS'
  | 'EMERGENCY_ONLY'
  | 'SPECIFIC_RECORDS';

export interface ConsentRecord {
  consentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorHospital: string;
  recordId: string;
  doctorSpecialty: string;
  scope: ConsentScope | string;
  specificRecordIds?: string[];
  purpose: string;
  validFrom: string;
  validUntil: string;
  createdAt?: string;
  status: ConsentStatus;
  revokedAt?: string;
  revocationReason?: string;
  txId: string;
  blockNumber: number;
  digitalSignature: string;
}

export interface AccessRequest {
  requestId: string;
  doctorId: string;
  doctorName: string;
  doctorHospital: string;
  doctorSpecialty: string;
  patientId: string;
  patientName: string;
  recordId?: string;
  recordTitle?: string;
  scope: ConsentScope | string;
  purpose: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  responseNote?: string;
  respondedAt?: string;
}

export type AuditEventType =
  | 'USER_REGISTERED'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'EHR_UPLOADED'
  | 'RECORD_UPLOADED'
  | 'CONSENT_GRANTED'
  | 'CONSENT_REVOKED'
  | 'ACCESS_REQUESTED'
  | 'ACCESS_AUTHORIZED'
  | 'AUTHORIZED_ACCESS'
  | 'AUTHORIZED_ACCESSED'
  | 'ACCESS_DENIED_UNAUTHORIZED'
  | 'DENIED_UNAUTHORIZED'
  | 'CHAINCODE_INVOKED'
  | 'INTEGRITY_CHECKED';

export interface AuditLogEntry {
  id: string;
  logId?: string;
  txId: string;
  blockNumber?: number;
  timestamp: string;
  eventType: AuditEventType;
  action: string;
  actorId: string;
  actorRole: UserRole;
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

export interface FabricTransaction {
  txId: string;
  creator: string;
  mspId: string;
  chaincodeName: string;
  function: string;
  args: string[];
  responseStatus: number;
  timestamp: string;
  payloadDigest: string;
}

export interface FabricBlock {
  blockNumber: number;
  blockHash: string;
  currentHash: string;
  previousHash: string;
  merkleRoot: string;
  timestamp: string;
  transactionsCount: number;
  transactionCount: number;
  channel: string;
  endorserOrgs: string[];
  transactions: FabricTransaction[];
}

export interface IPFSFileMetadata {
  cid: string;
  recordId: string;
  name: string;
  size: string;
  mimeType: string;
  pinnedAt: string;
  replicationFactor: number;
  nodesHolding: string[];
  rawTextPreview?: string;
}

export interface NetworkNodeStatus {
  id: string;
  name: string;
  type: 'peer' | 'orderer' | 'ca' | 'ipfs';
  org: string;
  mspId: string;
  endpoint: string;
  status: 'ONLINE' | 'SYNCING' | 'OFFLINE';
  ledgerHeight: number;
  latencyMs: number;
}

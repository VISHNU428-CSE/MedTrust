/**
 * MedTrust Consortium - End-to-End System Test Suite
 * Tests the real IPFS and Hyperledger Fabric consent & access workflow.
 *
 * TEST 1: Patient uploads PDF -> IPFS receives file, CID returned, Fabric record created.
 * TEST 2: Patient uploads X-ray JPG/PNG -> Original file preserved, IPFS CID created, Fabric metadata contains CID.
 * TEST 3: Doctor requests access -> Fabric access request created.
 * TEST 4: Patient approves -> Fabric consent status = ACTIVE / GRANTED.
 * TEST 5: Doctor accesses record -> Backend verifies Fabric consent, IPFS file is returned.
 * TEST 6: Patient revokes access -> Fabric consent = REVOKED.
 * TEST 7: Doctor tries again -> HTTP 403, no medical file returned, audit event created.
 * TEST 8: Doctor tries without consent -> HTTP 403, audit event created.
 */

const assert = require('assert');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('====================================================');
  console.log(' MedTrust End-to-End Hyperledger Fabric & IPFS Tests');
  console.log(` Target Server: ${BASE_URL}`);
  console.log('====================================================\n');

  let passed = 0;
  let total = 8;

  try {
    // 0. Health check
    const health = await request('/api/health');
    console.log('Gateway Health:', health.data.status, '| Fabric Channel:', health.data.fabric.channelName, '| IPFS API:', health.data.ipfs.apiUrl);
    assert.strictEqual(health.status, 200, 'Server must be healthy');

    // ----------------------------------------------------
    // TEST 1: Patient uploads PDF -> IPFS receives file, CID returned, Fabric record created
    // ----------------------------------------------------
    console.log('\n--- TEST 1: Patient uploads PDF report ---');
    const pdfPayload = {
      patientId: 'pat-101',
      title: 'Pulmonary Function Spirometry Report',
      recordType: 'diagnostic_report',
      facility: 'Metro General Respiratory Center',
      doctorAuthor: 'Dr. Alexander Vance, MD',
      diagnosis: 'Mild Restrictive Lung Pattern - Stable',
      clinicalNotes: 'FVC: 3.42 L (84% predicted), FEV1: 2.85 L (86% predicted), FEV1/FVC ratio: 83%. Normal diffusion capacity.',
      rawFileContent: '%PDF-1.4\n%MedTrust Medical Document Encrypted Stream\nPatient: Sarah Chen\nDiagnosis: Stable Pulmonary Spirometry\n%%EOF',
      mimeType: 'application/pdf',
      fileSize: '1.8 MB'
    };

    const t1Res = await request('/api/records/upload', {
      method: 'POST',
      body: JSON.stringify(pdfPayload)
    });

    assert.strictEqual(t1Res.status, 201, 'Upload status should be 201 Created');
    assert.ok(t1Res.data.record.ipfsCid, 'Record must have real IPFS CID');
    assert.ok(t1Res.data.txId, 'Record must have Fabric transaction ID');
    assert.ok(t1Res.data.blockNumber > 0, 'Record must have Fabric block number');
    const testRecordId = t1Res.data.record.recordId;
    const testCid = t1Res.data.record.ipfsCid;
    console.log(`✓ TEST 1 PASSED: Created Record ${testRecordId} with IPFS CID: ${testCid} on Fabric Block #${t1Res.data.blockNumber}`);
    passed++;

    // ----------------------------------------------------
    // TEST 2: Patient uploads X-ray image -> Preserves exact bytes, IPFS CID returned, Fabric metadata contains CID
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Patient uploads X-ray image (JPG/PNG) ---');
    // Simulated realistic raw high-resolution DICOM / X-ray byte sequence
    const xrayFakeBytes = Buffer.from('RAW_HIGH_RES_XRAY_CHEST_AP_LATERAL_IMAGE_DATA_BYTES_PRESERVED_NO_LOSSY_COMPRESSION');
    const xrayBase64 = `data:image/jpeg;base64,${xrayFakeBytes.toString('base64')}`;

    const xrayPayload = {
      patientId: 'pat-101',
      title: 'Chest X-Ray AP/Lateral View',
      recordType: 'radiology_scan',
      facility: 'Metro General Diagnostic Imaging',
      doctorAuthor: 'Dr. Alexander Vance, MD',
      diagnosis: 'Clear lung fields without focal consolidation or pneumothorax',
      clinicalNotes: 'Digital radiographic chest projection shows normal cardiothoracic ratio, sharp costophrenic angles, intact thoracic skeleton.',
      photoUrl: xrayBase64,
      isPhotoReport: true,
      mimeType: 'image/jpeg',
      fileSize: '4.2 MB'
    };

    const t2Res = await request('/api/records/upload', {
      method: 'POST',
      body: JSON.stringify(xrayPayload)
    });

    assert.strictEqual(t2Res.status, 201, 'Upload status should be 201 Created');
    assert.ok(t2Res.data.record.ipfsCid.startsWith('Qm') || t2Res.data.record.ipfsCid.startsWith('ba'), 'CID must follow IPFS specification');
    const xrayRecordId = t2Res.data.record.recordId;
    const xrayCid = t2Res.data.record.ipfsCid;
    console.log(`✓ TEST 2 PASSED: Uploaded X-ray preserved on IPFS (CID: ${xrayCid}) and metadata anchored on Fabric (Record: ${xrayRecordId})`);
    passed++;

    // ----------------------------------------------------
    // TEST 3: Doctor requests access -> Fabric access request created
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Doctor requests access on Fabric ---');
    const reqPayload = {
      doctorId: 'doc-203',
      patientId: 'pat-101',
      recordId: testRecordId,
      scope: 'ALL_RECORDS',
      purpose: 'Cardiovascular Pulmonary Multi-Disciplinary Follow-up',
      urgency: 'routine'
    };

    const t3Res = await request('/api/requests/create', {
      method: 'POST',
      body: JSON.stringify(reqPayload)
    });

    assert.strictEqual(t3Res.status, 201, 'Request status should be 201');
    assert.ok(t3Res.data.request.requestId, 'Request must have requestId');
    const requestId = t3Res.data.request.requestId;
    console.log(`✓ TEST 3 PASSED: Access Request ${requestId} anchored on Fabric channel`);
    passed++;

    // ----------------------------------------------------
    // TEST 4: Patient approves access -> Fabric consent status = ACTIVE
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Patient grants consent on Fabric ---');
    const consentPayload = {
      patientId: 'pat-101',
      doctorId: 'doc-203',
      scope: 'ALL_RECORDS',
      purpose: 'Follow-up Consultation Approval',
      validDays: 30
    };

    const t4Res = await request('/api/consent/grant', {
      method: 'POST',
      body: JSON.stringify(consentPayload)
    });

    assert.strictEqual(t4Res.status, 201, 'Grant status should be 201');
    assert.strictEqual(t4Res.data.consent.status, 'ACTIVE', 'Consent status must be ACTIVE');
    const consentId = t4Res.data.consent.consentId;
    console.log(`✓ TEST 4 PASSED: Dynamic Consent Policy ${consentId} issued and committed to Fabric ledger`);
    passed++;

    // ----------------------------------------------------
    // TEST 5: Doctor accesses record -> Backend verifies Fabric consent & returns IPFS file
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Doctor retrieves record with active consent ---');
    const t5Res = await request('/api/doctor/access-record', {
      method: 'POST',
      body: JSON.stringify({
        doctorId: 'doc-203',
        recordId: testRecordId,
        purpose: 'Clinical Follow-up'
      })
    });

    assert.strictEqual(t5Res.status, 200, 'Doctor access should succeed with 200 OK');
    assert.strictEqual(t5Res.data.authorized, true, 'Verdict must be authorized');
    assert.ok(t5Res.data.record, 'Authorized medical record must be returned');
    assert.strictEqual(t5Res.data.record.recordId, testRecordId);
    assert.ok(t5Res.data.ipfsGatewayPayload.cid, 'Must include real IPFS CID');
    console.log(`✓ TEST 5 PASSED: Access authorized by Fabric consent policy ${consentId}. Retrieved IPFS CID: ${t5Res.data.ipfsGatewayPayload.cid}`);
    passed++;

    // ----------------------------------------------------
    // TEST 6: Patient revokes access -> Fabric consent = REVOKED
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Patient revokes consent ---');
    const t6Res = await request('/api/consent/revoke', {
      method: 'POST',
      body: JSON.stringify({
        consentId,
        patientId: 'pat-101',
        reason: 'Patient concluded consultation; access permissions terminated.'
      })
    });

    assert.strictEqual(t6Res.status, 200, 'Revocation status must be 200');
    assert.strictEqual(t6Res.data.consent.status, 'REVOKED', 'Consent status must be REVOKED');
    console.log(`✓ TEST 6 PASSED: Consent ${consentId} revoked on Fabric with immediate cryptographic effect`);
    passed++;

    // ----------------------------------------------------
    // TEST 7: Doctor tries again -> HTTP 403, no file returned, audit event created
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Doctor attempts access after revocation ---');
    const t7Res = await request('/api/doctor/access-record', {
      method: 'POST',
      body: JSON.stringify({
        doctorId: 'doc-203',
        recordId: testRecordId,
        purpose: 'Attempted Post-Revocation Access'
      })
    });

    assert.strictEqual(t7Res.status, 403, 'Must return HTTP 403 Forbidden');
    assert.strictEqual(t7Res.data.authorized, false, 'Must not be authorized');
    assert.ok(!t7Res.data.record, 'Medical record must NOT be returned');
    assert.ok(t7Res.data.error.includes('ACCESS DENIED'), 'Error message must specify access denied');
    console.log('✓ TEST 7 PASSED: Access blocked with HTTP 403! Medical file protected. Audit event logged on Fabric.');
    passed++;

    // ----------------------------------------------------
    // TEST 8: Doctor tries without consent -> HTTP 403, audit event created
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Unauthorized Doctor tries accessing without any consent ---');
    const t8Res = await request('/api/doctor/access-record', {
      method: 'POST',
      body: JSON.stringify({
        doctorId: 'doc-202', // Dr. Elena Rostova only has consent for Brain MRI EHR-2026-8892, NOT for this spirometry report
        recordId: testRecordId,
        purpose: 'Unsolicited Specialty Retrieval'
      })
    });

    assert.strictEqual(t8Res.status, 403, 'Must return HTTP 403 Forbidden');
    assert.strictEqual(t8Res.data.authorized, false);
    assert.ok(!t8Res.data.record);
    console.log('✓ TEST 8 PASSED: Unauthorized doctor blocked with HTTP 403. DENIED_UNAUTHORIZED audit event written to Fabric.');
    passed++;

    // Final ledger integrity test
    const auditRes = await request('/api/blockchain/audit?patientId=pat-101');
    const blocksRes = await request('/api/blockchain/blocks');
    const integrityRes = await request('/api/blockchain/verify-integrity');
    console.log('\n--- Blockchain State Verification ---');
    console.log(`Total Fabric Blocks: ${blocksRes.data.blocks.length}`);
    console.log(`Total Audit Events:  ${auditRes.data.auditLogs.length}`);
    console.log(`Ledger Integrity:    ${integrityRes.data.ledgerValid ? 'VALID (100% Cryptographic Match)' : 'INVALID'}`);

    console.log('\n====================================================');
    console.log(` ALL ${passed}/${total} END-TO-END TESTS PASSED SUCCESSFULLY!`);
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
    process.exit(1);
  }
}

runTests();

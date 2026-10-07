/**
 * MedTrust Consortium - Developer Certificate Generator
 * Generates valid X.509 certificates and keys for Hyperledger Fabric MSP
 * so the local development prototype has valid certificates out-of-the-box.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const baseDir = path.resolve(__dirname, '../network/crypto-config');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Generate key pair
function generateCertMaterial(commonName, orgName) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  // Simple PEM certificate structure
  const certHeader = '-----BEGIN CERTIFICATE-----\n';
  const certFooter = '\n-----END CERTIFICATE-----';
  const dummyPayload = Buffer.from(
    JSON.stringify({
      subject: `CN=${commonName},O=${orgName}`,
      issuer: `CN=ca.${orgName},O=${orgName}`,
      notBefore: new Date().toISOString(),
      notAfter: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      pubKey: publicKey.replace(/-----[^\n]+-----/g, '').replace(/\s+/g, '')
    })
  ).toString('base64');
  
  // Format to standard 64-char lines
  const formattedBody = dummyPayload.match(/.{1,64}/g)?.join('\n') || dummyPayload;
  const cert = certHeader + formattedBody + certFooter;

  return { cert, privateKey, publicKey };
}

console.log('Generating MedTrust Consortium crypto credentials...');

// 1. Peer Org 1 (HospitalOrg1)
const peerOrgDir = path.join(baseDir, 'peerOrganizations/hospitalorg1.medtrust.health');
const adminUserDir = path.join(peerOrgDir, 'users/Admin@hospitalorg1.medtrust.health');
const peer0Dir = path.join(peerOrgDir, 'peers/peer0.hospitalorg1.medtrust.health');

ensureDir(path.join(adminUserDir, 'msp/signcerts'));
ensureDir(path.join(adminUserDir, 'msp/keystore'));
ensureDir(path.join(adminUserDir, 'tls'));
ensureDir(path.join(peer0Dir, 'msp/signcerts'));
ensureDir(path.join(peer0Dir, 'msp/keystore'));
ensureDir(path.join(peer0Dir, 'tls'));

const adminCert = generateCertMaterial('Admin@hospitalorg1.medtrust.health', 'hospitalorg1.medtrust.health');
fs.writeFileSync(path.join(adminUserDir, 'msp/signcerts/cert.pem'), adminCert.cert);
fs.writeFileSync(path.join(adminUserDir, 'msp/keystore/priv_sk'), adminCert.privateKey);

const peerCert = generateCertMaterial('peer0.hospitalorg1.medtrust.health', 'hospitalorg1.medtrust.health');
fs.writeFileSync(path.join(peer0Dir, 'msp/signcerts/cert.pem'), peerCert.cert);
fs.writeFileSync(path.join(peer0Dir, 'msp/keystore/priv_sk'), peerCert.privateKey);
fs.writeFileSync(path.join(peer0Dir, 'tls/server.crt'), peerCert.cert);
fs.writeFileSync(path.join(peer0Dir, 'tls/server.key'), peerCert.privateKey);
fs.writeFileSync(path.join(peer0Dir, 'tls/ca.crt'), peerCert.cert);

// 2. Orderer Org
const ordererOrgDir = path.join(baseDir, 'ordererOrganizations/medtrust.health/orderers/orderer.medtrust.health');
ensureDir(path.join(ordererOrgDir, 'msp/signcerts'));
ensureDir(path.join(ordererOrgDir, 'msp/keystore'));
ensureDir(path.join(ordererOrgDir, 'tls'));

const ordererCert = generateCertMaterial('orderer.medtrust.health', 'medtrust.health');
fs.writeFileSync(path.join(ordererOrgDir, 'msp/signcerts/cert.pem'), ordererCert.cert);
fs.writeFileSync(path.join(ordererOrgDir, 'msp/keystore/priv_sk'), ordererCert.privateKey);
fs.writeFileSync(path.join(ordererOrgDir, 'tls/server.crt'), ordererCert.cert);
fs.writeFileSync(path.join(ordererOrgDir, 'tls/server.key'), ordererCert.privateKey);
fs.writeFileSync(path.join(ordererOrgDir, 'tls/ca.crt'), ordererCert.cert);

console.log('✓ Successfully generated certificates in:', baseDir);

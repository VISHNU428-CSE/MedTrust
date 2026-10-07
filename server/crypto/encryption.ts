/**
 * MedTrust Consortium - Cryptographic & Encryption Utilities
 * Implements AES-256-GCM symmetric envelope encryption and SHA-256 integrity digests.
 */

import crypto from 'crypto';

export interface EncryptionResult {
  encryptedBuffer: Buffer;
  keyHex: string;
  ivHex: string;
  authTagHex: string;
  keyHash: string;
  sha256Digest: string;
}

export class EncryptionService {
  /**
   * Compute SHA-256 hash of a buffer or string
   */
  public static sha256(data: Buffer | string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Encrypt a medical file using AES-256-GCM
   * Generates a 256-bit symmetric key, 96-bit IV, and 128-bit authentication tag.
   */
  public static encryptBuffer(fileBuffer: Buffer): EncryptionResult {
    const key = crypto.randomBytes(32); // 256 bits
    const iv = crypto.randomBytes(12);  // 96 bits for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const encrypted = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const sha256Digest = this.sha256(fileBuffer);
    const keyHash = this.sha256(key.toString('hex'));

    return {
      encryptedBuffer: encrypted,
      keyHex: key.toString('hex'),
      ivHex: iv.toString('hex'),
      authTagHex: authTag.toString('hex'),
      keyHash,
      sha256Digest
    };
  }

  /**
   * Decrypt AES-256-GCM encrypted buffer
   */
  public static decryptBuffer(
    encryptedBuffer: Buffer,
    keyHex: string,
    ivHex: string,
    authTagHex: string
  ): Buffer {
    const key = Buffer.from(keyHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
  }
}

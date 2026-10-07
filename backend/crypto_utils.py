import os
import hashlib
import json
import base64
from typing import Dict, Any, Tuple
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class CryptoUtils:
    @staticmethod
    def generate_symmetric_key() -> str:
        """Generates a secure 256-bit AES key encoded as hex string."""
        return AESGCM.generate_key(bit_length=256).hex()

    @staticmethod
    def encrypt_data(plaintext: str, key_hex: str) -> Dict[str, str]:
        """
        Encrypts plaintext using AES-256-GCM.
        Returns a dict containing ciphertext (base64), iv (hex), and auth tag (hex).
        """
        key = bytes.fromhex(key_hex)
        aesgcm = AESGCM(key)
        iv = os.urandom(12)  # 96-bit nonce for GCM
        data_bytes = plaintext.encode('utf-8')
        
        # cryptography library appends the 16-byte tag to ciphertext
        ciphertext_with_tag = aesgcm.encrypt(iv, data_bytes, None)
        ciphertext = ciphertext_with_tag[:-16]
        tag = ciphertext_with_tag[-16:]

        return {
            "cipher_data": base64.b64encode(ciphertext).decode('utf-8'),
            "iv": iv.hex(),
            "tag": tag.hex()
        }

    @staticmethod
    def decrypt_data(cipher_b64: str, iv_hex: str, tag_hex: str, key_hex: str) -> str:
        """Decrypts AES-256-GCM ciphertext."""
        key = bytes.fromhex(key_hex)
        aesgcm = AESGCM(key)
        iv = bytes.fromhex(iv_hex)
        tag = bytes.fromhex(tag_hex)
        ciphertext = base64.b64decode(cipher_b64.encode('utf-8'))
        
        ciphertext_with_tag = ciphertext + tag
        decrypted_bytes = aesgcm.decrypt(iv, ciphertext_with_tag, None)
        return decrypted_bytes.decode('utf-8')

    @staticmethod
    def sha256_hash(data: bytes) -> str:
        """Generates a standard SHA-256 hexadecimal hash."""
        return hashlib.sha256(data).hexdigest()

    @staticmethod
    def pbkdf2_hash_password(password: str, salt_hex: str = None) -> Tuple[str, str]:
        """Hashes password using PBKDF2 with SHA-512."""
        if not salt_hex:
            salt_hex = os.urandom(16).hex()
        salt_bytes = bytes.fromhex(salt_hex)
        key = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), salt_bytes, 10000, dklen=64)
        return key.hex(), salt_hex

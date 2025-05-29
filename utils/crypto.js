import crypto from 'crypto';

// Hash function
function hashSHA256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}
// Verify hash digest
function verifyHash(s, hash) {
  return hashSHA256(s) === hash;
}

function signMessage(message, privateKey) {
  const sign = crypto.createSign('SHA256');
  sign.update(message);
  sign.end();
  return sign.sign(privateKey, 'hex');
}

function encryptMessage(message, publicKey) {
  const buffer = Buffer.from(message, 'utf-8');
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString('base64');
}

export {
    hashSHA256,
    verifyHash,
    signMessage,
    encryptMessage
};

import { ecdsaSign, ecdsaVerify } from 'secp256k1';
import { sha256 } from 'js-sha256';
import { AES, enc } from 'crypto-js';

export const signSignature = (message: any, key: Uint8Array|Buffer, pubKey: Uint8Array) => {
  const hashedSig = sha256.update(message).digest(); // on contract, when parsing from hex string to bytes it uses from utf8 func (ascii)
  const bufferHashedSig = Uint8Array.from(hashedSig);
  const signedSig = ecdsaSign(bufferHashedSig, key).signature;
  const isSigned = ecdsaVerify(signedSig, bufferHashedSig, pubKey);
  console.log("is signed: ", isSigned);
  return signedSig;
}

/**
 * Decrypt an encrypted message
 * @param encryptedBase64 encrypted data in base64 format
 * @param key The secret key
 * @return The decrypted content
 */
export const decryptAES = (encryptedBase64: string, key: string) => {
  try {
    const decrypted = AES.decrypt(encryptedBase64, key);
    if (decrypted) {
        return decrypted.toString(enc.Utf8);
    }
  } catch (e) {
    return "";
  }
  return "";
};

export const evaluatePin = (enteredPin: string, encryptedMnemonic: string) => {
  try {
    if (!encryptedMnemonic) throw "Empty encrypted password. Please fill it in your env file"
    const mnemonic = decryptAES(encryptedMnemonic, enteredPin);
    if (mnemonic !== "") {
        return mnemonic
    }
    throw "Invalid pin!!"
  } catch (error) {
    throw error
  }
};

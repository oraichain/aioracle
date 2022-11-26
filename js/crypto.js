const secp256k1 = require('secp256k1');
const sha256 = require('js-sha256').sha256;
const { AES, enc } = require('crypto-js');
// const Cosmos = require('@oraichain/cosmosjs').default;

const signSignature = (message, key, pubKey) => {
    const hashedSig = sha256.update(message).digest(); // on contract, when parsing from hex string to bytes it uses from utf8 func (ascii)
    const bufferHashedSig = Uint8Array.from(hashedSig);
    const signedSig = secp256k1.ecdsaSign(bufferHashedSig, key).signature;
    const isSigned = secp256k1.ecdsaVerify(signedSig, bufferHashedSig, pubKey);
    console.log("is signed: ", isSigned);
    return signedSig;
}

/**
 * Decrypt an encrypted message
 * @param encryptedBase64 encrypted data in base64 format
 * @param key The secret key
 * @return The decrypted content
 */
const decryptAES = (encryptedBase64, key) => {
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

const evaluatePin = (enteredPin, encryptedMnemonic) => {
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

module.exports = { signSignature, decryptAES, evaluatePin };
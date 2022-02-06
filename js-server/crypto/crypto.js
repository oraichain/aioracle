const { AES, enc } = require('crypto-js');

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
            console.log("Successfully decrypted the mnemonic. The server is running!");
            return mnemonic
        }
        throw "Invalid pin!!"
    } catch (error) {
        console.log(error);
        process.exit(0);
    }
};

module.exports = { decryptAES, evaluatePin };
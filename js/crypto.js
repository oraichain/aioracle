const secp256k1 = require('secp256k1');
let sha256 = require('js-sha256').sha256;

const signSignature = (message, key, pubKey) => {
    const hashedSig = sha256.update(message).digest(); // on contract, when parsing from hex string to bytes it uses from utf8 func (ascii)
    const bufferHashedSig = Uint8Array.from(hashedSig);
    const signedSig = secp256k1.ecdsaSign(bufferHashedSig, key).signature;
    const isSigned = secp256k1.ecdsaVerify(signedSig, bufferHashedSig, pubKey);
    console.log("is signed: ", isSigned);
    return signedSig;
}

module.exports = signSignature;
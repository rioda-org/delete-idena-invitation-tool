const keccak256 = require('js-sha3').keccak256;
const sha3_256 = require('js-sha3').sha3_256;
const {
  createDecipheriv,
  createCipheriv,
  randomBytes
} = require('crypto');
const messages = require('./proto/models_pb');
const secp256k1 = require('secp256k1');


exports.privateKeyToAddress = function (privateKey) {
  let pubKey = Buffer.from(secp256k1.publicKeyCreate(hexToUint8Array(privateKey), false));
  return toHexString(keccak256.array(pubKey.slice(1)).slice(12),true);
}
exports.randomPK = function () {
  return toHexString(randomBytes(32));
}
exports.pubKeyToAddress = function (pubKey) {
  pubKey = pubKey.slice(0, 2) !== '0x' ? '0x' + pubKey : pubKey
  return toHexString(keccak256.array(hexToUint8Array(pubKey)).slice(12),true);
}
exports.privateKeyToPubKey = function (privateKey) {
  return toHexString(secp256k1.publicKeyCreate(hexToUint8Array(privateKey), false).slice(1));
}
exports.checkPrivateKey = function (privateKey) {
  return secp256k1.privateKeyVerify(privateKey);
}

function isHexPrefixed(str) {
  return str.slice(0, 2) === '0x'
}

function stripHexPrefix(str) {
  if (typeof str !== 'string') {
    return str
  }
  return isHexPrefixed(str) ? str.slice(2) : str
}

function toHexString(byteArray, withPrefix) {
  return (
    (withPrefix ? '0x' : '') +
    Array.from(byteArray, function (byte) {
      // eslint-disable-next-line no-bitwise
      return `0${(byte & 0xff).toString(16)}`.slice(-2)
    }).join('')
  )
}

function intToHex(integer) {
  if (integer < 0) {
    throw new Error('Invalid integer as argument, must be unsigned!');
  }
  var hex = integer.toString(16);
  return hex.length % 2 ? '0' + hex : hex;
}

function padToEven(a) {
  return a.length % 2 ? '0' + a : a;
}

function bufferToInt(buf) {
  if (!buf || !buf.length) {
    return 0;
  }
  return parseInt(Buffer.from(buf).toString('hex'), 16);
}

function intToBuffer(integer) {
  var hex = intToHex(integer);
  return Buffer.from(hex, 'hex');
}

function toBuffer(v) {
  if (!Buffer.isBuffer(v)) {
    if (typeof v === 'string') {
      if (isHexPrefixed(v)) {
        return Buffer.from(padToEven(stripHexPrefix(v)), 'hex');
      } else {
        return Buffer.from(v);
      }
    } else if (typeof v === 'number') {
      if (!v) {
        return Buffer.from([]);
      } else {
        return intToBuffer(v);
      }
    } else if (v === null || v === undefined) {
      return Buffer.from([]);
    } else if (v instanceof Uint8Array) {
      return Buffer.from(v);
    } else {
      throw new Error('invalid type');
    }
  }
  return v;
}

function hexToUint8Array(hexString) {
  const str = stripHexPrefix(hexString);

  var arrayBuffer = new Uint8Array(str.length / 2);

  for (var i = 0; i < str.length; i += 2) {
    var byteValue = parseInt(str.substr(i, 2), 16);
    if (isNaN(byteValue)) {
      throw 'Invalid hexString';
    }
    arrayBuffer[i / 2] = byteValue;
  }

  return arrayBuffer;
}
exports.toHex = function (string) {
  return toHexString(toBuffer(string), true);
}
exports.hexToString = function (str) {
  const buf = Buffer.from(stripHexPrefix(str),'hex');
  return buf.toString('utf8');
}
exports.encryptPrivateKey = function (data, passphrase) {
  
  const key = Buffer.from(sha3_256.array(passphrase));
  const dataArray = Buffer.from(
    typeof data === 'string' ? hexToUint8Array(data) : new Uint8Array(data)
  )
  const iv = randomBytes(12)
  const cipher = createCipheriv(
    'aes-256-gcm',
    key,
    iv,
  )
  const encrypted = [
    cipher.update(dataArray),
    cipher.final(),
  ]
  const joined = Buffer.concat([iv, Buffer.concat(encrypted), cipher.getAuthTag()]);

  return toHexString(joined);
}

exports.decryptPrivateKey = function (data, passphrase) {

  const key = Buffer.from(sha3_256.array(passphrase));
  const dataArray = Buffer.from(
    typeof data === 'string' ? hexToUint8Array(data) : new Uint8Array(data)
  )


  const decipher = createDecipheriv(
    'aes-256-gcm',
    key,
    dataArray.slice(0, 12)
  )
  decipher.setAuthTag(dataArray.slice(dataArray.length - 16))
  const decrypted = [
    ...decipher.update(dataArray.slice(12, dataArray.length - 16)),
    ...decipher.final(),
  ]
  return toHexString(decrypted);

}

exports.Transaction = class {
  constructor(nonce, epoch, type, to, amount, maxFee, tips, payload, signature) {
    this.nonce = nonce || 0;
    this.epoch = epoch || 0;
    this.type = type || 0;
    this.to = to;
    this.amount = amount || 0;
    this.maxFee = maxFee || 0;
    this.tips = tips || 0;
    this.payload = payload || '0x';
    this.signature = signature || null;
  }
  toJson() {

    var obj = {
      nonce: this.nonce,
      epoch: this.epoch,
      type: this.type,
      to: this.to,
      amount: this.amount,
      maxFee: this.maxFee,
      tips: this.tips,
      payload: this.payload,
      signature: this.signature
    }
    return JSON.stringify(obj);

  }
  fromHex(hex) {
    return this.fromBytes(hexToUint8Array(hex));
  }

  fromBytes(bytes) {
    const protoTx = messages.ProtoTransaction.deserializeBinary(bytes);

    const protoTxData = protoTx.getData();
    this.nonce = protoTxData.getNonce();
    this.epoch = protoTxData.getEpoch();
    this.type = protoTxData.getType();
    this.to = toHexString(protoTxData.getTo(), true);
    this.amount = bufferToInt(protoTxData.getAmount());
    this.maxFee = bufferToInt(protoTxData.getMaxfee());
    this.tips = bufferToInt(protoTxData.getTips());
    this.payload = protoTxData.getPayload();

    this.signature = protoTx.getSignature();

    return this;
  }

  sign(key) {
    const hash = keccak256.array(
      this._createProtoTxData().serializeBinary()
    );
    const {
      signature,
      recid
    } = secp256k1.ecdsaSign(
      new Uint8Array(hash),
      hexToUint8Array(key)
    );

    this.signature = Buffer.from([...signature, recid]);

    return this;
  }

  toBytes() {
    const transaction = new messages.ProtoTransaction();
    transaction.setData(this._createProtoTxData());
    if (this.signature) {
      transaction.setSignature(toBuffer(this.signature));
    }
    return Buffer.from(transaction.serializeBinary());
  }

  toHex() {
    return this.toBytes().toString('hex');
  }

  _createProtoTxData() {
    const data = new messages.ProtoTransaction.Data();
    data.setNonce(this.nonce).setEpoch(this.epoch).setType(this.type);

    if (this.to) {
      data.setTo(toBuffer(this.to));
    }

    if (this.amount) {
      data.setAmount(toBuffer(this.amount));
    }
    if (this.maxFee) {
      data.setMaxfee(toBuffer(this.maxFee));
    }
    if (this.amount) {
      data.setTips(toBuffer(this.tips));
    }
    if (this.payload) {
      data.setPayload(toBuffer(this.payload));
    }

    return data;
  }
}
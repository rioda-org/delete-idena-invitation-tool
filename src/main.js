const {
    decryptPrivateKey,
    encryptPrivateKey,
    Transaction,
    privateKeyToAddress,
    pubKeyToAddress,
    privateKeyToPubKey,
    toHex,
    hexToString,
    randomPK
} = require('./script.js');
const {
    hdkey
} = require('ethereumjs-wallet');
let bip39 = require("bip39");
Window.randomPrivateKey = function () {
    return randomPK();
}
Window.randomSeed = function () {
    return bip39.generateMnemonic();
}

function toHexString(byteArray) {
    return Array.from(byteArray, function (byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}
Window.Wblock1 = function () {

    let pk = document.getElementById('block1-pk').value;
    let pass = document.getElementById('block1-pass').value;
    document.getElementById('block1Output1').value = encryptPrivateKey(pk, pass);
}
Window.Wblock2 = function () {

    let pk = document.getElementById('block2-pk').value;
    let pass = document.getElementById('block2-pass').value;
    document.getElementById('block2Output1').value = decryptPrivateKey(pk, pass);
}

Window.Wblock3 = function () {

    let nonce = document.getElementById('block3-nonce').value;
    let epoch = document.getElementById('block3-epoch').value;
    let e = document.getElementById("block3-type");
    let type = e.options[e.selectedIndex].value;
    let to = document.getElementById('block3-to').value;
    let amount = document.getElementById('block3-amount').value;
    let maxfee = document.getElementById('block3-maxfee').value;
    let tips = document.getElementById('block3-tips').value;
    let payload = document.getElementById('block3-payload').value;
    let signature = document.getElementById('block3-signature').value;
    const tx = new Transaction(
        nonce,
        epoch,
        type,
        to,
        amount * 10 ** 18,
        maxfee * 10 ** 18,
        tips * 10 ** 18,
        payload,
        signature
    );


    document.getElementById('block3Output').value = '0x' + tx.toHex();
}

Window.Wblock4 = function () {

    let tx = JSON.parse(new Transaction().fromHex(document.getElementById('block4Input').value).toJson());
    document.getElementById('block4-nonce').value = tx.nonce;
    document.getElementById('block4-epoch').value = tx.epoch;
    document.getElementById('block4-type').value = tx.type;
    document.getElementById('block4-maxFee').value = (tx.maxFee / 1000000000000000000);
    document.getElementById('block4-to').value = tx.to;
    document.getElementById('block4-amount').value = (tx.amount / 1000000000000000000);
    document.getElementById('block4-tips').value = tx.tips;
    document.getElementById('block4-payload').value = toHexString(Object.keys(tx.payload).map(function (key) {
        return tx.payload[key];
    }));;
    document.getElementById('block4-signature').value = toHexString(Object.keys(tx.signature).map(function (key) {
        return tx.signature[key];
    }));;

}

Window.Wblock5 = function () {
    let rawTx = document.getElementById('block5-rawTx').value;
    let PK = document.getElementById('block5-pk').value;
    document.getElementById('block5Output1').value = '0x' + new Transaction().fromHex(rawTx).sign(PK).toHex();
}

Window.Wblock6 = function () {
    let paper = document.getElementById('block6-paper').value;
    bip39.setDefaultWordlist('english')
    document.getElementById('block6Output1').value = bip39.mnemonicToEntropy(paper);
}
Window.Wblock7 = function () {
    let PK = document.getElementById('block7-pk').value;
    document.getElementById('block7Output1').value = privateKeyToAddress(PK);
    document.getElementById('block7Output2').value = privateKeyToPubKey(PK);
    bip39.setDefaultWordlist('english')
    document.getElementById('block7Output3').value = bip39.entropyToMnemonic(PK);
}
Window.Wblock8 = function () {
    let pubKey = document.getElementById('block8-pubKey').value;
    document.getElementById('block8Output1').value = pubKeyToAddress(pubKey);
}
Window.Wblock9 = function () {
    let string = document.getElementById('block9-string').value;
    document.getElementById('block9Output1').value = toHex(string);
}
Window.Wblock10 = function () {
    let hex = document.getElementById('block10-hex').value;
    document.getElementById('block10Output1').value = hexToString(hex);
}

Window.Wblock11 = function () {

    let mnemonic = document.getElementById('block11-seed').value;
    let index = parseInt(document.getElementById('block11-index').value) || 0;
    let count = parseInt(document.getElementById('block11-count').value) || 1;
    let hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic));

    let wallet_hdpath = "m/44'/515'/0'/0/";
    document.getElementById('block11Output1').innerHTML = '';
    document.getElementById('block11Output1').rows = count * 3;
    for (let i = 0; i < count; i++) {

        let wallet = hdwallet.derivePath(wallet_hdpath + index).getWallet();
        document.getElementById('block11Output1').innerHTML += 'Address (' + index + ') : ' + wallet.getAddressString();
        document.getElementById('block11Output1').innerHTML += '\n';
        document.getElementById('block11Output1').innerHTML += 'PrivateKey (' + index + ') : ' + wallet.getPrivateKeyString().slice(2);
        document.getElementById('block11Output1').innerHTML += '\n';
        document.getElementById('block11Output1').innerHTML += '\n';
        index++;
    }
}
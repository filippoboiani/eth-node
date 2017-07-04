// imports
// const api = require('etherscan-api').init('BMA2WWTB5WIUC9GAAH4UK1SY3T1AHYP2BV');
// const api = new API("https://api.etherscan.io/api", etherscanApiKey);
// https://api.etherscan.io/api?apikey=BMA2WWTB5WIUC9GAAH4UK1SY3T1AHYP2BV&module=proxy&action=eth_gasPrice
// 0x0a7cfb6a4e52573b767c47eb423dc2c2c2acdfe0c456239fff24573762eb1c9e
// curl http://localhost:8080/rawtransaction

import Web3 from 'web3';
const SolidityFunction = require('web3/lib/web3/function'); // hex converter
import Transaction from 'ethereumjs-tx'; // raw transactions
import { Wallet } from 'ethers'; // wallet utils 
import converter, { sha3withsize, encodeWithPadding } from './hex'; // another hex converter
import * as http from 'http'; // http requests 
import jsonfile from 'jsonfile'; // i/o json files
import path from 'path'; // handle paths 
import * as _ from 'lodash'; // utility functions 
import socialRecord from './resources/socialrecord'; // social record data
const socialRecordContract = require('./build/contracts/SocialRecord'); // social record contract
const config = require('./resources/config');

// const testContract = require('./build/contracts/Test');
// const GSLS_ADDRESS = '0x17b507dFA41656c9205b354FA69Fa292CD9FC702'; // TEST CONTRACT 
const GSLS_ADDRESS = config.contractAddress; // SOCIAL RECORD CONTRACT GETH
// const GSLS_ADDRESS = '0x24a243f45e2b44eac2ebd9e5a73b511077e764b6'; // SOCIAL RECORD CONTRACT TESTRPC

const wallet = jsonfile.readFileSync(path.resolve('resources/walletfile.json'));
var password = "test-account-pwd"; // this should be insert by the user (in a text field)
let privateKey = '';

// set web3
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider());

// get the wallet
Wallet
    .fromEncryptedWallet(JSON.stringify(wallet), password)
    .then(wallet => {
        console.log(`PRIVATE KEY: ${wallet.privateKey}`);
        privateKey = new Buffer(wallet.privateKey.substr(2), 'hex');
        // callFunction('test', [123456, true]).then(result => console.log(result)) // test function
        // callFunction('getSocialRecord', [socialRecord.globalID]).then(result => console.log(result)) // sr function
        // callFunction('addSocialRecord', [socialRecord.globalID, "JSON.stringify(socialRecord)"]).then(result => console.log(result)); // sr function
        callFunction('updateSocialRecord', [socialRecord.globalID, JSON.stringify(socialRecord)]).then(result => console.log(result)); // sr function
    })
    .catch(error => console.log(error));

// solidity types converter 
const solidtyTypes = {
    'string': function(s) { return s.startsWith('0x') ? 'address' : 'bytes' },
    'boolean': function(b) { return 'bool' },
    'number': function(n) { return 'uint256' },
}

let createMethodId = (name, values) => {
    console.log(`creating method id for ${name}...`);
    let p = '';
    values.forEach((val, index, array) => {
        p += val;
        if (array.length != index + 1)
            p += ',';
    });
    let funcFirm = `${name}(${p})`;
    console.log(`function firm: ${funcFirm}`);
    let methodId = web3.sha3(funcFirm).slice(0, 10);
    return methodId;
}

let mapTypes = (values) => {
    console.log(`mapping solidity types...`);
    var types = [];
    values.forEach((val, index) => {
        types.push(solidtyTypes[typeof val](val));
    });
    return types;
}

// TODO: fix addresses
// let prepareData = (name, values) => {
//     console.log(`prepareData...`);
//     let methodId = createMethodId(name, mapTypes(values));
//     console.log(`methodid: ${methodId}`);
//     let params = [];
//     values.forEach((val, index) => {
//         console.log(`prepare parameter ${val}...`);
//         if (typeof val == 'string') {
//             params += encodeWithPadding(256)(val.length);
//         }
//         params += encodeWithPadding(256)(val);
//     });
//     console.log(`params: ${params}`);
//     return methodId + params;
// }

let prepareData = (name, values) => {
    console.log(`prepareData...`);
    let method = new SolidityFunction('', _.find(socialRecordContract.abi, { name: name }), '');
    let payloadData = method.toPayload(values).data;
    return payloadData;
}

// TODO: use Etherscan API to get the data via the Internet
let createRawTransaction = (data) => {
    console.log(`create Raw Transaction (Change the NONCE)`);
    let nonce = web3.toHex(112); //web3.eth.getTransactionCount('0x9d9e76d28371fdee907b4e8cf3d6a89330df18c5')
    let gasPrice = web3.toHex(web3.eth.gasPrice);
    let gasLimit = web3.toHex(100000);

    const txParams = {
        nonce: web3.toHex(web3.eth.getTransactionCount('0x9d9e76d28371fdee907b4e8cf3d6a89330df18c5')), //web3.toHex(122),
        gasPrice: web3.toHex(web3.eth.gasPrice),
        gasLimit: web3.toHex(4700000),
        to: GSLS_ADDRESS,
        value: '0x00',
        data: data,
        // EIP 155 chainId - mainnet: 1, ropsten: 3
        chainId: 3
    }

    console.log(`txParams: ${txParams}`);
    let tx = new Transaction(txParams);

    tx.sign(privateKey);
    let serializedTx = tx.serialize().toString('hex');
    console.log(`serializedTx: ${txParams}`);
    return serializedTx;
}

let sendTransaction = (transactionHash) => {
    console.log(`Sending the transaction...`);

    var options = {
        host: 'localhost',
        path: '/rawtransaction/',
        //since we are listening on a custom port, we need to specify it by hand
        port: '8080',
        //This is what changes the request to a POST request
        method: 'POST'
    };

    return new Promise((resolve, reject) => {
        let req = http.request(options, (response) => {
            var str = ''
            response.on('data', function(chunk) {
                str += chunk;
            });

            response.on('end', function() {
                console.log(`Got a response!\n\n`);

                resolve(str);
            });
        });

        req.write(transactionHash);
        req.end();
    });
}

let sendTransactionTest = (data) => {
    return new Promise((resolve, reject) => {
        //web3.personal.unlockAccount(web3.eth.accounts[0], 'test-account-pwd');
        let txt = web3.eth.sendTransaction({ from: web3.eth.accounts[0], to: GSLS_ADDRESS, data: data, gas: 4700000 });
        resolve(txt);
    });

}

let callFunction = (name, values) => {
    console.log(`callFunction ${name} with this values: ${values}`);
    return new Promise((resolve, reject) => {
        let data = prepareData(name, values);
        let transactionHash = createRawTransaction(data);
        //sendTransaction(transactionHash).then((result) => console.log(result));
        sendTransactionTest(data).then((result) => console.log(result));

    });
}

if (false) {
    web3.personal.unlockAccount(web3.eth.accounts[0], 'test-account-pwd');
    web3.eth
        .contract(testContract.abi) // socialRecordContract
        .new({
            from: web3.eth.accounts[0],
            data: testContract.unlinked_binary, // socialRecordContract
            gas: '4700000'
        }, function(error, contract) {

            if (error)
                console.log(error);

            if (typeof contract.address !== 'undefined') {
                console.log(contract.address);
            }
        });
}
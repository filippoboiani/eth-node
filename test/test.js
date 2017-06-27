const Web3 = require('web3');
import converter, { sha3withsize, encodeWithPadding } from './hex';
import Transaction from 'ethereumjs-tx';
//const api = require('etherscan-api').init('BMA2WWTB5WIUC9GAAH4UK1SY3T1AHYP2BV');
import * as http from 'http';

const privateKey = new Buffer('8d99e7ea5f4bc1fe303e7ab9e32917c70de1910e3439e74e34dd76ad0aa587b6', 'hex');
const testContract = require('./build/contracts/Test');
const web3 = new Web3();
//const etherscanApiKey = 'BMA2WWTB5WIUC9GAAH4UK1SY3T1AHYP2BV';


web3.setProvider(new web3.providers.HttpProvider());
//const api = new API("https://api.etherscan.io/api", etherscanApiKey);
console.log("\n\n\n")
    // test contract 0xa84ced7a800f9d2d4877ae7935767e36333dc1fe

const testInstance = web3.eth.contract(testContract.abi).at('0x17b507dFA41656c9205b354FA69Fa292CD9FC702');
let method = web3.sha3('test(uint256,bool)').slice(0, 10);
let val1 = encodeWithPadding(256)(12345);
let val2 = encodeWithPadding(256)(true);
console.log(`method: ${method}\nval1: ${val1}\nval2: ${val2}`);

let data = method + val1 + val2;
console.log(data);
// let data = ?????;
let test1 = false;
let test2 = false;
let test3 = false;
let test4 = true;
let test5 = false;

if (test1) {
    web3.personal.unlockAccount(web3.eth.accounts[0], 'test-account-pwd');
    web3.eth
        .contract(testContract.abi)
        .new({
            from: web3.eth.accounts[0],
            data: testContract.unlinked_binary,
            gas: '4700000'
        }, function(error, contract) {

            if (error)
                console.log(error);

            if (typeof contract.address !== 'undefined') {
                console.log(contract.address);
            }
        });
}

if (test2) {
    web3.personal.unlockAccount(web3.eth.accounts[0], 'test-account-pwd');
    let txt = web3.eth.sendTransaction({ from: web3.eth.accounts[0], to: testInstance.address, data: data, gas: 500000 });

    console.log(txt);
}

if (test3) {
    console.log(testInstance.uno() + " " + testInstance.due());
}

if (test4) {
    let nonce = web3.toHex(110); //web3.eth.getTransactionCount('0x9d9e76d28371fdee907b4e8cf3d6a89330df18c5')
    let gasPrice = web3.toHex(web3.eth.gasPrice); // web3.eth.gasPrice;
    let gasLimit = web3.toHex(100000); // 300000;
    let tot = gasPrice * gasLimit;
    let balance = web3.eth.getBalance('0x9d9e76d28371fdee907b4e8cf3d6a89330df18c5');
    console.log(`nonce: ${nonce}`);
    console.log(`gasPrice: ${gasPrice}`);
    console.log(`gasLimit: ${gasLimit}`);
    console.log(`hextot: ${tot}`);
    console.log(`balance: ${balance}`);
    console.log(`diff: ${balance - tot}`);

    const txParams = {
        nonce: nonce,
        from: '0x9d9e76d28371fdee907b4e8cf3d6a89330df18c5',
        gasPrice: gasPrice,
        gasLimit: gasLimit,
        to: '0x17b507dFA41656c9205b354FA69Fa292CD9FC702',
        value: '0x00',
        data: data,
        // EIP 155 chainId - mainnet: 1, ropsten: 3
        chainId: 3
    }
    console.log("txParams");
    console.log(txParams);

    const tx = new Transaction(txParams);

    console.log("tx");
    console.log(tx);

    tx.sign(privateKey);
    const serializedTx = `0x${tx.serialize().toString('hex')}`;
    console.log(serializedTx);

    // web3.eth.sendRawTransaction(serializedTx, (err, hash) => {
    //     if (err) {
    //         console.info(err);
    //     } else {
    //         console.log('Transaction hash: ', hash);
    //     }
    // });


    var options = {
        host: 'localhost',
        path: '/rawtransaction/',
        //since we are listening on a custom port, we need to specify it by hand
        port: '8080',
        //This is what changes the request to a POST request
        method: 'POST'
    };

    let req = http.request(options, (response) => {
        var str = ''
        response.on('data', function(chunk) {
            str += chunk;
        });

        response.on('end', function() {
            console.log(str);
        });
    });

    req.write(serializedTx);
    req.end();
}

if (test5) {
    var tx = new Transaction(null, 3);
    tx.nonce = 108;
    tx.gasPrice = 100;
    tx.gasLimit = 100000;
    tx.value = 0;
    tx.data = data;
    tx.sign(privateKey);

    var feeCost = tx.getUpfrontCost();
    tx.gas = feeCost;
    console.log('Total Amount of wei needed:' + feeCost.toString());

    console.log('---Serialized TX----');
    console.log(tx.serialize().toString('hex'));
    console.log('--------------------');
}
// https://api.etherscan.io/api?apikey=BMA2WWTB5WIUC9GAAH4UK1SY3T1AHYP2BV&module=proxy&action=eth_gasPrice
// 0x0a7cfb6a4e52573b767c47eb423dc2c2c2acdfe0c456239fff24573762eb1c9e

// curl http://localhost:8080/rawtransaction
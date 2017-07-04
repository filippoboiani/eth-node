import Web3 from 'web3';

let config = require("./resources/config");
// set web3
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider());
//web3.personal.unlockAccount(web3.eth.accounts[0], 'test-account-pwd', 150000);

const socialRecordContract = require('./build/contracts/SocialRecord'); // social record contract

const testInstance = web3.eth.contract(socialRecordContract.abi).at(config.contractAddress);
//console.log(testInstance);
let r = testInstance.getSocialRecord('1WQZLRE0PWU46VPD2RJ3231AO6ZRCI8YMMQLRC5KFYTTYB8UH0');
r = JSON.parse(r);
console.log(r);

// , { from: web3.eth.accounts[0] }, (error, result) => {
//     if (error)
//         console.log(error);
//     else {

//         console.log(result);
//     }
// }
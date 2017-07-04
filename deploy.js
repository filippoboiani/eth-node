import Web3 from 'web3';

// set web3
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider());
//web3.personal.unlockAccount(web3.eth.accounts[0], 'test-account-pwd');

const owned = require('./build/contracts/Owned');
const mortal = require('./build/contracts/Mortal');
const socialRecord = require('./build/contracts/SocialRecord');

let deploy = () => {
    web3.eth
        .contract(owned.abi)
        .new({
            from: web3.eth.accounts[0],
            data: owned.unlinked_binary,
            gas: '4700000'
        }, function(error, contract) {

            if (error)
                console.log(error);

            if (typeof contract.address !== 'undefined') {
                console.log(contract.address);
                deployMortal();
            }
        });
}

let deployMortal = () => {
    web3.eth
        .contract(mortal.abi)
        .new({
            from: web3.eth.accounts[0],
            data: mortal.unlinked_binary,
            gas: '4700000'
        }, function(error, contract) {

            if (error)
                console.log(error);

            if (typeof contract.address !== 'undefined') {
                console.log(contract.address);
                deploySocialRecord();
            }
        });
}

let deploySocialRecord = () => {
    web3.eth
        .contract(socialRecord.abi)
        .new({
            from: web3.eth.accounts[0],
            data: socialRecord.unlinked_binary,
            gas: '4700000'
        }, function(error, contract) {

            if (error)
                console.log(error);

            if (typeof contract.address !== 'undefined') {
                console.log(contract.address);
            }
        });
}

//deploy();
deploySocialRecord();
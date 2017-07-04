# ether-node

## How to
- You already have the node_modules 
- change wallet file with yours (inside the resources)
- change password 
- start geth with the following:
  `geth --fast --cache=512 --rpcapi personal,db,eth,net,web3 --rpc --testnet`
- run `babel-node index.js`

## If not working 
- If Windows: change path to wallet file (or use Linux)
- npm install babel (brew install babel...)
- npm install, again 

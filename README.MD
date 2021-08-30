
# Resources
- [GitHub Repo](https://github.com/magiclabs/example-optimism)
- [Demo](https://magic-optimism.vercel.app/login)

# Quick Start

```
$ git clone https://github.com/magiclabs/example-optimism.git
$ cd example-optimism
$ mv .env.example .env // enter your TEST API Key (from https://dashboard.magic.link)
$ yarn install
$ yarn start
```

# Introduction

## What is Optimism

[Optimism](https://optimism.io) (aka Optimistic Ethereum) is a new Layer 2 scaling solution for Ethereum. It uses "optimistic rollups" technology where transactions are submitted directly to the L2, "rolled up" into a single proof, then sent to the layer one chain (Ethereum) to be verified. With smart contract computations being done on L2 rather than L1, it allows for significantly faster and cheaper transactions.

Optimism is also interoperable with Ethereum and the Ethereum Virtual Machine (EVM) so smart contracts can easily be depolyed on Optimism without much/any refactoring.

With Magic, developers can connect to the Optimism network by simply specifying the network URL when initiating a Magic instance. This guide will show how you can create a web3-enabled app, allow users to switch between the Ethereum and Optimism networks, call smart contracts, and send transactions. 

## Connecting to Ethereum / Optimism

In `magic.js`, we will need two `Magic` and two `Web3` instances, one for each network, since we're allowing users to switch between the two. If you're only interested in connecting to Optimism, then only one instance of `Magic` and `Web3` should be created. We also are adding `magicEthereum.network = 'ethereum'` to be able to identify the Magic network we're creating.

You’ll use the same API key for both `Magic` instances so that the user’s public address does not change. 

```js
import { Magic } from 'magic-sdk';
import Web3 from 'web3';

const customNodeOptions = {
  rpcUrl: 'https://kovan.optimism.io',
  chainId: 69
}

// Setting network to Optimism Testnet
export const magicOptimism = new Magic(process.env.REACT_APP_MAGIC_PUBLISHABLE_KEY, { network: customNodeOptions });
magicOptimism.network = 'optimism'

export const web3Optimism = new Web3(magicOptimism.rpcProvider);

/** 
 * NOTE: when connecting to a testnet, TEST API keys must be used from the Magic dashboard (live API keys for mainnet)
 */

// Setting network to Ethereum (Ropsten Testnet)
export const magicEthereum = new Magic(process.env.REACT_APP_MAGIC_PUBLISHABLE_KEY, { network: 'kovan' });
magicEthereum.network = 'ethereum'

export const web3Ethereum = new Web3(magicEthereum.rpcProvider);
```

## Switching Between Networks

Users are able to switch between the Ethereum and Optimism networks with the `select` element dropdown list. Since one `Magic` instance points towards Ethereum, and the other Optimism, we simply update the instance that we’re using for our app based on whichever network the user selects.

```js
import { magicEthereum, magicOptimism } from '../magic';

  const [magic, setMagic] = useState(magicEthereum);

  const handleChangeNetwork = (e) => {
    e.target.value === 'ethereum' ? setMagic(magicEthereum) : setMagic(magicOptimism);
    fetchBalance(userMetadata.publicAddress);
    fetchContractMessage();
  }

  return (
    <div className='info'>
      <select name='network' onChange={(e) => handleChangeNetwork(e)}>
        <option value='ethereum'>Ethereum Testnet (Kovan)</option>
        <option value='optimism'>Optimism Testnet</option>
      </select>
    </div>
  )
```

## Viewing User Balance

A user's public address will be the same on both Ethereum and Optimism (as long as you are using the same API key for each instance) so a simple `web3.eth.getBalance` call is all that is needed for either network.

```js
const fetchBalance = (address) => {
  web3.eth.getBalance(address).then(bal => setBalance(web3.utils.fromWei(bal)))
}

return (
<h1>Balance</h1>
<div className="info">
  {balance.toString().substring(0, 6)} ETH
</div>
)
```

## Send Transaction

Sending a transaction is also very simple and similar for both networks. However, an important difference between the two is gas price and gas limit, as those values will be unique to each chain. 

For gas price on Ethereum, you can use `web3.eth.getGasPrice` however for transaction on Optimism, the gas price should be hard-coded to 15000000.

For the gas limit on Ethereum, you can hard-code in 21000, and transactions on Optimism need to be sent with a minimum of 820000.

```js
const web3 = magic.network === "ethereum" ? web3Ethereum : web3Optimism;

const sendTransaction = async () => {
  if (!toAddress || !amount) return;
  const { transactionHash } = await web3.eth.sendTransaction({
    from: publicAddress,
    to: toAddress,
    value: web3.utils.toWei(amount),
    gas: network === 'ethereum' ? 21000 : 820000,
    gasPrice: network === 'ethereum' ? await web3.eth.getGasPrice() : 15000000
  });
}

return (
 <div className="container">
  <h1>Send Transaction</h1>
  <input 
    type="text" 
    value={toAddress} 
    onChange={(e) => setToAddress(e.target.value)} 
    placeholder="To Address" 
  />
  <input 
    type="text" 
    value={amount} 
    onChange={(e) => setAmount(e.target.value)} 
    placeholder="Amount" 
  />
  <button onClick={sendTransaction}>Send Transaction</button>
</div>
)
```

## Calling Smart Contracts

Separate smart contracts will need to be deployed on each Ethereum and Optimism for your users to interact with them, so you'll need to know the address of each in order to call it. 

```js
const [message, setMessage] = useState('...');
const [newMessage, setNewMessage] = useState('');
const network = magic.network === 'ethereum' ? 'ethereum' : 'optimism';
const ethContractAddress = '0x62cB21dF5D7d6F6B9157C6aB27A2178fB180Ca20';
const optimismContractAddress = '0x62cB21dF5D7d6F6B9157C6aB27A2178fB180Ca20';
const contract = new web3.eth.Contract(abi, network === 'ethereum' ? ethContractAddress : optimismContractAddress);

// Grabbing `message` variable value stored in the smart contract
const fetchContractMessage = () => contract.methods.message().call().then(setMessage);

// Update contract `message` value on the blockchain
const updateContractMessage = async () => {
  if (!newMessage) return;

  // Estimate Gas Limit
  let gasLimit = await contract.methods.update(newMessage).estimateGas({});

  const { transactionHash } = await contract.methods.update(newMessage).send({ 
    from: publicAddress, 
    gas: gasLimit,
    gasPrice: network === 'ethereum' ? await web3.eth.getGasPrice() : 15000000
  });
}

return (
  <h1>Contract Message</h1>
  <div className="info">{message}</div>

  <h1>Update Message</h1>
  <input 
    type="text" 
    value={newMessage} 
    onChange={(e) => setNewMessage(e.target.value)} 
    placeholder="New Message" />

  <button onClick={updateContractMessage}>Update</button>
)
```

## Done

That's all there is to it! You've now got an app that allows users to create a wallet with just their email, and connect to the Optimism L2 and Ethereum networks within your app.

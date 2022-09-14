import React, { useState, useRef } from 'react';

export default function SendTransaction({ web3, network, publicAddress, fetchBalance }) {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [txnHash, setTxnHash] = useState();
  const sendTxBtnRef = useRef();

  const sendTransaction = async () => {
    if (!toAddress || !amount) return;
    disableForm();
    const { transactionHash } = await web3.eth.sendTransaction({
      from: publicAddress,
      to: toAddress,
      value: web3.utils.toWei(amount),
      gas: network === 'ethereum' ? 21000 : 820000,
      gasPrice: network === 'ethereum' ? await web3.eth.getGasPrice() : 15000000 // gasPrice for Optimism transactions should be set to 15000000
    });
    setTxnHash(transactionHash);
    enableForm();
  }

   // Disable input form while the transaction is being confirmed
   const disableForm = () => {
    setTxnHash();
    setDisabled(true);
    sendTxBtnRef.current.innerText = 'Submitted...';
  }

  // Re-enable input form once the transaction is confirmed
  const enableForm = () => {
    setDisabled(false);
    setToAddress('');
    setAmount('');
    fetchBalance(publicAddress);
    sendTxBtnRef.current.innerText = 'Send Transaction';
  }


  return (
    <div className='container'>
          <h1>Send Transaction</h1>
          <input type='text' disabled={disabled} value={toAddress} onChange={(e) => setToAddress(e.target.value)} className='full-width' placeholder='To Address' />
          <input type='text' disabled={disabled} value={amount} onChange={(e) => setAmount(e.target.value)} className='full-width' placeholder='Amount' />
          <button disabled={disabled} ref={sendTxBtnRef} onClick={sendTransaction}>Send Transaction</button>
          {
          txnHash &&
            <div className='info'>
              <a href={network === 'ethereum' ? `https://goerli.etherscan.io/tx/${txnHash}` : `https://goerli-optimism.etherscan.io/tx/${txnHash}`} target='_blank'>
                View Transaction
              </a> ↗️
            </div>
          }
        </div>
  )
}
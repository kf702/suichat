import React, { useState, useEffect, useCallback } from 'react'
import './App.css';
import { Input } from 'antd';
import * as datalib from './lib';
import { useWallet, ConnectModal, ConnectButton } from '@suiet/wallet-kit';

const shortenAddress = (address) => { return `${address.substring(0, 6)}...${address.substring(address.length - 4)}` }
const formatDate = (d) => { return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes(); }

const MsgItem = ({ msg }) => {
  return (
    <div style={{ margin: "10px" }}>
      <div style={{ color: '#888' }}>
        <span>{formatDate(new Date(msg.timestamp))}</span> <span>{shortenAddress(msg.sender)}</span> say:
        </div>
      <div>{msg.message}</div>
    </div>
  )
}

function App() {
  const [showModal, setShowModal] = useState(false)
  const wallet = useWallet()
  const [sending, setSending] = useState(false);
  const [msgs, setMsgs] = useState([]);

  async function handleSendMsg(address, msg) {
    try {
      const sui_id = await datalib.getSui(address, 100);
      if (!sui_id) {
        alert('wallet balance not enough');
        return;
      }
      const resData = await wallet.signAndExecuteTransaction({
        transaction: {
          kind: 'moveCall',
          data: {
            packageObjectId: datalib.ContractInfo.package,
            module: datalib.ContractInfo.module,
            function: 'send_msg',
            typeArguments: [],
            arguments: [
              datalib.ContractInfo.share,
              sui_id,
              msg,
            ],
            gasBudget: 10000,
          }
        }
      });
      console.log('successfully:', resData);
      alert('Send message successfully');
    } catch (err) {
      console.log(err);
    }
  }

  const onSend = async (value) => {
    if (!wallet.connected) {
      setShowModal(true);
      console.log('wait wallet');
      return;
    }
    if (!wallet.account) {
      alert('wallet has no account');
      return;
    }
    setSending(true);
    await handleSendMsg(wallet.account.address, value);
    setSending(false);
  }

  useEffect(() => {
    let subid = null;
    async function execute() {
      subid = await datalib.subscribeEvent((msgs) => {
        setMsgs(msgs);
      });
    }
    execute();
    return () => {
      if (subid) datalib.unsubscribeEvent(subid);
    }
  }, [])

  return (
    <div>
      <div
        style={{ textAlign: "center", fontSize: '28px', marginBottom: '30px' }} >
        {wallet.connected ?
          <div className="pull-right"><ConnectButton>Connect Wallet</ConnectButton></div>
          : ''}
        Sui Chat
      </div>
      <div style={{ height: '500px', margin: "20px auto", width: '490px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'auto' }}>
        {msgs.map((item, index) => <MsgItem key={index} msg={item} />)}
      </div>
      <div style={{ textAlign: "center" }}>
        <Input.Search style={{ width: '500px' }} size="large" placeholder="address" onSearch={onSend} enterButton="send" loading={sending} />
      </div>

      <ConnectModal
        open={showModal}
        onConnectSuccess={(name) => setShowModal(false)}
        onOpenChange={(open) => setShowModal(open)}
      />
    </div>
  );
}

export default App;

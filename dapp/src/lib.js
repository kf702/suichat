import { JsonRpcProvider, devnetConnection } from '@mysten/sui.js';

export const ContractInfo = {
  package: '0x81858aee1dc562e1102849aae8d4dbfecb91d395',
  module: 'chat',
  share: '0x39c0c72cde189ecf42ce5a63a7d07c1cb3a90210',
  eventType: '0x81858aee1dc562e1102849aae8d4dbfecb91d395::chat::MessageSended'
};

const provider = new JsonRpcProvider(devnetConnection);

export async function getSui(address, min) {
  try {
    const { data: coins } = await provider.getCoins(address, '0x2::sui::SUI');
    if (coins.length == 0) return null;
    for (let i = 0; i < coins.length; i++) {
      if (coins[i].balance >= min) return coins[i].coinObjectId;
    }
  } catch (err) {
    console.log(err)
  }
  return null;
}

export async function queryMsg() {
  const msgs = [];
  try {
    const { data: events } = await provider.getEvents({
      MoveModule: { package: ContractInfo.package, module: ContractInfo.module }
    });
    for (let i = 0; i < events.length; i++) {
      const moveEvent = events[i].event.moveEvent;
      if (!moveEvent) continue;
      if (moveEvent.type != ContractInfo.eventType) continue;
      msgs.unshift({
        timestamp: events[i].timestamp,
        sender: moveEvent.fields.sender,
        message: moveEvent.fields.message
      });
    }
  } catch (err) {
    console.log(err)
  }
  return msgs;
}

let storeMsgs = [];
export async function subscribeEvent(initMsgs, cb) {
  storeMsgs = initMsgs;
  const devnetNftFilter = {
    All: [
      { EventType: 'MoveEvent' },
      { Package: ContractInfo.package },
      { Module: ContractInfo.module },
      //{ MoveEventType: ContractInfo.eventType }
    ],
  };
  const subscriptionId = await provider.subscribeEvent(
    devnetNftFilter,
    (data) => {
      console.log('got event:', data);
      if (!data.event.moveEvent) return;
      storeMsgs.push({
        timestamp: data.timestamp,
        sender: data.event.moveEvent.fields.sender,
        message: data.event.moveEvent.fields.message
      });
      cb(storeMsgs);
    },
  );
  console.log('sub:', subscriptionId);
  return subscriptionId;
}
export async function unsubscribeEvent(subscriptionId) {
  console.log('unsub:', subscriptionId);
  await provider.unsubscribeEvent(subscriptionId);
}
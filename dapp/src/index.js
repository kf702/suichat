import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  WalletProvider,
  SuietWallet,
  SuiWallet,
  EthosWallet,
  IDefaultWallet,
} from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';

window.Buffer = window.Buffer || require("buffer").Buffer;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WalletProvider defaultWallets={[
      SuietWallet,
      SuiWallet,
      EthosWallet
    ]}>
      <App />
    </WalletProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

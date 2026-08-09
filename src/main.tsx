import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ============================================================================
// STEP 2 — VERIFY WHAT window.midnight ACTUALLY CONTAINS
// This runs at app load. Open browser DevTools Console and look for:
//   [CipherTrial] window.midnight = { lace: {...}, ... } if extension is installed
//   [CipherTrial] window.midnight = undefined           if NO extension detected
// ============================================================================
function logInjectedWalletState() {
  const wm = (window as any).midnight;
  const wc = (window as any).cardano;

  console.group('[CipherTrial] Injected Wallet State at Load');
  console.log('window.midnight:', wm ?? 'undefined — no Midnight extension detected');
  console.log('window.midnight.lace:', wm?.lace ?? 'not found');
  console.log("window.midnight['1am']:", wm?.['1am'] ?? 'not found');
  console.log('window.midnight.mnLace:', wm?.mnLace ?? 'not found');
  console.log('window.midnight.oneAm:', wm?.oneAm ?? 'not found');
  console.log('window.cardano:', wc ?? 'undefined');
  console.log('window.cardano.lace:', wc?.lace ?? 'not found');
  console.groupEnd();

  if (!wm && !wc) {
    console.warn('[CipherTrial] ⚠ No injected wallet extension detected. Install Lace or 1AM wallet extension to connect.');
  }
}

// Run on next tick to let extensions inject after page load
setTimeout(logInjectedWalletState, 500);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

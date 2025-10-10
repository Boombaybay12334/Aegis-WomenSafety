import React from 'react';
import { getSession } from '../services/accountService';

export default function Dashboard() {
  const session = getSession();

  if (!session) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <p className="subtitle">You are securely logged in.</p>
      <div className="info-box">
        <p><strong>Your Wallet Address:</strong></p>
        <p className="wallet-address" style={{ wordBreak: 'break-all' }}>{session.walletAddress}</p>
      </div>
       <div className="info-box">
        <p><strong>Your Decrypted Shard A (for this session):</strong></p>
        <p className="wallet-address" style={{ wordBreak: 'break-all', fontSize: '0.8em' }}>{session.decryptedShardA}</p>
        <p style={{fontSize: '0.9em', marginTop: '10px'}}>This shard is kept in memory only while you are logged in. It will be used to encrypt and decrypt your evidence files.</p>
      </div>
    </div>
  );
}
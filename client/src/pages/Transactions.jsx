import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Transactions = () => {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    api.get('/sales').then(res => setSales(res.data)).catch(console.error);
  }, []);

  return (
    <div className="container">
      <h1 className="text-gradient">Transaction History</h1>
      <p className="text-subtle mb-8">View all historical fuel sale records.</p>
      
      <div className="glass-card">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>ID</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Pump</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Amount</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr key={sale.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem' }}>{sale.id}</td>
                <td style={{ padding: '1rem' }}>{sale.pumpId}</td>
                <td style={{ padding: '1rem' }}>${sale.totalAmount}</td>
                <td style={{ padding: '1rem' }}>{new Date(sale.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;

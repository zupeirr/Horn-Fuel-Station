import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Pumps = () => {
  const [pumps, setPumps] = useState([]);
  
  useEffect(() => {
    api.get('/pumps').then(res => setPumps(res.data)).catch(console.error);
  }, []);

  return (
    <div className="container">
      <h1 className="text-gradient">Pumps & Tanks Inventory</h1>
      <p className="text-subtle mb-8">Manage your physical station inventory.</p>
      
      <div className="glass-card">
        {pumps.length === 0 ? (
          <p className="text-subtle">No pumps configured.</p>
        ) : (
          <ul>
            {pumps.map(p => (
              <li key={p.id}>{p.pumpNumber} - {p.status}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Pumps;

import React, { useState, useEffect } from 'react';
import api from '../services/api';

const NewSale = () => {
  return (
    <div className="container">
      <h1 className="text-gradient">Record New Sale</h1>
      <p className="text-subtle mb-8">Enter transaction details to dispense fuel.</p>
      
      <div className="glass-card" style={{ maxWidth: '600px' }}>
        <p className="text-subtle pb-4">Sale Module Interface goes here.</p>
        <button className="btn btn-primary" disabled>Process Sale</button>
      </div>
    </div>
  );
};

export default NewSale;

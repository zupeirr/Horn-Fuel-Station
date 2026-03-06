import React from 'react';

const Reports = () => {
  return (
    <div className="container">
      <h1 className="text-gradient">Daily Summary & Reports</h1>
      <p className="text-subtle mb-8">Generated reports on sales volume and revenue.</p>
      
      <div className="glass-card flex-center" style={{ minHeight: '300px' }}>
        <p className="text-subtle">Select a date range to generate a report.</p>
      </div>
    </div>
  );
};

export default Reports;

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { NavLink } from 'react-router-dom';
import { Droplet, DollarSign, Activity, Users } from 'lucide-react';

const DashboardCard = ({ title, value, icon, color }) => (
  <div className="glass-card">
    <div className="flex-between mb-4">
      <div className="text-subtle font-medium">{title}</div>
      <div style={{ background: `${color}20`, padding: '0.5rem', borderRadius: '50%' }}>
        {icon}
      </div>
    </div>
    <div className="text-gradient" style={{ fontSize: '1.875rem', fontWeight: '700' }}>
      {value}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    activePumps: 0,
    fuelTypes: 0,
    users: 0
  });

  useEffect(() => {
    // In a real app we would fetch dashboard aggregate stats from the backend
    setStats({
      totalSales: '$4,250.00',
      activePumps: 4,
      fuelTypes: 3,
      users: 2
    });
  }, []);

  return (
    <div className="container">
      <div className="flex-between mb-8">
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2rem' }}>Dashboard Overview</h1>
          <p className="text-subtle">Welcome back! Here's what's happening today.</p>
        </div>
        <NavLink to="/sales/new" className="btn btn-primary">
          Record New Sale
        </NavLink>
      </div>

      <div className="grid-cols-4 mb-8">
        <DashboardCard title="Today's Sales" value={stats.totalSales} icon={<DollarSign size={24} color="var(--success)" />} color="var(--success)" />
        <DashboardCard title="Active Pumps" value={stats.activePumps} icon={<Activity size={24} color="var(--accent-primary)" />} color="var(--accent-primary)" />
        <DashboardCard title="Fuel Varieties" value={stats.fuelTypes} icon={<Droplet size={24} color="var(--warning)" />} color="var(--warning)" />
        <DashboardCard title="Staff Members" value={stats.users} icon={<Users size={24} color="var(--accent-secondary)" />} color="var(--accent-secondary)" />
      </div>

      <div className="grid-cols-2">
        <div className="glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Transactions</h2>
          <div className="text-subtle" style={{ textAlign: 'center', padding: '2rem' }}>
            No recent transactions found.
          </div>
        </div>
        <div className="glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Tank Levels</h2>
          <div className="text-subtle" style={{ textAlign: 'center', padding: '2rem' }}>
            All tanks operating at normal capacity.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

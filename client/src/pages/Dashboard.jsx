import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { NavLink } from 'react-router-dom';
import { Droplet, DollarSign, Activity, Users, AlertTriangle, TrendingUp, Filter } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DashboardCard = ({ title, value, subtext, icon, color }) => (
  <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.1, color }}>
      {React.cloneElement(icon, { size: 80 })}
    </div>
    <div className="flex-between mb-4">
      <div className="text-subtle font-medium">{title}</div>
      <div style={{ background: `${color}20`, padding: '0.5rem', borderRadius: '12px' }}>
        {React.cloneElement(icon, { size: 20, color })}
      </div>
    </div>
    <div className="text-gradient" style={{ fontSize: '1.875rem', fontWeight: '800', marginBottom: '4px' }}>
      {value}
    </div>
    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtext}</div>
  </div>
);

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/reports/dashboard-summary');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="container flex-center" style={{ minHeight: '60vh', flexDirection: 'column' }}>
        <div className="loading-spinner"></div>
        <p className="mt-4 text-subtle">Aggregating real-time statistics...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex-between mb-8">
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '800' }}>Executive Overview</h1>
          <p className="text-subtle">Real-time business intelligence for Horn Fuel Station</p>
        </div>
        <div className="flex" style={{ gap: '1rem' }}>
          <button className="btn btn-secondary flex-center" style={{ gap: '0.5rem' }}>
            <Filter size={18} /> Filters
          </button>
          <NavLink to="/sales/new" className="btn btn-primary flex-center" style={{ gap: '0.5rem' }}>
             Record New Sale
          </NavLink>
        </div>
      </div>

      <div className="grid-cols-4 mb-8">
        <DashboardCard 
          title="Revenue (Today)" 
          value={`$${data.today.revenue.toLocaleString()}`} 
          subtext={`${data.today.transactions} Transactions`}
          icon={<DollarSign />} 
          color="#10b981" 
        />
        <DashboardCard 
          title="Active Pumps" 
          value={data.activePumps} 
          subtext="Operational"
          icon={<Activity />} 
          color="#3b82f6" 
        />
        <DashboardCard 
          title="Fuel Dispensed" 
          value={`${data.today.liters.toLocaleString()} L`} 
          subtext="Total Volume Today"
          icon={<Droplet />} 
          color="#f59e0b" 
        />
        <DashboardCard 
          title="Critical Alerts" 
          value={data.lowFuelAlerts} 
          subtext="Tanks below threshold"
          icon={<AlertTriangle />} 
          color="#ef4444" 
        />
      </div>

      <div className="grid-cols-2 mb-8">
        <div className="glass-card" style={{ height: '400px' }}>
          <div className="flex-between mb-6">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Sales Performance (7 Days)</h2>
            <TrendingUp size={20} color="var(--success)" />
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={data.salesTrend}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
              />
              <Tooltip 
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ height: '400px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '2rem' }}>Revenue Distribution</h2>
          <div className="flex-center" style={{ height: '80%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.fuelDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {data.fuelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ paddingLeft: '2rem' }}>
              {data.fuelDistribution.map((entry, index) => (
                <div key={entry.name} className="flex-center mb-2" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
                  <div style={{ fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: '600' }}>{entry.name}:</span>
                    <span className="text-subtle ml-2">${entry.value.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card mb-8">
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>Storage Tank Levels</h2>
        <div className="grid-cols-3">
          {data.tankLevels.map((tank) => (
            <div key={tank.name} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex-between mb-3">
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: '600' }}>{tank.name}</div>
                  <div className="text-subtle" style={{ fontSize: '0.75rem' }}>{tank.fuelType}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '700', color: tank.percentage < 20 ? 'var(--error)' : 'inherit' }}>{tank.percentage}%</div>
                  <div className="text-subtle" style={{ fontSize: '0.75rem' }}>{tank.level.toLocaleString()} / {tank.capacity.toLocaleString()} L</div>
                </div>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${tank.percentage}%`, 
                    height: '100%', 
                    background: tank.percentage < 20 ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                    borderRadius: '4px',
                    transition: 'width 1s ease-in-out'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LayoutDashboard, Fuel, PlusCircle, ListOrdered, BarChart3, LogOut, Settings } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, role: 'any' },
    { name: 'New Sale', path: '/sales/new', icon: <PlusCircle size={20} />, role: 'any' },
    { name: 'Transactions', path: '/transactions', icon: <ListOrdered size={20} />, role: 'any' },
    { name: 'Pumps & Tanks', path: '/inventory', icon: <Fuel size={20} />, role: 'any' },
    { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} />, role: 'admin' },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} />, role: 'admin' },
  ];

  return (
    <div className="sidebar" style={{ 
      width: '260px', 
      height: '100vh', 
      position: 'fixed', 
      left: 0, 
      top: 0, 
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(12px)',
      borderRight: '1px solid var(--glass-border)',
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100
    }}>
      <div className="logo mb-8">
        <h2 className="text-gradient" style={{ fontSize: '1.5rem', margin: 0 }}>HORN FUEL</h2>
        <span className="text-subtle text-xs uppercase cursor-default">Management System</span>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navLinks.map(link => {
          if (link.role === 'admin' && user?.role !== 'admin') return null;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                color: isActive ? 'white' : 'var(--text-muted)',
                background: isActive ? 'linear-gradient(135deg, var(--accent-primary) 0%, #2563eb 100%)' : 'transparent',
                fontWeight: isActive ? '600' : '500',
                transition: 'all var(--transition-fast)'
              })}
            >
              {link.icon}
              {link.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="user-profile mt-auto pt-6" style={{ borderTop: '1px solid var(--glass-border)' }}>
        <div className="flex-between mb-4">
          <div>
            <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{user?.username}</div>
            <div className="text-subtle text-xs capitalize">{user?.role}</div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Layout = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: '260px', flex: 1, minHeight: '100vh', padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

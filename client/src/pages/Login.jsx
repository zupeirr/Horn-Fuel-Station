import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Fuel, Lock, Mail } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div className="flex-center" style={{ flexDirection: 'column', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--accent-primary)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}>
            <Fuel size={32} color="white" />
          </div>
          <h2 className="text-gradient" style={{ margin: 0 }}>HORN FUEL</h2>
          <p className="text-subtle">Management System</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem' }} />
              <input
                type="email"
                className="input-field"
                style={{ paddingLeft: '2.75rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@hornfuel.com"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem' }} />
              <input
                type="password"
                className="input-field"
                style={{ paddingLeft: '2.75rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

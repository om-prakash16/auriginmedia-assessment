import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginApi(email, password);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center', color: '#0F172A' }}>Welcome Back</h1>
        
        {error && (
          <div style={{ padding: '0.75rem', background: '#FEE2E2', color: '#DC2626', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.9rem', color: '#475569' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="form-input"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.9rem', color: '#475569' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="form-input"
            />
          </div>
          
          <Button type="submit" variant="primary" disabled={loading} style={{ marginTop: '0.5rem', width: '100%' }}>
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: '500', textDecoration: 'none' }}>Sign Up</Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;

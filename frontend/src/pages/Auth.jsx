import { useState } from 'react';
import { login, register } from '../api/client';
import './Auth.css';

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({ name: '', email: 'admin@example.com', password: 'Admin@123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let res;
      if (mode === 'login') {
        res = await login({ email: form.email, password: form.password });
      } else {
        res = await register({ name: form.name, email: form.email, password: form.password });
      }
      
      const token = res.data.data.token;
      const user = res.data.data.user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      onAuthSuccess();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${mode}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-brand">₹ FinanceApp</h1>
        <h2 className="auth-title">{mode === 'login' ? 'Sign in to your account' : 'Create an account'}</h2>
        
        {error && <p className="auth-error">{error}</p>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="auth-group">
              <label>Name</label>
              <input 
                type="text" 
                required 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
              />
            </div>
          )}
          <div className="auth-group">
            <label>Email</label>
            <input 
              type="email" 
              required 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
            />
          </div>
          <div className="auth-group">
            <label>Password</label>
            <input 
              type="password" 
              required 
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
            />
          </div>
          
          <button className="auth-btn" disabled={loading}>
            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="auth-footer">
          {mode === 'login' ? (
            <p>New here? <button onClick={() => setMode('register')}>Create an account</button></p>
          ) : (
            <p>Already have an account? <button onClick={() => setMode('login')}>Sign in</button></p>
          )}
        </div>
      </div>
    </div>
  );
}

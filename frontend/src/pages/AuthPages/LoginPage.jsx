import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) {
      return setError('Please fill in all fields.');
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-page__bg-glow auth-page__bg-glow--left" />
      <div className="auth-page__bg-glow auth-page__bg-glow--right" />

      <div className="auth-card">
        <div className="auth-card__header">
          <span className="auth-card__logo">◈</span>
          <h1 className="auth-card__title">Welcome Back</h1>
          <p className="auth-card__subtitle">Sign in to your GameVault account</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__group">
            <label htmlFor="email" className="auth-form__label">Email Address</label>
            <input
              type="email" id="email" name="email"
              value={form.email} onChange={handleChange}
              placeholder="you@example.com"
              className="auth-form__input"
              autoComplete="email"
            />
          </div>

          <div className="auth-form__group">
            <label htmlFor="password" className="auth-form__label">Password</label>
            <input
              type="password" id="password" name="password"
              value={form.password} onChange={handleChange}
              placeholder="••••••••"
              className="auth-form__input"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="auth-form__submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-card__footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-card__link">Create one</Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;

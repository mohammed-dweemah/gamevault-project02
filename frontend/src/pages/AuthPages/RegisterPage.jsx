import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

const RegisterPage = () => {
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      return setError('Please fill in all fields.');
    }
    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.confirm);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <h1 className="auth-card__title">Create Account</h1>
          <p className="auth-card__subtitle">Join GameVault and start exploring</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__group">
            <label htmlFor="name" className="auth-form__label">Full Name</label>
            <input
              type="text" id="name" name="name"
              value={form.name} onChange={handleChange}
              placeholder="Full Name" className="auth-form__input"
              autoComplete="name"
            />
          </div>

          <div className="auth-form__group">
            <label htmlFor="email" className="auth-form__label">Email Address</label>
            <input
              type="email" id="email" name="email"
              value={form.email} onChange={handleChange}
              placeholder="you@example.com" className="auth-form__input"
              autoComplete="email"
            />
          </div>

          <div className="auth-form__group">
            <label htmlFor="password" className="auth-form__label">Password</label>
            <input
              type="password" id="password" name="password"
              value={form.password} onChange={handleChange}
              placeholder="Min. 6 characters" className="auth-form__input"
              autoComplete="new-password"
            />
          </div>

          <div className="auth-form__group">
            <label htmlFor="confirm" className="auth-form__label">Confirm Password</label>
            <input
              type="password" id="confirm" name="confirm"
              value={form.confirm} onChange={handleChange}
              placeholder="Repeat your password" className="auth-form__input"
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="auth-form__submit auth-form__submit--register" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-card__link">Sign in</Link>
        </p>
      </div>
    </main>
  );
};

export default RegisterPage;

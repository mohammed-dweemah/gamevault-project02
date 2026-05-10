import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

const RegisterPage = () => {
  const [form, setForm]           = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, refreshSession } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm)
      return setError('Please fill in all fields.');
    if (form.password !== form.confirm)
      return setError('Passwords do not match.');
    if (form.password.length < 6)
      return setError('Password must be at least 6 characters.');

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.confirm);
      // إعادة التحقق من الـ session بعد التسجيل (مهم للهاتف)
      await refreshSession();
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
            <div className="auth-form__input-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                id="password" name="password"
                value={form.password} onChange={handleChange}
                placeholder="Min. 6 characters"
                className="auth-form__input auth-form__input--icon"
                autoComplete="new-password"
              />
              <button type="button" className="auth-form__eye-btn"
                onClick={() => setShowPass(p => !p)} tabIndex={-1}
                aria-label={showPass ? 'Hide password' : 'Show password'}>
                <EyeIcon open={showPass} />
              </button>
            </div>
          </div>

          <div className="auth-form__group">
            <label htmlFor="confirm" className="auth-form__label">Confirm Password</label>
            <div className="auth-form__input-wrapper">
              <input
                type={showConfirm ? 'text' : 'password'}
                id="confirm" name="confirm"
                value={form.confirm} onChange={handleChange}
                placeholder="Repeat your password"
                className="auth-form__input auth-form__input--icon"
                autoComplete="new-password"
              />
              <button type="button" className="auth-form__eye-btn"
                onClick={() => setShowConfirm(p => !p)} tabIndex={-1}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                <EyeIcon open={showConfirm} />
              </button>
            </div>
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

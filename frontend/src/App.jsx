import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header/Header';
import MainPage from './pages/MainPage/MainPage';
import LoginPage from './pages/AuthPages/LoginPage';
import RegisterPage from './pages/AuthPages/RegisterPage';
import AboutPage from './pages/AboutPage/AboutPage';
import AddGamePage from './pages/AddGamePage/AddGamePage';
import MyGamesPage from './pages/MyGamesPage/MyGamesPage';
import './App.css';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><span className="loading-spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/add-game" element={
          <ProtectedRoute><AddGamePage /></ProtectedRoute>
        } />
        <Route path="/my-games" element={
          <ProtectedRoute><MyGamesPage /></ProtectedRoute>
        } />
        <Route path="/edit-game/:id" element={
          <ProtectedRoute><AddGamePage /></ProtectedRoute>
        } />
        <Route path="*" element={
          <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '16px',
            paddingTop: '68px', fontFamily: 'Syne, sans-serif'
          }}>
            <span style={{ fontSize: '64px', color: 'var(--text-dim)' }}>◎</span>
            <h1 style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-2px' }}>404</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Page not found.</p>
            <a href="/" style={{
              marginTop: '8px', padding: '10px 24px', background: 'var(--accent)',
              borderRadius: '8px', color: '#fff', fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px', fontWeight: 600
            }}>Back to Library</a>
          </div>
        } />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

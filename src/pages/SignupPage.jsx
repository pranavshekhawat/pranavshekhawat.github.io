import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Signup Page - New user registration for Soap Lab
 */
export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, name.trim());
      navigate('/lab/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      navigate('/lab/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Failed to sign in with Google. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Logo */}
        <div className="auth-logo">
          <span className="logo-icon">🧪</span>
          <span className="logo-text">Soap Lab</span>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start your soap making journey</p>

        {/* Error Message */}
        {error && (
          <div className="auth-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Google Sign In */}
        <button 
          onClick={handleGoogleSignIn} 
          className="auth-google-btn"
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
            <span className="form-hint">At least 6 characters</span>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-terms">
          By signing up, you agree to our{' '}
          <a href="/terms" target="_blank">Terms of Service</a> and{' '}
          <a href="/privacy" target="_blank">Privacy Policy</a>
        </p>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>

        {/* Free Plan Info */}
        <div className="free-plan-info">
          <div className="plan-header">✨ Start free, upgrade later</div>
          <ul className="plan-features">
            <li>✓ 5 recipes</li>
            <li>✓ 20 ingredients</li>
            <li>✓ 10 batches</li>
            <li>✓ Basic calculator</li>
          </ul>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .auth-container {
          width: 100%;
          max-width: 400px;
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }

        .auth-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 24px;
        }

        .auth-logo .logo-icon {
          font-size: 2rem;
        }

        .auth-logo .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: #5c6bc0;
        }

        .auth-title {
          font-size: 1.5rem;
          font-weight: 700;
          text-align: center;
          margin: 0 0 8px;
          color: #1a1a1a;
        }

        .auth-subtitle {
          text-align: center;
          color: #666;
          margin: 0 0 24px;
        }

        .auth-error {
          background: #fff5f5;
          border: 1px solid #feb2b2;
          color: #c53030;
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 16px;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .auth-google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 12px 20px;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 500;
          color: #333;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .auth-google-btn:hover {
          border-color: #5c6bc0;
          background: #fafafa;
        }

        .auth-google-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          margin: 24px 0;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e0e0e0;
        }

        .auth-divider span {
          padding: 0 16px;
          color: #999;
          font-size: 0.9rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #333;
        }

        .form-group input {
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #5c6bc0;
          box-shadow: 0 0 0 3px rgba(92, 107, 192, 0.1);
        }

        .form-hint {
          font-size: 0.8rem;
          color: #999;
        }

        .auth-submit-btn {
          padding: 14px 20px;
          background: linear-gradient(135deg, #5c6bc0 0%, #3949ab 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 8px;
        }

        .auth-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(92, 107, 192, 0.4);
        }

        .auth-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .auth-terms {
          text-align: center;
          margin-top: 16px;
          color: #999;
          font-size: 0.8rem;
        }

        .auth-terms a {
          color: #5c6bc0;
          text-decoration: none;
        }

        .auth-terms a:hover {
          text-decoration: underline;
        }

        .auth-switch {
          text-align: center;
          margin-top: 16px;
          color: #666;
          font-size: 0.9rem;
        }

        .auth-switch a {
          color: #5c6bc0;
          font-weight: 600;
          text-decoration: none;
        }

        .auth-switch a:hover {
          text-decoration: underline;
        }

        .free-plan-info {
          margin-top: 24px;
          padding: 16px;
          background: linear-gradient(135deg, #f5f7ff 0%, #ede7f6 100%);
          border-radius: 12px;
          text-align: center;
        }

        .plan-header {
          font-weight: 600;
          color: #5c6bc0;
          margin-bottom: 12px;
        }

        .plan-features {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }

        .plan-features li {
          font-size: 0.8rem;
          color: #666;
          background: white;
          padding: 4px 10px;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}

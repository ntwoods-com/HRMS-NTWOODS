import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { GoogleOAuthButton } from '../auth/GoogleOAuthButton';
import { useAuth } from '../auth/useAuth';
import '../styles/login.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { loginWithGoogleIdToken, loginWithEmployeeId } = useAuth();

  const [employeeId, setEmployeeId] = useState('');
  const [empLoading, setEmpLoading] = useState(false);

  const onCredential = useCallback(
    async (idToken) => {
      try {
        await loginWithGoogleIdToken(idToken);
        navigate('/dashboard', { replace: true });
      } catch (e) {
        toast.error(e?.message ?? 'Login failed');
      }
    },
    [loginWithGoogleIdToken, navigate]
  );

  const onEmployeeLogin = useCallback(
    async () => {
      const id = String(employeeId || '').trim();
      if (!id) {
        toast.error('Enter Employee ID');
        return;
      }
      setEmpLoading(true);
      try {
        await loginWithEmployeeId(id);
        navigate('/employee/trainings', { replace: true });
      } catch (e) {
        toast.error(e?.message ?? 'Login failed');
      } finally {
        setEmpLoading(false);
      }
    },
    [employeeId, loginWithEmployeeId, navigate]
  );

  return (
    <div className="login-page">
      {/* Animated background elements */}
      <div className="login-bg">
        <div className="login-bg-shape shape-1" />
        <div className="login-bg-shape shape-2" />
        <div className="login-bg-shape shape-3" />
        <div className="login-bg-grid" />
      </div>

      {/* 3D Login Card */}
      <div className="login-card-wrapper">
        <div className="login-card">
          {/* Glowing logo */}
          <div className="login-logo">
            <div className="login-logo-inner">NT</div>
            <div className="login-logo-glow" />
          </div>

          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to NT Woods HRMS Portal</p>

          <div className="login-divider">
            <span>Continue with</span>
          </div>

          <GoogleOAuthButton onCredential={onCredential} />

          <div className="login-hint">
            Use your NT Woods authorized Google account
          </div>

          <div className="login-separator">
            <span>OR</span>
          </div>

          <div className="login-employee-section">
            <div className="login-employee-label">Employee Login</div>
            <div className="login-employee-form">
              <input
                className="login-input"
                placeholder="Enter Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                autoComplete="off"
              />
              <button 
                className="login-btn primary" 
                type="button" 
                onClick={onEmployeeLogin} 
                disabled={empLoading}
              >
                {empLoading ? (
                  <span className="login-btn-loading">
                    <span className="spinner" />
                    Signing in...
                  </span>
                ) : (
                  'Login with Employee ID'
                )}
              </button>
            </div>
          </div>

          <p className="login-footer">
            Access denied? <a href="mailto:admin@ntwoods.com">Contact Administrator</a>
          </p>

          <p className="login-credit">Designed & Developed by Rajesh Jadoun</p>
        </div>

        {/* 3D shadow effect */}
        <div className="login-card-shadow" />
      </div>
    </div>
  );
}

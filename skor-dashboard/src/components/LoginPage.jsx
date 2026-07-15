import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Shield } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        onLogin();
      } else {
        setError('Invalid username or password.');
      }
    } catch (err) {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Background Decorative Elements */}
      <div className="bg-shape bg-shape-1"></div>
      <div className="bg-shape bg-shape-2"></div>
      
      {/* Faint Background Shield */}
      <div className="bg-shield">
        <Shield size={400} strokeWidth={1} />
      </div>

      <div className="login-card fade-in-up">
        {/* Header */}
        <div className="login-header">
          <div className="shield-icon-container">
            <Shield size={28} className="shield-icon" strokeWidth={2.5} />
            <div className="shield-inner-lock">
              <Lock size={12} strokeWidth={3} />
            </div>
          </div>
          <h1>Admin Login</h1>
          <p>Please sign in to continue to the admin dashboard</p>
        </div>

        {error && (
          <div className="error-message shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Username</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon left-icon" />
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon left-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="toggle-password" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          Secure access to admin panel
        </div>
      </div>

      <style>{`
        /* Container */
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f4f7fb;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* Abstract Background Shapes */
        .bg-shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
          animation: float 15s infinite ease-in-out alternate;
        }
        .bg-shape-1 {
          width: 600px;
          height: 600px;
          background: rgba(59, 130, 246, 0.15); /* blue */
          bottom: -10%;
          left: -10%;
          animation-delay: 0s;
        }
        .bg-shape-2 {
          width: 500px;
          height: 500px;
          background: rgba(147, 197, 253, 0.1); /* light blue */
          top: -10%;
          left: 10%;
          animation-delay: -5s;
        }

        .bg-shield {
          position: absolute;
          left: 10%;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(59, 130, 246, 0.05);
          z-index: 0;
          animation: floatSlow 20s infinite ease-in-out;
        }

        /* Login Card */
        .login-card {
          background: #ffffff;
          width: 100%;
          max-width: 440px;
          border-radius: 20px;
          padding: 3rem 2.5rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
          z-index: 1;
          position: relative;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .login-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
        }

        /* Header */
        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        
        .shield-icon-container {
          width: 64px;
          height: 64px;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          color: #3b82f6; /* Blue */
          animation: pulseIcon 4s infinite ease-in-out;
        }
        .shield-inner-lock {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -40%);
          background: #3b82f6;
          color: white;
          padding: 4px;
          border-radius: 50%;
        }

        .login-header h1 {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.5rem;
          letter-spacing: -0.5px;
        }
        .login-header p {
          font-size: 0.95rem;
          color: #64748b;
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.6rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          color: #94a3b8;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .left-icon {
          left: 1rem;
        }

        .input-wrapper input {
          width: 100%;
          padding: 1rem 1rem 1rem 2.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          color: #1e293b;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: #f8fafc;
        }
        .input-wrapper input::placeholder {
          color: #cbd5e1;
        }
        
        .input-wrapper input:focus {
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        }
        .input-wrapper input:focus + .left-icon,
        .input-wrapper input:focus ~ .left-icon {
          color: #3b82f6;
        }

        .toggle-password {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          transition: all 0.2s;
        }
        .toggle-password:hover {
          color: #3b82f6;
        }

        .login-button {
          width: 100%;
          padding: 1rem;
          margin-top: 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        .login-button:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
        .login-button:active:not(:disabled) {
          transform: translateY(0px);
        }
        .login-button:disabled {
          background: #93c5fd;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Error */
        .error-message {
          background: #fee2e2;
          color: #ef4444;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.875rem;
          text-align: center;
          margin-bottom: 1rem;
          border: 1px solid #fca5a5;
        }

        /* Footer */
        .login-footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.8rem;
          color: #94a3b8;
        }

        /* Spinner */
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Animations */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, -30px) scale(1.05); }
        }
        @keyframes floatSlow {
          0% { transform: translate(0, -50%); }
          50% { transform: translate(0, -55%); }
          100% { transform: translate(0, -50%); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseIcon {
          0% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(59,130,246,0)); }
          50% { transform: scale(1.02); filter: drop-shadow(0 4px 8px rgba(59,130,246,0.3)); }
          100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(59,130,246,0)); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}
import React, { useState } from 'react';

export const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === '123456') {
      sessionStorage.setItem('isLoggedIn', 'true');
      onLoginSuccess();
    } else {
      setErrorMsg('Invalid Username or Password');
    }
  };

  return (
    <div className="login-backdrop">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>ANPR Surveillance Portal</h2>
        <p className="login-subtitle">Sign in to access live CCTV camera feeds</p>

        {errorMsg && <div className="error-alert">{errorMsg}</div>}

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            required
          />
        </div>

        <button type="submit" className="login-btn">
          Sign In
        </button>
      </form>
    </div>
  );
};
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/auth';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(username, password);
      localStorage.setItem('token', response.data.access_token);
      navigate('/exams');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={containerStyle}>
      <h2>Login</h2>
      {error && <p style={errorStyle}>{error}</p>}
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={inputGroupStyle}>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div style={inputGroupStyle}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <button type="submit" style={buttonStyle}>Login</button>
      </form>
      <p>Don't have an account? <Link to="/register">Register here</Link></p>
    </div>
  );
};

const containerStyle = {
  maxWidth: '400px',
  margin: '50px auto',
  padding: '20px',
  border: '1px solid #ddd',
  borderRadius: '5px'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column'
};

const inputGroupStyle = {
  marginBottom: '15px'
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  marginTop: '5px',
  border: '1px solid #ddd',
  borderRadius: '3px'
};

const buttonStyle = {
  padding: '10px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '3px',
  cursor: 'pointer'
};

const errorStyle = {
  color: 'red',
  marginBottom: '15px'
};

export default Login;

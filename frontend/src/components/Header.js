import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header style={headerStyle}>
      <h1>LeadMasters Exam Portal</h1>
      <nav>
        {token ? (
          <>
            <Link to="/exams" style={linkStyle}>Exams</Link>
            <Link to="/results" style={linkStyle}>Results</Link>
            <button onClick={handleLogout} style={buttonStyle}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem',
  backgroundColor: '#333',
  color: 'white'
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  margin: '0 10px'
};

const buttonStyle = {
  backgroundColor: '#d9534f',
  color: 'white',
  border: 'none',
  padding: '5px 10px',
  borderRadius: '3px',
  cursor: 'pointer',
  marginLeft: '10px'
};

export default Header;

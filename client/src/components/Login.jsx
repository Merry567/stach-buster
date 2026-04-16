import { useState } from 'react';
import API from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  // Stores the form inputs
  const [formData, setFormData] = useState({ email: '', password: '' });

  // Stores any error message from login
  const [error, setError] = useState('');

  // Tracks whether the form is currently submitting
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Updates the form fields as the user types
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handles login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/auth/login', formData);

      // Save token for future authenticated requests
      localStorage.setItem('token', response.data.token);

      alert('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Stash Buster</h1>
          <p className="login-subtitle">Sign in to your yarn stash</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
            className="login-input"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="login-input"
          />

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="login-footer">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="login-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
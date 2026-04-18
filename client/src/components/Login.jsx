import { useState } from 'react';
import API from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { theme, sharedStyles } from '../styles/theme';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      alert('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (fieldName) => ({
    ...sharedStyles.input,
    borderColor:
      focusedField === fieldName
        ? theme.colors.focus
        : theme.colors.inputBorder,
    boxShadow:
      focusedField === fieldName
        ? '0 0 0 3px rgba(168, 85, 247, 0.18)'
        : 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  });

  return (
    <div style={styles.pageCentered}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Stash Buster</h1>
          <p style={styles.subtitle}>Sign in to your yarn stash</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField('')}
            required
            style={getInputStyle('email')}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField('')}
            required
            style={getInputStyle('password')}
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p style={styles.footer}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={styles.link}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  pageCentered: {
    ...sharedStyles.page,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    ...sharedStyles.card,
    width: '100%',
    maxWidth: '420px',
  },

  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },

  title: sharedStyles.title,

  subtitle: sharedStyles.subtitle,

  error: sharedStyles.errorBox,

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  },

  button: {
    ...sharedStyles.primaryButton,
    width: '100%',
  },

  footer: {
    textAlign: 'center',
    marginTop: '22px',
    color: theme.colors.subtext,
    fontSize: theme.fontSizes.small,
  },

  link: {
    color: theme.colors.secondary,
    textDecoration: 'none',
    fontWeight: 500,
  },
};

export default Login;
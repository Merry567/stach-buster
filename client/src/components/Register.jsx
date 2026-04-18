import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { theme, sharedStyles } from '../styles/theme';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validatePassword = (password) => {
    return /^(?=.*[A-Z])(?=.*\\d).{8,}$/.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError(
        'Password must be at least 8 characters and include one uppercase letter and one number'
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await API.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          <p style={styles.subtitle}>Create your account</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField('')}
            style={getInputStyle('name')}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField('')}
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
            style={getInputStyle('password')}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onFocus={() => setFocusedField('confirmPassword')}
            onBlur={() => setFocusedField('')}
            style={getInputStyle('confirmPassword')}
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>
            Login
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

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  },

  button: {
    ...sharedStyles.primaryButton,
    width: '100%',
  },

  error: sharedStyles.errorBox,

  success: {
    background: '#dcfce7',
    color: '#166534',
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    marginBottom: '18px',
    fontSize: theme.fontSizes.small,
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

export default Register;
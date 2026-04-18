import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { theme, sharedStyles } from '../styles/theme';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/login');
          return;
        }

        const response = await API.get('/auth/me');
        setUser(response.data);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Your session expired or could not be loaded.');
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={styles.pageCentered}>
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Loading dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageCentered}>
      <div style={styles.card}>
        <h1 style={styles.title}>Stash Buster</h1>

        {error && <div style={styles.error}>{error}</div>}

        {user && (
          <div style={styles.infoBox}>
            <p style={styles.welcomeText}>
              <strong>Welcome</strong> {user.name || 'User'}
            </p>
          </div>
        )}

        <div style={styles.buttonGroup}>
          <button
            type="button"
            style={styles.primaryButton}
            onClick={() => navigate('/stash')}
          >
            My Yarn Stash
          </button>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={() => navigate('/patterns')}
          >
            My Patterns
          </button>

          <button
            type="button"
            style={styles.logoutButton}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageCentered: {
    ...sharedStyles.page,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    ...sharedStyles.card,
    width: '100%',
    maxWidth: '500px',
    textAlign: 'center',
  },

  title: {
    ...sharedStyles.title,
    marginBottom: theme.spacing.lg,
  },

  sectionTitle: sharedStyles.sectionTitle,

  infoBox: {
    textAlign: 'left',
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.cardAltBg,
    borderRadius: theme.radius.sm,
    border: `1px solid ${theme.colors.border}`,
  },

  welcomeText: {
    margin: 0,
    color: theme.colors.text,
    fontSize: theme.fontSizes.body,
  },

  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
  },

  primaryButton: {
    ...sharedStyles.primaryButton,
    width: '100%',
  },

  logoutButton: {
    ...sharedStyles.dangerButton,
    width: '100%',
  },

  error: sharedStyles.errorBox,
};

export default Dashboard;
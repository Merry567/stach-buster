import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

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
      <div style={styles.page}>
        <div style={styles.card}>
          <h2>Loading dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Stash Buster Dashboard</h1>

        {error && <p style={styles.error}>{error}</p>}

        {user && (
          <div style={styles.infoBox}>
            <p><strong>Welcome:</strong> {user.name || 'User'}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        )}

        <div style={styles.buttonGroup}>
          <button style={styles.button} onClick={() => navigate('/stash')}>
            My Yarn Stash
          </button>

          <button style={styles.button} onClick={() => navigate('/patterns')}>
            My Patterns
          </button>

          <button style={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f3ff',
    padding: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '14px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '500px',
    textAlign: 'center',
  },
  title: {
    marginBottom: '20px',
    color: '#4b2e83',
  },
  infoBox: {
    textAlign: 'left',
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#f3ecff',
    borderRadius: '10px',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#7c5cff',
    color: 'white',
    cursor: 'pointer',
  },
  logoutButton: {
    padding: '12px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#d9534f',
    color: 'white',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginBottom: '16px',
  },
};

export default Dashboard;
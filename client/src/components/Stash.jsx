import { useNavigate } from 'react-router-dom';

const Stash = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>My Yarn Stash</h1>
        <p style={styles.text}>
          This page will display your yarn inventory soon.
        </p>

        <div style={styles.infoBox}>
          <p><strong>Planned features:</strong></p>
          <ul style={styles.list}>
            <li>View all yarn entries</li>
            <li>Add new yarn</li>
            <li>Edit yarn details</li>
            <li>Delete yarn entries</li>
            <li>Filter by brand, color, or weight</li>
          </ul>
        </div>

        <button style={styles.button} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
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
    maxWidth: '550px',
    textAlign: 'center',
  },
  title: {
    marginBottom: '16px',
    color: '#4b2e83',
  },
  text: {
    marginBottom: '20px',
    fontSize: '16px',
  },
  infoBox: {
    textAlign: 'left',
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#f3ecff',
    borderRadius: '10px',
  },
  list: {
    paddingLeft: '20px',
    marginTop: '10px',
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
};

export default Stash;
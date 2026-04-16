import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Stash = () => {
  const navigate = useNavigate();

  // Stores all yarn entries from the backend
  const [stash, setStash] = useState([]);

  // Search bar text
  const [search, setSearch] = useState('');

  // Loading state while fetching the stash
  const [loading, setLoading] = useState(true);

  // Error message for fetch/delete issues
  const [error, setError] = useState('');

  // Load the stash when the page first opens
  useEffect(() => {
    fetchStash();
  }, []);

  // Gets the current yarn stash from the API
  const fetchStash = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/stash');
      setStash(response.data);
    } catch (err) {
      console.error('Error fetching stash:', err);
      setError('Could not load yarn stash.');
    } finally {
      setLoading(false);
    }
  };

  // Filters the stash based on the search box
  const filteredStash = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return stash;

    return stash.filter((item) =>
      [
        item.brand,
        item.color,
        item.weight,
        item.fiberContent,
        item.dyeLot,
        item.notes,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }, [stash, search]);

  // Deletes a yarn entry
  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this yarn entry?');
    if (!confirmed) return;

    try {
      await API.delete(`/stash/${id}`);
      setStash((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error('Error deleting yarn:', err);
      setError('Could not delete yarn entry.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <h1 style={styles.title}>My Yarn Stash</h1>

          <div style={styles.topButtonRow}>
            <button
              style={styles.secondaryButton}
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>

            <button
              style={styles.primaryButton}
              onClick={() => navigate('/stash/new')}
            >
              Add Yarn
            </button>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.card}>
          <div style={styles.listHeader}>
            <h2 style={styles.sectionTitle}>Saved Yarn</h2>

            <input
              type="text"
              placeholder="Search by brand, color, weight..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {loading ? (
            <p>Loading stash...</p>
          ) : filteredStash.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No yarn entries found.</p>
              <button
                style={styles.primaryButton}
                onClick={() => navigate('/stash/new')}
              >
                Add Your First Yarn
              </button>
            </div>
          ) : (
            <div style={styles.list}>
              {filteredStash.map((item) => (
                <div key={item._id} style={styles.itemCard}>
                  <div style={styles.itemContent}>
                    <h3 style={styles.itemTitle}>
                      {item.brand} — {item.color}
                    </h3>
                    <p><strong>Fiber:</strong> {item.fiberContent}</p>
                    <p><strong>Weight:</strong> {item.weight}</p>
                    <p><strong>Grams:</strong> {item.grams}</p>
                    <p><strong>Yardage:</strong> {item.yardage ?? '—'}</p>
                    <p><strong>Quantity:</strong> {item.quantity}</p>
                    <p><strong>Dye Lot:</strong> {item.dyeLot || '—'}</p>
                    <p><strong>Notes:</strong> {item.notes || '—'}</p>
                  </div>

                  <div style={styles.itemButtons}>
                    <button
                      style={styles.editButton}
                      onClick={() => navigate(`/stash/edit/${item._id}`)}
                    >
                      Edit
                    </button>

                    <button
                      style={styles.deleteButton}
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  //background
  page: {
    minHeight: '100vh',
    backgroundColor: '#F5D7E3',
    padding: '24px',
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  topButtonRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },

  //title
  title: {
    margin: 0,
    color: '#11001C',
  },

  //yarn card
  card: {
    backgroundColor: '#fcf1f5',
    borderRadius: '14px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    padding: '24px',
    marginBottom: '24px',
  },
  sectionTitle: {
    marginTop: 0,
    color: '#40006a',
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  searchInput: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #fcf1f5',
    minWidth: '260px',
  },
  list: {
    display: 'grid',
    gap: '16px',
  },
  itemCard: {
    border: '1px solid #e3d8ff',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
    backgroundColor: '#faf8ff',
  },
  itemContent: {
    flex: 1,
    minWidth: '240px',
  },
  itemTitle: {
    marginTop: 0,
    marginBottom: '10px',
    color: '#4b2e83',
  },
  itemButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minWidth: '100px',
  },
  primaryButton: {
    padding: '12px 16px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#7c5cff',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '15px',
  },
  secondaryButton: {
    padding: '10px 14px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#7c5cff',
    color: '#fff',
    cursor: 'pointer',
  },
  editButton: {
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#5b8def',
    color: '#fff',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#d9534f',
    color: '#fff',
    cursor: 'pointer',
  },
  emptyState: {
    display: 'grid',
    gap: '12px',
    justifyItems: 'start',
  },
  emptyText: {
    margin: 0,
  },
  error: {
    color: '#b00020',
    marginBottom: '16px',
  },
};

export default Stash;
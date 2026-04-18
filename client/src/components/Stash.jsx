import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { theme, sharedStyles } from '../styles/theme';

const Stash = () => {
  const navigate = useNavigate();

  const [stash, setStash] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const estimatedYardsPerGram = {
    '0 - Lace': 6.75,
    '1 - Super Fine': 4.2,
    '2 - Fine': 3.3,
    '3 - Light': 2.6,
    '4 - Medium': 2.2,
    '5 - Bulky': 1.45,
    '6 - Super Bulky': 0.9,
    '7 - Jumbo': 0.6,
  };

  useEffect(() => {
    fetchStash();
  }, []);

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

  const getDisplayYardage = (item) => {
    if (item.yardageSource === 'user' && item.yardage != null) {
      return `${item.yardage} yd`;
    }

    if (item.estimatedYardage != null) {
      return `${item.estimatedYardage} yd (estimated)`;
    }

    if (
      item.yardage == null &&
      item.grams != null &&
      estimatedYardsPerGram[item.weight]
    ) {
      return `${Math.round(item.grams * estimatedYardsPerGram[item.weight])} yd (estimated)`;
    }

    if (item.yardage != null) {
      return `${item.yardage} yd`;
    }

    return '—';
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <h1 style={styles.title}>My Yarn Stash</h1>

          <div style={styles.topButtonRow}>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>

            <button
              type="button"
              style={styles.primaryButton}
              onClick={() => navigate('/stash/new')}
            >
              Add Yarn
            </button>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

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
            <p style={styles.statusText}>Loading stash...</p>
          ) : filteredStash.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No yarn entries found.</p>
              <button
                type="button"
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
                    <p><strong>Yardage:</strong> {getDisplayYardage(item)}</p>
                    <p><strong>Quantity:</strong> {item.quantity}</p>
                    <p><strong>Dye Lot:</strong> {item.dyeLot || '—'}</p>
                    <p><strong>Notes:</strong> {item.notes || '—'}</p>
                  </div>

                  <div style={styles.itemButtons}>
                    <button
                      type="button"
                      style={styles.editButton}
                      onClick={() => navigate(`/stash/edit/${item._id}`)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
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
  page: sharedStyles.page,

  container: sharedStyles.container,

  topBar: sharedStyles.topBar,

  topButtonRow: {
    display: 'flex',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },

  title: sharedStyles.title,

  card: {
    ...sharedStyles.sectionCard,
    marginBottom: theme.spacing.lg,
  },

  sectionTitle: {
    ...sharedStyles.sectionTitle,
    marginBottom: 0,
  },

  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    flexWrap: 'wrap',
  },

  searchInput: {
    ...sharedStyles.input,
    minWidth: '260px',
    maxWidth: '360px',
  },

  list: {
    display: 'grid',
    gap: theme.spacing.md,
  },

  itemCard: {
    ...sharedStyles.itemCard,
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
  },

  itemContent: {
    flex: 1,
    minWidth: '240px',
    color: theme.colors.text,
  },

  itemTitle: {
    marginTop: 0,
    marginBottom: '10px',
    color: theme.colors.subtext,
    fontSize: '1.15rem',
  },

  itemButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minWidth: '110px',
  },

  primaryButton: sharedStyles.primaryButton,

  secondaryButton: sharedStyles.secondaryButton,

  editButton: {
    ...sharedStyles.secondaryButton,
    width: '100%',
  },

  deleteButton: {
    ...sharedStyles.dangerButton,
    width: '100%',
  },

  emptyState: {
    display: 'grid',
    gap: theme.spacing.sm,
    justifyItems: 'start',
  },

  emptyText: {
    margin: 0,
    color: theme.colors.subtext,
  },

  statusText: {
    margin: 0,
    color: theme.colors.subtext,
  },

  error: sharedStyles.errorBox,
};

export default Stash;
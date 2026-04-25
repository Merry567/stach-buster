import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { theme, sharedStyles } from '../styles/theme';

const presetTags = [
  'clothing',
  'decoration',
  'gloves',
  'hat',
  'sweater',
  'cardigan',
  'color block',
];

const Patterns = () => {
  const navigate = useNavigate();

  //use state
  const [patterns, setPatterns] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matchingId, setMatchingId] = useState(null);
  const [matchResults, setMatchResults] = useState({});

  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/patterns');
      setPatterns(response.data);
    } catch (err) {
      console.error('Error fetching patterns:', err);
      setError('Could not load patterns.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatterns = useMemo(() => {
    const q = search.toLowerCase().trim();

    return patterns.filter((item) => {
      const matchesSearch =
        !q ||
        [
          item.name,
          item.type,
          item.skillLevel,
          item.notes,
          ...(item.tags || []),
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(q));

      const matchesTag =
        !activeTag ||
        (item.tags || []).some(
          (tag) => tag.toLowerCase() === activeTag.toLowerCase()
        );

      return matchesSearch && matchesTag;
    });
  }, [patterns, search, activeTag]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this pattern?');
    if (!confirmed) return;

    try {
      await API.delete(`/patterns/${id}`);
      setPatterns((prev) => prev.filter((item) => item._id !== id));

      setMatchResults((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (err) {
      console.error('Error deleting pattern:', err);
      setError('Could not delete pattern.');
    }
  };

  const handleFindMatches = async (patternId) => {
    try {
      setError('');
      setMatchingId(patternId);

      const response = await API.get(`/patterns/${patternId}/matches`);

      setMatchResults((prev) => ({
        ...prev,
        [patternId]: response.data,
      }));
    } catch (err) {
      console.error('Error finding matches:', err);
      setError(
        err.response?.data?.message || 'Could not generate yarn matches.'
      );
    } finally {
      setMatchingId(null);
    }
  };

  const handleViewPdf = async (fileId) => {
    try {
      const response = await API.get(`/patterns/file/${fileId}`, {
        responseType: 'blob',
      });

      const fileURL = window.URL.createObjectURL(
        new Blob([response.data], { type: 'application/pdf' })
      );

      window.open(fileURL, '_blank');
    } catch (err) {
      console.error('Error opening PDF:', err);
      setError('Could not open PDF.');
    }
  };
  const getSortedMatches = (patternId) => {
    const result = matchResults[patternId];
    if (!result?.materialMatches) return [];

    return result.materialMatches
      .flatMap((entry) =>
        (entry.matches || []).map((match) => ({
          ...match,
          materialIndex: entry.materialIndex,
          material: entry.material,
          status: entry.status,
        }))
      )
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <h1 style={styles.title}>My Patterns</h1>

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
              onClick={() => navigate('/patterns/new')}
            >
              Add Pattern
            </button>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.card}>
          <div style={styles.listHeader}>
            <h2 style={styles.sectionTitle}>Saved Patterns</h2>

            <input
              type="text"
              placeholder="Search patterns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.tagFilterRow}>
            <button
            type="button"
            onClick={() => setActiveTag('')}
            style={{
              ...styles.tagChip,
              ...(activeTag === '' ? styles.activeTagChip : {}),
            }}
          >
            All
          </button>
          {presetTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              style={{
                ...styles.tagChip,
                ...(activeTag === tag ? styles.activeTagChip : {}),
              }}
              >
                {tag}
              </button>
          ))}            
          </div>

          {loading ? (
            <p style={styles.statusText}>Loading patterns...</p>
          ) : filteredPatterns.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No patterns found.</p>
              <button
                type="button"
                style={styles.primaryButton}
                onClick={() => navigate('/patterns/new')}
              >
                Add Your First Pattern
              </button>
            </div>
          ) : (
            <div style={styles.list}>
              {filteredPatterns.map((item) => (
                <div key={item._id} style={styles.itemCard}>
                  <div style={styles.itemContent}>
                    <h3 style={styles.itemTitle}>{item.name}</h3>

                    <p>
                      <strong>Type:</strong> {item.type || '—'}
                    </p>
                    <p>
                      <strong>Skill Level:</strong> {item.skillLevel || '—'}
                    </p>
                    
                    <p>
                      <strong>Tags:</strong>{' '}
                      {item.tags?.length ? item.tags.join(', ') : '—'}
                    </p>
                    <p>
                      <strong>Notes:</strong> {item.notes || '—'}
                    </p>

                    <div style={styles.materialDisplay}>
                      <strong>Materials:</strong>
                      {item.materials?.length ? (
                        <ul style={styles.materialList}>
                          {item.materials.map((mat, idx) => (
                            <li key={idx}>
                              {mat.name ? `${mat.name} — ` : ''}
                              Weight: {mat.yarnWeight || '—'}, Yardage: {mat.yardage ?? '—'}, Quantity: {mat.quantity ?? '—'}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={styles.inlineText}>—</p>
                      )}
                    </div>

                    {item.patternFileId && (
                      <p style={styles.fileLinkRow}>
                        <strong>Pattern PDF:</strong>{' '}
                        <button
                          type="button"
                          style={styles.linkButton}
                          onClick={() => handleViewPdf(item.patternFileId)}
                        >
                          {item.patternFileName || 'View PDF'}
                        </button>
                      </p>
                    )}

                    {matchResults[item._id] && (
                      <div style={styles.matchBox}>
                        <p>
                          <strong>Overall Match:</strong> {matchResults[item._id].overallStatus}
                        </p>

                        {getSortedMatches(item._id).length ? (
                          getSortedMatches(item._id).map((match, index) => (
                            <div key={`${match.stashId}-${index}`} style={styles.matchItem}>
                              <p>
                                <strong>
                                  {match.material?.name || `Material ${match.materialIndex + 1}`}:
                                </strong>
                              </p>

                              <p>
                                <strong>Required Weight:</strong> {match.material?.yarnWeight || '—'}
                              </p>

                              <p>
                                <strong>Required Yardage:</strong> {match.requiredYardage ?? '—'}
                              </p>

                              <p>
                                <strong>Matched Yarn:</strong> {match.brand} — {match.color}
                              </p>

                              <p>
                                <strong>Available Yardage:</strong> {match.stashYardageTotal ?? '—'}
                              </p>

                              <p>
                                <strong>Score:</strong> {match.score ?? 0}
                              </p>

                              <p>
                                <strong>Why:</strong>{' '}
                                {match.reasons?.length ? match.reasons.join(', ') : 'No details'}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p>No stash yarn matched this pattern.</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={styles.itemButtons}>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      onClick={() => handleFindMatches(item._id)}
                      disabled={matchingId === item._id}
                    >
                      {matchingId === item._id
                        ? 'Matching...'
                        : 'Find Yarn Matches'}
                    </button>

                    <button
                      type="button"
                      style={styles.editButton}
                      onClick={() => navigate(`/patterns/edit/${item._id}`)}
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
    minWidth: '260px',
    color: theme.colors.text,
  },

  itemTitle: {
    marginTop: 0,
    marginBottom: '10px',
    color: theme.colors.subtext,
  },

  itemButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minWidth: '150px',
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

  materialDisplay: {
    marginTop: '10px',
  },

  materialList: {
    marginTop: '8px',
    paddingLeft: '20px',
  },

  inlineText: {
    display: 'inline',
    marginLeft: '6px',
  },

  fileLinkRow: {
    marginTop: '12px',
  },

  matchBox: {
    marginTop: '16px',
    padding: '16px',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.mutedBg,
    border: `1px solid ${theme.colors.border}`,
  },

  matchSection: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: `1px solid ${theme.colors.border}`,
  },

  matchItem: {
    marginTop: '10px',
    padding: '10px',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.border}`,
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

  linkButton: {
    background: 'none',
    border: 'none',
    color: theme.colors.subtext,
    textDecoration: 'underline',
    cursor: 'pointer',
    padding: 0,
    fontSize: '14px',
  },
  
  tagFilterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: theme.spacing.md,
},

  tagChip: {
    padding: '8px 12px',
    borderRadius: '999px',
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.white,
    color: theme.colors.subtext,
    cursor: 'pointer',
    fontSize: '14px',
  },

  activeTagChip: {
    backgroundColor: theme.colors.subtext,
    color: theme.colors.white,
    border: `1px solid ${theme.colors.subtext}`,
  },
};

export default Patterns;
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const emptyForm = {
  brand: '',
  fiberContent: '',
  weight: 'worsted',
  color: '',
  grams: '',
  yardage: '',
  dyeLot: '',
  quantity: 1,
  notes: '',
};

const weightOptions = [
  'lace',
  'fingering',
  'sport',
  'dk',
  'worsted',
  'aran',
  'bulky',
  'super-bulky',
  'other',
];

const Stash = () => {
  const navigate = useNavigate();

  const [stash, setStash] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      [item.brand, item.color, item.weight, item.fiberContent, item.dyeLot, item.notes]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }, [stash, search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'grams' || name === 'yardage' || name === 'quantity'
        ? value
        : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      brand: item.brand || '',
      fiberContent: item.fiberContent || '',
      weight: item.weight || 'worsted',
      color: item.color || '',
      grams: item.grams ?? '',
      yardage: item.yardage ?? '',
      dyeLot: item.dyeLot || '',
      quantity: item.quantity ?? 1,
      notes: item.notes || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this yarn entry?');
    if (!confirmed) return;

    try {
      await API.delete(`/stash/${id}`);
      setStash((prev) => prev.filter((item) => item._id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      console.error('Error deleting yarn:', err);
      setError('Could not delete yarn entry.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      brand: form.brand.trim(),
      fiberContent: form.fiberContent.trim(),
      weight: form.weight,
      color: form.color.trim(),
      grams: Number(form.grams),
      yardage: form.yardage === '' ? undefined : Number(form.yardage),
      dyeLot: form.dyeLot.trim(),
      quantity: Number(form.quantity),
      notes: form.notes.trim(),
    };

    try {
      if (editingId) {
        const response = await API.put(`/stash/${editingId}`, payload);
        setStash((prev) =>
          prev.map((item) => (item._id === editingId ? response.data : item))
        );
      } else {
        const response = await API.post('/stash', payload);
        setStash((prev) => [response.data, ...prev]);
      }

      resetForm();
    } catch (err) {
      console.error('Error saving yarn:', err);
      setError(err.response?.data?.message || 'Could not save yarn entry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <h1 style={styles.title}>My Yarn Stash</h1>
          <button style={styles.secondaryButton} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            {editingId ? 'Edit Yarn Entry' : 'Add Yarn Entry'}
          </h2>

          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              name="brand"
              placeholder="Brand"
              value={form.brand}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <input
              type="text"
              name="fiberContent"
              placeholder="Fiber Content"
              value={form.fiberContent}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <select
              name="weight"
              value={form.weight}
              onChange={handleChange}
              style={styles.input}
              required
            >
              {weightOptions.map((weight) => (
                <option key={weight} value={weight}>
                  {weight}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="color"
              placeholder="Color"
              value={form.color}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <input
              type="number"
              name="grams"
              placeholder="Grams"
              value={form.grams}
              onChange={handleChange}
              min="0"
              step="0.01" //accpes grams into the hundreths place
              required
              style={styles.input}
            />

            <input
              type="number"
              name="yardage"
              placeholder="Yardage (optional)"
              value={form.yardage}
              onChange={handleChange}
              min="0"
              style={styles.input}
            />

            <input
              type="text"
              name="dyeLot"
              placeholder="Dye Lot (optional)"
              value={form.dyeLot}
              onChange={handleChange}
              style={styles.input}
            />

            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
              min="1"
              required
              style={styles.input}
            />

            <textarea
              name="notes"
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={handleChange}
              style={styles.textarea}
            />

            <div style={styles.buttonRow}>
              <button type="submit" style={styles.primaryButton} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Yarn' : 'Add Yarn'}
              </button>

              {editingId && (
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

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
            <p>No yarn entries found.</p>
          ) : (
            <div style={styles.list}>
              {filteredStash.map((item) => (
                <div key={item._id} style={styles.itemCard}>
                  <div>
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
                      onClick={() => handleEdit(item)}
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
  page: {
    minHeight: '100vh',
    backgroundColor: '#f6f3ff',
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
  title: {
    margin: 0,
    color: '#4b2e83',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '14px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    padding: '24px',
    marginBottom: '24px',
  },
  sectionTitle: {
    marginTop: 0,
    color: '#4b2e83',
  },
  form: {
    display: 'grid',
    gap: '12px',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '15px',
  },
  textarea: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '15px',
    minHeight: '90px',
    resize: 'vertical',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
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
  cancelButton: {
    padding: '12px 16px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#888',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '15px',
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
    border: '1px solid #ccc',
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
  error: {
    color: '#b00020',
    marginBottom: '16px',
  },
};

export default Stash;
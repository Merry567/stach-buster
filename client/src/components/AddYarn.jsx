import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const weightOptions = [
  '0 - Lace',
  '1 - Super Fine',
  '2 - Fine',
  '3 - Light',
  '4 - Medium',
  '5 - Bulky',
  '6 - Super Bulky',
  '7 - Jumbo',
];

// Default form values for a new yarn entry
const emptyForm = {
  brand: '',
  fiberContent: '',
  weight: '4 - Medium',
  color: '',
  grams: '',
  yardage: '',
  dyeLot: '',
  quantity: 1,
  notes: '',
};

const AddYarn = () => {
  const navigate = useNavigate();

  // Stores the form values
  const [form, setForm] = useState(emptyForm);

  // Tracks whether the form is currently saving
  const [saving, setSaving] = useState(false);

  // Stores API error messages
  const [error, setError] = useState('');

  // Updates form state as the user types
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Resets the form back to blank/default values
  const resetForm = () => {
    setForm(emptyForm);
  };

  // Sends the new yarn entry to the backend
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
      await API.post('/stash', payload);

      // After successful save, go back to the stash list page
      navigate('/stash');
    } catch (err) {
      console.error('Error saving yarn:', err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Could not save yarn entry.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <h1 style={styles.title}>Add Yarn</h1>

          <div style={styles.topButtonRow}>
            <button
              style={styles.secondaryButton}
              onClick={() => navigate('/stash')}
            >
              Back to Stash
            </button>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>New Yarn Entry</h2>

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
              step="0.01"
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
                {saving ? 'Saving...' : 'Add Yarn'}
              </button>

              <button
                type="button"
                style={styles.cancelButton}
                onClick={resetForm}
              >
                Clear Form
              </button>
            </div>
          </form>
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
    maxWidth: '800px',
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
  title: {
    margin: 0,
    color: '#4b2e83',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '14px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    padding: '24px',
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
  error: {
    color: '#b00020',
    marginBottom: '16px',
  },
};

export default AddYarn;
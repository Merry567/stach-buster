import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { theme, sharedStyles } from '../styles/theme';

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
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
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
      await API.post('/stash', payload);
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
              type="button"
              style={styles.secondaryButton}
              onClick={() => navigate('/stash')}
            >
              Back to Stash
            </button>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

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
              style={styles.select}
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
  page: sharedStyles.page,

  container: {
    ...sharedStyles.container,
    maxWidth: '800px',
  },

  topBar: sharedStyles.topBar,

  topButtonRow: {
    display: 'flex',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },

  title: sharedStyles.title,

  card: sharedStyles.card,

  sectionTitle: sharedStyles.sectionTitle,

  form: {
    display: 'grid',
    gap: theme.spacing.sm,
  },

  input: sharedStyles.input,

  select: sharedStyles.select,

  textarea: sharedStyles.textarea,

  buttonRow: sharedStyles.buttonRow,

  primaryButton: {
    ...sharedStyles.primaryButton,
    minWidth: '140px',
  },

  secondaryButton: sharedStyles.secondaryButton,

  cancelButton: sharedStyles.dangerButton,

  error: sharedStyles.errorBox,
};

export default AddYarn;
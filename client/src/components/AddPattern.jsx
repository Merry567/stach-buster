import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';
import { theme, sharedStyles } from '../styles/theme';

const typeOptions = ['knit', 'crochet', 'both'];
const skillOptions = ['beginner', 'intermediate', 'advanced'];

const yarnWeightOptions = [
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

const presetTags = [
  'clothing',
  'decoration',
  'gloves',
  'hat',
  'sweater',
  'cardigan',
  'color block',
];

const emptyForm = {
  name: '',
  type: 'knit',
  skillLevel: 'intermediate',
  materials: [{ name:'', yarnWeight: '', yardage: '', quantity: '' }],
  notes: '',
  tags: '',
  patternFile: null,
};

const AddPattern = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
//use state
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');

  useEffect(() => {
    if (editing) {
      fetchPattern();
    }
  }, [id]);

  const getSelectStyle = (fieldName) => ({
    ...sharedStyles.select,
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

  const fetchPattern = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await API.get(`/patterns/${id}`);
      const pattern = response.data;

      setForm({
        name: pattern.name || '',
        type: pattern.type || 'knit',
        skillLevel: pattern.skillLevel || 'intermediate',
        materials:
          pattern.materials?.length > 0
            ? pattern.materials.map((mat) => ({
              name: mat.name || '',
                yarnWeight: mat.yarnWeight || '',
                yardage: mat.yardage ?? '',
                quantity: mat.quantity ?? '',
              }))
            : [{ name: '', yarnWeight: '', yardage: '', quantity: '' }],
        notes: pattern.notes || '',
        tags: pattern.tags?.join(', ') || '',
        patternFile: null,
      });
    } catch (err) {
      console.error('Error loading pattern:', err);
      setError('Could not load pattern.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({
      ...prev,
      patternFile: e.target.files?.[0] || null,
    }));
  };

  const handleMaterialChange = (index, field, value) => {
    setForm((prev) => {
      const updatedMaterials = [...prev.materials];
      updatedMaterials[index] = {
        ...updatedMaterials[index],
        [field]: value,
      };

      return {
        ...prev,
        materials: updatedMaterials,
      };
    });
  };

  const togglePresetTag = (tag) => {
    setForm((prev) => {
      const currentTags = prev.tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const hasTag = currentTags.some(
        (item) => item.toLowerCase() === tag.toLowerCase()
      );

      const updatedTags = hasTag
        ? currentTags.filter(
            (item) => item.toLowerCase() !== tag.toLowerCase()
          )
        : [...currentTags, tag];

      return {
        ...prev,
        tags: updatedTags.join(', '),
      };
    });
  };

  const addMaterialRow = () => {
    setForm((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        { name: '',  yarnWeight: '', yardage: '', quantity: '' },
      ],
    }));
  };

  const removeMaterialRow = (index) => {
    setForm((prev) => {
      if (prev.materials.length === 1) return prev;

      return {
        ...prev,
        materials: prev.materials.filter((_, i) => i !== index),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const cleanedMaterials = form.materials
      .map((mat) => ({
        name: mat.name.trim(),
        yarnWeight: mat.yarnWeight.trim(),
        yardage: mat.yardage === '' ? undefined : Number(mat.yardage),
        quantity: mat.quantity === '' ? undefined : Number(mat.quantity),
      }))
      .filter(
        (mat) =>
          mat.name ||
          mat.yarnWeight ||
          mat.yardage !== undefined ||
          mat.quantity !== undefined
      );

    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('type', form.type);
      formData.append('skillLevel', form.skillLevel);
      formData.append('materials', JSON.stringify(cleanedMaterials));
      formData.append('notes', form.notes.trim());
      formData.append(
        'tags',
        JSON.stringify(
          form.tags
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        )
      );

      if (form.patternFile) {
        formData.append('patternFile', form.patternFile);
      }

      if (editing) {
        await API.put(`/patterns/${id}`, formData);
      } else {
        await API.post('/patterns', formData);
      }

      navigate('/patterns');
    } catch (err) {
      console.error('Error saving pattern:', err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Could not save pattern.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <p style={styles.statusText}>Loading pattern...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <h1 style={styles.title}>
            {editing ? 'Edit Pattern' : 'Add Pattern'}
          </h1>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => navigate('/patterns')}
          >
            Back to Patterns
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.card}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              name="name"
              placeholder="Pattern name"
              value={form.name}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              onFocus={() => setFocusedField('type')}
              onBlur={() => setFocusedField('')}
              style={getSelectStyle('type')}
            >
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              name="skillLevel"
              value={form.skillLevel}
              onChange={handleChange}
              onFocus={() => setFocusedField('skillLevel')}
              onBlur={() => setFocusedField('')}
              style={getSelectStyle('skillLevel')}
            >
              {skillOptions.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <div>
              <label style={styles.fileLabel}>Upload Pattern PDF</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                style={styles.input}
              />
              {form.patternFile && (
                <p style={styles.fileName}>
                  Selected file: {form.patternFile.name}
                </p>
              )}
            </div>

            <div style={styles.materialsBox}>
              <h3 style={styles.subheading}>Materials Needed</h3>

              {form.materials.map((material, index) => (
                <div key={index} style={styles.materialCard}>
                  <input
                    type="text"
                    placeholder="Material name (ex: body, sleeve, trim)"
                    value={material.name}
                    onChange={(e) =>
                      handleMaterialChange(index, 'name', e.target.value)
                    }
                    style={styles.input}
                  />
                  <select
                    value={material.yarnWeight}
                    onChange={(e) =>
                      handleMaterialChange(index, 'yarnWeight', e.target.value)
                    }
                    onFocus={() => setFocusedField(`material-${index}-yarnWeight`)}
                    onBlur={() => setFocusedField('')}
                    style={getSelectStyle(`material-${index}-yarnWeight`)}
                  >
                    <option value="">Select Yarn Weight</option>
                    {yarnWeightOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                    
                  </select>

                  <input
                    type="number"
                    placeholder="Yardage"
                    value={material.yardage}
                    onChange={(e) =>
                      handleMaterialChange(index, 'yardage', e.target.value)
                    }
                    min="0"
                    style={styles.input}
                  />

                  <input
                    type="number"
                    placeholder="Quantity"
                    value={material.quantity}
                    onChange={(e) =>
                      handleMaterialChange(index, 'quantity', e.target.value)
                    }
                    min="0"
                    style={styles.input}
                  />

                  <button
                    type="button"
                    style={styles.removeButton}
                    onClick={() => removeMaterialRow(index)}
                  >
                    Remove Material
                  </button>
                </div>
              ))}

              <button
                type="button"
                style={styles.addButton}
                onClick={addMaterialRow}
              >
                Add Another Material
              </button>
            </div>

            <textarea
              name="notes"
              placeholder="Notes"
              value={form.notes}
              onChange={handleChange}
              style={styles.textarea}
            />

            <input
              type="text"
              name="tags"
              placeholder="Tags (comma separated)"
              value={form.tags}
              onChange={handleChange}
              style={styles.input}
            />
            <div style={styles.tagFilterRow}>
              {presetTags.map((tag) => {
                const selected = form.tags
                  .split(',')
                  .map((item) => item.trim().toLowerCase())
                  .includes(tag.toLowerCase());

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => togglePresetTag(tag)}
                    style={{
                      ...styles.tagChip,
                      ...(selected ? styles.activeTagChip : {}),
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>


            <div style={styles.buttonRow}>
              <button
                type="submit"
                style={styles.primaryButton}
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editing
                  ? 'Update Pattern'
                  : 'Add Pattern'}
              </button>

              <button
                type="button"
                style={styles.cancelButton}
                onClick={() => navigate('/patterns')}
              >
                Cancel
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
    maxWidth: '900px',
  },

  topBar: sharedStyles.topBar,

  title: sharedStyles.title,

  card: sharedStyles.card,

  form: {
    display: 'grid',
    gap: theme.spacing.sm,
  },

  input: sharedStyles.input,

  textarea: sharedStyles.textarea,

  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: theme.fontSizes.body,
    color: theme.colors.text,
  },

  fileLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: theme.colors.subtext,
  },

  fileName: {
    marginTop: '8px',
    fontSize: '14px',
    color: theme.colors.subtext,
  },

  subheading: {
    marginTop: 0,
    marginBottom: '12px',
    color: theme.colors.subtext,
  },

  materialsBox: {
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.mutedBg,
  },

  materialCard: {
    ...sharedStyles.itemCard,
    display: 'grid',
    gap: '10px',
    marginBottom: '14px',
  },

  addButton: {
    ...sharedStyles.secondaryButton,
  },

  removeButton: {
    ...sharedStyles.dangerButton,
  },

  buttonRow: sharedStyles.buttonRow,

  primaryButton: sharedStyles.primaryButton,

  secondaryButton: sharedStyles.secondaryButton,

  cancelButton: sharedStyles.dangerButton,

  error: sharedStyles.errorBox,

  statusText: {
    margin: 0,
    color: theme.colors.subtext,
  },
  tagFilterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
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

export default AddPattern;
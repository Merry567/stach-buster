import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const yarnWeightOptions = [
  '0 - Lace',
  '1 - Super Fine',
  '2 - Fine',
  '3 - Light',
  '4 - Medium',
  '5 - Bulky',
  '6 - Super Bulky',
  '7 - Jumbo',
];

const emptyMaterial = {
  yarnWeight: '',
  fiberContent: '',
  yardage: '',
  quantity: '',
};

const emptyForm = {
  name: '',
  type: 'knit',
  skillLevel: 'intermediate',
  estTime: '',
  materials: [{ ...emptyMaterial }],
  notes: '',
  tags: '',
  isPublic: false,
  coverImage: '',
  patternFile: null,
};

const typeOptions = ['knit', 'crochet', 'both'];
const skillOptions = ['beginner', 'intermediate', 'advanced'];

const Patterns = () => {
  const navigate = useNavigate();

  const [patterns, setPatterns] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
    if (!q) return patterns;

    return patterns.filter((item) =>
      [
        item.name,
        item.type,
        item.skillLevel,
        item.notes,
        ...(Array.isArray(item.tags) ? item.tags : []),
        ...(Array.isArray(item.materials)
          ? item.materials.flatMap((mat) => [
              mat?.yarnWeight,
              mat?.fiberContent,
              mat?.yardage?.toString(),
              mat?.quantity?.toString(),
            ])
          : []),
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }, [patterns, search]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;

    setForm((prev) => ({
      ...prev,
      patternFile: file,
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

  const addMaterialRow = () => {
    setForm((prev) => ({
      ...prev,
      materials: [...prev.materials, { ...emptyMaterial }],
    }));
  };

  const removeMaterialRow = (index) => {
    setForm((prev) => {
      if (prev.materials.length === 1) {
        return {
          ...prev,
          materials: [{ ...emptyMaterial }],
        };
      }

      return {
        ...prev,
        materials: prev.materials.filter((_, i) => i !== index),
      };
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name || '',
      type: item.type || 'knit',
      skillLevel: item.skillLevel || 'intermediate',
      estTime: item.estTime ?? '',
      materials:
        Array.isArray(item.materials) && item.materials.length > 0
          ? item.materials.map((mat) => ({
              yarnWeight: mat.yarnWeight || '',
              fiberContent: mat.fiberContent || '',
              yardage: mat.yardage ?? '',
              quantity: mat.quantity ?? '',
            }))
          : [{ ...emptyMaterial }],
      notes: item.notes || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      isPublic: item.isPublic || false,
      coverImage: item.coverImage || '',
      patternFile: null,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this pattern?');
    if (!confirmed) return;

    try {
      await API.delete(`/patterns/${id}`);
      setPatterns((prev) => prev.filter((item) => item._id !== id));

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error('Error deleting pattern:', err);
      setError('Could not delete pattern.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const cleanedMaterials = form.materials
      .map((mat) => ({
        yarnWeight: mat.yarnWeight.trim(),
        fiberContent: mat.fiberContent.trim(),
        yardage: mat.yardage === '' ? undefined : Number(mat.yardage),
        quantity: mat.quantity === '' ? undefined : Number(mat.quantity),
      }))
      .filter(
        (mat) =>
          mat.yarnWeight ||
          mat.fiberContent ||
          mat.yardage !== undefined ||
          mat.quantity !== undefined
      );

    try {
      if (editingId) {
        const payload = {
          name: form.name.trim(),
          type: form.type,
          skillLevel: form.skillLevel,
          estTime: form.estTime === '' ? undefined : Number(form.estTime),
          materials: cleanedMaterials,
          notes: form.notes.trim(),
          tags: form.tags
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          isPublic: form.isPublic,
          coverImage: form.coverImage.trim(),
        };

        const response = await API.put(`/patterns/${editingId}`, payload);
        setPatterns((prev) =>
          prev.map((item) => (item._id === editingId ? response.data : item))
        );
      } else {
        const formData = new FormData();

        formData.append('name', form.name.trim());
        formData.append('type', form.type);
        formData.append('skillLevel', form.skillLevel);

        if (form.estTime !== '') {
          formData.append('estTime', form.estTime);
        }

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
        formData.append('isPublic', form.isPublic.toString());
        formData.append('coverImage', form.coverImage.trim());

        if (form.patternFile) {
          formData.append('patternFile', form.patternFile);
        }

        const response = await API.post('/patterns', formData);
        setPatterns((prev) => [response.data, ...prev]);
      }

      resetForm();
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

  const getFileUrl = (filePath) => {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;

    const normalizedPath = filePath.replace(/\\/g, '/');
    return `http://localhost:5000/${normalizedPath}`;
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <h1 style={styles.title}>My Patterns</h1>
          <button style={styles.secondaryButton} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            {editingId ? 'Edit Pattern' : 'Add Pattern'}
          </h2>

          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              name="name"
              placeholder="Pattern Name"
              value={form.name}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              style={styles.input}
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
              required
              style={styles.input}
            >
              {skillOptions.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <input
              type="number"
              name="estTime"
              placeholder="Estimated Time in Hours"
              value={form.estTime}
              onChange={handleChange}
              min="0"
              step="0.1"
              style={styles.input}
            />

            <div>
              <label style={styles.fileLabel}>Upload Pattern PDF</label>
              <input
                type="file"
                name="patternFile"
                accept=".pdf"
                onChange={handleFileChange}
                style={styles.input}
              />
              {form.patternFile && (
                <p style={styles.fileName}>Selected file: {form.patternFile.name}</p>
              )}
            </div>

            <div style={styles.materialsBox}>
              <h3 style={styles.subheading}>Materials Needed</h3>

              {form.materials.map((material, index) => (
                <div key={index} style={styles.materialCard}>
                  <select
                    value={material.yarnWeight}
                    onChange={(e) =>
                      handleMaterialChange(index, 'yarnWeight', e.target.value)
                    }
                    style={styles.input}
                  >
                    <option value="">Select Yarn Weight</option>
                    {yarnWeightOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Fiber Content"
                    value={material.fiberContent}
                    onChange={(e) =>
                      handleMaterialChange(index, 'fiberContent', e.target.value)
                    }
                    style={styles.input}
                  />

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

            <input
              type="text"
              name="tags"
              placeholder="Tags (comma separated)"
              value={form.tags}
              onChange={handleChange}
              style={styles.input}
            />

            <input
              type="text"
              name="coverImage"
              placeholder="Cover Image URL (optional)"
              value={form.coverImage}
              onChange={handleChange}
              style={styles.input}
            />

            <textarea
              name="notes"
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={handleChange}
              style={styles.textarea}
            />

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isPublic"
                checked={form.isPublic}
                onChange={handleChange}
              />
              Make this pattern public
            </label>

            <div style={styles.buttonRow}>
              <button type="submit" style={styles.primaryButton} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Pattern' : 'Add Pattern'}
              </button>

              {editingId && (
                <button type="button" style={styles.cancelButton} onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

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

          {loading ? (
            <p>Loading patterns...</p>
          ) : filteredPatterns.length === 0 ? (
            <p>No patterns found.</p>
          ) : (
            <div style={styles.list}>
              {filteredPatterns.map((item) => (
                <div key={item._id} style={styles.itemCard}>
                  <div style={styles.itemContent}>
                    <h3 style={styles.itemTitle}>{item.name}</h3>
                    <p><strong>Type:</strong> {item.type || '—'}</p>
                    <p><strong>Skill Level:</strong> {item.skillLevel || '—'}</p>
                    <p><strong>Estimated Time:</strong> {item.estTime ?? '—'} hours</p>
                    <p><strong>Public:</strong> {item.isPublic ? 'Yes' : 'No'}</p>
                    <p><strong>Tags:</strong> {item.tags?.length ? item.tags.join(', ') : '—'}</p>
                    <p><strong>Notes:</strong> {item.notes || '—'}</p>

                    <div style={styles.materialDisplay}>
                      <strong>Materials:</strong>
                      {item.materials?.length ? (
                        <ul style={styles.materialList}>
                          {item.materials.map((mat, idx) => (
                            <li key={idx}>
                              Weight: {mat.yarnWeight || '—'}, Fiber: {mat.fiberContent || '—'}, Yardage: {mat.yardage ?? '—'}, Quantity: {mat.quantity ?? '—'}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={styles.inlineText}>—</p>
                      )}
                    </div>

                    {item.coverImage && (
                      <img
                        src={item.coverImage}
                        alt={item.name}
                        style={styles.image}
                      />
                    )}

                    {item.patternFile && (
                      <p style={styles.fileLinkRow}>
                        <strong>Pattern PDF:</strong>{' '}
                        <a
                          href={getFileUrl(item.patternFile)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View PDF
                        </a>
                      </p>
                    )}
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
  subheading: {
    marginTop: 0,
    marginBottom: '12px',
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
    width: '100%',
    boxSizing: 'border-box',
  },
  textarea: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '15px',
    minHeight: '90px',
    resize: 'vertical',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '15px',
  },
  fileLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#4b2e83',
  },
  fileName: {
    marginTop: '8px',
    fontSize: '14px',
    color: '#555',
  },
  fileLinkRow: {
    marginTop: '12px',
  },
  materialsBox: {
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '16px',
    backgroundColor: '#faf8ff',
  },
  materialCard: {
    display: 'grid',
    gap: '10px',
    marginBottom: '14px',
    padding: '14px',
    border: '1px solid #e3d8ff',
    borderRadius: '10px',
    backgroundColor: '#fff',
  },
  addButton: {
    padding: '10px 14px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#5b8def',
    color: '#fff',
    cursor: 'pointer',
  },
  removeButton: {
    padding: '10px 14px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#d9534f',
    color: '#fff',
    cursor: 'pointer',
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
  itemContent: {
    flex: 1,
    minWidth: '260px',
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
  image: {
    marginTop: '12px',
    maxWidth: '220px',
    width: '100%',
    borderRadius: '10px',
    border: '1px solid #ddd',
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
  error: {
    color: '#b00020',
    marginBottom: '16px',
  },
};

export default Patterns;
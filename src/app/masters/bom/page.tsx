'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import SearchBar from '@/components/SearchBar';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface BOM {
  _id: string;
  fgSize: string;
  rmSize: string;
  grade: string;
  annealingMin: number;
  annealingMax: number;
  drawPassMin: number;
  drawPassMax: number;
  status: 'Active' | 'Inactive';
}

interface BOMForm {
  fgSizes: string; // Changed to support multiple comma-separated sizes
  rmSize: string;
  grade: string;
  annealingMin: number;
  annealingMax: number;
  drawPassMin: number;
  drawPassMax: number;
  status: 'Active' | 'Inactive';
}

export default function BOMPage() {
  const [boms, setBoms] = useState<BOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BOMForm>({
    fgSizes: '',
    rmSize: '',
    grade: '',
    annealingMin: 0,
    annealingMax: 7,
    drawPassMin: 0,
    drawPassMax: 10,
    status: 'Active',
  });

  useEffect(() => {
    fetchBOMs();
  }, []);

  const fetchBOMs = async () => {
    try {
      const response = await fetch('/api/bom');
      const data = await response.json();
      if (data.success) {
        setBoms(data.data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.annealingMin > formData.annealingMax) {
      setError('Annealing minimum cannot be greater than maximum');
      return;
    }
    if (formData.drawPassMin > formData.drawPassMax) {
      setError('Draw pass minimum cannot be greater than maximum');
      return;
    }

    // Parse multiple FG sizes (comma-separated)
    const fgSizeList = formData.fgSizes
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (fgSizeList.length === 0) {
      setError('Please enter at least one Finish Size');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        // When editing, only update single entry
        const response = await fetch(`/api/bom/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fgSize: fgSizeList[0], // Use first size when editing
            rmSize: formData.rmSize,
            grade: formData.grade,
            annealingMin: formData.annealingMin,
            annealingMax: formData.annealingMax,
            drawPassMin: formData.drawPassMin,
            drawPassMax: formData.drawPassMax,
            status: formData.status,
          }),
        });

        const data = await response.json();
        if (data.success) {
          await fetchBOMs();
          resetForm();
        } else {
          setError(data.error);
        }
      } else {
        // When creating, create multiple BOMs
        const results: string[] = [];
        const autoCreatedFGs: string[] = [];
        const errors: string[] = [];

        for (const fgSize of fgSizeList) {
          try {
            const response = await fetch('/api/bom', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fgSize,
                rmSize: formData.rmSize,
                grade: formData.grade,
                annealingMin: formData.annealingMin,
                annealingMax: formData.annealingMax,
                drawPassMin: formData.drawPassMin,
                drawPassMax: formData.drawPassMax,
                status: formData.status,
                autoCreateFG: true, // Enable auto-creation of FG items
              }),
            });

            const data = await response.json();
            if (data.success) {
              results.push(fgSize);
              // Check if FG item was auto-created
              if (data.message && data.message.includes('auto-created')) {
                autoCreatedFGs.push(fgSize);
              }
            } else {
              errors.push(`${fgSize}: ${data.error}`);
            }
          } catch (err: any) {
            errors.push(`${fgSize}: ${err.message}`);
          }
        }

        await fetchBOMs();

        if (errors.length > 0) {
          setError(`Created ${results.length} BOM(s). Errors: ${errors.join('; ')}`);
        } else {
          let successMsg = `✅ Successfully created ${results.length} BOM entries for RM: ${formData.rmSize}`;
          if (autoCreatedFGs.length > 0) {
            successMsg += `\n\n📦 Auto-created ${autoCreatedFGs.length} FG items in Item Master:\n${autoCreatedFGs.join(', ')}`;
          }
          alert(successMsg);
          resetForm();
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (bom: BOM) => {
    setFormData({
      fgSizes: bom.fgSize, // When editing, show single size
      rmSize: bom.rmSize,
      grade: bom.grade,
      annealingMin: bom.annealingMin,
      annealingMax: bom.annealingMax,
      drawPassMin: bom.drawPassMin,
      drawPassMax: bom.drawPassMax,
      status: bom.status,
    });
    setEditingId(bom._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this BOM?')) return;

    try {
      const response = await fetch(`/api/bom/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchBOMs();
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      fgSizes: '',
      rmSize: '',
      grade: '',
      annealingMin: 0,
      annealingMax: 7,
      drawPassMin: 0,
      drawPassMax: 10,
      status: 'Active',
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Filter BOMs based on search query
  const filteredBoms = boms.filter((bom) => {
    const query = searchQuery.toLowerCase();
    return (
      bom.fgSize.toLowerCase().includes(query) ||
      bom.rmSize.toLowerCase().includes(query) ||
      bom.grade.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return <Loading message="Loading BOMs..." />;
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="BOM & Routing"
        description="Define size conversion rules and process limits"
        action={
          !showForm && (
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              <Plus className="w-5 h-5" />
              Add BOM
            </button>
          )
        }
      />

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {showForm && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {editingId ? 'Edit BOM' : 'Add New BOM'}
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">
                  {editingId ? 'Finish Size (FG) *' : 'Finish Sizes (FG) - Multiple allowed *'}
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.fgSizes}
                  onChange={(e) => setFormData({ ...formData, fgSizes: e.target.value })}
                  placeholder={editingId ? 'e.g., 6mm' : 'e.g., 6mm, 5.5mm, 5mm'}
                  required
                />
                <p className="text-xs mt-1">
                  {editingId 
                    ? <span className="text-slate-500">Must exist in Item Master as FG</span>
                    : <span className="text-green-600">💡 Enter multiple sizes (e.g., 13.55, 12.50, 11.00). <strong>Missing FG items will be auto-created!</strong></span>
                  }
                </p>
              </div>

              <div>
                <label className="label">Original Size (RM) *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.rmSize}
                  onChange={(e) => setFormData({ ...formData, rmSize: e.target.value })}
                  placeholder="e.g., 8mm"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Must exist in Item Master as RM. <span className="text-blue-600">Multiple FG sizes can use the same RM.</span>
                </p>
              </div>

              <div>
                <label className="label">Grade *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="e.g., MS"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">Routing Rules</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-blue-800">Annealing Range (0-7)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label text-xs">Minimum</label>
                      <input
                        type="number"
                        className="input"
                        value={formData.annealingMin}
                        onChange={(e) =>
                          setFormData({ ...formData, annealingMin: parseInt(e.target.value) })
                        }
                        min="0"
                        max="7"
                        required
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Maximum</label>
                      <input
                        type="number"
                        className="input"
                        value={formData.annealingMax}
                        onChange={(e) =>
                          setFormData({ ...formData, annealingMax: parseInt(e.target.value) })
                        }
                        min="0"
                        max="7"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-blue-800">Draw Pass Range (0-10)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label text-xs">Minimum</label>
                      <input
                        type="number"
                        className="input"
                        value={formData.drawPassMin}
                        onChange={(e) =>
                          setFormData({ ...formData, drawPassMin: parseInt(e.target.value) })
                        }
                        min="0"
                        max="10"
                        required
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Maximum</label>
                      <input
                        type="number"
                        className="input"
                        value={formData.drawPassMax}
                        onChange={(e) =>
                          setFormData({ ...formData, drawPassMax: parseInt(e.target.value) })
                        }
                        min="0"
                        max="10"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="label">Status *</label>
              <select
                className="input"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })
                }
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update' : 'Create'} BOM
              </button>
              <button type="button" onClick={resetForm} className="btn btn-outline">
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by FG size, RM size, or grade..."
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>FG Size</th>
                <th>RM Size</th>
                <th>Grade</th>
                <th>Annealing Range</th>
                <th>Draw Pass Range</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBoms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    {searchQuery ? 'No BOMs found matching your search.' : 'No BOMs found. Click "Add BOM" to create one.'}
                  </td>
                </tr>
              ) : (
                filteredBoms.map((bom) => (
                  <tr key={bom._id}>
                    <td className="font-medium">{bom.fgSize}</td>
                    <td className="font-medium">{bom.rmSize}</td>
                    <td>{bom.grade}</td>
                    <td>
                      <span className="badge badge-info">
                        {bom.annealingMin} - {bom.annealingMax}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {bom.drawPassMin} - {bom.drawPassMax}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          bom.status === 'Active' ? 'badge-success' : 'badge-error'
                        }`}
                      >
                        {bom.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(bom)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(bom._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import SearchBar from '@/components/SearchBar';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface GSTRate {
  _id: string;
  hsnCode: string;
  gstPercentage: number;
  isActive: boolean;
}

interface GSTForm {
  hsnCode: string;
  gstPercentage: number;
  isActive: boolean;
}

export default function GSTMasterPage() {
  const [gstRates, setGstRates] = useState<GSTRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<GSTForm>({
    hsnCode: '',
    gstPercentage: 18,
    isActive: true,
  });

  useEffect(() => {
    fetchGSTRates();
  }, []);

  const fetchGSTRates = async () => {
    try {
      const response = await fetch('/api/gst-master');
      const data = await response.json();
      if (data.success) {
        setGstRates(data.data);
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

    try {
      const url = editingId ? `/api/gst-master/${editingId}` : '/api/gst-master';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchGSTRates();
        resetForm();
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (gst: GSTRate) => {
    setFormData({
      hsnCode: gst.hsnCode,
      gstPercentage: gst.gstPercentage,
      isActive: gst.isActive,
    });
    setEditingId(gst._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      hsnCode: '',
      gstPercentage: 18,
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Filter GST rates based on search query
  const filteredGstRates = gstRates.filter((gst) => {
    const query = searchQuery.toLowerCase();
    return (
      gst.hsnCode.toLowerCase().includes(query) ||
      gst.gstPercentage.toString().includes(query)
    );
  });

  if (loading) {
    return <Loading message="Loading GST rates..." />;
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="GST Master"
        description="Manage HSN codes and GST percentages"
        action={
          !showForm && (
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              <Plus className="w-5 h-5" />
              Add GST Rate
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
              {editingId ? 'Edit GST Rate' : 'Add New GST Rate'}
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">HSN Code *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.hsnCode}
                  onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                  placeholder="e.g., 7217"
                  required
                />
              </div>

              <div>
                <label className="label">GST Percentage *</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.gstPercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, gstPercentage: parseFloat(e.target.value) })
                  }
                  min="0"
                  max="100"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <label htmlFor="isActive" className="text-sm text-slate-700 dark:text-slate-300">
                Active
              </label>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update' : 'Create'} GST Rate
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
          placeholder="Search by HSN Code or GST Percentage..."
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>HSN Code</th>
                <th>GST Percentage</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGstRates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-500">
                    {searchQuery ? 'No GST rates found matching your search.' : 'No GST rates found. Click "Add GST Rate" to create one.'}
                  </td>
                </tr>
              ) : (
                filteredGstRates.map((gst) => (
                  <tr key={gst._id}>
                    <td className="font-mono font-semibold">{gst.hsnCode}</td>
                    <td>
                      <span className="badge badge-info text-lg">{gst.gstPercentage}%</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          gst.isActive ? 'badge-success' : 'badge-error'
                        }`}
                      >
                        {gst.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(gst)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
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

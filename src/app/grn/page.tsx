'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import ItemSelector from '@/components/ItemSelector';
import { Plus, X, FileText } from 'lucide-react';

interface Party {
  _id: string;
  partyName: string;
}

interface Item {
  _id: string;
  size: string;
  grade: string;
  mill: string;
  category: string;
}

interface GRN {
  _id: string;
  sendingParty: {
    _id: string;
    partyName: string;
  };
  partyChallanNumber: string;
  rmSize: {
    _id: string;
    size: string;
    grade: string;
    mill: string;
  };
  quantity: number;
  rate: number;
  totalValue: number;
  grnDate: string;
}

interface GRNForm {
  sendingParty: string;
  partyChallanNumber: string;
  rmSize: string;
  quantity: number;
  rate: number;
  grnDate: string;
}

export default function GRNPage() {
  const [grns, setGrns] = useState<GRN[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [rmItems, setRmItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<GRNForm>({
    sendingParty: '',
    partyChallanNumber: '',
    rmSize: '',
    quantity: 0,
    rate: 0,
    grnDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [grnsRes, partiesRes, itemsRes] = await Promise.all([
        fetch('/api/grn'),
        fetch('/api/party-master'),
        fetch('/api/item-master?category=RM'),
      ]);

      const [grnsData, partiesData, itemsData] = await Promise.all([
        grnsRes.json(),
        partiesRes.json(),
        itemsRes.json(),
      ]);

      if (grnsData.success) setGrns(grnsData.data);
      if (partiesData.success) setParties(partiesData.data);
      if (itemsData.success) setRmItems(itemsData.data);
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
      const response = await fetch('/api/grn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchData();
        resetForm();
        alert('GRN created successfully! RM stock has been updated.');
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      sendingParty: '',
      partyChallanNumber: '',
      rmSize: '',
      quantity: 0,
      rate: 0,
      grnDate: new Date().toISOString().split('T')[0],
    });
    setShowForm(false);
  };

  const calculateTotal = () => {
    return (formData.quantity * formData.rate).toFixed(2);
  };

  if (loading) {
    return <Loading message="Loading GRN data..." />;
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Goods Receipt Note (GRN)"
        description="Record incoming raw materials and update stock"
        action={
          !showForm && (
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              <Plus className="w-5 h-5" />
              Create GRN
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
              Create New GRN
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ItemSelector
                label="Sending Party"
                value={formData.sendingParty}
                onChange={(value) => setFormData({ ...formData, sendingParty: value })}
                items={parties}
                placeholder="Select Party"
                required
                renderSelected={(party) => (
                  <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                    {party.partyName}
                  </span>
                )}
                renderOption={(party) => (
                  <div>
                    <div className="font-medium" style={{ color: 'var(--foreground)' }}>
                      {party.partyName}
                    </div>
                  </div>
                )}
                getSearchableText={(party) => party.partyName}
              />

              <div>
                <label className="label">Party Challan Number *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.partyChallanNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, partyChallanNumber: e.target.value })
                  }
                  placeholder="Enter challan number"
                  required
                />
              </div>

              <ItemSelector
                label="RM Size"
                value={formData.rmSize}
                onChange={(value) => setFormData({ ...formData, rmSize: value })}
                items={rmItems}
                placeholder="Select RM Size"
                required
                helperText="Select the raw material size for this GRN"
                renderSelected={(item) => (
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                      {item.size}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {item.grade} ({item.mill})
                    </span>
                  </div>
                )}
                renderOption={(item) => (
                  <div>
                    <div className="font-medium" style={{ color: 'var(--foreground)' }}>
                      {item.size} - {item.grade}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Mill: {item.mill}
                    </div>
                  </div>
                )}
                getSearchableText={(item) => 
                  `${item.size} ${item.grade} ${item.mill}`
                }
              />

              <div>
                <label className="label">GRN Date *</label>
                <input
                  type="date"
                  className="input"
                  value={formData.grnDate}
                  onChange={(e) => setFormData({ ...formData, grnDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Quantity *</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseFloat(e.target.value) })
                  }
                  placeholder="Enter quantity"
                  min="0.01"
                  required
                />
              </div>

              <div>
                <label className="label">Rate (per unit) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.rate}
                  onChange={(e) =>
                    setFormData({ ...formData, rate: parseFloat(e.target.value) })
                  }
                  placeholder="Enter rate"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-slate-900 dark:text-white">
                  Total Value:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{calculateTotal()}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Creating this GRN will automatically increase the RM stock
                for the selected size.
              </p>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary">
                Create GRN
              </button>
              <button type="button" onClick={resetForm} className="btn btn-outline">
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>GRN Date</th>
                <th>Sending Party</th>
                <th>Challan No.</th>
                <th>RM Size</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {grns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                    <p>No GRNs found. Click "Create GRN" to add one.</p>
                  </td>
                </tr>
              ) : (
                grns.map((grn) => (
                  <tr key={grn._id}>
                    <td>
                      {new Date(grn.grnDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="font-medium">{grn.sendingParty.partyName}</td>
                    <td className="font-mono text-sm">{grn.partyChallanNumber}</td>
                    <td>
                      {grn.rmSize.size} - {grn.rmSize.grade}
                      <span className="text-xs text-slate-500 block">
                        {grn.rmSize.mill}
                      </span>
                    </td>
                    <td className="font-semibold">{grn.quantity.toFixed(2)}</td>
                    <td>₹{grn.rate.toFixed(2)}</td>
                    <td className="font-bold text-green-600">
                      ₹{grn.totalValue.toFixed(2)}
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

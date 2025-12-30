'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import ItemSelector from '@/components/ItemSelector';
import { Plus, X, FileText, Download } from 'lucide-react';
import { exportToPDF, generatePDFFilename } from '@/lib/pdfExport';

interface Party {
  _id: string;
  partyName: string;
  address?: string;
  gstNumber?: string;
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
    address?: string;
    gstNumber?: string;
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
  quantity: string;
  rate: string;
  grnDate: string;
}

interface FormErrors {
  sendingParty?: string;
  partyChallanNumber?: string;
  rmSize?: string;
  quantity?: string;
  rate?: string;
  grnDate?: string;
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
    quantity: '',
    rate: '',
    grnDate: new Date().toISOString().split('T')[0],
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [valueUpdated, setValueUpdated] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState<GRN | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Trigger animation when total value changes
    if (formData.quantity || formData.rate) {
      setValueUpdated(true);
      const timer = setTimeout(() => setValueUpdated(false), 300);
      return () => clearTimeout(timer);
    }
  }, [formData.quantity, formData.rate]);

  const fetchData = async () => {
    try {
      const [grnsRes, partiesRes, rmRes] = await Promise.all([
        fetch('/api/grn'),
        fetch('/api/party-master'),
        fetch('/api/item-master?category=RM'),
      ]);

      const [grnsData, partiesData, rmData] = await Promise.all([
        grnsRes.json(),
        partiesRes.json(),
        rmRes.json(),
      ]);

      if (grnsData.success) setGrns(grnsData.data);
      if (partiesData.success) setParties(partiesData.data);
      if (rmData.success) setRmItems(rmData.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.sendingParty) errors.sendingParty = 'Please select a sending party';
    if (!formData.partyChallanNumber.trim()) errors.partyChallanNumber = 'Challan number is required';
    if (!formData.rmSize) errors.rmSize = 'Please select RM size';
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }
    if (!formData.rate || parseFloat(formData.rate) <= 0) {
      errors.rate = 'Rate must be greater than 0';
    }
    if (!formData.grnDate) errors.grnDate = 'GRN date is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const confirmAndSubmit = async () => {
    try {
      const quantity = parseFloat(formData.quantity);
      const rate = parseFloat(formData.rate);
      const totalValue = quantity * rate;

      const response = await fetch('/api/grn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity,
          rate,
          totalValue,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchData();
        resetForm();
        setShowConfirmation(false);
        alert('GRN created successfully! RM stock has been updated.');
      } else {
        setError(data.error);
        setShowConfirmation(false);
      }
    } catch (err: any) {
      setError(err.message);
      setShowConfirmation(false);
    }
  };

  const resetForm = () => {
    setFormData({
      sendingParty: '',
      partyChallanNumber: '',
      rmSize: '',
      quantity: '',
      rate: '',
      grnDate: new Date().toISOString().split('T')[0],
    });
    setFormErrors({});
    setShowForm(false);
    setShowConfirmation(false);
  };

  const calculateTotal = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const rate = parseFloat(formData.rate) || 0;
    return (quantity * rate).toFixed(2);
  };

  const handleDirectPDFExport = async (grn: GRN) => {
    try {
      // Create a temporary container
      const tempContainer = document.createElement('div');
      tempContainer.id = 'temp-grn-print';
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      document.body.appendChild(tempContainer);

      // Render the GRN content
      tempContainer.innerHTML = `
        <div style="background: white; padding: 2rem; width: 210mm;">
          <!-- Company Header -->
          <div style="text-align: center; border-bottom: 2px solid #1e293b; padding-bottom: 1rem; margin-bottom: 2rem;">
            <h1 style="font-size: 2rem; font-weight: bold; color: #1e293b; margin: 0;">DWPL</h1>
            <p style="font-size: 0.875rem; color: #64748b; margin: 0.25rem 0 0 0;">Manufacturing Management System</p>
            <h2 style="font-size: 1.25rem; font-weight: 600; color: #475569; margin: 1rem 0 0 0;">GOODS RECEIPT NOTE</h2>
          </div>

          <!-- GRN Details -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
            <div>
              <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 0.25rem;">GRN Date:</p>
              <p style="font-weight: 600; margin: 0;">${new Date(grn.grnDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 0.25rem;">Challan Number:</p>
              <p style="font-weight: 600; font-family: monospace; margin: 0;">${grn.partyChallanNumber}</p>
            </div>
          </div>

          <!-- Party Details -->
          <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 1.125rem; font-weight: 600; color: #1e293b; margin-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;">Sending Party Details</h3>
            <div style="background: #f8fafc; padding: 1rem; border-radius: 0.5rem;">
              <p style="font-weight: 600; font-size: 1.125rem; margin-bottom: 0.5rem;">${grn.sendingParty.partyName}</p>
              ${grn.sendingParty.address ? `<p style="font-size: 0.875rem; color: #64748b; margin-bottom: 0.25rem;">${grn.sendingParty.address}</p>` : ''}
              ${grn.sendingParty.gstNumber ? `<p style="font-size: 0.875rem; color: #64748b; margin: 0;"><span style="font-weight: 500;">GST:</span> ${grn.sendingParty.gstNumber}</p>` : ''}
            </div>
          </div>

          <!-- Material Details -->
          <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 1.125rem; font-weight: 600; color: #1e293b; margin-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;">Material Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="border: 1px solid #cbd5e1; padding: 0.75rem; text-align: left;">Description</th>
                  <th style="border: 1px solid #cbd5e1; padding: 0.75rem; text-align: right;">Quantity</th>
                  <th style="border: 1px solid #cbd5e1; padding: 0.75rem; text-align: right;">Rate</th>
                  <th style="border: 1px solid #cbd5e1; padding: 0.75rem; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border: 1px solid #cbd5e1; padding: 0.75rem;">
                    <p style="font-weight: 600; margin: 0 0 0.25rem 0;">${grn.rmSize.size} - ${grn.rmSize.grade}</p>
                    <p style="font-size: 0.875rem; color: #64748b; margin: 0;">Mill: ${grn.rmSize.mill}</p>
                  </td>
                  <td style="border: 1px solid #cbd5e1; padding: 0.75rem; text-align: right; font-weight: 600;">${grn.quantity.toFixed(2)}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 0.75rem; text-align: right;">₹${grn.rate.toFixed(2)}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 0.75rem; text-align: right; font-weight: 600;">₹${grn.totalValue.toFixed(2)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr style="background: #f1f5f9;">
                  <td colspan="3" style="border: 1px solid #cbd5e1; padding: 0.75rem; text-align: right; font-weight: bold;">Total Value:</td>
                  <td style="border: 1px solid #cbd5e1; padding: 0.75rem; text-align: right; font-weight: bold; font-size: 1.125rem;">₹${grn.totalValue.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Footer -->
          <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #cbd5e1;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
              <div>
                <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 2rem;">Received By:</p>
                <div style="border-top: 1px solid #94a3b8; padding-top: 0.5rem;">
                  <p style="font-size: 0.875rem; color: #64748b; margin: 0;">Signature & Date</p>
                </div>
              </div>
              <div>
                <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 2rem;">Authorized Signatory:</p>
                <div style="border-top: 1px solid #94a3b8; padding-top: 0.5rem;">
                  <p style="font-size: 0.875rem; color: #64748b; margin: 0;">Signature & Stamp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Generate PDF
      const filename = generatePDFFilename('GRN', grn.partyChallanNumber, grn.grnDate);
      await exportToPDF('temp-grn-print', filename);

      // Clean up
      document.body.removeChild(tempContainer);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
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
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
              Create New GRN
            </h2>
            <button 
              onClick={resetForm} 
              className="p-1 rounded transition-colors hover:bg-slate-100"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Party Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ItemSelector
                label="Sending Party"
                value={formData.sendingParty}
                onChange={(value) => {
                  setFormData({ ...formData, sendingParty: value });
                  if (formErrors.sendingParty) {
                    setFormErrors({ ...formErrors, sendingParty: undefined });
                  }
                }}
                items={parties}
                placeholder="Select Party"
                required
                error={formErrors.sendingParty}
                showError={!!formErrors.sendingParty}
                renderSelected={(party) => (
                  <span className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                    {party.partyName}
                  </span>
                )}
                renderOption={(party) => (
                  <div className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                    {party.partyName}
                  </div>
                )}
                getSearchableText={(party) => party.partyName}
              />

              <div>
                <label className="label">Party Challan Number *</label>
                <input
                  type="text"
                  className={`input ${formErrors.partyChallanNumber ? 'border-red-500' : ''}`}
                  value={formData.partyChallanNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, partyChallanNumber: e.target.value });
                    if (formErrors.partyChallanNumber) {
                      setFormErrors({ ...formErrors, partyChallanNumber: undefined });
                    }
                  }}
                  placeholder="Enter challan number"
                />
                {formErrors.partyChallanNumber && (
                  <p className="text-[11px] mt-0.5 text-red-600 font-medium">
                    {formErrors.partyChallanNumber}
                  </p>
                )}
              </div>

              {/* RM Size in same grid row */}
              <ItemSelector
                label="RM Size"
                value={formData.rmSize}
                onChange={(value) => {
                  setFormData({ ...formData, rmSize: value });
                  if (formErrors.rmSize) {
                    setFormErrors({ ...formErrors, rmSize: undefined });
                  }
                }}
                items={rmItems}
                placeholder="Select RM Size"
                required
                helperText="Raw material size"
                error={formErrors.rmSize}
                showError={!!formErrors.rmSize}
                renderSelected={(item) => (
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                    {item.size} - {item.grade} ({item.mill})
                  </span>
                )}
                renderOption={(item) => (
                  <div>
                    <div className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                      {item.size} - {item.grade}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Mill: {item.mill}
                    </div>
                  </div>
                )}
                getSearchableText={(item) => 
                  `${item.size} ${item.grade} ${item.mill}`
                }
              />

              {/* GRN Date in same grid row */}
              <div>
                <label className="label">GRN Date *</label>
                <input
                  type="date"
                  className={`input ${formErrors.grnDate ? 'border-red-500' : ''}`}
                  value={formData.grnDate}
                  onChange={(e) => {
                    setFormData({ ...formData, grnDate: e.target.value });
                    if (formErrors.grnDate) {
                      setFormErrors({ ...formErrors, grnDate: undefined });
                    }
                  }}
                />
                {formErrors.grnDate && (
                  <p className="text-[11px] mt-0.5 text-red-600 font-medium">
                    {formErrors.grnDate}
                  </p>
                )}
              </div>
            </div>

            {/* Quantity and Rate in one row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label">Quantity *</label>
                <input
                  type="number"
                  step="0.01"
                  className={`input ${formErrors.quantity ? 'border-red-500' : ''}`}
                  value={formData.quantity}
                  onChange={(e) => {
                    setFormData({ ...formData, quantity: e.target.value });
                    if (formErrors.quantity) {
                      setFormErrors({ ...formErrors, quantity: undefined });
                    }
                  }}
                  placeholder="0.00"
                  min="0.01"
                />
                {formErrors.quantity && (
                  <p className="text-[11px] mt-0.5 text-red-600 font-medium">
                    {formErrors.quantity}
                  </p>
                )}
              </div>

              <div>
                <label className="label">Rate (per unit) *</label>
                <div className="input-with-prefix">
                  <span className="input-prefix">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    className={`input input-currency-padding ${formErrors.rate ? 'border-red-500' : ''}`}
                    value={formData.rate}
                    onChange={(e) => {
                      setFormData({ ...formData, rate: e.target.value });
                      if (formErrors.rate) {
                        setFormErrors({ ...formErrors, rate: undefined });
                      }
                    }}
                    placeholder="0.00"
                    min="0.01"
                  />
                </div>
                {formErrors.rate && (
                  <p className="text-[11px] mt-0.5 text-red-600 font-medium">
                    {formErrors.rate}
                  </p>
                )}
              </div>
            </div>

            {/* Total Value - Compact */}
            <div 
              className={`bg-slate-50 rounded p-2.5 transition-all ${valueUpdated ? 'value-updated' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Total Value:
                </span>
                <span className="text-lg font-bold text-blue-600">
                  ₹{calculateTotal()}
                </span>
              </div>
            </div>

            {/* Error Summary */}
            {Object.keys(formErrors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-2.5">
                <p className="text-[11px] text-red-800 font-medium">
                  Please fix {Object.keys(formErrors).length} error{Object.keys(formErrors).length > 1 ? 's' : ''} before submitting
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
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

      {/* Stock Confirmation Dialog */}
      {showConfirmation && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowConfirmation(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                Confirm Stock Update
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    This action will increase RM stock:
                  </p>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p>
                      <strong>Material:</strong>{' '}
                      {rmItems.find(item => item._id === formData.rmSize)?.size || 'N/A'} -{' '}
                      {rmItems.find(item => item._id === formData.rmSize)?.grade || 'N/A'}
                    </p>
                    <p>
                      <strong>Mill:</strong>{' '}
                      {rmItems.find(item => item._id === formData.rmSize)?.mill || 'N/A'}
                    </p>
                    <p>
                      <strong>Quantity Increase:</strong> +{formData.quantity} units
                    </p>
                    <p>
                      <strong>Total Value:</strong> ₹{calculateTotal()}
                    </p>
                  </div>
                </div>

                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Are you sure you want to create this GRN and update the stock?
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={confirmAndSubmit}
                  className="btn btn-primary flex-1"
                >
                  Confirm & Create GRN
                </button>
                <button 
                  onClick={() => setShowConfirmation(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {grns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
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
                    <td>
                      <button
                        onClick={() => handleDirectPDFExport(grn)}
                        className="btn btn-primary flex items-center gap-2 text-sm"
                        title="Export as PDF"
                      >
                        <Download className="w-4 h-4" />
                        Export PDF
                      </button>
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

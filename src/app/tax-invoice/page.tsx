'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import ItemSelector from '@/components/ItemSelector';
import { Plus, X, Receipt, FileText } from 'lucide-react';

interface OutwardChallan {
  _id: string;
  challanNumber: string;
  party: {
    _id: string;
    partyName: string;
  };
  finishSize: {
    _id: string;
    size: string;
    hsnCode: string;
  };
  challanDate: string;
}

interface TaxInvoice {
  _id: string;
  invoiceNumber: string;
  party: {
    partyName: string;
  };
  finishSize: {
    size: string;
  };
  originalSize: {
    size: string;
  };
  quantity: number;
  baseAmount: number;
  gstPercentage: number;
  gstAmount: number;
  totalAmount: number;
  invoiceDate: string;
}

export default function TaxInvoicePage() {
  const [invoices, setInvoices] = useState<TaxInvoice[]>([]);
  const [challans, setChallans] = useState<OutwardChallan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invoicesRes, challansRes] = await Promise.all([
        fetch('/api/tax-invoice'),
        fetch('/api/outward-challan'),
      ]);

      const [invoicesData, challansData] = await Promise.all([
        invoicesRes.json(),
        challansRes.json(),
      ]);

      if (invoicesData.success) setInvoices(invoicesData.data);
      if (challansData.success) {
        // Filter out challans that already have invoices
        const invoicedChallanIds = invoicesData.success
          ? invoicesData.data.map((inv: any) => inv.outwardChallan)
          : [];
        const availableChallans = challansData.data.filter(
          (ch: any) => !invoicedChallanIds.includes(ch._id)
        );
        setChallans(availableChallans);
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
      const response = await fetch('/api/tax-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outwardChallan: selectedChallan,
          invoiceDate,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchData();
        resetForm();
        alert('Tax Invoice created successfully!');
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setSelectedChallan('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setShowForm(false);
  };

  if (loading) {
    return <Loading message="Loading tax invoices..." />;
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Tax Invoice"
        description="Generate GST invoices from outward challans"
        action={
          !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
              disabled={challans.length === 0}
            >
              <Plus className="w-5 h-5" />
              Create Invoice
            </button>
          )
        }
      />

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {challans.length === 0 && !showForm && (
        <Card className="mb-6">
          <div className="flex items-center gap-3 text-amber-800 bg-amber-50 p-4 rounded-lg">
            <FileText className="w-5 h-5" />
            <p>
              No outward challans available for invoicing. All existing challans have been
              invoiced or no challans exist yet.
            </p>
          </div>
        </Card>
      )}

      {showForm && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Create Tax Invoice
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-3">
                <strong>Note:</strong> Select an outward challan to generate invoice. GST will be
                auto-calculated based on HSN code.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ItemSelector
                label="Select Outward Challan"
                value={selectedChallan}
                onChange={(value) => setSelectedChallan(value)}
                items={challans}
                placeholder="Select Challan"
                required
                helperText="Choose an outward challan to generate invoice"
                renderSelected={(challan) => (
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold" style={{ color: 'var(--foreground)' }}>
                      {challan.challanNumber}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      - {challan.party.partyName}
                    </span>
                  </div>
                )}
                renderOption={(challan) => (
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold" style={{ color: 'var(--foreground)' }}>
                        {challan.challanNumber}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(challan.challanDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="text-sm mt-1" style={{ color: 'var(--secondary)' }}>
                      {challan.party.partyName}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {challan.finishSize.size}
                    </div>
                  </div>
                )}
                getSearchableText={(challan) => 
                  `${challan.challanNumber} ${challan.party.partyName} ${challan.finishSize.size}`
                }
              />

              <div>
                <label className="label">Invoice Date *</label>
                <input
                  type="date"
                  className="input"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {selectedChallan && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Invoice Preview</h3>
                <p className="text-sm text-green-800">
                  Invoice will be generated with all details from the selected challan including:
                </p>
                <ul className="text-sm text-green-800 list-disc list-inside mt-2 space-y-1">
                  <li>Party information</li>
                  <li>Item details (FG and RM sizes)</li>
                  <li>Quantity, rate, and charges</li>
                  <li>GST calculation based on HSN code</li>
                  <li>Final invoice total</li>
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary">
                Generate Invoice
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
                <th>Invoice No.</th>
                <th>Date</th>
                <th>Party</th>
                <th>FG Size</th>
                <th>Quantity</th>
                <th>Base Amount</th>
                <th>GST %</th>
                <th>GST Amount</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500">
                    <Receipt className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                    <p>No invoices found. Create an outward challan first, then generate invoice.</p>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td className="font-mono font-semibold text-blue-600">
                      {invoice.invoiceNumber}
                    </td>
                    <td>
                      {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="font-medium">{invoice.party.partyName}</td>
                    <td>
                      <div className="text-sm">
                        <span className="font-semibold">{invoice.finishSize.size}</span>
                        <span className="text-slate-400 mx-1">←</span>
                        <span className="text-slate-600">{invoice.originalSize.size}</span>
                      </div>
                    </td>
                    <td className="font-semibold">{invoice.quantity.toFixed(2)}</td>
                    <td>₹{invoice.baseAmount.toFixed(2)}</td>
                    <td>
                      <span className="badge badge-info">{invoice.gstPercentage}%</span>
                    </td>
                    <td className="text-amber-600 font-semibold">
                      ₹{invoice.gstAmount.toFixed(2)}
                    </td>
                    <td className="font-bold text-green-600 text-lg">
                      ₹{invoice.totalAmount.toFixed(2)}
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

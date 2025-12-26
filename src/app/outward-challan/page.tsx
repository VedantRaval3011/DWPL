'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import ItemSelector from '@/components/ItemSelector';
import { Plus, X, Send, AlertCircle, Printer, Eye } from 'lucide-react';

interface Party {
  _id: string;
  partyName: string;
  annealingCharge: number;
  drawCharge: number;
}

interface Item {
  _id: string;
  size: string;
  grade: string;
  mill: string;
}

interface BOM {
  _id: string;
  fgSize: string;
  rmSize: string;
  grade: string;
  annealingMin: number;
  annealingMax: number;
  drawPassMin: number;
  drawPassMax: number;
}

interface OutwardChallan {
  _id: string;
  challanNumber: string;
  party: {
    _id: string;
    partyName: string;
    address: string;
    gstNumber: string;
    contactNumber: string;
    annealingCharge: number;
    drawCharge: number;
  };
  finishSize: {
    _id: string;
    size: string;
    grade: string;
    mill: string;
    hsnCode: string;
    category: string;
  };
  originalSize: {
    _id: string;
    size: string;
    grade: string;
    mill: string;
    hsnCode: string;
    category: string;
  };
  annealingCount: number;
  drawPassCount: number;
  quantity: number;
  rate: number;
  annealingCharge: number;
  drawCharge: number;
  totalAmount: number;
  challanDate: string;
  createdAt: string;
}

interface ChallanForm {
  party: string;
  finishSize: string;
  originalSize: string;
  annealingCount: number;
  drawPassCount: number;
  quantity: number;
  rate: number;
  challanDate: string;
}

export default function OutwardChallanPage() {
  const [challans, setChallans] = useState<OutwardChallan[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [fgItems, setFgItems] = useState<Item[]>([]);
  const [rmItems, setRmItems] = useState<Item[]>([]);
  const [boms, setBoms] = useState<BOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [selectedBOM, setSelectedBOM] = useState<BOM | null>(null);
  const [rmStock, setRmStock] = useState<number>(0);
  const [printChallan, setPrintChallan] = useState<OutwardChallan | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  
  const [formData, setFormData] = useState<ChallanForm>({
    party: '',
    finishSize: '',
    originalSize: '',
    annealingCount: 0,
    drawPassCount: 0,
    quantity: 0,
    rate: 0,
    challanDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.party) {
      const party = parties.find((p) => p._id === formData.party);
      setSelectedParty(party || null);
    }
  }, [formData.party, parties]);

  useEffect(() => {
    if (formData.finishSize) {
      fetchBOMsForFG(formData.finishSize);
    } else {
      setSelectedBOM(null);
      setFormData((prev) => ({ ...prev, originalSize: '', annealingCount: 0, drawPassCount: 0 }));
    }
  }, [formData.finishSize]);

  useEffect(() => {
    if (formData.originalSize) {
      checkRMStock(formData.originalSize);
    }
  }, [formData.originalSize]);

  const fetchData = async () => {
    try {
      const [challansRes, partiesRes, fgRes, rmRes, bomsRes] = await Promise.all([
        fetch('/api/outward-challan'),
        fetch('/api/party-master'),
        fetch('/api/item-master?category=FG'),
        fetch('/api/item-master?category=RM'),
        fetch('/api/bom'),
      ]);

      const [challansData, partiesData, fgData, rmData, bomsData] = await Promise.all([
        challansRes.json(),
        partiesRes.json(),
        fgRes.json(),
        rmRes.json(),
        bomsRes.json(),
      ]);

      if (challansData.success) setChallans(challansData.data);
      if (partiesData.success) setParties(partiesData.data);
      if (fgData.success) setFgItems(fgData.data);
      if (rmData.success) setRmItems(rmData.data);
      if (bomsData.success) setBoms(bomsData.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBOMsForFG = async (fgItemId: string) => {
    const fgItem = fgItems.find((item) => item._id === fgItemId);
    if (!fgItem) return;

    const matchingBOMs = boms.filter(
      (bom) => bom.fgSize === fgItem.size && bom.grade === fgItem.grade
    );

    if (matchingBOMs.length > 0) {
      setSelectedBOM(matchingBOMs[0]);
      
      // Find matching RM item
      const rmItem = rmItems.find(
        (item) => item.size === matchingBOMs[0].rmSize && item.grade === matchingBOMs[0].grade
      );
      
      if (rmItem) {
        setFormData((prev) => ({
          ...prev,
          originalSize: rmItem._id,
          annealingCount: matchingBOMs[0].annealingMin,
          drawPassCount: matchingBOMs[0].drawPassMin,
        }));
      }
    } else {
      setError(`No BOM found for FG: ${fgItem.size} (${fgItem.grade})`);
      setSelectedBOM(null);
    }
  };

  const checkRMStock = async (rmItemId: string) => {
    try {
      const response = await fetch(`/api/stock?category=RM`);
      const data = await response.json();
      
      if (data.success) {
        const stockItem = data.data.find((s: any) => s.size._id === rmItemId);
        setRmStock(stockItem?.quantity || 0);
      }
    } catch (err) {
      console.error('Error fetching stock:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.quantity > rmStock) {
      setError(`Insufficient RM stock. Available: ${rmStock}, Required: ${formData.quantity}`);
      return;
    }

    try {
      const response = await fetch('/api/outward-challan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchData();
        resetForm();
        alert('Outward Challan created successfully! Stock has been updated.');
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      party: '',
      finishSize: '',
      originalSize: '',
      annealingCount: 0,
      drawPassCount: 0,
      quantity: 0,
      rate: 0,
      challanDate: new Date().toISOString().split('T')[0],
    });
    setSelectedParty(null);
    setSelectedBOM(null);
    setRmStock(0);
    setShowForm(false);
  };

  const calculateCharges = () => {
    if (!selectedParty) return { annealing: 0, draw: 0, material: 0, total: 0 };

    const material = formData.quantity * formData.rate;
    const annealing = selectedParty.annealingCharge * formData.quantity * formData.annealingCount;
    const draw = selectedParty.drawCharge * formData.quantity * formData.drawPassCount;
    const total = material + annealing + draw;

    return { annealing, draw, material, total };
  };

  const charges = calculateCharges();

  if (loading) {
    return <Loading message="Loading outward challan data..." />;
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Outward Challan"
        description="Create production challans with BOM-driven process control"
        action={
          !showForm && (
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              <Plus className="w-5 h-5" />
              Create Challan
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
              Create Outward Challan
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Party and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ItemSelector
                label="Party"
                value={formData.party}
                onChange={(value) => setFormData({ ...formData, party: value })}
                items={parties}
                placeholder="Select Party"
                required
                helperText={
                  selectedParty
                    ? `Annealing: ₹${selectedParty.annealingCharge}/unit | Draw: ₹${selectedParty.drawCharge}/pass`
                    : undefined
                }
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
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Annealing: ₹{party.annealingCharge}/unit | Draw: ₹{party.drawCharge}/pass
                    </div>
                  </div>
                )}
                getSearchableText={(party) => party.partyName}
              />

              <div>
                <label className="label">Challan Date *</label>
                <input
                  type="date"
                  className="input"
                  value={formData.challanDate}
                  onChange={(e) => setFormData({ ...formData, challanDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* FG and RM Selection */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-blue-900">Size Conversion (BOM-Driven)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ItemSelector
                  label="Finish Size (FG)"
                  value={formData.finishSize}
                  onChange={(value) => setFormData({ ...formData, finishSize: value })}
                  items={fgItems}
                  placeholder="Select FG Size"
                  required
                  helperText="Select the finished goods size"
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
                  <label className="label">Original Size (RM) - Auto-fetched from BOM</label>
                  <input
                    type="text"
                    className="input bg-slate-100"
                    value={
                      formData.originalSize
                        ? rmItems.find((i) => i._id === formData.originalSize)?.size || ''
                        : ''
                    }
                    disabled
                    placeholder="Will be auto-filled based on BOM"
                  />
                  {rmStock > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Available Stock: {rmStock.toFixed(2)} units
                    </p>
                  )}
                  {rmStock === 0 && formData.originalSize && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      No stock available!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Process Counts */}
            {selectedBOM && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-green-900">Process Parameters</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      Annealing Count ({selectedBOM.annealingMin}-{selectedBOM.annealingMax}) *
                    </label>
                    <select
                      className="input"
                      value={formData.annealingCount}
                      onChange={(e) =>
                        setFormData({ ...formData, annealingCount: parseInt(e.target.value) })
                      }
                      required
                    >
                      {Array.from(
                        { length: selectedBOM.annealingMax - selectedBOM.annealingMin + 1 },
                        (_, i) => selectedBOM.annealingMin + i
                      ).map((count) => (
                        <option key={count} value={count}>
                          {count}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">
                      Draw Pass Count ({selectedBOM.drawPassMin}-{selectedBOM.drawPassMax}) *
                    </label>
                    <select
                      className="input"
                      value={formData.drawPassCount}
                      onChange={(e) =>
                        setFormData({ ...formData, drawPassCount: parseInt(e.target.value) })
                      }
                      required
                    >
                      {Array.from(
                        { length: selectedBOM.drawPassMax - selectedBOM.drawPassMin + 1 },
                        (_, i) => selectedBOM.drawPassMin + i
                      ).map((count) => (
                        <option key={count} value={count}>
                          {count}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity and Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Quantity *</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })
                  }
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
                    setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })
                  }
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Charge Breakdown */}
            {selectedParty && formData.quantity > 0 && (
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                  Charge Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-slate-600">Material Cost:</span>
                  <span className="font-semibold text-right">₹{charges.material.toFixed(2)}</span>
                  
                  <span className="text-slate-600">Annealing Charge:</span>
                  <span className="font-semibold text-right">₹{charges.annealing.toFixed(2)}</span>
                  
                  <span className="text-slate-600">Draw Charge:</span>
                  <span className="font-semibold text-right">₹{charges.draw.toFixed(2)}</span>
                  
                  <span className="text-lg font-bold text-slate-900 dark:text-white border-t pt-2">
                    Total Amount:
                  </span>
                  <span className="text-lg font-bold text-blue-600 border-t pt-2 text-right">
                    ₹{charges.total.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary" disabled={!selectedBOM}>
                Create Challan
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
                <th>Challan No.</th>
                <th>Date</th>
                <th>Party</th>
                <th>FG → RM</th>
                <th>Process</th>
                <th>Qty</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {challans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    <Send className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                    <p>No challans found. Click "Create Challan" to add one.</p>
                  </td>
                </tr>
              ) : (
                challans.map((challan) => (
                  <tr key={challan._id}>
                    <td className="font-mono font-semibold">{challan.challanNumber}</td>
                    <td>
                      {new Date(challan.challanDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="font-medium">{challan.party.partyName}</td>
                    <td>
                      <div className="text-sm">
                        <span className="font-semibold">{challan.finishSize.size}</span>
                        <span className="text-slate-400 mx-1">←</span>
                        <span className="text-slate-600">{challan.originalSize.size}</span>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs space-y-1">
                        <div>A: {challan.annealingCount}</div>
                        <div>D: {challan.drawPassCount}</div>
                      </div>
                    </td>
                    <td className="font-semibold">{challan.quantity.toFixed(2)}</td>
                    <td className="font-bold text-green-600">
                      ₹{challan.totalAmount.toFixed(2)}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setPrintChallan(challan);
                            setShowPrintModal(true);
                          }}
                          className="btn btn-outline text-xs py-1 px-2"
                          title="View & Print Challan"
                        >
                          <Printer className="w-4 h-4" />
                          Print
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

      {/* Print Modal */}
      {showPrintModal && printChallan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b no-print">
              <h2 className="text-xl font-semibold text-slate-900">Outward Challan</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn btn-primary"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button
                  onClick={() => {
                    setShowPrintModal(false);
                    setPrintChallan(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Print Content */}
            <div id="print-content" className="p-8">
              {/* Company Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
                <h1 className="text-2xl font-bold text-slate-900">DWPL INDUSTRIES</h1>
                <p className="text-sm text-slate-600 mt-1">Manufacturing Excellence in Wire Drawing</p>
                <p className="text-xs text-slate-500 mt-1">GST No: 29XXXXXXXXXXXXXX | Phone: +91-XXXXXXXXXX</p>
              </div>

              {/* Document Title */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 border-2 border-slate-900 inline-block px-6 py-2">
                  OUTWARD CHALLAN
                </h2>
              </div>

              {/* Challan Details Row */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <p className="text-sm"><strong>Challan No:</strong> {printChallan.challanNumber}</p>
                  <p className="text-sm"><strong>Date:</strong> {new Date(printChallan.challanDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm"><strong>Created:</strong> {new Date(printChallan.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              {/* Party Details */}
              <div className="border border-slate-300 rounded-lg p-4 mb-6 bg-slate-50">
                <h3 className="font-semibold text-slate-900 mb-2 border-b pb-2">Party Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Party Name:</strong> {printChallan.party.partyName}</p>
                    <p><strong>Address:</strong> {printChallan.party.address}</p>
                  </div>
                  <div>
                    <p><strong>GSTIN:</strong> {printChallan.party.gstNumber}</p>
                    <p><strong>Contact:</strong> {printChallan.party.contactNumber}</p>
                  </div>
                </div>
              </div>

              {/* Item Details Table */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-2">Item Details</h3>
                <table className="w-full border-collapse border border-slate-300 text-sm">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-2 text-left">Description</th>
                      <th className="border border-slate-300 p-2 text-center">HSN Code</th>
                      <th className="border border-slate-300 p-2 text-center">Quantity</th>
                      <th className="border border-slate-300 p-2 text-right">Rate (₹)</th>
                      <th className="border border-slate-300 p-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 p-2">
                        <div className="font-medium">Finish Size: {printChallan.finishSize.size}</div>
                        <div className="text-xs text-slate-500">Grade: {printChallan.finishSize.grade} | Mill: {printChallan.finishSize.mill}</div>
                        <div className="text-xs text-slate-500 mt-1">From RM: {printChallan.originalSize.size} ({printChallan.originalSize.grade})</div>
                      </td>
                      <td className="border border-slate-300 p-2 text-center">{printChallan.finishSize.hsnCode}</td>
                      <td className="border border-slate-300 p-2 text-center font-semibold">{printChallan.quantity.toFixed(2)}</td>
                      <td className="border border-slate-300 p-2 text-right">{printChallan.rate.toFixed(2)}</td>
                      <td className="border border-slate-300 p-2 text-right">{(printChallan.quantity * printChallan.rate).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Process Details */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div className="border border-slate-300 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Process Details</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Annealing Count:</strong> {printChallan.annealingCount}</p>
                    <p><strong>Draw Pass Count:</strong> {printChallan.drawPassCount}</p>
                  </div>
                </div>
                <div className="border border-slate-300 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Charges (Per Unit)</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Annealing Charge:</strong> ₹{printChallan.annealingCharge.toFixed(2)}</p>
                    <p><strong>Draw Charge:</strong> ₹{printChallan.drawCharge.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Amount Summary */}
              <div className="border-2 border-slate-900 rounded-lg p-4 bg-slate-50">
                <h3 className="font-semibold text-slate-900 mb-3 border-b pb-2">Amount Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span>Material Cost ({printChallan.quantity.toFixed(2)} × ₹{printChallan.rate.toFixed(2)}):</span>
                  <span className="text-right">₹{(printChallan.quantity * printChallan.rate).toFixed(2)}</span>
                  
                  <span>Annealing Charge ({printChallan.quantity.toFixed(2)} × ₹{printChallan.annealingCharge.toFixed(2)} × {printChallan.annealingCount}):</span>
                  <span className="text-right">₹{(printChallan.quantity * printChallan.annealingCharge * printChallan.annealingCount).toFixed(2)}</span>
                  
                  <span>Draw Charge ({printChallan.quantity.toFixed(2)} × ₹{printChallan.drawCharge.toFixed(2)} × {printChallan.drawPassCount}):</span>
                  <span className="text-right">₹{(printChallan.quantity * printChallan.drawCharge * printChallan.drawPassCount).toFixed(2)}</span>
                  
                  <span className="font-bold text-lg border-t pt-2 mt-2">Total Amount:</span>
                  <span className="font-bold text-lg text-right border-t pt-2 mt-2 text-blue-600">₹{printChallan.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Signature Section */}
              <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t">
                <div className="text-center">
                  <div className="border-t border-slate-400 pt-2 mt-16">
                    <p className="text-sm font-medium">Prepared By</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-slate-400 pt-2 mt-16">
                    <p className="text-sm font-medium">Checked By</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-slate-400 pt-2 mt-16">
                    <p className="text-sm font-medium">Receiver's Signature</p>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center mt-8 text-xs text-slate-500 border-t pt-4">
                <p>This is a computer generated challan. No signature is required for digital copies.</p>
                <p className="mt-1">Thank you for your business!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

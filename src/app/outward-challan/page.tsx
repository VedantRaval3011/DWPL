'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import ItemSelector from '@/components/ItemSelector';
import { Plus, X, Send, AlertCircle, Printer, Eye, Edit, Trash2 } from 'lucide-react';

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
  status?: 'Active' | 'Inactive';
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
  // Available finish sizes when RM is selected (for dropdown)
  const [availableFinishSizes, setAvailableFinishSizes] = useState<BOM[]>([]);
  const [printChallan, setPrintChallan] = useState<OutwardChallan | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  // Track which field was changed last to prevent infinite loops
  const [lastChangedField, setLastChangedField] = useState<'fg' | 'rm' | null>(null);
  // Edit and Delete state
  const [editingChallan, setEditingChallan] = useState<OutwardChallan | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [challanToDelete, setChallanToDelete] = useState<OutwardChallan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
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

  // Effect for FG selection - only runs when FG was the last changed field
  useEffect(() => {
    if (formData.finishSize && lastChangedField === 'fg') {
      fetchBOMsForFG(formData.finishSize);
    } else if (!formData.finishSize) {
      setSelectedBOM(null);
      if (lastChangedField === 'fg') {
        setFormData((prev) => ({ ...prev, originalSize: '', annealingCount: 0, drawPassCount: 0 }));
      }
    }
  }, [formData.finishSize, lastChangedField]);

  // Effect for RM selection - only runs when RM was the last changed field
  useEffect(() => {
    if (formData.originalSize && lastChangedField === 'rm') {
      fetchBOMsForRM(formData.originalSize);
    } else if (!formData.originalSize) {
      if (lastChangedField === 'rm') {
        setSelectedBOM(null);
        setAvailableFinishSizes([]);
        setFormData((prev) => ({ ...prev, finishSize: '', annealingCount: 0, drawPassCount: 0 }));
      }
    }
  }, [formData.originalSize, lastChangedField]);

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
      setAvailableFinishSizes([]); // Clear when selecting FG first
      
      // Find matching RM item - MATCH BY SIZE ONLY (one RM can serve multiple FGs)
      const rmItem = rmItems.find(
        (item) => item.size === matchingBOMs[0].rmSize
      );
      
      if (rmItem) {
        setFormData((prev) => ({
          ...prev,
          originalSize: rmItem._id,
          annealingCount: matchingBOMs[0].annealingMin,
          drawPassCount: matchingBOMs[0].drawPassMin,
        }));
      } else {
        setError(`BOM found, but RM item with size "${matchingBOMs[0].rmSize}" not found in Item Master.`);
      }
    } else {
      setError(`No BOM found for FG: ${fgItem.size} (${fgItem.grade}). Please add a BOM entry first.`);
      setSelectedBOM(null);
    }
  };

  // Fetch all available finish sizes when RM is selected
  const fetchBOMsForRM = async (rmItemId: string) => {
    const rmItem = rmItems.find((item) => item._id === rmItemId);
    if (!rmItem) {
      setAvailableFinishSizes([]);
      return;
    }

    // Find ALL BOMs that use this RM size (one RM can produce multiple FG sizes)
    const matchingBOMs = boms.filter(
      (bom) => bom.rmSize === rmItem.size && (bom.status === 'Active' || !bom.status)
    );

    if (matchingBOMs.length > 0) {
      // Store all available finish sizes for dropdown
      setAvailableFinishSizes(matchingBOMs);

      // If only one option, auto-select it
      if (matchingBOMs.length === 1) {
        const selectedBom = matchingBOMs[0];
        setSelectedBOM(selectedBom);
        
        // Find the corresponding FG item
        const fgItem = fgItems.find(
          (item) => item.size === selectedBom.fgSize && item.grade === selectedBom.grade
        );
        
        if (fgItem) {
          setFormData((prev) => ({
            ...prev,
            finishSize: fgItem._id,
            annealingCount: selectedBom.annealingMin,
            drawPassCount: selectedBom.drawPassMin,
          }));
        }
      } else {
        // Multiple options - clear finish size and let user choose
        setSelectedBOM(null);
        setFormData((prev) => ({
          ...prev,
          finishSize: '',
          annealingCount: 0,
          drawPassCount: 0,
        }));
      }
    } else {
      setError(`No BOM found for RM size: ${rmItem.size}. Please add a BOM entry first.`);
      setSelectedBOM(null);
      setAvailableFinishSizes([]);
    }
  };

  // Handle finish size selection from the available options dropdown
  const handleFinishSizeFromRM = (fgItemId: string) => {
    const fgItem = fgItems.find((item) => item._id === fgItemId);
    if (!fgItem) return;

    // Find the matching BOM for this FG
    const matchingBOM = availableFinishSizes.find(
      (bom) => bom.fgSize === fgItem.size && bom.grade === fgItem.grade
    );

    if (matchingBOM) {
      setSelectedBOM(matchingBOM);
      setFormData((prev) => ({
        ...prev,
        finishSize: fgItemId,
        annealingCount: matchingBOM.annealingMin,
        drawPassCount: matchingBOM.drawPassMin,
      }));
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

    // Skip stock check for edit if quantity is same or less
    if (!editingChallan && formData.quantity > rmStock) {
      setError(`Insufficient RM stock. Available: ${rmStock}, Required: ${formData.quantity}`);
      return;
    }

    try {
      // Calculate charges for the submission
      const currentCharges = calculateCharges();
      
      const challanData = {
        ...formData,
        annealingCharge: currentCharges.annealing,
        drawCharge: currentCharges.draw,
        totalAmount: currentCharges.total,
      };

      let response;
      
      if (editingChallan) {
        // Update existing challan
        response = await fetch(`/api/outward-challan/${editingChallan._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(challanData),
        });
      } else {
        // Create new challan
        response = await fetch('/api/outward-challan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(challanData),
        });
      }

      const data = await response.json();

      if (data.success) {
        await fetchData();
        resetForm();
        alert(editingChallan 
          ? 'Outward Challan updated successfully!' 
          : 'Outward Challan created successfully! Stock has been updated.'
        );
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
    setAvailableFinishSizes([]);
    setLastChangedField(null);
    setShowForm(false);
    setEditingChallan(null);
  };

  // Handle Edit - populate form with challan data
  const handleEdit = (challan: OutwardChallan) => {
    setEditingChallan(challan);
    setFormData({
      party: challan.party._id,
      finishSize: challan.finishSize._id,
      originalSize: challan.originalSize._id,
      annealingCount: challan.annealingCount,
      drawPassCount: challan.drawPassCount,
      quantity: challan.quantity,
      rate: challan.rate,
      challanDate: new Date(challan.challanDate).toISOString().split('T')[0],
    });
    setSelectedParty(parties.find(p => p._id === challan.party._id) || null);
    setShowForm(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Delete confirmation
  const handleDeleteClick = (challan: OutwardChallan) => {
    setChallanToDelete(challan);
    setShowDeleteConfirm(true);
  };

  // Confirm and delete challan
  const confirmDelete = async () => {
    if (!challanToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/outward-challan/${challanToDelete._id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchData();
        setShowDeleteConfirm(false);
        setChallanToDelete(null);
        alert('Challan deleted successfully!');
      } else {
        setError(data.error || 'Failed to delete challan');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting');
    } finally {
      setIsDeleting(false);
    }
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
              {editingChallan ? `Edit Challan - ${editingChallan.challanNumber}` : 'Create Outward Challan'}
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
              <p className="text-sm text-blue-700">
                {availableFinishSizes.length > 1 
                  ? `📋 ${availableFinishSizes.length} finish sizes available for the selected RM. Please select one below.`
                  : 'Select either Finish Size or Original Size - the other will be auto-filled from BOM'
                }
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Show different FG selector based on flow */}
                {availableFinishSizes.length > 1 ? (
                  // When RM selected first with multiple FG options - show filtered dropdown
                  <div>
                    <label className="label">Finish Size (FG) - Select from available options *</label>
                    <select
                      className="input"
                      value={formData.finishSize}
                      onChange={(e) => handleFinishSizeFromRM(e.target.value)}
                      required
                    >
                      <option value="">-- Select Finish Size --</option>
                      {availableFinishSizes.map((bom) => {
                        const fgItem = fgItems.find(
                          (item) => item.size === bom.fgSize && item.grade === bom.grade
                        );
                        return fgItem ? (
                          <option key={fgItem._id} value={fgItem._id}>
                            {fgItem.size} - {fgItem.grade} ({fgItem.mill})
                          </option>
                        ) : (
                          <option key={bom._id} value="" disabled>
                            {bom.fgSize} - {bom.grade} (Not in Item Master)
                          </option>
                        );
                      })}
                    </select>
                    <p className="text-xs text-blue-600 mt-1">
                      Available finish sizes for RM: {rmItems.find(r => r._id === formData.originalSize)?.size || 'N/A'}
                    </p>
                  </div>
                ) : (
                  // Normal flow - show full FG selector
                  <ItemSelector
                    label="Finish Size (FG)"
                    value={formData.finishSize}
                    onChange={(value) => {
                      setLastChangedField('fg');
                      setAvailableFinishSizes([]);
                      setFormData({ ...formData, finishSize: value });
                    }}
                    items={fgItems}
                    placeholder="Select FG Size"
                    required
                    helperText="Select finish size - Original size will be auto-filled from BOM"
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
                )}

                {/* RM Selection - now editable */}
                <ItemSelector
                  label="Original Size (RM)"
                  value={formData.originalSize}
                  onChange={(value) => {
                    setLastChangedField('rm');
                    setFormData({ ...formData, originalSize: value });
                  }}
                  items={rmItems}
                  placeholder="Select RM Size"
                  required
                  helperText={
                    rmStock > 0
                      ? `✓ Available Stock: ${rmStock.toFixed(2)} units`
                      : formData.originalSize && rmStock === 0
                      ? '⚠ No stock available! Please create a GRN first.'
                      : 'Select original size to see available finish sizes'
                  }
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
              </div>

              {/* Show available finish sizes summary when RM is selected with multiple options */}
              {availableFinishSizes.length > 1 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-amber-800 font-medium mb-2">
                    📊 Available Finish Sizes for this RM:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableFinishSizes.map((bom) => (
                      <span 
                        key={bom._id} 
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          fgItems.find(fg => fg.size === bom.fgSize && fg.grade === bom.grade)?._id === formData.finishSize
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-white text-amber-800 border border-amber-200'
                        }`}
                      >
                        {bom.fgSize} ({bom.grade})
                      </span>
                    ))}
                  </div>
                </div>
              )}
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

            {/* Charge Breakdown - Professional ERP Style */}
            {selectedParty && formData.quantity > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Charge Breakdown
                  </h3>
                </div>
                
                {/* Body */}
                <div className="bg-white p-4">
                  <div className="space-y-3">
                    {/* Line Items */}
                    <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                      <span className="text-slate-600 text-sm">Material Cost</span>
                      <span className="font-medium text-slate-800">₹{charges.material.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                      <span className="text-slate-600 text-sm">
                        Annealing Charge 
                        <span className="text-xs text-slate-400 ml-1">({formData.annealingCount} × ₹{selectedParty.annealingCharge})</span>
                      </span>
                      <span className="font-medium text-slate-800">₹{charges.annealing.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                      <span className="text-slate-600 text-sm">
                        Draw Charge
                        <span className="text-xs text-slate-400 ml-1">({formData.drawPassCount} × ₹{selectedParty.drawCharge})</span>
                      </span>
                      <span className="font-medium text-slate-800">₹{charges.draw.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="mt-4 pt-4 border-t-2 border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-slate-800">Total Amount</span>
                      <span className="text-xl font-bold text-blue-600">
                        ₹{charges.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary" disabled={!selectedBOM}>
                {editingChallan ? 'Update Challan' : 'Create Challan'}
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
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(challan)}
                          className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Challan"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(challan)}
                          className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Challan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setPrintChallan(challan);
                            setShowPrintModal(true);
                          }}
                          className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Print Challan"
                        >
                          <Printer className="w-4 h-4" />
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && challanToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Delete Challan</h3>
                <p className="text-sm text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 mb-2">
                <strong>Warning:</strong> Deleting this challan will:
              </p>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                <li>Restore {challanToDelete.quantity.toFixed(2)} units to RM stock</li>
                <li>Remove {challanToDelete.quantity.toFixed(2)} units from FG stock</li>
                <li>Permanently delete the challan record</li>
              </ul>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <p className="text-sm">
                <strong>Challan:</strong> {challanToDelete.challanNumber}
              </p>
              <p className="text-sm">
                <strong>Party:</strong> {challanToDelete.party.partyName}
              </p>
              <p className="text-sm">
                <strong>Amount:</strong> ₹{challanToDelete.totalAmount.toFixed(2)}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Challan'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setChallanToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

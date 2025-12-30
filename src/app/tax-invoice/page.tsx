'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import ItemSelector from '@/components/ItemSelector';
import { Plus, X, Receipt, FileText, Download } from 'lucide-react';
import { exportToPDF, generatePDFFilename } from '@/lib/pdfExport';

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
  irnNumber?: string;
  party: {
    partyName: string;
    address: string;
    gstNumber: string;
    contactNumber: string;
  };
  finishSize: {
    size: string;
    grade: string;
    mill: string;
    hsnCode: string;
  };
  originalSize: {
    size: string;
    grade: string;
  };
  annealingCount: number;
  drawPassCount: number;
  quantity: number;
  rate: number;
  annealingCharge: number;
  drawCharge: number;
  
  // Invoice details
  poNumber?: string;
  paymentTerm?: string;
  supplierCode?: string;
  vehicleNumber?: string;
  eWayBillNo?: string;
  dispatchedThrough?: string;
  packingType?: string;
  
  // Amounts
  baseAmount: number;
  transportCharges?: number;
  assessableValue?: number;
  
  // GST
  gstPercentage: number;
  cgstPercentage?: number;
  sgstPercentage?: number;
  igstPercentage?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  gstAmount: number;
  
  // TCS
  tcsPercentage?: number;
  tcsAmount?: number;
  
  totalAmount: number;
  invoiceDate: string;
  createdAt: string;
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
      console.log('Fetching tax invoices and outward challans...');
      const [invoicesRes, challansRes] = await Promise.all([
        fetch('/api/tax-invoice'),
        fetch('/api/outward-challan'),
      ]);

      const [invoicesData, challansData] = await Promise.all([
        invoicesRes.json(),
        challansRes.json(),
      ]);

      console.log('Tax Invoices API Response:', invoicesData);
      console.log('Outward Challans API Response:', challansData);

      if (invoicesData.success) {
        console.log('Setting invoices:', invoicesData.data);
        console.log('Number of invoices:', invoicesData.data.length);
        setInvoices(invoicesData.data);
        
        // Show message if corrupted invoices were auto-deleted
        if (invoicesData.message) {
          console.log('ℹ️ Cleanup message:', invoicesData.message);
          alert(`ℹ️ Cleanup Notice:\n\n${invoicesData.message}`);
        }
      } else {
        console.error('Failed to fetch invoices:', invoicesData.error);
        setError(invoicesData.error);
      }
      
      if (challansData.success) {
        // Filter out challans that already have invoices
        // Note: outwardChallan is populated, so it's an object with _id
        const invoicedChallanIds = invoicesData.success
          ? invoicesData.data.map((inv: any) => {
              // Handle both populated (object) and non-populated (string) cases
              const challanId = typeof inv.outwardChallan === 'string' 
                ? inv.outwardChallan 
                : inv.outwardChallan?._id;
              console.log('Invoice outwardChallan:', inv.outwardChallan, '-> ID:', challanId);
              return challanId;
            })
          : [];
        console.log('Invoiced challan IDs:', invoicedChallanIds);
        
        const availableChallans = challansData.data.filter(
          (ch: any) => !invoicedChallanIds.includes(ch._id)
        );
        console.log('Available challans for invoicing:', availableChallans.length);
        setChallans(availableChallans);
      } else {
        console.error('Failed to fetch challans:', challansData.error);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
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

  const handleDirectPDFExport = async (invoice: TaxInvoice) => {
    try {
      // Create temporary hidden container
      const tempContainer = document.createElement('div');
      tempContainer.id = 'temp-invoice-print';
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '210mm';
      tempContainer.style.background = 'white';
      document.body.appendChild(tempContainer);

      // Generate 3 copies
      const copies = ['Triplicate', 'Duplicate', 'Original For Recipient'];
      let htmlContent = '';

      copies.forEach((copyType, index) => {
        const pageBreak = index < 2 ? 'page-break-after: always;' : '';
        
        htmlContent += `
          <div style="${pageBreak} padding: 15px; font-family: Arial, sans-serif; font-size: 11px; color: #000;">
            <!-- IRN and Copy Type -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <div style="font-size: 10px;">${invoice.irnNumber ? `IRN: ${invoice.irnNumber}` : ''}</div>
              <div style="font-weight: bold; font-size: 12px;">(${copyType})</div>
            </div>

            <!-- Title -->
            <div style="text-align: center; margin-bottom: 12px;">
              <h2 style="margin: 0; font-size: 14px; font-weight: bold;">Tax Invoice</h2>
            </div>

            <!-- Company and Invoice Details -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 12px; border: 1px solid #000;">
              <!-- Left: Company Details -->
              <div style="border-right: 1px solid #000; padding: 10px;">
                <p style="margin: 0 0 3px 0; font-weight: bold; font-size: 12px;">PINNACLE FASTENER</p>
                <p style="margin: 2px 0; font-size: 10px;">Plot No. 1005/B1, Phase-III, G.I.D.C.,</p>
                <p style="margin: 2px 0; font-size: 10px;">Wadhwancity, Surendranagar, Gujarat, India - 363035</p>
                <p style="margin: 2px 0; font-size: 10px;"><strong>GSTIN:</strong> 24AAQCP2416F1ZD</p>
                <p style="margin: 2px 0; font-size: 10px;"><strong>PAN No:</strong> AAQCP2416F</p>
                <p style="margin: 2px 0; font-size: 10px;"><strong>State:</strong> Gujarat</p>
                <p style="margin: 2px 0; font-size: 10px;"><strong>State Code:</strong> 24</p>
              </div>

              <!-- Right: Invoice Details -->
              <div style="padding: 10px;">
                <p style="margin: 2px 0; font-size: 10px;"><strong>INVOICE NO:</strong> ${invoice.invoiceNumber} <strong style="margin-left: 20px;">Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                <p style="margin: 2px 0; font-size: 10px;"><strong>P.O. No.:</strong> ${invoice.poNumber || 'checking invoice printing'} <strong>P.O. Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                <p style="margin: 2px 0; font-size: 10px;"><strong>Payment Term:</strong> ${invoice.paymentTerm || '0 Days'}</p>
                <p style="margin: 2px 0; font-size: 10px;"><strong>Supplier Code:</strong> ${invoice.supplierCode || '0'}</p>
                <p style="margin: 2px 0; font-size: 10px;"><strong>Vehicle No/LR No:</strong> ${invoice.vehicleNumber || 'EG13AW3140'} /</p>
                <p style="margin: 2px 0; font-size: 10px;"><strong>E-Way Bill No:</strong> ${invoice.eWayBillNo || ''}</p>
                <p style="margin: 2px 0; font-size: 10px;"><strong>Dispatched Through:</strong> ${invoice.dispatchedThrough || 'By Road'}</p>
              </div>
            </div>

            <!-- Billed To and Shipped To -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-bottom: 12px; border: 1px solid #000; border-top: none;">
              <!-- Billed To -->
              <div style="border-right: 1px solid #000; padding: 10px;">
                <p style="margin: 0 0 5px 0; font-weight: bold; font-size: 10px;">Details of Receiver (Billed To)</p>
                <p style="margin: 2px 0; font-weight: bold;">${invoice.party.partyName}</p>
                <p style="margin: 2px 0; font-size: 10px;">${invoice.party.address}</p>
                <p style="margin: 2px 0; font-size: 10px;"><strong>GSTIN:</strong> ${invoice.party.gstNumber}</p>
                <p style="margin: 2px 0; font-size: 10px;"><strong>State Code:</strong> 24 Gujarat</p>
              </div>

              <!-- Shipped To -->
              <div style="padding: 10px;">
                <p style="margin: 0 0 5px 0; font-weight: bold; font-size: 10px;">Details of Consignee (Shipped To)</p>
                <p style="margin: 2px 0; font-weight: bold;">${invoice.party.partyName}</p>
                <p style="margin: 2px 0; font-size: 10px;">${invoice.party.address}</p>
                <p style="margin: 2px 0; font-size: 10px;"><strong>GSTIN:</strong> ${invoice.party.gstNumber}</p>
                <p style="margin: 2px 0; font-size: 10px;"><strong>State Code:</strong> 24 Gujarat</p>
              </div>
            </div>

            <!-- Item Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
              <thead>
                <tr style="background: #f0f0f0;">
                  <th style="border: 1px solid #000; padding: 6px; text-align: center; font-size: 10px;">Sr. No.</th>
                  <th style="border: 1px solid #000; padding: 6px; text-align: left; font-size: 10px;">Description</th>
                  <th style="border: 1px solid #000; padding: 6px; text-align: center; font-size: 10px;">HSN/SAC</th>
                  <th style="border: 1px solid #000; padding: 6px; text-align: center; font-size: 10px;">No. & Type Of Packing</th>
                  <th style="border: 1px solid #000; padding: 6px; text-align: center; font-size: 10px;">Total Qty. Nos./ Kgs</th>
                  <th style="border: 1px solid #000; padding: 6px; text-align: center; font-size: 10px;">Rate Per Unit</th>
                  <th style="border: 1px solid #000; padding: 6px; text-align: right; font-size: 10px;">Amount Rs.</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border: 1px solid #000; padding: 6px; text-align: center;">1</td>
                  <td style="border: 1px solid #000; padding: 6px;">
                    <div style="font-weight: bold;">${invoice.finishSize.size} - ${invoice.finishSize.grade}</div>
                    <div style="font-size: 9px;">Item no 1</div>
                  </td>
                  <td style="border: 1px solid #000; padding: 6px; text-align: center;">${invoice.finishSize.hsnCode}</td>
                  <td style="border: 1px solid #000; padding: 6px; text-align: center;">
                    <div>${invoice.quantity.toFixed(0)}</div>
                    <div style="font-size: 9px;">${invoice.packingType || 'KGS'}</div>
                  </td>
                  <td style="border: 1px solid #000; padding: 6px; text-align: center;">
                    <div>${invoice.quantity.toFixed(0)}</div>
                    <div style="font-size: 9px;">${invoice.packingType || 'KGS'}</div>
                  </td>
                  <td style="border: 1px solid #000; padding: 6px; text-align: center;">${invoice.rate.toFixed(2)}</td>
                  <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">${(invoice.quantity * invoice.rate).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <!-- GST Calculation Section -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 12px;">
              <!-- Left: Amount in Words -->
              <div style="border: 1px solid #000; padding: 10px; font-size: 10px;">
                <p style="margin: 0 0 5px 0;">Rs ZERO Rupees And Zero Paise Only</p>
                <p style="margin: 5px 0; font-weight: bold;">Net Total Rs ${invoice.totalAmount.toFixed(2)}</p>
              </div>

              <!-- Right: GST Breakdown -->
              <div style="border: 1px solid #000; padding: 10px; font-size: 10px;">
                <div style="display: flex; justify-content: space-between; margin: 2px 0;">
                  <span>Transport Charges</span>
                  <span>${(invoice.transportCharges || 0).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 2px 0;">
                  <span>Ass Value:</span>
                  <span style="font-weight: bold;">${(invoice.assessableValue || invoice.baseAmount).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 2px 0;">
                  <span>CGST ${(invoice.cgstPercentage || 0).toFixed(2)}%:</span>
                  <span>${(invoice.cgstAmount || 0).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 2px 0;">
                  <span>SGST ${(invoice.sgstPercentage || 0).toFixed(2)}%:</span>
                  <span>${(invoice.sgstAmount || 0).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 2px 0;">
                  <span>IGST ${(invoice.igstPercentage || 0).toFixed(2)}%:</span>
                  <span>${(invoice.igstAmount || 0).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 2px 0;">
                  <span>TCS ${(invoice.tcsPercentage || 0).toFixed(2)}%:</span>
                  <span>${(invoice.tcsAmount || 0).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 5px 0 0 0; padding-top: 5px; border-top: 1px solid #000; font-weight: bold;">
                  <span>Net Payable:</span>
                  <span>${invoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <!-- Terms & Conditions -->
            <div style="border: 1px solid #000; padding: 10px; margin-bottom: 12px; font-size: 9px; line-height: 1.4;">
              <p style="margin: 0;">I / we certify that our registration certificate under the GST Act, 2017 is in force on the date on which the supply of goods specified in this Tax Invoice is made by me/us & that the transaction of supply covered by this Tax Invoice had been effected by me/us & it shall be accounted for in the turnover of supplies while filing of return & the due tax, if any, payable on the supplies has been paid or shall be paid. Further certified that the particulars given above are true & correct & the amount indicated represents the prices actually charged & that there is no flow of additional consideration directly or indirectly from the buyer.</p>
              <p style="margin: 5px 0 0 0;"><strong>Date & time of issue:</strong> ${new Date(invoice.createdAt).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</p>
            </div>

            <!-- Signature Section -->
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px; margin-bottom: 12px;">
              <div style="border: 1px solid #000; padding: 10px; text-align: center;">
                <p style="margin: 0; font-size: 10px;">(Customer's Seal and Signature)</p>
              </div>
              <div style="border: 1px solid #000; padding: 10px; text-align: right;">
                <p style="margin: 0; font-size: 10px;">For <strong>PINNACLE FASTENER</strong></p>
                <div style="display: flex; justify-content: space-around; margin-top: 30px; font-size: 9px;">
                  <span>Prepared By: Himesh Trivedi</span>
                  <span>Verified By:</span>
                  <span>Authorised Signatory</span>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; font-size: 9px;">
              <p style="margin: 2px 0; font-weight: bold;">(SUBJECT TO SURENDRANAGAR JURISDICTION)</p>
              <p style="margin: 2px 0; font-style: italic;">(This is Computer Generated Invoice)</p>
            </div>
          </div>
        `;
      });

      tempContainer.innerHTML = htmlContent;

      // Generate PDF
      const filename = generatePDFFilename('Invoice', invoice.invoiceNumber, invoice.invoiceDate);
      await exportToPDF('temp-invoice-print', filename);

      // Clean up
      document.body.removeChild(tempContainer);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
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
                <th>Actions</th>
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
                    <td>
                      <button
                        onClick={() => handleDirectPDFExport(invoice)}
                        className="btn btn-primary text-xs py-1 px-3 flex items-center gap-1"
                        title="Export as PDF (3 copies)"
                      >
                        <Download className="w-3 h-3" />
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
